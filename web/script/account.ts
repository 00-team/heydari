import { api_user_get } from './abi'

const pageLoader = document.querySelector<HTMLElement>('#loader')

const goToLogin = () => {
    window.location.href = '/login'
}

const fetch_user = async () => {
    let res = await api_user_get()

    if (!res.ok()) return goToLogin()

    pageLoader?.remove()
}

fetch_user()
