// src/components/DraggableItem.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DraggableItem({ id, sectionId, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: id,
    data: {
      type: "item",
      sectionId: sectionId
    }
  });

  const style = {
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? "draggable-item--dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export default DraggableItem;
