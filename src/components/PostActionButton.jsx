import React from 'react';

const PostActionButton = ({ clicked, action, children, hint, clickHandler, link, visible = true }) => {
    const Tag = link ? 'a' : 'button';
    const classes = [
        'btn-circle',
        `action-${action}`
    ];
    if (!visible) { classes.push('hidden'); }
    if (clicked) { classes.push('clicked'); }
    return (
        <Tag className={classes.join(' ')}
            title={hint}
            href={link ? link : '#'} target="_blank"
            onClick={clickHandler}>
            {children}
        </Tag>
    );
};

export default PostActionButton;
