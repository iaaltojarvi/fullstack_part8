import React from 'react'

const Notify = ({ errorMessage }) => {
    if (!errorMessage) {
        return null
    }

    return (
        <div style={{ color: 'red', border: '1px solid black', padding: 10 }}>
            {errorMessage}
        </div>
    )
}

export default Notify