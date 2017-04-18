import React from 'react';
import config from '../../config.json';

const SubDescription = ({ currentSub, user }) => {
    let description = null;
    let isFrontPage = false;
    // Add custom verbage for a user's Frontpage vs a subreddit
    if (currentSub) {
        isFrontPage = currentSub.toUpperCase() === config.api.subs.default_logged_in.toUpperCase();
        description = <p>You are viewing {user && isFrontPage ? 'your ' : 'r/'}{currentSub}</p>;
    }
    return (
        <div className="sub-description">
            {description}
        </div>
    );
};
export default SubDescription;
