import { A } from '@solidjs/router'
import {
    ChairIcon,
    ExitIcon,
    PersonIcon,
    StorageIcon,
    TagIcon,
    TrashIcon,
} from 'icons'

import { Show } from 'solid-js'
import { Perms, self } from 'store'
import { setPopup } from 'store/popup'
import './style/navbar.scss'

export default () => {
    console.log(self)

    function logout() {}
    return (
        <nav class='navbar-fnd'>
            <div class='admin-info title_small'>
                <button
                    class='icon'
                    onclick={() => {
                        setPopup({
                            show: true,
                            type: 'error',
                            title: 'خروج از حساب',
                            content: 'آیا از خروج حساب مطمعنید؟',
                            Icon: TrashIcon,
                            onSubmit: logout,
                        })
                    }}
                >
                    <ExitIcon />
                </button>
                {self.user.name || 'ادمین حیدری'}
            </div>
            <div class='links'>
                <Show when={self.perms.check(Perms.V_PRODUCT)}>
                    <A href='/products/' class='title_smaller'>
                        <ChairIcon />
                        محصولات
                    </A>
                </Show>
                <Show when={self.perms.check(Perms.V_PRODUCT_TAG)}>
                    <A href='/product-tags/' class='title_smaller'>
                        <TagIcon />
                        تگ مصحولات
                    </A>
                </Show>
                <Show when={self.perms.check(Perms.V_MATERIAL)}>
                    <A href='/storage/' class='title_smaller'>
                        <StorageIcon />
                        انبار
                    </A>
                </Show>
                <Show when={self.perms.check(Perms.V_USER)}>
                    <A href='/users/' class='title_smaller'>
                        <PersonIcon />
                        ادمین ها
                    </A>
                </Show>
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
