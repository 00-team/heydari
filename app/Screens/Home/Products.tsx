import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

// import { Link } from 'react-router-dom'
import { ButtonArrow } from 'components'

import './style/products.scss'

const product_img1 = '/static/image/home/products/1.webp'
const product_img2 = '/static/image/home/products/2.webp'
const product_img3 = '/static/image/home/products/3.webp'
const product_img4 = '/static/image/home/products/4.webp'
const product_img5 = '/static/image/home/products/5.webp'
const product_img6 = '/static/image/home/products/6.webp'

const PRODUCTS_SLIDER = [
    product_img1,
    product_img2,
    product_img3,
    product_img4,
    product_img5,
    product_img6,
]

// BASE_PRODUCT_DETAIL_DELAY
// const BPDD = 0.2

const Products: FC = () => {
    const LazyRef = useRef<HTMLDivElement>(null)
    const [isIntersecting, setisIntersecting] = useState(false)

    useEffect(() => {
        if (LazyRef.current && !isIntersecting) {
            var observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry && entry.isIntersecting) {
                        setisIntersecting(true)
                        observer.disconnect()
                    }
                },
                {
                    threshold: 0.4,
                }
            )

            observer.observe(LazyRef.current)
        }
        return () => {
            if (observer) observer.disconnect()
        }
    }, [LazyRef])
    return (
        <section id='products' ref={LazyRef} className='products-container'>
            <h2
                className={`section_title products-header ${C(isIntersecting)}`}
            >
                <span className='header-wrapper'>
                    <span>بهترین محصولات</span>
                </span>
            </h2>
            <ProductsWrapper />
            <ButtonArrow classname='title_small products-btn' link='/products'>
                همه محصولات
            </ButtonArrow>
        </section>
    )
}

const ProductsWrapper: FC = () => {
    const [ActiveProduct, setActiveProduct] = useState(1)

    const returnClass = (idx0: number): string => {
        if (ActiveProduct === idx0) return 'active'
        if (ActiveProduct - 1 === idx0) return 'next'
        if (ActiveProduct + 1 === idx0) return 'prev'
        if (ActiveProduct === PRODUCTS_SLIDER.length - 1 && idx0 === 0)
            return 'prev'
        return ''
    }

    useEffect(() => {
        const inverval = setInterval(() => {
            setActiveProduct(value => {
                if (value + 2 > PRODUCTS_SLIDER.length) {
                    return 1
                }
                return value + 1
            })
        }, 5000)

        return () => clearInterval(inverval)
    }, [])

    return (
        <div className='products-wrapper'>
            {/* <div className='product-detail-container'>
                <div className='product-name-wrapper'>
                    {DEBUG_PRODCUTS.map(({ name }, index) => {
                        return (
                            <div
                                key={index}
                                className={`product-name ${
                                    innerWidth <= 1024
                                        ? 'title center'
                                        : 'section_title'
                                } ${returnClass(index)}`}
                            >
                                {name}
                            </div>
                        )
                    })}
                </div>
                <div className='product-details-wrapper'>
                    {DEBUG_PRODCUTS.map(({ details }, idx1) => {
                        return (
                            <div key={idx1} className='product-details title'>
                                {details.map(({ holder, data, Svg }, idx2) => {
                                    return (
                                        <div
                                            className={`product-detail ${returnClass(
                                                idx1
                                            )}`}
                                            style={{
                                                transitionDelay: `${
                                                    BPDD * idx2
                                                }s`,
                                            }}
                                            key={idx2}
                                        >
                                            <div className='holder'>
                                                <div className='holder-icon icon'>
                                                    <Svg size={25} />
                                                </div>
                                                <div className='holder-text'>
                                                    {holder}:
                                                </div>
                                            </div>
                                            <div className='data'>{data}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>

                <Link to={'/contact'} className='product-submit title_small'>
                    خرید فوری!
                </Link>
            </div> */}
            <div className='products-slider'>
                {PRODUCTS_SLIDER.map((img, idx0) => {
                    return (
                        <div
                            key={idx0}
                            className={`product-slider ${returnClass(idx0)}`}
                        >
                            <img
                                decoding={'async'}
                                loading={'lazy'}
                                draggable={'false'}
                                src={img}
                                alt='صندلی صنایع تولیدی حیدری'
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Products
