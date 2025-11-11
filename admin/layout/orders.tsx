import { Component, Show } from 'solid-js'

import { OrderList } from 'abi'
import { CloseIcon } from 'icons'
import { createStore, produce, unwrap } from 'solid-js/store'
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
    return (
        <div class='order-cmp'>
            <div class='product-img'>
                <img src='/static/image/products/1.webp' alt='' />
            </div>
            <div class='order-info'></div>
        </div>
    )
}

const Loading: Component = () => {
    return <></>
}

export default Orders
