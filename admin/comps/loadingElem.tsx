import { Component } from 'solid-js'

import './style/loadingelem.scss'

interface LoadingElemProps {
    class?: string
}

export const LoadingElem: Component<LoadingElemProps> = P => {
    return <div class={`loading-elem ${P.class || ''}`}></div>
}
