import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { pinsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import styles from './CreatePinPage.module.css';

const CATEGORIES = [
  'Art', 'Photography', 'Architecture', 'Travel', 'Food',
  'Fashion', 'Nature', 'Technology', 'Design', 'DIY',
  'Home Decor', 'Fitness', 'Music', 'Quotes', 'Animals', 'Other'
];

export default function CreatePinPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Other', link: '', tags: '', imageUrl: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [useUrl, setUseUrl] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUseUrl(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => toast.error('File too large or invalid type. Max 10MB.')
  });

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setForm(f => ({ ...f, imageUrl: url }));
    if (url) { setPreview(url); setFile(null); }
    else setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!file && !form.imageUrl) { toast.error('Please upload an image or provide an image URL'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('link', form.link);
      formData.append('tags', form.tags);
      if (file) formData.append('image', file);
      else formData.append('imageUrl', form.imageUrl);

      const res = await pinsAPI.create(formData);
      toast.success('Pin created successfully! 📌');
      navigate(`/pin/${res.data.pin._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create pin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Pin</h1>
          <p className={styles.subtitle}>Share your inspiration with the world</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            {/* Left: Image Upload */}
            <div className={styles.imageSection}>
              <div className={styles.uploadTabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${!useUrl ? styles.activeTab : ''}`}
                  onClick={() => setUseUrl(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload File
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${useUrl ? styles.activeTab : ''}`}
                  onClick={() => setUseUrl(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Image URL
                </button>
              </div>

              {!useUrl ? (
                <div
                  {...getRootProps()}
                  className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${preview ? styles.hasPreview : ''}`}
                >
                  <input {...getInputProps()} />
                  {preview && !useUrl ? (
                    <div className={styles.previewWrapper}>
                      <img src={preview} alt="Preview" className={styles.previewImg} />
                      <div className={styles.previewOverlay}>
                        <span>Click or drag to replace</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.dropContent}>
                      <div className={styles.dropIcon}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <p className={styles.dropTitle}>{isDragActive ? 'Drop it here!' : 'Drag & drop your image'}</p>
                      <p className={styles.dropSub}>or click to browse · JPG, PNG, GIF, WEBP · Max 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.urlUpload}>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={form.imageUrl}
                    onChange={handleUrlChange}
                    className={styles.urlInput}
                  />
                  {preview && (
                    <div className={styles.urlPreview}>
                      <img
                        src={preview}
                        alt="Preview"
                        className={styles.urlPreviewImg}
                        onError={() => { setPreview(''); toast.error('Could not load image from URL'); }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Form Fields */}
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Title <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Give your pin a title..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={100}
                />
                <span className={styles.charCount}>{form.title.length}/100</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Tell people more about this pin..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  maxLength={500}
                  rows={4}
                />
                <span className={styles.charCount}>{form.description.length}/500</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select
                  className={styles.select}
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Destination Link</label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://example.com"
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tags</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="nature, photography, travel (comma separated)"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
                <span className={styles.fieldHint}>Up to 10 tags, separated by commas</span>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <><span className={styles.btnSpinner} />Publishing...</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Publish Pin</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
