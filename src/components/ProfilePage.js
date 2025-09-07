import React, { useEffect, useState } from 'react';
import { fetchMe, updateProfile } from '../services/apiService';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('You are not logged in.');
      return;
    }
    fetchMe(token)
      .then((data) => setUser(data.user))
      .catch((e) => setError(e.message || 'Failed to load profile'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    if (!token || !user) return;
    setSaving(true);
    try {
      const socials = {
        twitter: e.target.twitter.value.trim(),
        linkedin: e.target.linkedin.value.trim(),
        github: e.target.github.value.trim()
      };
      const { user: updated } = await updateProfile(token, { name: e.target.name.value.trim(), phone: e.target.phone.value.trim(), socials });
      setUser(updated);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h2 className="section-title">Profile</h2>
      {error && <div className="auth-error">{error}</div>}
      {user && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="avatar" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{user.name}</div>
              <div style={{ color: 'var(--text-light)' }}>{user.email}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSave}>
            <label>
              Name
              <input name="name" defaultValue={user.name} />
            </label>
            <label>
              Mobile Number
              <input name="phone" type="tel" defaultValue={user.phone || ''} placeholder="e.g. +91 98765 43210" />
            </label>
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <label>
                Twitter
                <input name="twitter" defaultValue={user.socials?.twitter || ''} placeholder="https://twitter.com/username" />
              </label>
              <label>
                LinkedIn
                <input name="linkedin" defaultValue={user.socials?.linkedin || ''} placeholder="https://linkedin.com/in/username" />
              </label>
              <label>
                GitHub
                <input name="github" defaultValue={user.socials?.github || ''} placeholder="https://github.com/username" />
              </label>
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;


