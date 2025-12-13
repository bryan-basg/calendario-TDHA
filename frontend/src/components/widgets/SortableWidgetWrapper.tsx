import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableWidgetWrapperProps {
    id: string;
    children: React.ReactNode;
}

export const SortableWidgetWrapper: React.FC<SortableWidgetWrapperProps> = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Required for dnd-kit on mobile/touch
        marginBottom: '1rem',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {/* Drag Handle could be separate, but for now applying listeners to the whole wrapper or specific handle?
                Applying to specific handle is better UX for text selection inside.
                But for simplicity let's wrap the children.
                Ideally, we pass the drag handle to the child or wrap it here.
            */}
            <div className="widget-container">
                {/* We inject listeners to the child or a handle.
                    For now, let's assume the child has a header we want to be the handle.
                    Actually, let's just make the whole thing draggable or add a handle icon.
                    Let's Pass listeners to a specific handler div.
                 */}
                <div className="widget-drag-handle" {...listeners} style={{ cursor: 'grab', padding: '5px', backgroundColor: '#f3f4f6', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '40px', height: '4px', backgroundColor: '#d1d5db', borderRadius: '2px' }}></div>
                </div>
                {children}
            </div>
        </div>
    );
};
