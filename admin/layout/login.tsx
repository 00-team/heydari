import './style/login.scss'
import { createStore } from 'solid-js/store'
import { httpx } from 'shared'
import { Show } from 'solid-js'
import { setSelf } from 'store'
import { addAlert } from 'comps/alert'

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
        if (state.phone.length != 11 || !state.phone.startsWith('09')) {
            addAlert({
                type: 'error',
                subject: 'invalid phone number',
                content: '',
                timeout: 6,
            })
            return
        }

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
        if (state.code.length != 5) return

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
                <h1>Login</h1>
                <div class='grid'>
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
                </Show>
            </div>
        </div>
    )
}
