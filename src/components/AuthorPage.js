import React from 'react';
import { useParams, Link } from 'react-router-dom';
import blogPosts, { authors } from '../data/blogPosts';

const AuthorPage = () => {
  const { id } = useParams();
  const author = authors[parseInt(id)];
  const postsByAuthor = blogPosts.filter(p => p.authorId === parseInt(id));

  if (!author) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Author not found</h2>
        <Link to="/blog" style={{ color: 'var(--primary)' }}>&larr; Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="author-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header className="author-header">
        <img src={author.avatar} alt={author.name} className="author-avatar-large" />
        <h1>{author.name}</h1>
        <p style={{ color: '#555', maxWidth: '600px', margin: '0 auto' }}>{author.bio}</p>
      </header>

      <h2 className="section-title">Posts by {author.name}</h2>
      <div className="grid-container">
        {postsByAuthor.map((post) => (
          <article key={post.id} className="card">
             <div style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.25rem' }}>{post.title}</h3>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                {post.date} &bull; {post.readTime}
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

export default AuthorPage;