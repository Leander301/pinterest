import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { pinsAPI } from '../utils/api';
import PinGrid from '../components/pins/PinGrid';
import CategoryFilter from '../components/pins/CategoryFilter';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [pins, setPins] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });
  const isLoadingRef = useRef(false);

  const fetchPins = useCallback(async (pageNum = 1, reset = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    if (pageNum === 1) setInitialLoading(true);
    else setLoading(true);

    try {
      const params = {
        page: pageNum,
        limit: 20,
        sort,
        ...(category !== 'All' && { category })
      };
      const res = await pinsAPI.getAll(params);
      const { pins: newPins, pagination } = res.data;

      if (reset || pageNum === 1) {
        setPins(newPins);
      } else {
        setPins(prev => [...prev, ...newPins]);
      }
      setHasMore(pagination.hasMore);
    } catch (error) {
      console.error('Failed to fetch pins:', error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [category, sort]);

  // Reset on category/sort change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPins(1, true);
  }, [category, sort]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPins(nextPage);
    }
  }, [inView]);

  const handleCategorySelect = (cat) => setCategory(cat);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Discover &amp; collect<br/>
            <span className={styles.heroAccent}>visual inspiration</span>
          </h1>
          <p className={styles.heroSub}>Millions of ideas to spark your creativity</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <CategoryFilter selected={category} onSelect={handleCategorySelect} />
          <div className={styles.sortWrapper}>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Liked</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        {initialLoading ? (
          <div className={styles.skeleton}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} style={{ height: `${200 + (i % 3) * 80}px`, animationDelay: `${i * 50}ms` }}/>
            ))}
          </div>
        ) : (
          <>
            <PinGrid pins={pins} />
            {loading && (
              <div className={styles.loadingMore}>
                <div className={styles.spinner}/>
                <span>Loading more pins...</span>
              </div>
            )}
            {!hasMore && pins.length > 0 && (
              <div className={styles.endMessage}>
                <span>✦</span> You've seen everything! <span>✦</span>
              </div>
            )}
            <div ref={loadMoreRef} className={styles.sentinel}/>
          </>
        )}
      </div>
    </div>
  );
}
