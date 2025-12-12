import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'text', height, width }) => {
    if (type === 'calendar') {
        return (
            <div className="skeleton-wrapper">
                <div className="skeleton skeleton-calendar-header"></div>
                <div className="skeleton skeleton-calendar-body"></div>
            </div>
        );
    }

    const style = {
        height: height || '20px',
        width: width || '100%',
    };

    return <div className="skeleton" style={style}></div>;
};

export default SkeletonLoader;
