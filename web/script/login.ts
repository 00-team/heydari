export let phoneRegex = /^(0|09|09[0-9]{1,9})$/

import { LOCALE } from './locale'
import {
    api_orders_post,
    api_user_get,
    api_user_login_post,
    api_user_patch,
    api_verification_post,
} from './abi'
import { ADD_ORDER_LOCAL } from './base'
import { addAlert } from './alert'

const form = document.querySelector<HTMLFormElement>('form.login-wrapper')!

const counter = form.querySelector<HTMLSpanElement>('#timer-count')!
let counterExpire: number = 0

let activeSection: 'phone' | 'code' | 'info' = 'phone'

const fetch_user = async () => {
    let res = await api_user_get()

    if (!res.ok()) return

    window.location.href = '/account'
}
fetch_user()

form.addEventListener('submit', e => {
    e.preventDefault()

    phoneInp.blur()

    if (activeSection == 'phone') {
        return sendCode()
    }

    if (activeSection == 'code') {
        return login()
    }

    return submit_login()
})

function sendCode() {
    const value = phoneInp.value

    if (value.length !== 11)
        return showError('شماره تلفن خود را به درستی وارد کنید!')

    if (value[0] !== '0')
        return showError('شماره تلفن خود را با پیش شماره 0 وارد کنید')

    if (!phoneRegex.test(value))
        return showError('شماره تلفن خود را به درستی وارد کنید!')

    form.classList.toggle('active', true)
    activeSection = 'code'

    api_verification_post({ action: 'login', phone: value })

    // test
    counterExpire = 180
    set_expire()

    codeInp.focus()
}

async function login() {
    let goToInfo = false

    codeInp.blur()
    form.classList.toggle('loading', true)

    const phone = phoneInp.value
    const code = codeInp.value

    let res = await api_user_login_post({ phone, code })

    form.classList.toggle('loading', false)

    if (!res.ok())
        return addAlert({
            type: 'error',
            timeout: 3,
            content: LOCALE.error_code(res.body.code),
            subject: 'خطا!',
        })

    stopTimer()

    let user = res.body

    if (!user.first_name || user.last_name) {
        goToInfo = true
    }

    const raw = localStorage.getItem(ADD_ORDER_LOCAL)

    if (raw) {
        try {
            const pending = JSON.parse(raw)

            if (Array.isArray(pending) && pending.length > 0) {
                let allOk = true

                for (const order of pending) {
                    const { product, count } = order

                    if (!product || !count) continue

                    form.classList.toggle('loading', true)

                    const orderRes = await api_orders_post({
                        product,
                        count,
                    })
                    if (!orderRes.ok()) {
                        allOk = false
                    }
                }

                localStorage.removeItem(ADD_ORDER_LOCAL)

                if (allOk && !goToInfo) {
                    window.location.href = '/account/orders'
                    return
                }
            }
        } catch (err) {
            localStorage.removeItem(ADD_ORDER_LOCAL)
        }
    }

    if (!goToInfo) {
        return (window.location.href = '/account')
    }

    activeSection = 'info'
    form.classList.toggle('active', false)
    form.classList.toggle('info', true)
}

async function submit_login() {
    form.classList.toggle('loading', true)

    const name = nameInp.value
    const lname = lnameInp.value
    const email = emailInp.value
    const corp = corpInp.value
    const address = addressInp.value

    if (!name || !lname) {
        addAlert({
            type: 'error',
            subject: 'خطا!',
            timeout: 3,
            content: 'نام و نام‌خانودگی نمیتواند خالی باشد!',
        })
        form.classList.toggle('loading', false)

        return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (email && !emailRegex.test(email)) {
        addAlert({
            type: 'error',
            subject: 'خطا!',
            timeout: 3,
            content: 'ایمیل وارد شده معتبر نیست!',
        })

        form.classList.toggle('loading', false)
        return
    }

    let res = await api_user_patch({
        address,
        company_name: corp,
        email,
        first_name: name,
        last_name: lname,
    })

    form.classList.toggle('loading', false)
    if (!res.ok())
        return addAlert({
            type: 'error',
            subject: 'خطا!',
            timeout: 3,
            content: LOCALE.error_code(res.body.code),
        })

    window.location.href = '/account'
}

function goToPhoneSection() {
    if (timer) {
        clearInterval(timer)
        timer = null
    }

    activeSection = 'phone'
    form.classList.toggle('active', false)
    counter.parentElement!.classList.toggle('active', false)
}

const goBack = form.querySelector<HTMLButtonElement>('.go-back')!

goBack.addEventListener('click', () => {
    goToPhoneSection()
})

const phoneInp = form.querySelector<HTMLInputElement>('input#login-phone-inp')!
const codeInp = form.querySelector<HTMLInputElement>('input#login-code-inp')!
const nameInp = form.querySelector<HTMLInputElement>('input#name-code-inp')!
const lnameInp = form.querySelector<HTMLInputElement>('input#lname-code-inp')!
const emailInp = form.querySelector<HTMLInputElement>('input#email-code-inp')!
const corpInp = form.querySelector<HTMLInputElement>('input#corp-code-inp')!
const addressInp = form.querySelector<HTMLTextAreaElement>(
    'textarea#address-code-inp'
)!

phoneInp.addEventListener('input', e => {
    clearError()

    const input = e.currentTarget as HTMLInputElement
    const converted = convertPersianPriceToNumber(input.value)

    if (converted.length > 11) return

    input.value = converted
})

const phoneErr = form.querySelector<HTMLDivElement>('#phone-error')!
const phoneErrSpan = phoneErr.querySelector<HTMLDivElement>('div')!

function clearError() {
    phoneErr.classList.toggle('active', false)
    phoneErrSpan.innerText = ''
}
function showError(msg: string) {
    phoneErr.classList.toggle('active', true)
    phoneErrSpan.innerText = msg
}

let timer: number | null
function set_expire() {
    counter.parentElement!.classList.toggle('active', true)

    // stop any running timer first
    if (timer) {
        clearInterval(timer)
        timer = null
    }

    // render immediately so user sees the full time without waiting 1s
    counter.innerText = convertSectoMin(counterExpire)

    timer = setInterval(() => {
        // decrement first so display goes down each tick
        counterExpire--

        // update UI
        if (counterExpire <= 0) {
            goToPhoneSection()

            return
        }

        counter.innerText = convertSectoMin(counterExpire)
    }, 1000)
}
function stopTimer() {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
}

function convertSectoMin(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins + ':' + (secs < 10 ? '0' : '') + secs
}

export function convertPersianPriceToNumber(str: string): string {
    return (
        str
            // keep only ASCII digits + both Eastern ranges
            .replace(/[^\d\u06F0-\u06F9\u0660-\u0669]/g, '')
            // Persian digits → ASCII
            .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06f0))
            // Arabic-Indic digits → ASCII
            .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
    )
}
