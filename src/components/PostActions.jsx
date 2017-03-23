import React from 'react';
import PostActionButton from './PostActionButton';
import { FaExpand, FaClose, FaArrowUp, FaArrowDown, FaRedditAlien } from 'react-icons/lib/fa';
// import { MdExpandMore, MdExpandLess } from 'react-icons/lib/md';

const PostActions = ({ onExpandClick, onHidePostContent, redditLink, bodyExpanded }) => {
    return (
        <div className="post-actions">
            <PostActionButton action="upvote" hint="Upvote"
                clickHandler={() => {}}>
                <FaArrowUp />
            </PostActionButton>
            <PostActionButton action="downvote" hint="Downvote"
                clickHandler={() => {}}>
                <FaArrowDown />
            </PostActionButton>
            <PostActionButton action="expand" hint="Expand"
                clickHandler={onExpandClick}
                visible={!bodyExpanded}>
                <FaExpand />
            </PostActionButton>
            <PostActionButton action="hide-content" hint="Hide Content"
                clickHandler={onHidePostContent}
                visible={bodyExpanded}>
                <FaClose />
            </PostActionButton>
            <PostActionButton action="view-link-reddit" hint="View in Reddit" link={redditLink}>
                <FaRedditAlien />
            </PostActionButton>
        </div>
    );
};

export default PostActions;
