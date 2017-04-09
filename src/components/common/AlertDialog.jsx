import React from 'react';
import { FaCheck } from 'react-icons/lib/fa';

const AlertDialog = ({ show, title, message, onDismiss }) => {
    if (!show) { return null; }
    return (
        <div className="dialog-alert">
            <h3 className="dialog-title">{title}</h3>
            <p className="dialog-text">{message}</p>
            <div className="dialog-footer">
                <button className="btn-standard btn-alert-confirm" onClick={onDismiss}>
                    <FaCheck />OK
            </button>
            </div>
        </div>
    );
};
export default AlertDialog;
