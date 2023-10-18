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
const productImg12 = '/static/image/products/12.webp'
const productImg13 = '/static/image/products/13.webp'
const productImg14 = '/static/image/products/14.webp'
const productImg15 = '/static/image/products/15.webp'
const productImg16 = '/static/image/products/16.webp'
const productImg17 = '/static/image/products/17.webp'
const productImg18 = '/static/image/products/18.webp'
const productImg19 = '/static/image/products/19.webp'
const productImg20 = '/static/image/products/20.webp'
const productImg21 = '/static/image/products/21.webp'
const productImg22 = '/static/image/products/22.webp'
const productImg23 = '/static/image/products/23.webp'
const productImg24 = '/static/image/products/24.webp'
const productImg25 = '/static/image/products/25.webp'
const productImg26 = '/static/image/products/26.webp'
const productImg27 = '/static/image/products/27.webp'
const productImg28 = '/static/image/products/28.webp'
const productImg29 = '/static/image/products/29.webp'

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
    productImg12,
    productImg13,
    productImg14,
    productImg15,
    productImg16,
    productImg17,
    productImg18,
    productImg19,
    productImg20,
    productImg21,
    productImg22,
    productImg23,
    productImg24,
    productImg25,
    productImg26,
    productImg27,
    productImg28,
    productImg29,
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
                            key={index}
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
                alt='صندلی صنایع تولیدی حیدری'
            />
            <figcaption className='card-caption title_smaller'>
                {title}
            </figcaption>
        </figure>
    )
}

export default Products
