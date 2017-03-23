import React from 'react';

const PostActionButton = ({ action, children, hint, clickHandler, link, visible = true }) => {
    const Tag = link ? 'a' : 'button';
    return (
        <Tag className={`btn-circle action-${action} ${!visible ? 'hidden' : ''}`}
            title={hint}
            href={link ? link : '#'} target="_blank"
            onClick={clickHandler}>
            {children}
        </Tag>
    );
};

export default PostActionButton;
