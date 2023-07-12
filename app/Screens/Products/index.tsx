import React, { FC, useEffect } from 'react'

import './style/products.scss'

const headerImg = require('../../static/products/header.jpg')

const productImg = require('../../static/products/1.png')
// const productImg2 = require('../../static/products/2.png')
// const productImg3 = require('../../static/products/3.png')

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
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </section>
        </main>
    )
}

const ProductCard: FC = () => {
    return (
        <figure className='product-card'>
            <img
                className='card-img'
                src={productImg}
                decoding={'async'}
                loading={'lazy'}
                alt=''
            />
            <figcaption className='card-caption title_smaller'>
                پاف کد F520 چهار پایه پلاستیکی
            </figcaption>
        </figure>
    )
}

export default Products
