import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pinsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './PinCard.module.css';

export default function PinCard({ pin, onUpdate }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(pin.isLiked);
  const [isSaved, setIsSaved] = useState(pin.isSaved);
  const [likesCount, setLikesCount] = useState(pin.likesCount || 0);
  const [savesCount, setSavesCount] = useState(pin.savesCount || 0);
  const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Sign in to like pins'); return; }
    setIsAnimatingHeart(true);
    setTimeout(() => setIsAnimatingHeart(false), 400);
    const prevLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => prev + (prevLiked ? -1 : 1));
    try {
      await pinsAPI.like(pin._id);
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prev => prev + (prevLiked ? 1 : -1));
      toast.error('Failed to like pin');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    const prevSaved = isSaved;
    setIsSaved(!isSaved);
    setSavesCount(prev => prev + (prevSaved ? -1 : 1));
    try {
      await pinsAPI.save(pin._id);
      toast.success(prevSaved ? 'Pin unsaved' : 'Pin saved!');
    } catch {
      setIsSaved(prevSaved);
      setSavesCount(prev => prev + (prevSaved ? 1 : -1));
      toast.error('Failed to save pin');
    }
  };

  const isOwner = user?._id === pin.author?._id;
  const imgSrc = pin.imageUrl || `https://picsum.photos/seed/${pin._id}/400/500`;

  return (
    <div className={styles.card}>
      <Link to={`/pin/${pin._id}`} className={styles.imageWrapper}>
        <img
          src={imgSrc}
          alt={pin.title}
          className={styles.image}
          loading="lazy"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${pin._id}/400/500`; }}
        />
        
        {/* Overlay */}
        <div className={styles.overlay}>
          <div className={styles.overlayTop}>
            <span className={styles.categoryBadge}>{pin.category}</span>
            <button
              className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
              onClick={handleSave}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          {pin.link && (
            <a
              href={pin.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBadge}
              onClick={e => e.stopPropagation()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Visit
            </a>
          )}
        </div>
      </Link>

      <div className={styles.cardBody}>
        <Link to={`/pin/${pin._id}`} className={styles.title}>{pin.title}</Link>
        
        <div className={styles.meta}>
          <Link to={`/profile/${pin.author?.username}`} className={styles.author}>
            <img
              src={pin.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${pin.author?.username}&backgroundColor=E63946&textColor=ffffff`}
              alt={pin.author?.username}
              className={styles.authorAvatar}
            />
            <span>{pin.author?.displayName || pin.author?.username}</span>
          </Link>

          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${isLiked ? styles.liked : ''} ${isAnimatingHeart ? styles.pop : ''}`}
              onClick={handleLike}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            <Link to={`/pin/${pin._id}`} className={styles.actionBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {pin.commentsCount > 0 && <span>{pin.commentsCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
