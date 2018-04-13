import React from 'react';
// import { ThemeContext } from '../ThemeContext';

function ThemedButton(props) {
    return (
        <button className={`btn-standard btn-filter-submit`} onClick={props.onClick}>{props.children}</button>
    );
}

export default ThemedButton;
