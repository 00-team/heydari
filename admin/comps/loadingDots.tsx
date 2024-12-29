import { Component } from 'solid-js'

import './style/loadingdots.scss'

const LoadingDots: Component<{}> = P => {
    return (
        <div class='loading-dots-cmp'>
            <span class='dot'></span>
            <span class='dot'></span>
            <span class='dot'></span>
        </div>
    )
}

export default LoadingDots
