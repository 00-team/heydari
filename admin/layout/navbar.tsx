import { A, reload } from '@solidjs/router'
import {
    ChairIcon,
    ExitIcon,
    PersonIcon,
    StorageIcon,
    TagIcon,
    TrashIcon,
} from 'icons'
import { httpx, Perm } from 'shared'

import { For, JSX, Show } from 'solid-js'
import { Perms, self, setSelf } from 'store'
import { setPopup } from 'store/popup'
import './style/navbar.scss'

type linkType = {
    link: string
    title: string
    icon: JSX.Element
    perm: Perm | null
}

const links: linkType[] = [
    {
        icon: <ChairIcon />,
        link: '/products',
        title: 'محصولات',
        perm: Perms.V_PRODUCT,
    },
    {
        icon: <TagIcon />,
        link: '/product-tags/',
        title: 'تگ محصولات',
        perm: Perms.V_PRODUCT_TAG,
    },
    // {
    //     icon: <StorageIcon />,
    //     link: '/storage/',
    //     title: 'انبار',
    //     perm: Perms.V_MATERIAL,
    // },
    {
        icon: <StorageIcon />,
        link: '/orders/',
        title: 'سفارشات',
        perm: null,
    },
    {
        icon: <PersonIcon />,
        link: '/users/',
        title: 'ادمین ها',
        perm: Perms.V_USER,
    },
]

export default () => {
    // const [state, setState] = createStore({
    //     active: 0,
    // })

    // onMount(() => {
    //     let pathname = location.pathname.split('/')

    //     let adminIndex = pathname.findIndex(str => str === 'admin')

    //     if (adminIndex <= -1) return

    //     let activeIndex = pathname[adminIndex + 1]

    //     let activeLink = links.findIndex(
    //         link => link.link.split('/').filter(str => str)[0] === activeIndex
    //     )

    //     activeLink >= 0 && setState({ active: activeLink })
    // })

    function logout() {
        httpx({
            method: 'POST',
            url: '/api/user/logout/',
            onLoad(x) {
                if (x.status !== 200) return

                setSelf({
                    loged_in: false,
                    fetch: true,
                    perms: new Perms([]),
                    user: {
                        id: 0,
                        phone: '',
                        name: '',
                        token: null,
                        photo: null,
                        admin: [],
                        banned: false,
                    },
                })

                reload()
            },
        })
    }
    return (
        <nav class='navbar-fnd'>
            <div class='admin-info title_small'>
                <div class='info-wrapper'>
                    <img
                        src={
                            self.user.photo || '/static/image/about/avatar.png'
                        }
                        alt=''
                    />
                    {self.user.name || self.user.phone}
                </div>

                <button
                    class='logout icon'
                    onclick={() => {
                        setPopup({
                            show: true,
                            type: 'error',
                            title: 'خروج از حساب',
                            content: 'آیا از خروج از حساب مطمئن هستید؟',
                            Icon: TrashIcon,
                            onSubmit: logout,
                        })
                    }}
                >
                    <ExitIcon />
                    خروج
                </button>
            </div>
            <div class='links'>
                <For each={links}>
                    {link => (
                        <Show
                            when={
                                link.perm == null || self.perms.check(link.perm)
                            }
                        >
                            <A
                                href={link.link}
                                inactiveClass=''
                                class='title_smaller'
                                // classList={{ active: state.active == index() }}
                                // onclick={() => setState({ active: index() })}
                            >
                                <span>
                                    {link.icon}
                                    {link.title}
                                </span>
                            </A>
                        </Show>
                    )}
                </For>
            </div>
            <img
                class='nav-logo-container'
                src='/static/image/logo.png'
                alt=''
                draggable={false}
                loading='lazy'
            />
        </nav>
    )
}
