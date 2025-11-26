// src/components/CollapsibleSection.jsx
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function CollapsibleSection({ section, onToggle, children, dropIndicator, onContextMenu }) {
  // Make the section itself draggable
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: section.id,
    data: {
      type: "section"
    }
  });

  // Make the section a drop target for items
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: section.id,
    data: {
      type: "section",
      sectionId: section.id
    }
  });

  const style = {
    opacity: isDragging ? 0.5 : 1
  };

  // Helper to render items with drop lines
  const renderItemsWithDropLines = () => {
    if (!children || !Array.isArray(children)) return children;

    const itemsArray = children.filter(Boolean);
    const result = [];

    itemsArray.forEach((child, index) => {
      // Add drop line before this item if needed
      if (
        dropIndicator &&
        dropIndicator.type === "item" &&
        dropIndicator.targetSectionId === section.id &&
        dropIndicator.index === index
      ) {
        result.push(
          <div key={`drop-${index}`} className="sidebar-drop-line" />
        );
      }
      result.push(child);
    });

    // Add drop line at the end if needed
    if (
      dropIndicator &&
      dropIndicator.type === "item" &&
      dropIndicator.targetSectionId === section.id &&
      dropIndicator.index === itemsArray.length
    ) {
      result.push(
        <div key={`drop-end`} className="sidebar-drop-line" />
      );
    }

    return result;
  };

  return (
    <div ref={setSortableRef} style={style} className="sidebar-section">
      <button
        type="button"
        className="sidebar-section-header"
        onClick={onToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onContextMenu) {
            onContextMenu(e, section);
          }
        }}
        {...attributes}
        {...listeners}
      >
        <span className="sidebar-section-title">{section.title}</span>
        <span
          className={`sidebar-section-chevron ${
            section.isCollapsed ? "sidebar-section-chevron--collapsed" : ""
          }`}
        >
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path
              d="M9 18l6-6-6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {!section.isCollapsed && (
        <SortableContext
          id={section.id}
          items={section.itemIds}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setDroppableRef} className="sidebar-section-items">
            {renderItemsWithDropLines()}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

export default CollapsibleSection;
