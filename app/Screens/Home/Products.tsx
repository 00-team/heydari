import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import { ColorSvg, RulerSvg, SvgProps, WeightSvg } from 'Icons'

import './style/products.scss'

const product_img = require('../../static/products/product.jpg')
const product_img2 = require('../../static/products/product2.jpg')
const product_img3 = require('../../static/products/product3.jpg')
const product_img4 = require('../../static/products/product4.jpg')
const product_img5 = require('../../static/products/product5.jpg')

interface ProductsModelProps {
    img: string
    name: string
    details: {
        holder: string
        Svg: React.FC<SvgProps>
        data: string
    }[]
    link: string
}

const DEBUG_PRODCUTS: ProductsModelProps[] = [
    {
        img: product_img,
        name: 'صندلی اداری مدل 4312',
        details: [
            {
                holder: 'رنگ',
                Svg: ColorSvg,
                data: 'ابی',
            },
            {
                holder: 'طول',
                Svg: RulerSvg,
                data: '123',
            },
            {
                holder: 'عرض',
                Svg: RulerSvg,
                data: '33',
            },
            {
                holder: 'وزن',
                Svg: WeightSvg,
                data: '3',
            },
        ],
        link: '/',
    },
    {
        img: product_img2,
        name: 'صندلی اداری مدل 213',
        details: [
            {
                holder: 'رنگ',
                Svg: ColorSvg,
                data: 'بنفش',
            },
            {
                holder: 'طول',
                Svg: RulerSvg,
                data: '132',
            },
            {
                holder: 'عرض',
                Svg: RulerSvg,
                data: '31',
            },
            {
                holder: 'وزن',
                Svg: WeightSvg,
                data: '1',
            },
        ],
        link: '/',
    },
    {
        img: product_img3,
        name: 'صندلی اداری مدل 321',
        details: [
            {
                holder: 'رنگ',
                Svg: ColorSvg,
                data: 'سیاه',
            },
            {
                holder: 'طول',
                Svg: RulerSvg,
                data: '142',
            },
            {
                holder: 'عرض',
                Svg: RulerSvg,
                data: '41',
            },
            {
                holder: 'وزن',
                Svg: WeightSvg,
                data: '5',
            },
        ],
        link: '/',
    },
    {
        img: product_img4,
        name: 'صندلی اداری مدل 124',
        details: [
            {
                holder: 'رنگ',
                Svg: ColorSvg,
                data: 'زرد',
            },
            {
                holder: 'طول',
                Svg: RulerSvg,
                data: '150',
            },
            {
                holder: 'عرض',
                Svg: RulerSvg,
                data: '20',
            },
            {
                holder: 'وزن',
                Svg: WeightSvg,
                data: '4',
            },
        ],
        link: '/',
    },
    {
        img: product_img5,
        name: 'صندلی اداری مدل 213',
        details: [
            {
                holder: 'رنگ',
                Svg: ColorSvg,
                data: 'نارنجی',
            },
            {
                holder: 'طول',
                Svg: RulerSvg,
                data: '100',
            },
            {
                holder: 'عرض',
                Svg: RulerSvg,
                data: '30',
            },
            {
                holder: 'وزن',
                Svg: WeightSvg,
                data: '30',
            },
        ],
        link: '/',
    },
]

// BASE_PRODUCT_DETAIL_DELAY
const BPDD = 0.2

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
        <section ref={LazyRef} className='products-container'>
            <h2
                className={`section_title products-header ${C(isIntersecting)}`}
            >
                <span className='header-wrapper'>
                    <span>بهترین محصولات</span>
                </span>
            </h2>
            <ProductsWrapper />
        </section>
    )
}

const ProductsWrapper: FC = () => {
    const [ActiveProduct, setActiveProduct] = useState(1)

    const returnClass = (idx0: number): string => {
        if (ActiveProduct === idx0) return 'active'
        if (ActiveProduct - 1 === idx0) return 'next'
        if (ActiveProduct + 1 === idx0) return 'prev'
        if (ActiveProduct === DEBUG_PRODCUTS.length - 1 && idx0 === 0)
            return 'prev'
        return ''
    }

    useEffect(() => {
        const inverval = setInterval(() => {
            setActiveProduct(value => {
                if (value + 2 > DEBUG_PRODCUTS.length) {
                    return 1
                }
                return value + 1
            })
        }, 5000)

        return () => clearInterval(inverval)
    }, [])

    return (
        <div className='products-wrapper'>
            <div className='product-detail-container'>
                <div className='product-name-wrapper'>
                    {DEBUG_PRODCUTS.map(({ name }, index) => {
                        return (
                            <div
                                key={index}
                                className={`product-name section_title ${returnClass(
                                    index
                                )}`}
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

                <button className='product-submit title_small'>
                    خرید فوری!
                </button>
            </div>
            <div className='products-slider'>
                {DEBUG_PRODCUTS.map(({ img }, idx0) => {
                    return (
                        <div
                            key={idx0}
                            className={`product-slider ${returnClass(idx0)}`}
                        >
                            <img
                                loading='lazy'
                                draggable={'false'}
                                src={img}
                                alt=''
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Products
