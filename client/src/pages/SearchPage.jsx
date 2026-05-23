import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pinsAPI, usersAPI } from '../utils/api';
import PinGrid from '../components/pins/PinGrid';
import CategoryFilter from '../components/pins/CategoryFilter';
import { Link } from 'react-router-dom';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [pins, setPins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('pins');
  const [searchInput, setSearchInput] = useState(query);

  const doSearch = useCallback(async (q, cat) => {
    setLoading(true);
    try {
      const params = { limit: 40, ...(q && { search: q }), ...(cat !== 'All' && { category: cat }) };
      const [pinsRes, usersRes] = await Promise.all([
        pinsAPI.getAll(params),
        q ? usersAPI.search(q) : Promise.resolve({ data: { users: [] } })
      ]);
      setPins(pinsRes.data.pins || []);
      setUsers(usersRes.data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(query, category);
    setSearchInput(query);
  }, [query, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchInput ? { q: searchInput } : {});
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchHeader}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search for pins, ideas, users..."
            className={styles.searchInput}
            autoFocus
          />
          {searchInput && (
            <button type="button" className={styles.clearBtn} onClick={() => { setSearchInput(''); setSearchParams({}); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </div>

      <div className={styles.container}>
        {query && (
          <div className={styles.resultMeta}>
            <h2 className={styles.resultTitle}>
              {loading ? 'Searching...' : `Results for "${query}"`}
            </h2>
            {!loading && <span className={styles.resultCount}>{pins.length} pins · {users.length} people</span>}
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'pins' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pins')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Pins {!loading && <span>{pins.length}</span>}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'people' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('people')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            People {!loading && <span>{users.length}</span>}
          </button>
        </div>

        {activeTab === 'pins' && (
          <>
            <div className={styles.filterRow}>
              <CategoryFilter selected={category} onSelect={setCategory} />
            </div>

            {loading ? (
              <div className={styles.skeleton}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} style={{ height: `${200 + (i % 3) * 60}px` }} />
                ))}
              </div>
            ) : (
              <PinGrid pins={pins} />
            )}
          </>
        )}

        {activeTab === 'people' && (
          <div className={styles.peopleGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonUser} />)
            ) : users.length === 0 ? (
              <div className={styles.noResults}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <p>No users found{query ? ` for "${query}"` : ''}</p>
              </div>
            ) : (
              users.map(u => (
                <Link key={u._id} to={`/profile/${u.username}`} className={styles.userCard}>
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=E63946&textColor=ffffff`}
                    alt={u.username}
                    className={styles.userAvatar}
                  />
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{u.displayName}</div>
                    <div className={styles.userHandle}>@{u.username}</div>
                    {u.bio && <p className={styles.userBio}>{u.bio.slice(0, 80)}{u.bio.length > 80 ? '...' : ''}</p>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.userArrow}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              ))
            )}
          </div>
        )}

        {!query && !loading && (
          <div className={styles.emptySearch}>
            <div className={styles.emptySearchIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h2>Search for anything</h2>
            <p>Try searching for topics, colors, or moods that inspire you</p>
            <div className={styles.suggestions}>
              {['Architecture', 'Travel', 'Photography', 'Food', 'Nature', 'Design'].map(s => (
                <button
                  key={s}
                  className={styles.suggestion}
                  onClick={() => { setSearchInput(s); setSearchParams({ q: s }); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
