import React from 'react';
import reddit from './../services/reddit';
import PostActionButton from './PostActionButton';
import { FaExpand, FaClose, FaArrowUp,
    FaArrowDown, FaExternalLink, FaRedditAlien } from 'react-icons/lib/fa';
// import { MdExpandMore, MdExpandLess } from 'react-icons/lib/md';

const PostActions = ({ userVote, onVoteClick, onExpandClick, onHidePostContent, link, redditLink, bodyExpanded }) => {
    return (
        <div className="post-actions">
            <PostActionButton action="upvote" hint="Upvote"
                clicked={userVote === reddit.VOTE_UP}
                clickHandler={() => onVoteClick(reddit.VOTE_UP)}>
                <FaArrowUp />
            </PostActionButton>
            <PostActionButton action="downvote" hint="Downvote"
                clicked={userVote === reddit.VOTE_DOWN}
                clickHandler={() => onVoteClick(reddit.VOTE_DOWN)}>
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
            <PostActionButton action="view-link" hint="Open Link" link={link}>
                <FaExternalLink />
            </PostActionButton>
            <PostActionButton action="view-link-reddit" hint="View in Reddit" link={redditLink}>
                <FaRedditAlien />
            </PostActionButton>
        </div>
    );
};

export default PostActions;
