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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category } from '@/hooks/useCategories';
import { 
  PencilIcon, 
  TrashIcon, 
  Bars3Icon,
  PhotoIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';

interface SortableCategoryProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleStatus: (categoryId: string) => void;
  onAddSubcategory: (parentId: string) => void;
}

function SortableCategory({ 
  category, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onAddSubcategory 
}: SortableCategoryProps) {
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
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
        isDragging 
          ? 'shadow-xl border-pink-300 bg-pink-50 scale-105' 
          : 'hover:shadow-md border-gray-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-100 transition-colors"
            title="Drag to reorder"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PhotoIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                category.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{category.description}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-400">/{category.slug}</span>
              <span className="text-xs text-gray-400">{category.productCount} products</span>
              {category.subcategories && (
                <span className="text-xs text-gray-400">{category.subcategories.length} subcategories</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddSubcategory(category._id)}
              className="text-blue-600 hover:text-blue-900 p-1"
              title="Add Subcategory"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(category)}
              className="text-yellow-600 hover:text-yellow-900 p-1"
              title="Edit Category"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="text-red-600 hover:text-red-900 p-1"
              title="Delete Category"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleStatus(category._id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                category.isActive
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {category.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
        
        {/* Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-4 pl-8 space-y-2">
            {category.subcategories.map((sub) => (
              <div key={sub._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                <span className="text-xs text-gray-500">/{sub.slug}</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                  sub.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sub.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => onEdit(sub)}
                    className="text-yellow-600 hover:text-yellow-900 p-1"
                    title="Edit Subcategory"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(sub)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Delete Subcategory"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(sub._id)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      sub.isActive
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                    title={sub.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {sub.isActive ? 'Off' : 'On'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DraggableCategoryListProps {
  categories: Category[];
  onReorder: (categories: Category[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleStatus: (categoryId: string) => void;
  onAddSubcategory: (parentId: string) => void;
}

export default function DraggableCategoryList({
  categories,
  onReorder,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddSubcategory
}: DraggableCategoryListProps) {
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(cat => cat._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((category) => (
            <SortableCategory
              key={category._id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onAddSubcategory={onAddSubcategory}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeCategory ? (
          <div className="bg-white rounded-lg shadow-xl border-2 border-pink-400 p-4 opacity-95">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                {activeCategory.image ? (
                  <img src={activeCategory.image} alt={activeCategory.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{activeCategory.name}</h3>
                <p className="text-sm text-gray-500 truncate">{activeCategory.description}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}