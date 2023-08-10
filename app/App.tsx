import React, { FC, useEffect } from 'react'

import About from 'Screens/About'
import Blog from 'Screens/Blog'
import Blogs from 'Screens/Blogs'
import Contact from 'Screens/Contact'
import Home from 'Screens/Home'
import Products from 'Screens/Products'
// import { renderToString } from 'react-dom/server'
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

            <Route path='/products' element={<Products />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/about' element={<About />} />
            <Route path='/blogs' element={<Blogs />} />
            <Route path='/blog/' element={<Blog />} />
        </Routes>
    )
}


export default App
