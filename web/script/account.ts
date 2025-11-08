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
