import React from 'react';

const PostDetails = ({ postData }) => {
    const { score, subreddit } = postData;
    return (
        <div className="post-details">
            <p className="post-score">{score}</p>
            <p className="post-subreddit">{subreddit}</p>
        </div>
    );
};

export default PostDetails;
