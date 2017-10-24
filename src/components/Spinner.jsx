import React from 'react';
import FaSpinner from 'react-icons/lib/fa/spinner';

const Spinner = ({ visible }) => (
    <FaSpinner className={"spinner-global" + (visible ? '' : ' hidden')} />
);

export default Spinner;
