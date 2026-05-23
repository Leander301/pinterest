import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../utils/api';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const menuRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    if (val.trim().length > 1) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await usersAPI.search(val);
          setSearchResults(res.data.users || []);
        } catch { setSearchResults([]); }
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearchFocused(false);
      setSearch('');
    }
  };

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'U'}&backgroundColor=E63946&textColor=ffffff`;

  return (
    <div className={styles.appWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="14" fill="#E63946"/>
                <path d="M14 6C10.69 6 8 8.69 8 12c0 2.24 1.33 4.21 3.25 5.16L10 22h8l-1.25-4.84C18.67 16.21 20 14.24 20 12c0-3.31-2.69-6-6-6zm0 9a3 3 0 110-6 3 3 0 010 6z" fill="white"/>
              </svg>
            </span>
            <span className={styles.logoText}>PinVault</span>
          </Link>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <form onSubmit={handleSearchSubmit} className={`${styles.searchForm} ${searchFocused ? styles.focused : ''}`}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search pins, users, ideas..."
                value={search}
                onChange={handleSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className={styles.searchInput}
              />
            </form>
            {searchFocused && searchResults.length > 0 && (
              <div className={styles.searchDropdown}>
                {searchResults.map(u => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className={styles.searchResult}
                    onClick={() => { setSearchFocused(false); setSearch(''); }}
                  >
                    <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}&backgroundColor=E63946&textColor=ffffff`} alt={u.username} className={styles.searchResultAvatar}/>
                    <div>
                      <div className={styles.searchResultName}>{u.displayName}</div>
                      <div className={styles.searchResultUsername}>@{u.username}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav Actions */}
          <div className={styles.navActions}>
            <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/create" className={styles.createBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create
                </Link>

                <div className={styles.userMenu} ref={menuRef}>
                  <button className={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                    <img src={avatarUrl} alt={user?.username} className={styles.navAvatar}/>
                  </button>
                  {menuOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <img src={avatarUrl} alt={user?.username} className={styles.dropdownAvatar}/>
                        <div>
                          <div className={styles.dropdownName}>{user?.displayName}</div>
                          <div className={styles.dropdownUsername}>@{user?.username}</div>
                        </div>
                      </div>
                      <div className={styles.dropdownDivider}/>
                      <Link to={`/profile/${user?.username}`} className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        My Profile
                      </Link>
                      <Link to="/create" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Create Pin
                      </Link>
                      <div className={styles.dropdownDivider}/>
                      <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={() => { logout(); setMenuOpen(false); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.authLinks}>
                <Link to="/login" className={styles.loginBtn}>Log in</Link>
                <Link to="/register" className={styles.signupBtn}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
