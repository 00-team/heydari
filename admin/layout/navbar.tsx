import { A } from '@solidjs/router'

import './style/navbar.scss'
import { Show } from 'solid-js'
import { Perms, self } from 'store'

export default () => {
    return (
        <nav class='navbar-fnd'>
            <div class='links'>
                <Show when={self.perms.check(Perms.V_PRODUCT)}>
                    <A href='/products/'>Products</A>
                </Show>
                <Show when={self.perms.check(Perms.V_PRODUCT_TAG)}>
                    <A href='/product-tags/'>Product Tags</A>
                </Show>
                <Show when={self.perms.check(Perms.V_USER)}>
                    <A href='/users/'>Users</A>
                </Show>
                <Show when={self.perms.check(Perms.V_MATERIAL)}>
                    <A href='/storage/'>Storage</A>
                </Show>
            </div>
        </nav>
    )
}
