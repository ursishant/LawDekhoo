import React from 'react';
import { useParams, Link } from 'react-router-dom';
import blogPosts, { authors } from '../data/blogPosts';

// Social Share Component
const SocialShare = ({ postUrl, title }) => {
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="social-share-container">
      <span>Share this article:</span>
      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="social-share-btn twitter">
        <i className="fab fa-twitter"></i>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="social-share-btn facebook">
        <i className="fab fa-facebook-f"></i>
      </a>
      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="social-share-btn linkedin">
        <i className="fab fa-linkedin-in"></i>
      </a>
      <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="social-share-btn whatsapp">
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  );
};


const BlogPostPage = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === parseInt(id));

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Post not found</h2>
        <p>The blog post you are looking for does not exist.</p>
        <Link to="/blog" style={{ color: 'var(--primary)' }}>&larr; Back to Blog</Link>
      </div>
    );
  }

  const author = authors[post.authorId];
  const postUrl = window.location.href; // Get current URL for sharing

  return (
    <div className="blog-post-container">
      <header className="post-header">
        <Link to="/blog" className="back-to-blog-link">
          &larr; Back to All Posts
        </Link>
        <h1>{post.title}</h1>
        <p className="post-summary">{post.summary}</p>
        <div className="author-info-header">
          <img src={author.avatar} alt={author.name} className="author-avatar" />
          <div className="author-details">
            <Link to={`/author/${post.authorId}`}>{author.name}</Link>
            <span>{post.date} &bull; {post.readTime}</span>
          </div>
        </div>
      </header>

      <img src={post.image} alt={post.title} className="post-feature-image" />
      
      {/* Add the SocialShare component here */}
      <SocialShare postUrl={postUrl} title={post.title} />

      <div className="post-content">
        {post.content.split('\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export default BlogPostPage;
