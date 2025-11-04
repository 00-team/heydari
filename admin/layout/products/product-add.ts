import { produce, unwrap } from 'solid-js/store'
import { state, setState, popup_clear } from './shared'
import { deepcopy, httpx } from 'shared'
import { addAlert } from 'comps/alert'
import { EMPTY_PRODUCT, ProductModel } from 'models'

export async function product_add() {
    let p = deepcopy(state.popup)
    const files = unwrap(state.popup.files)

    popup_clear()

    let uniqeId = performance.now()

    let empty = { ...EMPTY_PRODUCT, id: uniqeId }

    setState(
        produce(s => {
            s.products.unshift({ ...empty })
        })
    )

    let product: ProductModel

    await new Promise<void>(resolve => {
        httpx({
            url: '/api/admin/products/',
            method: 'POST',
            json: {
                code: p.product.code,
                kind: p.product.kind,
                name: p.product.name,
                slug: p.product.slug,
            },
            onLoad(resp) {
                resolve()

                let index = state.products.findIndex(a => a.id === uniqeId)
                if (index < 0) return

                if (resp.status !== 200) {
                    addAlert({
                        type: 'error',
                        content: 'لطفا دوباره تلاش کنید.',
                        subject: 'خطا در اضافه کردن',
                        timeout: 3,
                    })
                    setState(
                        produce(s => {
                            s.products.splice(index, 1)
                        })
                    )
                    return
                }

                uniqeId = resp.response.id

                const productWithLoading = {
                    ...resp.response,
                    loading: true,
                }

                product = productWithLoading

                setState(
                    produce(s => {
                        s.products[index] = productWithLoading
                    })
                )
            },
        })
    })

    let hasFiles = files.length > 0
    let hasDetail =
        !!p.product.detail ||
        !!p.product.price ||
        !!p.product.description ||
        Object.keys(p.product.specification).length > 0

    let index = state.products.findIndex(a => a.id === uniqeId)
    if (index < 0) return

    if (!product!) return

    if (hasDetail) {
        httpx({
            url: `/api/admin/products/${product.id}/`,
            method: 'PATCH',
            json: {
                ...product,

                detail: p.product.detail,
                price: p.product.price,
                description: p.product.description,
                specification: p.product.specification,
            },
            onLoad(x) {
                if (x.status != 200)
                    return addAlert({
                        type: 'error',
                        subject: 'ذخیره ناموفق!',
                        content: 'ذخیره محصول با خطا مواجح شد!',
                        timeout: 3,
                    })

                addAlert({
                    type: 'success',
                    subject: 'ذخیره موفق!',
                    content: 'محصول با موفقیت ذخیره شد',
                    timeout: 3,
                })

                console.log('putted')

                setState(
                    produce(s => {
                        s.products[index] = {
                            ...x.response,
                            loading: false,
                        }
                    })
                )
            },
        })
    }

    if (hasFiles) {
        const f = files.filter(f => f.file)

        const uploadPromises: Promise<void>[] = []

        f.forEach(fa => {
            uploadPromises.push(
                new Promise<void>((resolve, reject) => {
                    const data = new FormData()
                    data.set('photo', fa.file!)

                    httpx({
                        url: `/api/admin/products/${product.id}/photos/`,
                        method: 'PUT',
                        data,
                        onLoad(secRes) {
                            if (secRes.status !== 200) return reject()

                            resolve()

                            setState(
                                produce(s => {
                                    s.products[index]!.photos =
                                        secRes.response.photos
                                })
                            )
                        },
                    })
                })
            )
        })

        await Promise.all(uploadPromises).catch(() => {
            addAlert({
                type: 'error',
                subject: 'آپلود ناموفق!',
                content: 'آپلود عکس با خطا مواجه شد',
                timeout: 3,
            })
        })
    }

    index = state.products.findIndex(a => a.id === uniqeId)
    if (index !== -1)
        setState(
            produce(s => {
                s.products[index]!.loading = false
            })
        )
}
