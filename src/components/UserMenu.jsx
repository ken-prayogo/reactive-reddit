import React from 'react';

const UserMenu = ({ visible, user, isLoggedIn, onHoverLeave, onSignIn, onSignOut }) => {
    let content = null;
    if (isLoggedIn) {
        content = (
            <div>
                <h3>{user.name}</h3>
                <p>Post Karma: {user.link_karma}</p>
                <p>Comment Karma: {user.comment_karma}</p>
                <button className="btn-standard" onClick={onSignOut}>Sign Out</button>
            </div>
        );
    } else {
        content = (
            <div>
                <p>You are not logged in.</p>
                <button className="btn-standard" onClick={onSignIn}>Sign In</button>
            </div>
        );
    }
    return visible ? (
        <div className="menu-user" onMouseLeave={onHoverLeave}>
            {content}
        </div>
    ) : null;
};
export default UserMenu;
