import { addAlert } from 'comps/alert'
import { BackIcon, MobileIcon, SmsIcon } from 'icons'
import { httpx } from 'shared'
import { createStore } from 'solid-js/store'
import { setSelf } from 'store'
import './style/login.scss'

export default () => {
    type State = {
        stage: 'phone' | 'code'
        phone: string
        code: string
        loading: boolean
    }
    const [state, setState] = createStore<State>({
        stage: 'phone',
        phone: '',
        code: '',
        loading: false,
    })

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
                if (x.status == 200 && x.response.expires > 0) {
                    setState({ stage: 'code' })
                }
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

        setState({ loading: true })

        httpx({
            url: '/api/user/login/',
            method: 'POST',
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
                }
            },
        })
    }

    return (
        <div class='login-fnd'>
            <div class='login-form' classList={{ loading: state.loading }}>
                <button
                    class='go-back'
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
                                کد پیامکی به شماره {state.phone} پیامک شد!
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    class='cta title_smaller'
                    classList={{
                        code: state.stage === 'code',
                        disable: state.phone.length !== 11,
                    }}
                    onclick={() => {
                        if (state.stage === 'phone') return verification()

                        user_login()
                    }}
                >
                    <span class='code'>ارسال کد</span>
                    <span class='enter'>ورود</span>
                </button>

                {/* <div class='grid'>
                    <label
                        for='login-phone'
                        classList={{ disabled: state.stage != 'phone' }}
                    >
                        موبایل:
                    </label>
                    <input
                        disabled={state.stage != 'phone'}
                        id='login-phone'
                        type='phone'
                        class='styled'
                        placeholder='09223334444'
                        maxLength={11}
                        value={state.phone}
                        onInput={e =>
                            setState({ phone: e.currentTarget.value })
                        }
                    />
                    <label
                        classList={{ disabled: state.stage != 'code' }}
                        for='login-code'
                    >
                        کد:
                    </label>
                    <input
                        disabled={state.stage != 'code'}
                        id='login-code'
                        maxLength={5}
                        pattern='\d{5,5}'
                        class='styled'
                        placeholder='12345'
                        value={state.code}
                        onInput={e => setState({ code: e.currentTarget.value })}
                    />
                </div>
                <Show
                    when={state.stage == 'phone'}
                    fallback={
                        <button class='styled' onclick={user_login}>
                            تایید کد
                        </button>
                    }
                >
                    <button class='styled' onclick={verification}>
                        دریافت کد
                    </button>
                </Show> */}
            </div>
        </div>
    )
}
