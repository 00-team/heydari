import { AppErr } from './gen'
import { httpx, HttpxProps } from './httpx'

export type { HttpxProps }
export { httpx }

export type Ok<T> = { status: 200; body: T }
export type Err = { status: number; body: AppErr }
export type Base<T> = {
    r: Response
    ok(): this is Ok<T>
    err(): this is Err
}

export type Result<T> = Base<T> & (Ok<T> | Err)
