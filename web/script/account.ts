import { LOCALE } from './locale'
import { api_user_get, api_user_logout_post, api_user_patch } from './abi'

const form = document.querySelector<HTMLFormElement>('form.profile-container')
const pageLoader = document.querySelector<HTMLElement>('#loader')

// summery infos
const online_at = document.querySelector<HTMLDivElement>('#online_at')
const orders_count = document.querySelector<HTMLDivElement>('#orders_count')
const created_at = document.querySelector<HTMLDivElement>('#created_at')
// summery infos

const errorContainer = document.querySelector<HTMLDivElement>('#form-error')

const nameInp = document.querySelector<HTMLInputElement>('#user-name')

const logout = document.querySelector<HTMLButtonElement>('#logout')

const goToLogin = () => {
    window.location.href = '/login'
}
const showLoading = (show: boolean) => {
    pageLoader?.classList.toggle('hide', !show)
}
function showError(msg: string | false) {
    if (!errorContainer) return

    if (msg === false) {
        errorContainer.classList.toggle('show', false)
        return
    }

    errorContainer.classList.toggle('show', true)
    errorContainer.querySelector<HTMLSpanElement>('span')!.innerText = msg
    console.log(
        errorContainer.querySelector<HTMLSpanElement>('span')!.innerText
    )
}

const fetch_user = async () => {
    let res = await api_user_get()

    if (!res.ok()) return goToLogin()

    const user = res.body

    if (online_at) {
        online_at.innerText = `${new Date(user.online_at * 1e3).toLocaleDateString('fa-IR')}`
    }
    if (orders_count) {
        orders_count.innerText = `${user.order_count}`
    }
    if (created_at) {
        created_at.innerText = `${new Date(user.created_at * 1e3).toLocaleDateString('fa-IR')}`
    }
    if (nameInp) {
        nameInp.value = user.name || ''
        nameInp.parentElement!.classList.toggle('active', !!user.name)
    }

    showLoading(false)
}

fetch_user()

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.acc-nav a')
    const currentPath = window.location.pathname

    links.forEach(link => {
        const linkPath = link.getAttribute('href')
        if (
            currentPath === linkPath ||
            currentPath.startsWith(linkPath + '/')
        ) {
            link.classList.add('active')
        }
    })
})

nameInp?.addEventListener('input', e => {
    const input = e.currentTarget as HTMLInputElement
    const v = input.value.trim()

    const parent = input.parentElement

    if (v.length !== 0) {
        parent!.classList.add('active')
    } else {
        parent!.classList.remove('active')
    }

    showError(false)
})

form?.addEventListener('submit', async e => {
    e.preventDefault()

    const v = nameInp!.value.trim()

    if (v.length == 0) {
        return showError('اسم شما نمیتواند خالی باشد!')
    }

    showLoading(true)

    let res = await api_user_patch({
        name: v,
    })

    showLoading(false)

    if (!res.ok()) return showError(LOCALE.error_code(res.body.code))

    nameInp!.value = res.body.name || ''
})
logout?.addEventListener('click', async () => {
    showLoading(true)

    await api_user_logout_post()

    location.reload()
})
