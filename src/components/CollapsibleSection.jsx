// src/components/CollapsibleSection.jsx
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import SortModeDropdown from "./SortModeDropdown";

function CollapsibleSection({
  section,
  onToggle,
  children,
  dropIndicator,
  onContextMenu,
  onChangeSortMode,
  onOpenMenu,
  sortedItemIds
}) {
  // Make the section itself draggable (except Uncategorized which stays at top)
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
    },
    disabled: section.id === "uncategorized"  // Prevent dragging Uncategorized
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

  // Handle sort mode change
  const handleSortModeChange = (mode) => {
    onChangeSortMode?.(section.id, mode);
  };

  // Handle menu button click
  const handleMenuClick = (e) => {
    e.stopPropagation();
    onOpenMenu?.(e, section);
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

  // Use sortedItemIds if provided, otherwise fall back to section.itemIds
  const itemIdsForContext = sortedItemIds || section.itemIds;

  // Hide header for Uncategorized section
  const isUncategorized = section.id === "uncategorized";

  return (
    <div ref={setSortableRef} style={style} className={`sidebar-section ${isUncategorized ? "sidebar-section--no-header" : ""}`}>
      {!isUncategorized && (
        <div
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
          {/* Section title (no longer editable inline) */}
          <span className="sidebar-section-title">
            {section.title}
          </span>

          {/* Sort mode dropdown */}
          <SortModeDropdown
            mode={section.sortMode || "manual"}
            onChange={handleSortModeChange}
            disabled={false}
          />

          {/* Menu button (only for non-protected sections) */}
          {!section.isProtected && (
            <button
              type="button"
              className="sidebar-section-menu-btn"
              onClick={handleMenuClick}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Section menu"
            >
              ...
            </button>
          )}

          {/* Collapse chevron */}
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
        </div>
      )}

      {(!section.isCollapsed || isUncategorized) && (
        <SortableContext
          id={section.id}
          items={itemIdsForContext}
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
