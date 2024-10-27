import { Navigate, Route, RouteSectionProps, Router } from '@solidjs/router'
import { Component, Show, lazy } from 'solid-js'
import { render } from 'solid-js/web'
import { self } from 'store/self'

import Alert from 'comps/alert'

import './style/index.scss'

import Navbar from './layout/navbar'
import Login from 'layout/login'
const Products = lazy(() => import('./layout/products'))
const ProductTags = lazy(() => import('./layout/product-tags'))

const App: Component<RouteSectionProps> = P => {
    return (
        <Show when={self.loged_in && self.perms.any()} fallback={<Login />}>
            <Navbar />
            <main>{P.children}</main>
        </Show>
    )
}

const Root = () => {
    return (
        <>
            <Router base='/admin'>
                <Route path='/' component={App}>
                    <Route
                        path='/'
                        component={() => <Navigate href='/products/' />}
                    />
                    <Route path='/products/' component={Products} />
                    <Route path='/product-tags/' component={ProductTags} />
                    <Route path='*' component={() => <span>Not Found</span>} />
                </Route>
            </Router>
            <Alert />
        </>
    )
}

render(() => <Root />, document.getElementById('root'))
