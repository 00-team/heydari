import React, { FC, useEffect } from 'react'

import './style/products.scss'

const headerImg = require('../../static/products/header.jpg')

const Products: FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <main className='products-page-container'>
            <header
                className='products-header'
                style={{
                    backgroundImage: `
linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
url(${headerImg})`,
                }}
            >
                <div className='header-title title_hero'>محصولات</div>
            </header>
            <section className='products-wrapper'>
                <ProductCard />
            </section>
        </main>
    )
}

const ProductCard: FC = () => {
    return <figure className='product-card'></figure>
}

export default Products
