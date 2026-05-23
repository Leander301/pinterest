import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { toast.error('Please fill in all required fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to PinVault!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.moodboard}>
          {[
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&h=350&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=280&fit=crop',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=400&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=320&fit=crop',
            'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=380&fit=crop',
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=260&fit=crop',
          ].map((src, i) => (
            <div key={i} className={styles.moodItem} style={{ animationDelay: `${i * 100}ms` }}>
              <img src={src} alt="" loading="lazy" onError={e => e.target.style.display = 'none'} />
            </div>
          ))}
          <div className={styles.moodOverlay}>
            <div className={styles.brandMark}>
              <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="14" fill="white"/>
                <path d="M14 6C10.69 6 8 8.69 8 12c0 2.24 1.33 4.21 3.25 5.16L10 22h8l-1.25-4.84C18.67 16.21 20 14.24 20 12c0-3.31-2.69-6-6-6zm0 9a3 3 0 110-6 3 3 0 010 6z" fill="#E63946"/>
              </svg>
              <span>PinVault</span>
            </div>
            <p>"Join the creative community"</p>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Create account</h1>
            <p className={styles.formSubtitle}>Start saving and sharing your inspiration</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Username *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="your_username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Your Name"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email address *</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password *</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <p className={styles.terms}>
              By creating an account, you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.btnSpinner}/> : null}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className={styles.divider}><span>or</span></div>

          <div className={styles.demoNote}>
            <p>Already have an account?</p>
            <Link to="/login" className={styles.switchLink}>Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
