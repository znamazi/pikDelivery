import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const rootStyle = {
    display: 'block',
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
};

export default function CircularIndeterminate() {
    return (
        <div style={rootStyle}>
            <CircularProgress/>
            {/*<CircularProgress color="secondary" />*/}
        </div>
    );
}
