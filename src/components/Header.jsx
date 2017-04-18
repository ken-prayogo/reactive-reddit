import React from 'react';
import { FaUser } from 'react-icons/lib/fa';

const Header = ({ title, onMenuClick, onUserHover }) => (
    <div className="header">
        <h1 className="header-title">{title}</h1>
        <FaUser className="header-button user-icon" onMouseOver={onUserHover} />
    </div>
);

export default Header;
