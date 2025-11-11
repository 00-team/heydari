import { Component, Show } from 'solid-js'

import { OrderList, OrderState } from 'abi'
import {
    Calendar2Icon,
    CartIcon,
    CheckIcon,
    CloseIcon,
    MobileIcon,
    PersonIcon,
} from 'icons'
import { createStore, produce, unwrap } from 'solid-js/store'
import { setPopup } from 'store/popup'
import './style/orders.scss'

const Orders: Component = () => {
    type STATE = {
        page: number
        loading: boolean
        orders: OrderList | null
    }
    const [state, setState] = createStore<STATE>({
        orders: null,
        loading: false,
        page: 0,
    })

    const search = async () => {
        let page = unwrap(state.page)

        // let res = await api_admin_orders_get({oid: null})``
        return
    }

    const Empty = () => {
        return (
            <div class='empty-order title_smaller'>
                <div class='icon'>
                    <CloseIcon />
                </div>
                <p>سفارشی در سیستم ثبت نشده!</p>
            </div>
        )
    }

    return (
        <div class='orders-container'>
            <header class='section_title'>سفارشات حیدری</header>
            <div class='pagination'>
                <button
                    class='title_smaller page-cta'
                    disabled={state.page == 0}
                    onClick={() => {
                        setState(
                            produce(s => {
                                s.page--
                            })
                        )
                        search()
                    }}
                >
                    صفحه قبل
                </button>
                <button
                    class='title_smaller page-cta'
                    // disabled={state.page == }
                    onClick={() => {
                        setState(
                            produce(s => {
                                s.page++
                            })
                        )
                        search()
                    }}
                >
                    صفحه بعد
                </button>
            </div>
            <div class='divider'></div>
            <div class='orders-wrapper'>
                <Show when={!state.loading} fallback={<Loading />}>
                    <Show when={true} fallback={<Empty />}>
                        <Order />
                    </Show>
                </Show>
            </div>
        </div>
    )
}

const Order: Component = () => {
    const submit = () => {}
    const reject = () => {}

    const label_map: Record<OrderState, string> = {
        pending: 'حالت انتظار',
        rejected: 'رد شده!',
        resolved: 'رسیدگی شده!',
    }

    return (
        <div class='order-cmp-wrapper'>
            <div class='order-cmp'>
                <div class='order-infos'>
                    <div
                        class='order-status pending description'
                        classList={
                            {
                                // [P.order.state]: true
                            }
                        }
                    >
                        {label_map['pending']}
                    </div>
                    <div class='wrapper'>
                        <div class='product-name title'>صندلی رادین اپنی</div>
                        <div class='order-sum title_small number'>
                            <span>120,000</span>
                            <div class='toman'>تومان</div>
                        </div>
                        <div class='order-info'>
                            <div class='order-count'>10 عدد</div>
                            <div class='order-divider'>|</div>
                            <div class='order-date'>1400/09/09</div>
                        </div>
                    </div>

                    <div class='buyer-wrapper'>
                        <div class='buyer-head title_small'>
                            <span>خریدار</span>
                        </div>
                        <div class='buyer-infos description'>
                            <div class='buyer-name'>
                                <PersonIcon />
                                عباس تقوی روشن
                            </div>
                            <a href={`tel:09120974411`} class='buyer-info '>
                                <div class='holder'>
                                    <MobileIcon />
                                    تلفن:
                                </div>
                                <div class='data'>09120974956</div>
                            </a>
                            <div class='buyer-info '>
                                <div class='holder'>
                                    <Calendar2Icon />
                                    عضویت:
                                </div>
                                <div class='data'>1400/09/09</div>
                            </div>
                            <div class='buyer-info '>
                                <div class='holder'>
                                    <CartIcon />
                                    سفارش تا حالا
                                </div>
                                <div class='data'>5</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class='product-img-wrapper'>
                    <div class='product-img'>
                        <img src='/static/image/home/hero/office.webp' alt='' />
                    </div>
                </div>
            </div>
            <div class='order-ctas title_smaller'>
                <button
                    class='cta reject'
                    onclick={() => {
                        setPopup({
                            show: true,
                            type: 'error',
                            Icon: CloseIcon,
                            title: 'سفارش را رد میکنید؟',
                            onSubmit: reject,
                        })
                    }}
                >
                    <CloseIcon />
                    رد
                </button>
                <button
                    class='cta submit'
                    onclick={() =>
                        setPopup({
                            show: true,
                            type: 'success',
                            Icon: CheckIcon,
                            title: 'سفارش را تایید میکنید؟',
                            onSubmit: submit,
                        })
                    }
                >
                    <CheckIcon />
                    تایید
                </button>
            </div>
        </div>
    )
}

const Loading: Component = () => {
    return <></>
}

export default Orders
