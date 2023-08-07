import React, { FC, StrictMode, useEffect } from 'react'

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
        <StrictMode>
            <Navbar />
            <MainContent />
            <Footer />
        </StrictMode>
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

// console.log('--- products ---')
// console.log(renderToString(<Products />))

// console.log('--- contact ---')
// console.log(renderToString(<Contact />))

// console.log('--- about ---')
// console.log(renderToString(<About />))

// console.log('--- blog ---')
// console.log(renderToString(<Blog />))

// console.log('--- blogs ---')
// console.log(renderToString(<Blogs />))

export default App
