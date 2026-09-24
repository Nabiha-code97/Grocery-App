import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-6xl font-medium text-primary">404</p>
        <p className="text-2xl font-medium">Page not found</p>
        <p className="text-gray-500">The page you are looking for doesn't exist or has moved.</p>
        <Link to="/" className="mt-2 px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">
            Back to Home
        </Link>
    </div>
)

export default NotFound
