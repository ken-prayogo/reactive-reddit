import React from 'react';
import config from '../../config.json';
import { ThemeContext } from './ThemeContext';

const SubDescription = ({ currentSub, user }) => {
    // Add custom verbage for a user's Frontpage vs a subreddit
    let isFrontPage = !currentSub;
    let description = <p>You are viewing r/{currentSub ? currentSub : config.api.subs.default}</p>;
    if (user && isFrontPage) {
        description = <p>You are viewing your Frontpage</p>;
    }
    return (
        <ThemeContext.Consumer>
        {theme => (
            <div className={`sub-description ${theme}`}>
                {description}
            </div>
        )}
        </ThemeContext.Consumer>
    );
};
export default SubDescription;
