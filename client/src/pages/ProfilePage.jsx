import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PinGrid from '../components/pins/PinGrid';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [savedPins, setSavedPins] = useState([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '', website: '', location: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await usersAPI.getProfile(username);
        const { user: u, pins: p, savedPins: sp } = res.data;
        setProfile(u);
        setPins(p || []);
        setSavedPins(sp || []);
        setIsFollowing(u.isFollowing || false);
        setFollowersCount(u.followersCount || 0);
        setEditForm({
          displayName: u.displayName || '',
          bio: u.bio || '',
          website: u.website || '',
          location: u.location || ''
        });
      } catch {
        toast.error('User not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowersCount(c => c + (prev ? -1 : 1));
    try {
      await usersAPI.follow(profile._id);
      toast.success(prev ? 'Unfollowed' : `Following ${profile.displayName}`);
    } catch {
      setIsFollowing(prev);
      setFollowersCount(c => c + (prev ? 1 : -1));
    }
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => formData.append(k, v));
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await usersAPI.updateProfile(formData);
      setProfile(prev => ({ ...prev, ...res.data.user }));
      updateUser(res.data.user);
      setEditMode(false);
      setAvatarFile(null);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
    </div>
  );

  if (!profile) return null;

  const isOwn = profile.isOwnProfile;
  const avatarUrl = avatarPreview || profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}&backgroundColor=E63946&textColor=ffffff`;
  const displayPins = activeTab === 'created' ? pins : savedPins;

  return (
    <div className={styles.page}>
      {/* Cover */}
      <div className={styles.cover}>
        <div className={styles.coverGradient} />
      </div>

      <div className={styles.container}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <img src={avatarUrl} alt={profile.displayName} className={styles.avatar} />
            {isOwn && editMode && (
              <>
                <button className={styles.changeAvatarBtn} onClick={() => fileInputRef.current?.click()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </>
            )}
          </div>

          {!editMode ? (
            <div className={styles.profileInfo}>
              <h1 className={styles.displayName}>{profile.displayName}</h1>
              <p className={styles.usernameText}>@{profile.username}</p>
              {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
              <div className={styles.metaRow}>
                {profile.location && (
                  <span className={styles.metaItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{pins.length}</span>
                  <span className={styles.statLabel}>Pins</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{followersCount}</span>
                  <span className={styles.statLabel}>Followers</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{profile.followingCount || 0}</span>
                  <span className={styles.statLabel}>Following</span>
                </div>
              </div>

              <div className={styles.profileActions}>
                {isOwn ? (
                  <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                {isOwn && (
                  <Link to="/create" className={styles.createPinBtn}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create Pin
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className={styles.editForm}>
              <div className={styles.editGrid}>
                <div className={styles.editField}>
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                    className={styles.editInput}
                    placeholder="Your display name"
                  />
                </div>
                <div className={styles.editField}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                    className={styles.editInput}
                    placeholder="City, Country"
                  />
                </div>
                <div className={`${styles.editField} ${styles.fullWidth}`}>
                  <label>Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    className={styles.editTextarea}
                    placeholder="Tell us about yourself..."
                    maxLength={300}
                    rows={3}
                  />
                </div>
                <div className={`${styles.editField} ${styles.fullWidth}`}>
                  <label>Website</label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))}
                    className={styles.editInput}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              <div className={styles.editActions}>
                <button type="button" className={styles.cancelEditBtn} onClick={() => { setEditMode(false); setAvatarPreview(''); setAvatarFile(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'created' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('created')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Created
            <span className={styles.tabCount}>{pins.length}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'saved' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            Saved
            <span className={styles.tabCount}>{savedPins.length}</span>
          </button>
        </div>

        {/* Pin Grid */}
        <div className={styles.pinsContainer}>
          {displayPins.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                {activeTab === 'created' ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                )}
              </div>
              <h3>{activeTab === 'created' ? 'No pins yet' : 'No saved pins'}</h3>
              <p>{activeTab === 'created'
                ? isOwn ? 'Start sharing your creativity!' : `${profile.displayName} hasn't created any pins yet`
                : isOwn ? 'Save pins you love to find them later' : `${profile.displayName} hasn't saved any pins yet`
              }</p>
              {isOwn && activeTab === 'created' && (
                <Link to="/create" className={styles.emptyAction}>Create your first pin</Link>
              )}
            </div>
          ) : (
            <PinGrid pins={displayPins} />
          )}
        </div>
      </div>
    </div>
  );
}
