import React, { FC } from 'react'

import './style/product.scss'

const Product: FC = () => {
    return (
        <div className='product-container'>
            <div className='product-wrapper'>
                <div className='product-detials'></div>
                <ProductImgs />
            </div>
        </div>
    )
}

const ProductImgs: FC = () => {
    return (
        <div className='product-imgs'>
            <img className='main-img' src='https://picsum.photos/1080/700' />
            <div className='other-imgs'></div>
        </div>
    )
}

export default Product
