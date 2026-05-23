import React from 'react';
import Masonry from 'react-masonry-css';
import PinCard from './PinCard';
import styles from './PinGrid.module.css';

const breakpointColumns = {
  default: 5,
  1400: 5,
  1200: 4,
  992: 3,
  768: 2,
  480: 2,
};

export default function PinGrid({ pins, onUpdate }) {
  if (!pins || pins.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        </div>
        <h3>No pins found</h3>
        <p>Try searching for something else or explore a different category</p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {pins.map((pin, i) => (
        <div key={pin._id} style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
          <PinCard pin={pin} onUpdate={onUpdate} />
        </div>
      ))}
    </Masonry>
  );
}
