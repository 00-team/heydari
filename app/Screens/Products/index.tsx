import React, { FC, useEffect } from 'react'

import './style/products.scss'

const Products: FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className='products-page-container'>
            <header className='products-header'>
                <div className='header-title'></div>
            </header>
        </div>
    )
}

export default Products
