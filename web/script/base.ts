import { initAlerts } from './alert'

export {}

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.scrollTop = 0

    initAlerts()
})

export const ADD_ORDER_LOCAL = 'ADD-ORDER-LOCAL'
