import React from 'react';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blogPosts';

const BlogPage = () => {
  return (
    <div className="blog-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h1 className="section-title">LegalBridge Blog</h1>
      <p style={{ textAlign: 'center', maxWidth: '700px', margin: '-1rem auto 2rem', color: '#555' }}>
        Insights, guides, and stories on Indian law, your rights, and navigating the justice system.
      </p>
      <div className="grid-container">
        {blogPosts.map((post) => (
          <article key={post.id} className="card">
            <div style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.25rem' }}>{post.title}</h3>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                By {post.author} • {post.date}
              </div>
              <p style={{ flexGrow: 1, lineHeight: 1.5, color: '#333' }}>{post.summary}</p>
              <Link to={`/blog/${post.id}`} style={{ marginTop: '1rem', alignSelf: 'flex-start', color: 'var(--primary)', fontWeight: 600 }}>
                Read More &rarr;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
