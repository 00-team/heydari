import { useNavigate } from '@solidjs/router'
import { Timer } from 'comps'
import { addAlert } from 'comps/alert'
import LoadingDots from 'comps/loadingDots'
import { BackIcon, MobileIcon, SmsIcon } from 'icons'
import { httpx } from 'shared'
import { createEffect, on, onCleanup, Show } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { setSelf } from 'store'
import './style/login.scss'

export default () => {
    type State = {
        stage: 'phone' | 'code'
        phone: string
        expires: number
        code: string
        loading: boolean
    }
    const [state, setState] = createStore<State>({
        stage: 'phone',
        phone: '',
        expires: 0,
        code: '',
        loading: false,
    })

    let timer: ReturnType<typeof setInterval>

    const navigate = useNavigate()

    createEffect(
        on(
            () => state.stage,
            stage => {
                if (stage === 'phone') return

                set_expire()

                onCleanup(() => {
                    clearInterval(timer)
                })
            }
        )
    )

    function verification() {
        if (state.phone.length != 11 || !state.phone.startsWith('09'))
            return addAlert({
                type: 'error',
                timeout: 5,
                content: ' تلقن همراه خود را به درستی وارد کنید!',
                subject: 'خطا!',
            })

        setState({ loading: true })

        httpx({
            url: '/api/verification/',
            method: 'POST',
            json: {
                action: 'login',
                phone: state.phone,
            },
            onLoad(x) {
                setState({ loading: false })

                if (x.status == 200 && x.response.expires > 0)
                    return setState({
                        stage: 'code',
                        expires: x.response.expires,
                    })

                addAlert({
                    type: 'error',
                    content:
                        'به تلفن شما پیامک ارسال شده است، برای ارسال دوباره چند لحظه صبر کنید.',
                    subject: 'صبر کنید',
                    timeout: 10,
                })
            },
        })
    }

    function user_login() {
        if (state.code.length != 5)
            return addAlert({
                type: 'error',
                timeout: 5,
                content: ' کد را به درستی وارد کنید!',
                subject: 'خطا!',
            })

        if (state.expires <= 0)
            return addAlert({
                type: 'error',
                timeout: 5,
                subject: 'خطا!',
                content: 'محلت تایید کد به اتمام رسید، کد جدید دریافت کنید',
            })

        setState({ loading: true })

        httpx({
            url: '/api/user/login/',
            method: 'POST',
            show_messages: false,
            json: {
                phone: state.phone,
                code: state.code,
            },
            onLoad(x) {
                setState({ loading: false })
                if (x.status == 200) {
                    setSelf({
                        loged_in: true,
                        fetch: false,
                        user: x.response,
                    })

                    navigate('/products/?page=0')

                    location.reload()

                    return
                }

                addAlert({
                    type: 'error',
                    timeout: 3,
                    subject: 'کد نادرست!',
                    content: 'کد وارد شده نادرست است.',
                })
            },
        })
    }

    function set_expire() {
        timer = setInterval(() => {
            setState(
                produce(s => {
                    if (s.expires < 2) {
                        clearInterval(timer)
                        s.expires = 0
                    }
                    s.expires = s.expires - 1
                })
            )
        }, 1e3)
    }

    return (
        <div class='login-fnd'>
            <form
                onsubmit={e => {
                    e.preventDefault()

                    if (state.stage === 'phone') return verification()

                    user_login()
                }}
                class='login-form'
                classList={{ loading: state.loading }}
            >
                <Show when={state.loading}>
                    <div class='loading-form'>
                        <LoadingDots />
                        <h2 class='title'>صبر کنید...</h2>
                    </div>
                </Show>
                <button
                    type='button'
                    class='go-back'
                    classList={{ active: state.stage === 'code' }}
                    onclick={() => {
                        setState({ stage: 'phone' })
                    }}
                >
                    <BackIcon />
                </button>

                <header>
                    <h1 class='title_hero'>خوش آمدید</h1>
                    <h2 class='title_small'>ورود مدیریت</h2>
                </header>

                <div
                    class='inps-container'
                    classList={{ code: state.stage === 'code' }}
                >
                    <div class='inp-container'>
                        <label for='login-phone' class='holder'>
                            <MobileIcon />
                            تلفن همراه
                        </label>
                        <div class='input'>
                            <input
                                id='login-phone'
                                class='title_small'
                                type='number'
                                inputMode='numeric'
                                min={0}
                                maxLength={11}
                                placeholder='09123456789'
                                value={state.phone}
                                onInput={e =>
                                    setState({ phone: e.currentTarget.value })
                                }
                            />
                        </div>
                    </div>
                    <div class='inp-container code'>
                        <label for='login-code' class='holder'>
                            <SmsIcon />
                            کد پیامکی
                        </label>
                        <div class='input'>
                            <input
                                id='login-code'
                                class='title_small'
                                type='number'
                                maxLength={5}
                                pattern='\d{5,5}'
                                inputMode='numeric'
                                placeholder='123456'
                                value={state.code}
                                onInput={e =>
                                    setState({ code: e.currentTarget.value })
                                }
                            />
                            <p class='msg title_smaller'>
                                کد پیامکی به شماره {state.phone} ارسال شد!
                            </p>
                        </div>
                        <button
                            class='resend title_smaller'
                            type={'button'}
                            classList={{ disable: state.expires >= 1 }}
                            disabled={state.expires >= 1}
                            onclick={() => {
                                if (state.expires >= 1) return

                                setState({ loading: true })

                                httpx({
                                    url: '/api/verification/',
                                    method: 'POST',
                                    show_messages: true,
                                    json: {
                                        phone: state.phone,
                                        action: 'login',
                                    },

                                    onLoad(x) {
                                        setState({ loading: false })

                                        if (x.status != 200) return

                                        setState({
                                            stage: 'code',
                                            expires: x.response.expires,
                                        })

                                        set_expire()

                                        addAlert({
                                            type: 'success',
                                            content:
                                                'کد با موفقیت دوباره برای شما ارسال شد!',
                                            subject: 'ارسال شد!',
                                            timeout: 3,
                                        })
                                    },
                                })
                            }}
                        >
                            <Show when={state.expires > 0}>
                                <Timer seconds={state.expires} />
                            </Show>
                            ارسال دوباره
                        </button>
                    </div>
                </div>

                <button
                    type='submit'
                    class='cta title_smaller'
                    classList={{
                        code: state.stage === 'code',
                        disable: state.phone.length !== 11,
                    }}
                >
                    <span class=''>ارسال کد</span>
                    <span class='code'>ورود</span>
                </button>
            </form>
        </div>
    )
}
