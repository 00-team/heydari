import { Component, For, JSX, onMount, Show } from 'solid-js'

import { useSearchParams } from '@solidjs/router'
import {
    api_admin_orders_list,
    api_admin_orders_patch,
    api_admin_products_get,
    Order,
    ORDER_STATE,
    OrderState,
    User,
} from 'abi'
import { LoadingElem } from 'comps'
import LoadingDots from 'comps/loadingDots'
import {
    Calendar2Icon,
    CalendarIcon,
    CartIcon,
    CashLoadingIcon,
    CheckIcon,
    CloseIcon,
    MobileIcon,
    PersonIcon,
} from 'icons'
import { LOCALE } from 'locale'
import { createStore, produce, unwrap } from 'solid-js/store'
import { setPopup } from 'store/popup'
import { FilterCheckbox } from './products'
import './style/orders.scss'

const Orders: Component = () => {
    const [params, setParams] = useSearchParams()

    type STATE = {
        page: number
        loading: boolean
        state: OrderState | null
        orders: [Order, User | null][]
    }
    const [state, setState] = createStore<STATE>({
        orders: [],
        state: null,
        loading: false,
        page: 0,
    })

    onMount(() => {
        setState({
            page: parseInt(params.page || '0') || 0,
        })

        search()
    })

    const search = async () => {
        let page = unwrap(state.page)
        let ostate = unwrap(state.state)

        setParams({ page })

        setState('loading', true)

        let res = await api_admin_orders_list({ page, state: ostate })

        setState('loading', false)

        if (!res.ok()) return

        setState('orders', res.body)
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

    const Loading: Component = () => {
        return (
            <div class='loading-container'>
                <img
                    src='/static/image/logo.png'
                    loading='lazy'
                    decoding='async'
                />
                <p class='title_small'>درحال گرفتن اطلاعات از سرور</p>
            </div>
        )
    }

    return (
        <div class='orders-container'>
            <div class='filters'>
                <For each={ORDER_STATE}>
                    {o => (
                        <FilterCheckbox
                            holder={LOCALE.order_state(o)}
                            checked={state.state == o}
                            onCheck={c => {
                                setState(
                                    produce(s => {
                                        if (c) {
                                            s.state = o
                                        } else {
                                            s.state = null
                                        }
                                    })
                                )

                                search()
                            }}
                            class='title_smaller'
                        />
                    )}
                </For>
            </div>
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
                {/* <button
                    class='title_smaller page-cta'
                    classList={{
                        red: state.state == 'rejected',
                        green: state.state == 'resolved',
                    }}
                    onClick={() => {
                        setState(
                            produce(s => {
                                if (s.state == 'pending') {
                                    s.state = 'rejected'
                                } else if (s.state == 'rejected') {
                                    s.state = 'resolved'
                                } else {
                                    s.state = 'pending'
                                }
                            })
                        )
                        search()
                    }}
                >
                    <Locale order_state={state.state} />
                </button> */}
                <button
                    class='title_smaller page-cta'
                    disabled={state.orders.length == 0}
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
                    <Show when={state.orders.length > 0} fallback={<Empty />}>
                        <For each={state.orders}>
                            {(o, index) => (
                                <OrderCmp
                                    onState={a => {
                                        setState(
                                            produce(s => {
                                                if (!s.orders[index()]) return

                                                s.orders[index()]![0].state = a
                                            })
                                        )
                                    }}
                                    order={o[0]}
                                    user={o[1]}
                                />
                            )}
                        </For>
                    </Show>
                </Show>
            </div>
        </div>
    )
}

interface OrderProps {
    user: User | null
    order: Order
    onState(s: OrderState): void
}
const OrderCmp: Component<OrderProps> = P => {
    type STATE = {
        loading: boolean
        product: {
            loading: boolean
            img: string
            name: string
        }
    }
    const [state, setState] = createStore<STATE>({
        loading: false,

        product: {
            loading: true,
            img: '',
            name: '',
        },
    })

    type CTA = {
        text: string
        Icon: JSX.Element
        alert: null | { title: string; type: 'error' | 'success' }
    }
    const CTAS_MAP: Record<Exclude<OrderState, 'pending'>, CTA> = {
        payment_pending: {
            alert: null,
            Icon: <CashLoadingIcon />,
            text: 'انتظار پرداخت',
        },
        rejected: {
            alert: {
                title: 'سفارش رد شده؟',
                type: 'error',
            },
            Icon: <CloseIcon />,
            text: 'رد',
        },
        sending: {
            alert: null,
            Icon: <CloseIcon />,
            text: 'درحال ارسال',
        },
        resolved: {
            alert: {
                title: 'سفارش تایید و تمام شده؟',
                type: 'success',
            },
            Icon: <CheckIcon />,
            text: 'تایید',
        },
    }

    onMount(async () => {
        setState('product', 'loading', true)
        let res = await api_admin_products_get({ id: P.order.product })
        setState('product', 'loading', false)

        if (!res.ok()) return

        setState('product', {
            name: res.body.name,
            img: res.body.photos.find(Boolean) || '',
        })
    })

    const changeTo = async (state: OrderState) => {
        setState('loading', true)

        let res = await api_admin_orders_patch(
            {
                oid: P.order.id,
            },
            {
                state,
            }
        )

        setState('loading', false)

        if (!res.ok()) return

        P.onState(res.body.state)
    }

    const name = () => {
        if (!P.user?.first_name && !P.user?.last_name) {
            return 'بدون نام'
        }
        const n = P.user.first_name || ''
        const l = P.user.last_name || ''
        return n + ' ' + l
    }

    return (
        <div class='order-cmp-wrapper'>
            <Show when={state.loading}>
                <LoadingElem class='order-loading' />
            </Show>
            <div class='order-cmp'>
                <div class='order-infos'>
                    <div
                        class='order-status title_smaller'
                        classList={{
                            [P.order.state]: true,
                        }}
                    >
                        {LOCALE.order_state(P.order.state)}
                    </div>
                    <div class='wrapper'>
                        <div class='product-name title'>
                            <Show
                                when={!state.product.loading}
                                fallback={<LoadingDots />}
                            >
                                {state.product.name}
                            </Show>
                        </div>
                        <div class='order-sum title_small number'>
                            <span>{P.order.price.toLocaleString()}</span>
                            <div class='toman'>تومان</div>
                        </div>
                        <div class='order-info'>
                            <div class='order-count'> {P.order.count} عدد</div>
                            <div class='order-divider'>|</div>
                            <div class='order-date'>
                                <div class='icon'>
                                    <CalendarIcon />
                                </div>
                                {new Date(
                                    P.order.created_at * 1e3
                                ).toLocaleDateString('fa-IR')}
                            </div>
                        </div>
                    </div>

                    <div class='buyer-wrapper'>
                        <div class='buyer-head title_small'>
                            <span>خریدار</span>
                        </div>
                        <div class='buyer-infos description'>
                            <div class='buyer-name'>
                                <PersonIcon />
                                {name()}
                            </div>
                            <a
                                href={`tel:${P.user?.phone}`}
                                class='buyer-info '
                            >
                                <div class='holder'>
                                    <MobileIcon />
                                    تلفن:
                                </div>
                                <div class='data'>
                                    {P.user?.phone || 'بدون شماره!'}
                                </div>
                            </a>
                            <div class='buyer-info '>
                                <div class='holder'>
                                    <Calendar2Icon />
                                    عضویت:
                                </div>
                                <div class='data'>
                                    {P.user?.created_at &&
                                        new Date(
                                            P.user?.created_at * 1e3
                                        ).toLocaleDateString('fa-IR')}
                                </div>
                            </div>
                            <div class='buyer-info '>
                                <div class='holder'>
                                    <CartIcon />
                                    {P.user?.order_count || 0} سفارش تا حالا
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class='product-img-wrapper'>
                    <div class='product-img'>
                        <Show
                            when={!state.product.loading}
                            fallback={<LoadingElem />}
                        >
                            <img
                                src={`/record/pp-${P.order.product}-${state.product.img}`}
                                loading='lazy'
                                decoding='async'
                            />
                        </Show>
                    </div>
                </div>
            </div>
            <div class='order-ctas title_smaller'>
                <For each={Object.entries(CTAS_MAP)}>
                    {([k, v]) => (
                        <button
                            classList={{ [k]: true }}
                            class='cta'
                            disabled={P.order.state == k}
                            onclick={() => {
                                if (!v.alert) return changeTo(k as OrderState)

                                setPopup({
                                    show: true,
                                    type: v.alert.type,
                                    Icon: CloseIcon,
                                    title: v.alert.title,
                                    onSubmit: () => changeTo(k as OrderState),
                                })

                                return
                            }}
                        >
                            {v.Icon}
                            {v.text}
                        </button>
                    )}
                </For>
            </div>
        </div>
    )
}

export default Orders
