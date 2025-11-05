export let phoneRegex = /^(0|09|09[0-9]{1,9})$/

const form = document.querySelector<HTMLFormElement>('form.login-wrapper')

let activeSection: 'phone' | 'code' = 'phone'

form.addEventListener('submit', e => {
    e.preventDefault()

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
}

function login() {}

const goBack = form.querySelector<HTMLButtonElement>('.go-back')

goBack.addEventListener('click', () => {})

const phoneInp = form.querySelector<HTMLInputElement>('input#login-phone-inp')!
const codeInp = form.querySelector<HTMLInputElement>('input#login-code-inp')!

phoneInp.addEventListener('input', e => {
    clearError()

    const input = e.currentTarget as HTMLInputElement
    const converted = convertPersianPriceToNumber(input.value)

    if (converted.length > 11) return

    input.value = converted
})

const phoneErr = form.querySelector<HTMLDivElement>('#phone-error')
const phoneErrSpan = phoneErr.querySelector<HTMLDivElement>('div')

function clearError() {
    phoneErr.classList.toggle('active', false)
    phoneErrSpan.innerText = ''
}
function showError(msg: string) {
    // console.log(phoneErrSpan)
    phoneErr.classList.toggle('active', true)
    phoneErrSpan.innerText = msg
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
