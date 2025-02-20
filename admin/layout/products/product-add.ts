import { produce } from 'solid-js/store'
import { state, setState } from './shared'
import { httpx } from 'shared'
import { addAlert } from 'comps/alert'
import { EMPTY_PRODUCT } from 'models'

export async function product_add() {
    let p = state.popup.product

    let uniqeId = performance.now()

    let empty = { ...EMPTY_PRODUCT, id: uniqeId }

    setState(
        produce(s => {
            s.popup.show = false

            s.products.unshift({ ...empty })
        })
    )

    let index = state.products.findIndex(a => a.id === uniqeId)

    if (index < 0) return

    httpx({
        url: '/api/admin/products/',
        method: 'POST',
        json: {
            code: p.code,
            kind: p.kind,
            name: p.name,
            slug: p.slug,
        },
        onLoad(firstRes) {
            if (firstRes.status !== 200) {
                setState(
                    produce(s => {
                        s.products.splice(index, 1).filter(s => s)
                    })
                )
                return
            }

            const productsWithLoading = {
                ...firstRes.response,
                loading: true,
            }

            setState(
                produce(s => {
                    s.products[index] = productsWithLoading
                })
            )

            let hasFiles = state.popup.files.length > 0
            let hasDetail = p.detail || Object.keys(p.specification).length > 0

            if (!hasFiles && !hasDetail) {
                setState(
                    produce(s => {
                        s.products[index].loading = false
                    })
                )
                return
            }

            if (hasFiles) {
                for (let f of state.popup.files) {
                    let data = new FormData()
                    data.set('photo', f)

                    httpx({
                        url: `/api/admin/products/${firstRes.response.id}/photos/`,
                        method: 'PUT',
                        data,
                        onLoad(secRes) {
                            if (secRes.status != 200) return

                            setState(
                                produce(s => {
                                    s.products[index].photos =
                                        secRes.response.photos

                                    s.products[index].loading = false
                                })
                            )
                        },
                    })
                }
            }

            if (hasDetail) {
                httpx({
                    url: `/api/admin/products/${firstRes.response.id}/`,
                    method: 'PATCH',
                    json: {
                        slug: firstRes.response.slug,
                        name: firstRes.response.name,
                        code: firstRes.response.code,
                        detail: firstRes.response.detail,
                        tag_leg: p.tag_leg || firstRes.response.tag_leg,
                        tag_bed: p.tag_bed || firstRes.response.tag_bed,
                        best: firstRes.response.best,
                        price: firstRes.response.price,
                        count: firstRes.response.count,
                        description: firstRes.response.description,
                        specification:
                            p.specification || firstRes.response.specification,
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
        },
    })
}
