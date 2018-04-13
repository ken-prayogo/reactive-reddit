import React from 'react';

export const themes = {
    light: 'light',
    dark: 'dark'
};

export const ThemeContext = React.createContext(
    themes.light // default value
);
