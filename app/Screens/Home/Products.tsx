import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import { ColorSvg, RulerSvg, WeightSvg } from 'Icons'

import './style/products.scss'

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
            <div className='products-wrapper'>
                <div className='product-detail-wrapper'>
                    <div className='product-name section_title'>
                        لورم ایپسوم
                    </div>
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
                <div className='product-slider'></div>
            </div>
        </section>
    )
}

export default Products
