import React from 'react'

const Spinner = ({ className = 'min-h-screen' }) => (
    <div className={`flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
)

export default Spinner
