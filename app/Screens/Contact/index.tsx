import React, { FC, useEffect } from 'react'

import { ContactForm } from 'components'

import './style/contact.scss'

const Contact: FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <main className='contact-container'>
            <img
                className='contact-img'
                src='/static/image/contact.webp'
                decoding={'async'}
                loading={'lazy'}
                alt=''
            />
            <ContactForm />
        </main>
    )
}

export default Contact
