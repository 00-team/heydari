import { A } from '@solidjs/router'

import './style/navbar.scss'

export default () => {
    return (
        <nav class='navbar-fnd'>
            <div class='links'>
                <A href='/products/'>Products</A>
                <A href='/product-tags/'>Product Tags</A>
                <A href='/storage/'>Storage</A>
            </div>
        </nav>
    )
}
