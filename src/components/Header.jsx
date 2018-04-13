import React from 'react';
import { ThemeContext, themes } from './ThemeContext';
import { FaUser } from 'react-icons/lib/fa';

const Header = ({ title, onMenuClick, onThemeClick, onUserHover }) => (
    <div className="header">
        <h1 className="header-title">{title}</h1>
        <aside className="header-buttons">
            <ThemeContext.Consumer>
            {theme => (
                <button id="theme-switch" className={`header-button btn-standard ${theme}`}
                    onClick={onThemeClick}>{theme === themes.light ? 'Light' : 'Dark' }</button>
            )}
            </ThemeContext.Consumer>
            <FaUser className="header-button user-icon" onMouseOver={onUserHover} />
        </aside>
    </div>
);

export default Header;
