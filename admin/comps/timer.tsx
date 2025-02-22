import { Component } from 'solid-js'

type Props = {
    seconds: number
    class?: string
}
export const Timer: Component<Props> = P => {
    function convertSectoMin(seconds: number) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return mins + ':' + (secs < 10 ? '0' : '') + secs
    }

    return (
        <span class={`timer-wrapper ${P.class}`}>
            {convertSectoMin(P.seconds)}
        </span>
    )
}
