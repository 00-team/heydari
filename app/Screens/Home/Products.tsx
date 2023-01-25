import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

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
                    <span>محصولات</span>
                </span>
            </h2>
            <div className="products-wrapper"></div>
        </section>
    )
}

export default Products
