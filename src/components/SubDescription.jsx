import React from 'react';
import config from '../../config.json';

const SubDescription = ({ currentSub, user }) => {
    // Add custom verbage for a user's Frontpage vs a subreddit
    let isFrontPage = !currentSub;
    let description = <p>You are viewing r/{currentSub ? currentSub : config.api.subs.default}</p>;
    if (user && isFrontPage) {
        description = <p>You are viewing your Frontpage</p>;
    }
    return (
        <div className="sub-description">
            {description}
        </div>
    );
};
export default SubDescription;
