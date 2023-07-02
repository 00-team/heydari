import React, { FC, useEffect } from 'react'

import ContactUs from 'Screens/ContactUs'
import Home from 'Screens/Home'
import Product from 'Screens/Product'
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
            <Route path='/product' element={<Product />} />
            <Route path='/contact' element={<ContactUs />} />
        </Routes>
    )
}

export default App
