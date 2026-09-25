import React from "react";


const ProductCardSkeleton = () => (
    <div className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white w-full animate-pulse">
        <div className="h-36 bg-gray-200 rounded" />
        <div className="text-sm">
            <div className="h-3 w-16 bg-gray-200 rounded mt-3" />
            <div className="h-5 w-3/4 bg-gray-200 rounded mt-2" />
            <div className="flex items-center gap-0.5 mt-2">
                {Array(5).fill('').map((_, i) => (
                    <div key={i} className="md:w-3.5 w-3 h-3 bg-gray-200 rounded-sm" />
                ))}
            </div>
            <div className="flex items-end justify-between mt-3">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="md:w-[80px] w-[64px] h-[34px] bg-gray-200 rounded" />
            </div>
        </div>
    </div>
);

export default ProductCardSkeleton;
