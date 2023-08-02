import React, { FC, useEffect } from 'react'

import './style/products.scss'

const headerImg = '/static/image/header.webp'

const productImg1 = '/static/image/products/1.webp'
const productImg2 = '/static/image/products/2.webp'
const productImg3 = '/static/image/products/3.webp'

const imgs = [productImg1, productImg2, productImg3]

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
                <h2 className='header-title title_hero'>محصولات</h2>
            </header>
            <section className='products-wrapper'>
                {imgs.map((img, index) => {
                    return (
                        <ProductCard
                            title={`صندلی کد ${index + 1}`}
                            img={img}
                        />
                    )
                })}
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
