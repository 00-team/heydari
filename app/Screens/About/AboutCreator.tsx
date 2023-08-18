import React, { FC } from 'react'

import './style/aboutCreator.scss'

const ownerImg = '/static/image/about/owner.webp'

export const AboutCreator: FC = () => {
    return (
        <section className='about-page-creator'>
            <aside className='creator-data'>
                <h2 className='data-title title_hero'>
                    <span>محمدرضا حیدری</span>
                </h2>
                <p className='title_small'>
                    لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و
                    با استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه
                    و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی
                    تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای
                    کاربردی می باشد
                </p>
            </aside>
            <aside className='creator-img'>
                <img
                    src={ownerImg}
                    loading={'lazy'}
                    decoding={'async'}
                    alt={'بنیان گذار صنایع تولیدی حیدری'}
                />
            </aside>
        </section>
    )
}
