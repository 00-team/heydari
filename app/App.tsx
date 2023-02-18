import React, { FC, useEffect } from 'react'

import Home from 'Screens/Home'
import { Footer, Navbar } from 'layout'
import {
    Route,
    /* Route */
    Routes,
} from 'react-router-dom'

import './style/base.scss'
import './style/font/imports.scss'

const App: FC = () => {
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
    }, [])

    return (
        <>
            <Navbar />
            <MainContent />
            <Footer />
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
