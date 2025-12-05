import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, Edit, Trash2 } from 'lucide-react';
import ListingCard from './ListingCard';

// Composant d'annonce triable
const SortableListingCard = ({ listing, onEdit, onDelete, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: listing.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      {/* Handle de drag */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} className="text-gray-500" />
      </div>

      {/* Actions rapides */}
      <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onView(listing)}
          className="p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          title="Voir l'annonce"
        >
          <Eye size={14} className="text-gray-600" />
        </button>
        <button
          onClick={() => onEdit(listing)}
          className="p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          title="Modifier"
        >
          <Edit size={14} className="text-gray-600" />
        </button>
        <button
          onClick={() => onDelete(listing)}
          className="p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors"
          title="Supprimer"
        >
          <Trash2 size={14} className="text-red-600" />
        </button>
      </div>

      {/* Carte d'annonce */}
      <ListingCard listing={listing} />
    </div>
  );
};

// Composant principal avec drag & drop
const DraggableListingGrid = ({ 
  listings, 
  onReorder, 
  onEdit, 
  onDelete, 
  onView,
  className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
}) => {
  const [items, setItems] = useState(listings);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Notifier le parent du changement d'ordre
        if (onReorder) {
          onReorder(newItems);
        }

        return newItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className={className}>
          {items.map((listing) => (
            <SortableListingCard
              key={listing.id}
              listing={listing}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableListingGrid; 