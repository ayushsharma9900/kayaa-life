'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PublicCategory } from '@/hooks/usePublicCategories';
import { Bars3Icon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

interface SortableSubcategoryProps {
  subcategory: PublicCategory;
  parentId: string;
}

function SortableSubcategory({ subcategory, parentId }: SortableSubcategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: subcategory._id,
    data: { type: 'subcategory', parentId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-gray-50 rounded text-sm transition-all ${
        isDragging ? 'shadow-lg bg-pink-50 scale-105' : 'hover:bg-gray-100'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        title="Drag to reorder or move to another category"
      >
        <Bars3Icon className="h-3 w-3" />
      </button>
      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      <span className="text-gray-700">{subcategory.name}</span>
      <span className="text-gray-500">/{subcategory.slug}</span>
    </div>
  );
}

interface SortableMenuItemProps {
  category: PublicCategory;
  onReorder: (items: PublicCategory[]) => void;
}

function SortableMenuItem({ category, onReorder }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg transition-all duration-200 ${
        isDragging 
          ? 'shadow-xl border-pink-300 bg-pink-50 scale-105' 
          : 'hover:shadow-md border-gray-200'
      }`}
    >
      <div className="flex items-center p-3 gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
          title="Drag to reorder"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{category.name}</span>
            {category.subcategories && category.subcategories.length > 0 && (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm text-gray-500">/{category.slug}</span>
        </div>
        
        <div className="text-sm text-gray-400">
          {category.productCount} products
        </div>
      </div>
      
      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <SortableContext items={category.subcategories.map(s => s._id)} strategy={verticalListSortingStrategy}>
          <div className="pl-12 pb-3 space-y-1">
            {category.subcategories.map((sub) => (
              <SortableSubcategory key={sub._id} subcategory={sub} parentId={category._id} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

interface DraggableMenuManagerProps {
  categories: PublicCategory[];
  onReorder: (categories: PublicCategory[]) => void;
}

export default function DraggableMenuManager({ 
  categories, 
  onReorder 
}: DraggableMenuManagerProps) {
  const [items, setItems] = useState(categories);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item._id === active.id);
      const newIndex = items.findIndex(item => item._id === over?.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onReorder(newItems);
    }
  }

  const activeCategory = activeId ? items.find(item => item._id === activeId) : null;

  // Update items when categories prop changes
  if (categories !== items) {
    setItems(categories);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Order Management</h3>
      <p className="text-sm text-gray-600 mb-6">Drag and drop to reorder menu items as they appear in the navigation.</p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(cat => cat._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((category) => (
              <SortableMenuItem
                key={category._id}
                category={category}
                onReorder={onReorder}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeCategory ? (
            <div className="bg-white rounded-lg shadow-xl border-2 border-pink-400 p-3 opacity-95">
              <div className="flex items-center gap-3">
                <Bars3Icon className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="font-medium text-gray-900">{activeCategory.name}</span>
                  <div className="text-sm text-gray-500">/{activeCategory.slug}</div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}