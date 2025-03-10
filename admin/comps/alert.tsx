import { CheckIcon, CloseIcon, WarningIcon } from 'icons'
import { Component, JSX, Show, onCleanup, onMount } from 'solid-js'
import './style/alert.scss'

import { createStore, produce } from 'solid-js/store'

type AlertModel = {
    type: 'info' | 'error' | 'success'
    subject: string
    content: string
    timeout: number
    timeleft: number
}

type AlertState = {
    alerts: AlertModel[]
}

const [alert_state, setAlertState] = createStore<AlertState>({
    alerts: [],
})

function addAlert(props: Omit<AlertModel, 'timeleft'>) {
    setAlertState(
        produce(s => {
            s.alerts.unshift({ ...props, timeleft: props.timeout })
        })
    )
}

function delAlert(index: number) {
    setAlertState(
        produce(s => {
            if (index > -1 && index < s.alerts.length) {
                s.alerts.splice(index, 1)
            }
        })
    )
}

const ALERT_ICON: {
    [x in AlertModel['type']]: () => JSX.Element
} = {
    info: () => <WarningIcon />,
    error: () => <CloseIcon />,
    success: () => <CheckIcon />,
}

const Alert: Component<{ a: AlertModel; i: number }> = P => {
    let interval: number
    let timer: HTMLDivElement

    function do_timeout() {
        setAlertState(
            produce(s => {
                let a = s.alerts[P.i]
                if (!a) return

                a.timeleft -= 1

                if (a.timeleft < 0) {
                    s.alerts.splice(P.i, 1)
                }
            })
        )
    }

    onMount(() => {
        interval = setInterval(do_timeout, 1000)
    })

    onCleanup(() => clearInterval(interval))

    return (
        <div
            class='alert'
            classList={{ [P.a.type]: true }}
            onMouseEnter={() => {
                clearInterval(interval)
                let a = timer.getAnimations()[0]
                if (a) a.pause()
            }}
            onMouseLeave={() => {
                interval = setInterval(do_timeout, 1000)
                let a = timer.getAnimations()[0]
                if (a) {
                    a.currentTime = (P.a.timeout - P.a.timeleft - 1) * 1000
                    a.play()
                }
            }}
            onclick={() => delAlert(P.i)}
        >
            <div class='head title'>
                <div></div>
                <span>{P.a.subject}</span>
                {ALERT_ICON[P.a.type]()}
            </div>
            <Show when={P.a.content}>
                <div class='body title_smaller'>
                    <p>
                        {P.a.content.split('\n').map(line => (
                            <>
                                {line}
                                <br />
                            </>
                        ))}
                    </p>
                </div>
            </Show>
            <div
                ref={ref => (timer = ref)}
                class='timer-line'
                style={{
                    'animation-duration': P.a.timeout + 's',
                }}
            ></div>
        </div>
    )
}

export default () => {
    return (
        <div class='alert-fnd'>
            {alert_state.alerts.map((a, i) => (
                <Alert a={a} i={i} />
            ))}
        </div>
    )
}

export { alert_state, setAlertState, addAlert, delAlert }
