import React, { FC, useEffect } from 'react'

import './style/products.scss'

const Products: FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return <div className='products-page-container'>Products</div>
}

export default Products
