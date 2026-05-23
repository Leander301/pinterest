import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { pinsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import styles from './PinDetailPage.module.css';

export default function PinDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [relatedPins, setRelatedPins] = useState([]);

  useEffect(() => {
    const fetchPin = async () => {
      setLoading(true);
      try {
        const res = await pinsAPI.getById(id);
        const p = res.data.pin;
        setPin(p);
        setIsLiked(p.isLiked);
        setIsSaved(p.isSaved);
        setLikesCount(p.likesCount || 0);
        // Fetch related
        const related = await pinsAPI.getAll({ category: p.category, limit: 6 });
        setRelatedPins(related.data.pins.filter(rp => rp._id !== id));
      } catch {
        toast.error('Pin not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like'); return; }
    const prev = isLiked;
    setIsLiked(!prev);
    setLikesCount(c => c + (prev ? -1 : 1));
    try { await pinsAPI.like(id); }
    catch { setIsLiked(prev); setLikesCount(c => c + (prev ? 1 : -1)); }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      await pinsAPI.save(id);
      toast.success(prev ? 'Pin unsaved' : '📌 Pin saved!');
    } catch { setIsSaved(prev); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmittingComment(true);
    try {
      const res = await pinsAPI.addComment(id, { text: comment });
      setPin(prev => ({ ...prev, comments: [...(prev.comments || []), res.data.comment] }));
      setComment('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await pinsAPI.deleteComment(id, commentId);
      setPin(prev => ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this pin?')) return;
    try {
      await pinsAPI.delete(id);
      toast.success('Pin deleted');
      navigate('/');
    } catch { toast.error('Failed to delete pin'); }
  };

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingSpinner}/>
    </div>
  );

  if (!pin) return null;

  const isOwner = user?._id === pin.author?._id || user?._id === pin.author;
  const authorAvatar = pin.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${pin.author?.username}&backgroundColor=E63946&textColor=ffffff`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back button */}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <div className={styles.pinDetail}>
          {/* Image */}
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              <img
                src={pin.imageUrl}
                alt={pin.title}
                className={styles.image}
                onError={e => { e.target.src = `https://picsum.photos/seed/${pin._id}/600/800`; }}
              />
              {pin.link && (
                <a href={pin.link} target="_blank" rel="noopener noreferrer" className={styles.imgLink}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Visit source
                </a>
              )}
            </div>
          </div>

          {/* Info */}
          <div className={styles.infoSection}>
            {/* Actions */}
            <div className={styles.topActions}>
              <div className={styles.statsRow}>
                <span className={styles.categoryTag}>{pin.category}</span>
                <span className={styles.viewCount}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {pin.views || 0}
                </span>
              </div>
              <div className={styles.actionBtns}>
                {isOwner && (
                  <button className={styles.deleteBtn} onClick={handleDelete}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                )}
                <button
                  className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
                  onClick={handleLike}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {likesCount > 0 && <span>{likesCount}</span>}
                </button>
                <button
                  className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
                  onClick={handleSave}
                >
                  {isSaved ? (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Saved</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Save</>
                  )}
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <h1 className={styles.title}>{pin.title}</h1>
            {pin.description && <p className={styles.description}>{pin.description}</p>}

            {/* Tags */}
            {pin.tags?.length > 0 && (
              <div className={styles.tags}>
                {pin.tags.map(tag => (
                  <Link key={tag} to={`/search?q=${tag}`} className={styles.tag}>#{tag}</Link>
                ))}
              </div>
            )}

            {/* Author */}
            <div className={styles.authorSection}>
              <Link to={`/profile/${pin.author?.username}`} className={styles.authorCard}>
                <img src={authorAvatar} alt={pin.author?.username} className={styles.authorAvatar}/>
                <div>
                  <div className={styles.authorName}>{pin.author?.displayName}</div>
                  <div className={styles.authorUsername}>@{pin.author?.username}</div>
                </div>
              </Link>
              <span className={styles.pinDate}>
                {formatDistanceToNow(new Date(pin.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Comments */}
            <div className={styles.commentsSection}>
              <h3 className={styles.commentsTitle}>
                Comments
                {pin.comments?.length > 0 && <span className={styles.commentCount}>{pin.comments.length}</span>}
              </h3>

              <div className={styles.commentsList}>
                {(!pin.comments || pin.comments.length === 0) ? (
                  <p className={styles.noComments}>No comments yet. Be the first!</p>
                ) : (
                  pin.comments.map(c => {
                    const cAvatar = c.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.user?.username}&backgroundColor=E63946&textColor=ffffff`;
                    const canDelete = user?._id === c.user?._id || user?._id === pin.author?._id;
                    return (
                      <div key={c._id} className={styles.comment}>
                        <img src={cAvatar} alt={c.user?.username} className={styles.commentAvatar}/>
                        <div className={styles.commentContent}>
                          <div className={styles.commentHeader}>
                            <Link to={`/profile/${c.user?.username}`} className={styles.commentAuthor}>
                              {c.user?.displayName || c.user?.username}
                            </Link>
                            <span className={styles.commentTime}>
                              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={styles.commentText}>{c.text}</p>
                        </div>
                        {canDelete && (
                          <button className={styles.deleteComment} onClick={() => handleDeleteComment(c._id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleComment} className={styles.commentForm}>
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}&backgroundColor=E63946&textColor=ffffff`}
                    alt={user?.username}
                    className={styles.commentAvatar}
                  />
                  <div className={styles.commentInputWrapper}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className={styles.commentInput}
                      maxLength={500}
                    />
                    <button type="submit" className={styles.commentSubmit} disabled={!comment.trim() || submittingComment}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                </form>
              ) : (
                <p className={styles.loginToComment}>
                  <Link to="/login">Sign in</Link> to leave a comment
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Pins */}
        {relatedPins.length > 0 && (
          <div className={styles.related}>
            <h2 className={styles.relatedTitle}>More in {pin.category}</h2>
            <div className={styles.relatedGrid}>
              {relatedPins.slice(0, 5).map(rp => (
                <Link key={rp._id} to={`/pin/${rp._id}`} className={styles.relatedCard}>
                  <img
                    src={rp.imageUrl}
                    alt={rp.title}
                    onError={e => { e.target.src = `https://picsum.photos/seed/${rp._id}/300/400`; }}
                  />
                  <div className={styles.relatedOverlay}>{rp.title}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
