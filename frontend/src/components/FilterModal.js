import React, { useEffect } from 'react';
import '../styles/FilterModal.css';

export default function FilterModal({
  isOpen,
  title,
  options = [],
  selected,
  onClose,
  onSelect
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="filter-modal-backdrop" onMouseDown={onClose}>
      <div
        className="filter-modal-panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Filter options'}
      >
        {title && <div className="filter-modal-title">{title}</div>}
        <div className="filter-modal-list">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`filter-modal-option ${selected === opt.value ? 'active' : ''}`}
              onClick={() => {
                onSelect(opt.value);
                onClose();
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button className="filter-modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
