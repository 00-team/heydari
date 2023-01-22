import React, { FC, useEffect } from 'react'

import loadable from '@loadable/component'
import {
    Route,
    /* Route */
    Routes,
} from 'react-router-dom'

import './style/base.scss'
import './style/font/imports.scss'

const Home = loadable(() => import('Screens/Home'))

const App: FC = () => {
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
    }, [])
    return (
        <>
            <MainContent />
        </>
    )
}

const MainContent: FC = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
        </Routes>
    )
}

export default App
