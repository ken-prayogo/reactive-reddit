import React from 'react';
import { FaStar } from 'react-icons/lib/fa';

const PostDetails = ({ postData }) => {
    const { score, subreddit_name_prefixed, author, gilded, over_18 } = postData;
    const { userVote, timePosted } = postData.custom;
    let voteClass = '';
    if (userVote !== null) {
        voteClass = `voted-${userVote}`;
    }
    return (
        <div className="post-details">
            <p className={`post-score ${voteClass}`}>{score}</p>
            {gilded ? <p className="post-golds"><FaStar />{gilded}</p> : null }
            {over_18 ? <p className="post-nsfw">NSFW</p> : null}
            <p className="post-subreddit">{subreddit_name_prefixed}</p>
            <p className="post-author">{timePosted} ago by {author}</p>
        </div>
    );
};

export default PostDetails;
