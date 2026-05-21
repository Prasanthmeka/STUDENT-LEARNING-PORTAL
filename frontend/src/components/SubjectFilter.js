import React, { useState } from 'react';
import FilterModal from './FilterModal';
import '../styles/SubjectFilter.css';

function SubjectFilter({ selectedSubject, onSubjectChange, showLabel = true }) {
  const subjects = [
    'All',
    'Telugu',
    'Hindi',
    'English',
    'Maths',
    'Physics',
    'Chemistry',
    'Biology',
    'Social'
  ];

  const [open, setOpen] = useState(false);

  const options = subjects.map(s => ({ value: s, label: s }));

  return (
    <div className="subject-filter">
      {showLabel && <label>Filter by Subject:</label>}

      <button className="subject-select" onClick={() => setOpen(true)}>
        {selectedSubject}
      </button>

      <FilterModal
        isOpen={open}
        title="Choose Subject"
        options={options}
        selected={selectedSubject}
        onClose={() => setOpen(false)}
        onSelect={(val) => onSubjectChange(val)}
      />
    </div>
  );
}

export default SubjectFilter;
