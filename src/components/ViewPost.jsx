import React from 'react'

export default function ViewPost() {
    const post = {
        image: '/dodobird.jpeg', // Replace with a valid image URL
        caption: 'A pair of dodo birds.',
        location: 'Johnson City, TN',
      };
    
      return (
        <div className="post-container">
          <div className="post">
            <img src={post.image} alt="Post" className="post-image" />
            <div className="post-details">
              <p className="post-caption">{post.caption}</p>
              <p className="post-location">Location: {post.location}</p>
            </div>
          </div>
        </div>
      );
}
