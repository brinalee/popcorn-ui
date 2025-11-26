// src/components/SidebarSearchBar.jsx

function SidebarSearchBar({ value, onChange }) {
  return (
    <div className="sidebar-search">
      <div className="sidebar-search-input">
        <span className="sidebar-search-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <line
              x1="15.5"
              y1="15.5"
              x2="20"
              y2="20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="text"
          className="sidebar-search-field"
          placeholder="Search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default SidebarSearchBar;
