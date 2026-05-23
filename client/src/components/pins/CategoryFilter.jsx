import React from 'react';
import styles from './CategoryFilter.module.css';

const CATEGORIES = [
  'All', 'Art', 'Photography', 'Architecture', 'Travel', 'Food',
  'Fashion', 'Nature', 'Technology', 'Design', 'DIY',
  'Home Decor', 'Fitness', 'Music', 'Quotes', 'Animals'
];

const CATEGORY_ICONS = {
  'All': '✦', 'Art': '🎨', 'Photography': '📷', 'Architecture': '🏛️',
  'Travel': '✈️', 'Food': '🍜', 'Fashion': '👗', 'Nature': '🌿',
  'Technology': '💻', 'Design': '✏️', 'DIY': '🔨', 'Home Decor': '🪴',
  'Fitness': '💪', 'Music': '🎵', 'Quotes': '💬', 'Animals': '🐾'
};

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollContainer}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.pill} ${selected === cat ? styles.active : ''}`}
            onClick={() => onSelect(cat)}
          >
            <span className={styles.icon}>{CATEGORY_ICONS[cat]}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
