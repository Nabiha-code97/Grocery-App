import React from 'react'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'
import { useAppContext } from '../context/AppContext'

const BestSeller = () => {
  const{products, productsLoading} = useAppContext()

  const bestSellers = products.filter((product)=> product.inStock).slice(0,5)

  return (
    <div className='mt-16'>
        <p className='text-2xl md:text-3xl font-medium'>Best Sellers</p>
        <div className='grid grid-cols-1 min-[240px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 '>
            {productsLoading
              ? Array(5).fill('').map((_, index)=>(
                  <ProductCardSkeleton key={index}/>
              ))
              : bestSellers.map((product, index)=>(
                  <ProductCard key={index} product={product}/>
              ))}
        </div>

        {!productsLoading && bestSellers.length === 0 && (
          <p className='text-gray-500 mt-6'>No products available right now.</p>
        )}
    </div>
  )
}

export default BestSeller
