import React from 'react';
import { FaBars, FaUser } from 'react-icons/lib/fa';

const Header = ({ title, onMenuClick, onUserHover }) => (
    <div className="header">
        <FaBars className="header-button menu-bar" onClick={onMenuClick} />
        <h1 className="header-title">{title}</h1>
        <FaUser className="header-button user-icon" onMouseOver={onUserHover} />
    </div>
);

export default Header;
