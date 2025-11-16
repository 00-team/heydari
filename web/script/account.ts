// import { LOCALE } from './locale'
import { addAlert } from './alert'
import { api_user_get, api_user_logout_post, api_user_patch, User } from './abi'
import { LOCALE } from './locale'

const form = document.querySelector<HTMLFormElement>('form.profile-container')
const pageLoader = document.querySelector<HTMLElement>('#loader')

// summery infos
const online_at = document.querySelector<HTMLDivElement>('#online_at')
const orders_count = document.querySelector<HTMLDivElement>('#orders_count')
const created_at = document.querySelector<HTMLDivElement>('#created_at')
// summery infos

const fnameInp = document.querySelector<HTMLInputElement>('#user-fname')
const lnameInp = document.querySelector<HTMLInputElement>('#user-lname')
const emailInp = document.querySelector<HTMLInputElement>('#user-email')
const corpInp = document.querySelector<HTMLInputElement>('#user-corp')
const addressInp = document.querySelector<HTMLInputElement>('#user-address')

const logout = document.querySelector<HTMLButtonElement>('#logout')

const goToLogin = () => {
    window.location.href = '/login'
}
const showLoading = (show: boolean) => {
    pageLoader?.classList.toggle('hide', !show)
}

let USER: User | null = null
const fetch_user = async () => {
    let res = await api_user_get()

    if (!res.ok()) return goToLogin()

    USER = res.body

    if (online_at) {
        online_at.innerText = `${new Date(USER.online_at * 1e3).toLocaleDateString('fa-IR')}`
    }
    if (orders_count) {
        orders_count.innerText = `${USER.order_count}`
    }
    if (created_at) {
        created_at.innerText = `${new Date(USER.created_at * 1e3).toLocaleDateString('fa-IR')}`
    }
    if (fnameInp) {
        fnameInp.value = USER.first_name || ''
        fnameInp.parentElement!.classList.toggle('active', !!USER.first_name)
    }
    if (lnameInp) {
        lnameInp.value = USER.last_name || ''
        lnameInp.parentElement!.classList.toggle('active', !!USER.last_name)
    }
    if (emailInp) {
        emailInp.value = USER.email || ''
        emailInp.parentElement!.classList.toggle('active', !!USER.email)
    }
    if (corpInp) {
        corpInp.value = USER.company_name || ''
        corpInp.parentElement!.classList.toggle('active', !!USER.company_name)
    }
    if (addressInp) {
        addressInp.value = USER.address || ''
        addressInp.parentElement!.classList.toggle('active', !!USER.address)
    }

    showLoading(false)
}

fetch_user()

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.acc-nav a')
    const currentPath = window.location.pathname

    links.forEach(link => {
        const linkPath = link.getAttribute('href')

        if (currentPath === linkPath) {
            link.classList.add('active')
        }
    })
})

let inps = [fnameInp, lnameInp, emailInp, corpInp, addressInp]
inps.forEach(elem => {
    elem?.addEventListener('input', e => {
        const input = e.currentTarget as HTMLInputElement
        const v = input.value.trim()

        const parent = input.parentElement

        if (v.length !== 0) {
            parent!.classList.add('active')
        } else {
            parent!.classList.remove('active')
        }
    })
})

form?.addEventListener('submit', async e => {
    e.preventDefault()

    const fname = fnameInp!.value.trim()
    const lname = lnameInp!.value.trim()
    const email = emailInp!.value.trim()
    const corp = corpInp!.value.trim()
    const address = addressInp!.value.trim()

    if (!fname) {
        return addAlert({
            type: 'error',
            subject: 'خطا اسم!',
            timeout: 3,
            content: 'اسم نمیتواند خالی باشد!',
        })
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

    showLoading(true)

    let res = await api_user_patch({
        first_name: fname,
        last_name: lname,
        address,
        company_name: corp,
        email,
    })

    showLoading(false)

    if (!res.ok())
        return addAlert({
            type: 'error',
            subject: 'خطا!',
            timeout: 3,
            content: LOCALE.error_code(res.body.code),
        })

    addAlert({
        type: 'success',
        subject: 'موفق!',
        timeout: 3,
        content: 'اطلاعات شما با موفقیت ثبت شد',
    })
})
logout?.addEventListener('click', async () => {
    showLoading(true)

    await api_user_logout_post()

    location.reload()
})
