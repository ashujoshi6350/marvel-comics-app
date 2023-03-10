import React from 'react';
import "./page-buttons.css";

export const PageButtons = ({
  handleOffsetChange,
  totalPages,
  offset,
  limit
}) => {
  const buttons = [];
  // Add the previous button
  if (offset >= limit) {
    buttons.push(
      <button
        className='page-btn'
        key="prev"
        onClick={() => handleOffsetChange(offset - limit)}
      >
        Prev
      </button>
    );
  }
  // Add the first page button
  buttons.push(
    <button
      className='page-btn'
      key={1}
      onClick={() => handleOffsetChange(0)}
      disabled={offset === 0}
    >
      1
    </button>
  );
  // Add the middle buttons with 3 dots
  let start = Math.max(2, Math.ceil(offset / limit) - 1);
  let end = Math.min(totalPages - 1, start + 3);
  if (start > 2) {
    buttons.push(<span className='dots' key="dots-start">...</span>);
  }
  for (let i = start; i <= end; i++) {
    const newOffset = (i - 1) * limit;
    buttons.push(
      <button
        className='page-btn'
        key={i}
        onClick={() => handleOffsetChange(newOffset)}
        disabled={newOffset === offset}
      >
        {i}
      </button>
    );
  }
  if (end < totalPages - 1) {
    buttons.push(<span className='dots' key="dots-end">...</span>);
  }
  // Add the last page button
  if (totalPages > 1) {
    buttons.push(
      <button
        className='page-btn'
        key={totalPages}
        onClick={() => handleOffsetChange((totalPages - 1) * limit)}
        disabled={offset === (totalPages - 1) * limit}
      >
        {totalPages}
      </button>
    );
  }
  // Add the next button
  if (offset + limit < totalPages * limit) {
    buttons.push(
      <button
        className='page-btn'
        key="next"
        onClick={() => handleOffsetChange(offset + limit)}
      >
        Next
      </button>
    );
  }
  return buttons;
}
