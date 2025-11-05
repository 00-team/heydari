export let phoneRegex = /^(0|09|09[0-9]{1,9})$/

import { api_verification_post } from './abi'

const form = document.querySelector<HTMLFormElement>('form.login-wrapper')!

const counter = form.querySelector<HTMLSpanElement>('#timer-count')!
let counterExpire: number = 0

let activeSection: 'phone' | 'code' = 'phone'

form.addEventListener('submit', e => {
    e.preventDefault()

    phoneInp.blur()

    if (activeSection == 'phone') {
        return sendCode()
    }

    return login()
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

function login() {
    codeInp.blur()
    stopTimer()
    form.classList.toggle('loading', true)
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
    // console.log(phoneErrSpan)
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
