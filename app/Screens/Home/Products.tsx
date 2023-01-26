import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import { ColorSvg, RulerSvg, WeightSvg } from 'Icons'

import './style/products.scss'

const DEBUG_PRODCUTS = [
    {
        img: 'https://picsum.photos/1021/960',
        details: {
            name: 'صندلی اداری مدل 123',
            color: 'آبی',
            weight: '3',
            height: '180',
            width: '80',
            link: '/',
        },
    },
    {
        img: 'https://picsum.photos/1023/960',
        details: {
            name: 'صندلی اداری مدل 321',
            color: 'آبی',
            weight: '3',
            height: '180',
            width: '80',
            link: '/',
        },
    },
    {
        img: 'https://picsum.photos/1021/961',
        details: {
            name: 'صندلی اداری مدل 2312',
            color: 'آبی',
            weight: '3',
            height: '180',
            width: '80',
            link: '/',
        },
    },
    {
        img: 'https://picsum.photos/1022/962',
        details: {
            name: 'صندلی اداری مدل 2312',
            color: 'آبی',
            weight: '3',
            height: '180',
            width: '80',
            link: '/',
        },
    },
    {
        img: 'https://picsum.photos/1021/963',
        details: {
            name: 'صندلی اداری مدل 2312',
            color: 'آبی',
            weight: '3',
            height: '180',
            width: '80',
            link: '/',
        },
    },
]

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
            <div className='product-detail-wrapper'>
                <div className='product-name section_title'>لورم ایپسوم</div>
                <div className='product-details title'>
                    <div className='product-detail '>
                        <div className='holder'>
                            <div className='holder-icon icon'>
                                <ColorSvg size={25} />
                            </div>
                            <div className='holder-text'>رنگ:</div>
                        </div>
                        <div className='data'>نارنجی</div>
                    </div>
                    <div className='product-detail'>
                        <div className='holder'>
                            <div className='holder-icon icon'>
                                <WeightSvg size={25} />
                            </div>
                            <div className='holder-text'>وزن:</div>
                        </div>
                        <div className='data'>3</div>
                    </div>
                    <div className='product-detail'>
                        <div className='holder'>
                            <div className='holder-icon icon'>
                                <RulerSvg size={25} />
                            </div>
                            <div className='holder-text'>طول:</div>
                        </div>
                        <div className='data'>60</div>
                    </div>
                    <div className='product-detail'>
                        <div className='holder'>
                            <div className='holder-icon icon'>
                                <RulerSvg
                                    style={{ rotate: `-90deg` }}
                                    size={25}
                                />
                            </div>
                            <div className='holder-text'>عرض:</div>
                        </div>
                        <div className='data'>60</div>
                    </div>
                </div>
                <button className='product-submit title_small'>
                    خرید فوری!
                </button>
            </div>
            <div className='products-slider'>
                {DEBUG_PRODCUTS.map(({ img }, idx0) => {
                    const returnClass = (): string => {
                        if (ActiveProduct === idx0) return 'active'
                        if (ActiveProduct - 1 === idx0) return 'next'
                        if (ActiveProduct + 1 === idx0) return 'prev'
                        if (
                            ActiveProduct === DEBUG_PRODCUTS.length - 1 &&
                            idx0 === 0
                        )
                            return 'prev'
                        return ''
                    }

                    return (
                        <div
                            key={idx0}
                            className={`product-slider ${returnClass()}`}
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
