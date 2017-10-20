import React from 'react';
import reddit from './../services/reddit';
import PostActionButton from './PostActionButton';
import {
    FaChevronDown,
    FaClose,
    FaArrowUp,
    FaArrowDown,
    FaRedditAlien
} from 'react-icons/lib/fa';

const PostActions = ({ customData, onVoteClick, onExpandClick, onHidePostContent, link, redditLink, bodyExpanded }) => {
    return (
        <div className="post-actions">
            <PostActionButton action="upvote" hint="Upvote"
                clicked={customData.userVote === reddit.VOTE_UP}
                clickHandler={() => onVoteClick(reddit.VOTE_UP)}>
                <FaArrowUp />
            </PostActionButton>
            <PostActionButton action="downvote" hint="Downvote"
                clicked={customData.userVote === reddit.VOTE_DOWN}
                clickHandler={() => onVoteClick(reddit.VOTE_DOWN)}>
                <FaArrowDown />
            </PostActionButton>
            <PostActionButton action="expand" hint="Expand"
                clickHandler={onExpandClick}
                visible={!bodyExpanded && customData.canExpand}>
                <FaChevronDown />
            </PostActionButton>
            <PostActionButton action="hide-content" hint="Hide Content"
                clickHandler={onHidePostContent}
                visible={bodyExpanded && customData.canExpand}>
                <FaClose />
            </PostActionButton>
            <PostActionButton action="view-link-reddit" hint="View in Reddit" link={redditLink}>
                <FaRedditAlien />
            </PostActionButton>
        </div>
    );
};

export default PostActions;
