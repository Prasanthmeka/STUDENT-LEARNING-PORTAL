import React from 'react';
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

  return (
    <div className="subject-filter">
      {showLabel && <label>Filter by Subject:</label>}
      <div className="filter-buttons">
        {subjects.map((subject) => (
          <button
            key={subject}
            className={`filter-btn ${selectedSubject === subject ? 'active' : ''}`}
            onClick={() => onSubjectChange(subject)}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SubjectFilter;
