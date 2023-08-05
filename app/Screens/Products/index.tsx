import React, { FC, useEffect } from 'react'

import { ContactForm } from 'components'

import './style/products.scss'

const headerImg = '/static/image/header.webp'

const productImg1 = '/static/image/products/1.webp'
const productImg2 = '/static/image/products/2.webp'
const productImg3 = '/static/image/products/3.webp'
const productImg4 = '/static/image/products/4.webp'
const productImg5 = '/static/image/products/5.webp'
const productImg6 = '/static/image/products/6.webp'
const productImg7 = '/static/image/products/7.webp'
const productImg8 = '/static/image/products/8.webp'
const productImg9 = '/static/image/products/9.webp'
const productImg10 = '/static/image/products/10.webp'
const productImg11 = '/static/image/products/11.webp'

const imgs = [
    productImg1,
    productImg2,
    productImg3,
    productImg4,
    productImg5,
    productImg6,
    productImg7,
    productImg8,
    productImg9,
    productImg10,
    productImg11,
]

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
            <ContactForm />
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
