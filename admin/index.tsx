import { Navigate, Route, Router, RouteSectionProps } from '@solidjs/router'
import { Component, lazy, Show } from 'solid-js'
import { render } from 'solid-js/web'
import { Perms, self } from 'store/self'

import Alert from 'comps/alert'

import './style/index.scss'

import { Popup } from 'comps/popup'
import Login from 'layout/login'
import Navbar from './layout/navbar'
const Products = lazy(() => import('./layout/products'))
const Storage = lazy(() => import('./layout/storage'))
const ProductTags = lazy(() => import('./layout/product-tags'))

const App: Component<RouteSectionProps> = P => {
    return (
        <Show when={self.loged_in && self.perms.any()} fallback={<Login />}>
            <Navbar />
            <main>{P.children}</main>
            <Popup />
        </Show>
    )
}

const Root = () => {
    return (
        <>
            <Router base='/admin'>
                <Route path='/' component={App}>
                    <Show when={self.perms.check(Perms.V_PRODUCT)}>
                        <Route
                            path='/'
                            component={() => <Navigate href='/products/' />}
                        />
                        <Route path='/products/' component={Products} />
                    </Show>
                    <Show when={self.perms.check(Perms.V_PRODUCT_TAG)}>
                        <Route path='/product-tags/' component={ProductTags} />
                    </Show>
                    <Show when={self.perms.check(Perms.V_USER)}>
                        <Route
                            path='/users/'
                            component={lazy(() => import('./layout/users'))}
                        />
                    </Show>
                    <Show when={self.perms.check(Perms.V_MATERIAL)}>
                        <Route path='/storage/' component={Storage} />
                    </Show>
                    <Route
                        path='*'
                        component={() => (
                            <span id='select-tab'>
                                بخش مورد نظر خود را انتخاب کنید
                            </span>
                        )}
                    />
                </Route>
            </Router>
            <Alert />
        </>
    )
}

render(() => <Root />, document.getElementById('root'))
