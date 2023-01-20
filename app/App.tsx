import React, { FC } from 'react'

import { useAlert } from '@00-team/react-alert'
// import loadable from '@loadable/component'
import axios from 'axios'
import {
    /* Route */
    Routes,
} from 'react-router-dom'

import './style/base.scss'
import './style/font/imports.scss'

const App: FC = () => {
    global.ReactAlert = useAlert()
    global.HandleError = error => {
        let msg = 'Error'

        if (axios.isAxiosError(error)) {
            if (error.response) {
                msg = error.response.data.detail
                if (Array.isArray(msg)) {
                    msg = msg[0].msg
                }
            } else {
                msg = error.message
            }
        } else if (error instanceof Error) {
            msg = error.message
        }

        ReactAlert.error(msg)
    }

    return (
        <>
            app
            <MainContent />
        </>
    )
}

const MainContent: FC = () => {
    return (
        <Routes>
            GG
            {/* <Route index element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/me' element={<UserTemp />} />
            <Route path='/dashboard' element={<Dashboard />} /> */}
        </Routes>
    )
}

export default App
