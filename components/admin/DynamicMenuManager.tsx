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
import { Category } from '@/hooks/useCategories';
import { Bars3Icon, ChevronDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface SortableSubcategoryProps {
  subcategory: Category;
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-gray-50 rounded text-sm ${isDragging ? 'bg-pink-100' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <Bars3Icon className="h-3 w-3" />
      </button>
      <ArrowRightIcon className="h-3 w-3 text-gray-400" />
      <span className="text-gray-700">{subcategory.name}</span>
      <span className="text-gray-500">/{subcategory.slug}</span>
    </div>
  );
}

interface SortableMenuItemProps {
  category: Category;
}

function SortableMenuItem({ category }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category._id,
    data: { type: 'category' }
  });

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
      
      {/* Subcategories Drop Zone */}
      {category.subcategories && category.subcategories.length > 0 && (
        <SortableContext items={category.subcategories.map(s => s._id)} strategy={verticalListSortingStrategy}>
          <div className="pl-12 pb-3 space-y-1 min-h-[20px] border-t bg-gray-50/50">
            {category.subcategories.map((sub) => (
              <SortableSubcategory key={sub._id} subcategory={sub} parentId={category._id} />
            ))}
          </div>
        </SortableContext>
      )}
      
      {/* Empty drop zone for categories without subcategories */}
      {(!category.subcategories || category.subcategories.length === 0) && (
        <div 
          className="pl-12 pb-3 min-h-[40px] border-t bg-gray-50/30 flex items-center justify-center text-xs text-gray-400"
          data-category-id={category._id}
        >
          Drop subcategories here
        </div>
      )}
    </div>
  );
}

interface DynamicMenuManagerProps {
  categories: Category[];
  onReorder: (categories: Category[]) => void;
  onMoveSubcategory: (subcategoryId: string, newParentId: string) => void;
}

export default function DynamicMenuManager({ 
  categories, 
  onReorder,
  onMoveSubcategory
}: DynamicMenuManagerProps) {
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

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle subcategory moving between categories
    if (activeData?.type === 'subcategory' && overData?.type === 'category') {
      const subcategoryId = active.id as string;
      const newParentId = over.id as string;
      const oldParentId = activeData.parentId;

      if (oldParentId !== newParentId) {
        // Move subcategory to new parent
        const updatedItems = items.map(category => {
          if (category._id === oldParentId) {
            return {
              ...category,
              subcategories: category.subcategories?.filter(sub => sub._id !== subcategoryId) || []
            };
          }
          if (category._id === newParentId) {
            const subcategory = items
              .find(c => c._id === oldParentId)
              ?.subcategories?.find(s => s._id === subcategoryId);
            
            if (subcategory) {
              return {
                ...category,
                subcategories: [...(category.subcategories || []), { ...subcategory, parentId: newParentId }]
              };
            }
          }
          return category;
        });
        
        setItems(updatedItems);
        onMoveSubcategory(subcategoryId, newParentId);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle category reordering
    if (activeData?.type === 'category' && overData?.type === 'category') {
      const oldIndex = items.findIndex(item => item._id === active.id);
      const newIndex = items.findIndex(item => item._id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onReorder(newItems);
    }

    // Handle subcategory reordering within same parent
    if (activeData?.type === 'subcategory' && overData?.type === 'subcategory') {
      const parentId = activeData.parentId;
      const updatedItems = items.map(category => {
        if (category._id === parentId && category.subcategories) {
          const oldIndex = category.subcategories.findIndex(sub => sub._id === active.id);
          const newIndex = category.subcategories.findIndex(sub => sub._id === over.id);
          
          return {
            ...category,
            subcategories: arrayMove(category.subcategories, oldIndex, newIndex)
          };
        }
        return category;
      });
      
      setItems(updatedItems);
      onReorder(updatedItems);
    }
  }

  const activeItem = activeId ? 
    items.find(item => item._id === activeId) ||
    items.flatMap(c => c.subcategories || []).find(sub => sub._id === activeId)
    : null;

  // Update items when categories prop changes
  if (categories !== items) {
    setItems(categories);
  }

  const allItems = [
    ...items.map(c => c._id),
    ...items.flatMap(c => c.subcategories?.map(s => s._id) || [])
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Dynamic Menu Management</h3>
      <p className="text-sm text-gray-600 mb-6">
        Drag categories to reorder, or drag subcategories between categories to reorganize the menu structure.
      </p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(cat => cat._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((category) => (
              <SortableMenuItem key={category._id} category={category} />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeItem ? (
            <div className="bg-white rounded-lg shadow-xl border-2 border-pink-400 p-3 opacity-95">
              <div className="flex items-center gap-3">
                <Bars3Icon className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="font-medium text-gray-900">{activeItem.name}</span>
                  <div className="text-sm text-gray-500">/{activeItem.slug}</div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}