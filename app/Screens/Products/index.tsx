import React, { FC, useEffect } from 'react'

import './style/products.scss'

const headerImg = require('../../static/products/header.jpg')

const productImg = require('../../static/products/1.png')
const productImg2 = require('../../static/products/2.png')
const productImg3 = require('../../static/products/3.png')

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
                <ProductCard
                    title='پاف کد F520 چهار پایه پلاستیکی'
                    img={productImg}
                />
                <ProductCard
                    title='پاف کد F520 چهار پایه پلاستیکی'
                    img={productImg2}
                />
                <ProductCard
                    title='پاف کد F520 چهار پایه پلاستیکی'
                    img={productImg3}
                />
                <ProductCard
                    title='پاف کد F520 چهار پایه پلاستیکی'
                    img={productImg3}
                />
                <ProductCard
                    title='پاف کد F520 چهار پایه پلاستیکی'
                    img={productImg2}
                />
                <ProductCard
                    title='پاف کد F520 چهار پایه پلاستیکی'
                    img={productImg}
                />
            </section>
        </main>
    )
}

interface ProductCardProps {
    img: string
    title: string
}

const ProductCard: FC<ProductCardProps> = ({ img, title }) => {
    return (
        <figure className='product-card'>
            <img
                className='card-img'
                src={img}
                decoding={'async'}
                loading={'lazy'}
                alt=''
            />
            <figcaption className='card-caption title_smaller'>
                {title}
            </figcaption>
        </figure>
    )
}

export default Products
