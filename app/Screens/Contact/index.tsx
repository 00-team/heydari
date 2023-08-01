import React, { FC } from 'react'

import { FaxSvg, PhoneSvg } from 'Icons'

import './style/contact.scss'

const Contact: FC = () => {
    return (
        <main className='contact-container'>
            <img
                className='contact-img'
                src='/static/image/contact.webp'
                decoding={'async'}
                loading={'lazy'}
                alt=''
            />
            <div className='contact-wrapper'>
                <aside className='contact-data title_small'>
                    <div className='contact-header'>
                        <div className='link'>
                            <div className='link-holder'>
                                <div className='icon'>
                                    <FaxSvg size={25} />
                                </div>
                                <div className='holder'>تلفن دفتر</div>
                            </div>
                            <div className='data'>09120974955</div>
                        </div>
                        <div className='link'>
                            <div className='link-holder'>
                                <div className='icon'>
                                    <PhoneSvg size={25} />
                                </div>
                                <div className='holder'>تلفن ثابت</div>
                            </div>
                            <div className='data'>0218852221</div>
                        </div>
                    </div>
                    <div className='contact-body'>
                        <p className='title_small'>
                            آدرس: لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم
                            از صنعت چاپ و با استفاده از طراحان گرافیک است
                            چاپگرها و متون بلکه روزنامه و مجله در ستون و
                            سطرآنچنان که لازم است
                        </p>
                    </div>
                </aside>
                <aside className='location'>
                    <iframe
                        src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.8468496861897!2d51.39778397484384!3d35.72998486503635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e012d4c92106d%3A0x7b7eec5872b4ff0!2sTehran%20Province%2C%20Tehran%2C%2021St%20St%2C%20Iran!5e0!3m2!1sen!2s!4v1688300364495!5m2!1sen!2s'
                        allowFullScreen
                        loading='lazy'
                        height={500}
                    ></iframe>
                </aside>
            </div>
        </main>
    )
}

export default Contact
