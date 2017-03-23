import React from 'react';
import PostActions from './PostActions';
import PostDetails from './PostDetails';
import PostBody from './PostBody';

const Post = ({ postData, actionHandler, expanded }) => {
    const { title, thumbnail, id, permalink } = postData;
    const redditLink = `http://reddit.com${permalink}`;
    return (
        <div className="post" data-id={id}>
            <div className="post-head">
                <img className="post-thumbnail" src={thumbnail} alt="None" />
                <div className="post-section">
                    <p className="post-title">{title}</p>
                    <PostDetails postData={postData} />
                    <PostActions onExpandClick={() => actionHandler.expandPost(id)}
                        onHidePostContent={() => actionHandler.expandPost(null)}
                        bodyExpanded={expanded}
                        redditLink={redditLink} />
                </div>
            </div>
            <PostBody visible={expanded} postData={postData} />
        </div>
    );
};

export default Post;
