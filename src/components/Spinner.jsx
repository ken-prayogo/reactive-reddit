import React from 'react';
import FaSpinner from 'react-icons/lib/fa/spinner';

const Spinner = ({ visible, isGlobal = true }) => {
    const classes = [];
    if (isGlobal) {
        classes.push('spinner-global');
    } else {
        classes.push('spinner');
    }
    if (!visible) {
        classes.push('hidden');
    }
    return <FaSpinner className={classes.join(' ')} />;
}

export default Spinner;
