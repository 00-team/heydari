import { alert_code } from 'comps'
import { API_VERSION, AppErr, is_error_code } from './gen'
import { isServer } from 'solid-js/web'

export type HttpxProps = {
    url: string | URL
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'
    json?: unknown
    data?: XMLHttpRequestBodyInit
    params?: {
        [k: string]: string | boolean | number | undefined | null
    }
    // type?: XMLHttpRequestResponseType
    show_alert?: boolean
    exclude_status?: number[]
    // reject?(reson?: string): void
    // onReadyStateChange?(x: XMLHttpRequest): void
    // onLoad?(r: Response): void
    // onProgress?(x: XMLHttpRequest, ev: ProgressEvent): void
    // onError?(x: XMLHttpRequest, e: ProgressEvent): void
    // onAbort?(x: XMLHttpRequest, e: ProgressEvent): void
    // onTimeout?(x: XMLHttpRequest, e: ProgressEvent): void
    // onLoadStart?(x: XMLHttpRequest, e: ProgressEvent): void
    // onLoadStart?(x: XMLHttpRequest, e: ProgressEvent): void
    headers?: {
        [k: string]: string
    }
}

export async function httpx(P: HttpxProps): Promise<Response> {
    const { url, headers: ih, show_alert = true } = P
    let headers = ih || {}
    const HOST = 'https://hamrah-insurance.com'

    let oul =
        typeof url == 'string'
            ? new URL(url, isServer ? HOST : location.href)
            : url

    if (P.params) {
        for (let [k, v] of Object.entries(P.params)) {
            if (v == null || v == void 0) continue
            oul.searchParams.set(k, v.toString())
        }
    }

    if ((P.json || P.data) && !['PUT', 'POST', 'PATCH'].includes(P.method)) {
        throw new Error(`request with method: ${P.method} cannot have any body`)
    }

    let body: XMLHttpRequestBodyInit | null = null

    if (P.json) {
        headers['Content-Type'] = 'application/json'
        // http.setRequestHeader('Content-Type', 'application/json')
        body = JSON.stringify(P.json)
    } else if (P.data) {
        body = P.data
    }

    let r = await fetch(oul, {
        method: P.method,
        body,
        headers,
    })

    let rc = r.clone()

    let av = r.headers.get('x-api-version')
    if (av && av != API_VERSION) {
        console.error('you must update ...\napi version mismatch ...')
        throw new Error('api version mismatch')
    }

    // if (P.onLoad) P.onLoad(rc)

    if (!show_alert) return rc

    if (r.status == 200 || P.exclude_status && P.exclude_status.includes(r.status)) return rc
    try {
        let apperr: AppErr = await r.json()
        if (is_error_code(apperr.code)) {
            alert_code(apperr.code)
        }
    } catch {}

    return rc

    // let http = new XMLHttpRequest()
    // http.open(P.method, oul, true)
    // if (type) http.responseType = type
    //
    // if (headers) {
    //     Object.entries(headers).forEach(([key, value]) => {
    //         http!.setRequestHeader(key, value)
    //     })
    // }
    //
    // function cleanup(x: XMLHttpRequest) {
    //     if (P.reject) P.reject(x.statusText)
    // }
    //
    // http.onerror = function (e) {
    //     if (P.onError) P.onError(this, e)
    //     cleanup(this)
    // }
    // http.ontimeout = function (e) {
    //     if (P.onTimeout) P.onTimeout(this, e)
    //     cleanup(this)
    // }
    // http.onabort = function (e) {
    //     if (P.onAbort) P.onAbort(this, e)
    //     cleanup(this)
    // }
    // http.onloadstart = function (e) {
    //     if (P.onLoadStart) P.onLoadStart(this, e)
    // }
    // http.onload = function (e) {
    //     let av = this.getResponseHeader('x-api-version')
    //     if (av && av != API_VERSION) {
    //         alert('you must update ...\napi version mismatch ...')
    //         return
    //     }
    //
    //     if (P.onLoad) P.onLoad(this, e)
    //
    //     if (!show_alert) return
    //
    //     if (P.exclude_status && P.exclude_status.includes(this.status)) return
    //
    //     if (this.status != 200 && this.response && this.response.code) {
    //         alert_code(this.response.code)
    //     }
    // }
    // http.onreadystatechange = function () {
    //     if (P.onReadyStateChange) P.onReadyStateChange(this)
    // }
    //
    // if (P.onProgress) {
    //     http.onprogress = function (e) {
    //         P.onProgress!(this, e)
    //     }
    // }
    //
    // http.send(body)
}
