import { addAlert } from 'comps/alert'
import { CloseIcon, PlusIcon, SaveIcon, TrashIcon, WarningIcon } from 'icons'
import { httpx, Perms } from 'shared'
import { Component, createMemo, onCleanup, onMount, Show } from 'solid-js'
import { produce } from 'solid-js/store'
import { self } from 'store'
import { setPopup } from 'store/popup'
import './style/products.scss'
import { state, setState } from './shared'
import { PopupAdvanced } from './popup-advanced'
import { PopupOverview } from './popup-overview'
import { product_add } from './product-add'

export const ProductPopup: Component = () => {
    let ac = new AbortController()

    onMount(() => {
        escHandle()

        onCleanup(() => {
            ac.abort()
        })
    })

    function escHandle() {
        document.addEventListener(
            'keydown',
            e => {
                if (e.key === 'Escape' && state.popup.show) {
                    closePopup()
                }
            },
            { signal: ac.signal }
        )
    }

    const closePopup = () => {
        let addChange = false

        if (state.popup.type === 'add') {
            if (state.popup.product.name || state.popup.files.length > 0) {
                addChange = true
            }
        }

        if (changed() || addChange) {
            setPopup({
                type: 'warning',
                content:
                    'بعد از خروج مطالبی که عوض کردید بدون ذخیر پاک میشوند!',
                Icon: () => <WarningIcon />,
                show: true,
                title: 'خروج بدون ذخیره؟',
                onSubmit() {
                    setState(
                        produce(s => {
                            s.popup.show = false
                        })
                    )
                },
            })

            return
        }

        setState(
            produce(s => {
                s.popup.show = false
            })
        )
    }

    function product_delete() {
        let index = state.products.findIndex(
            p => p.slug === state.popup.product.slug
        )

        if (index < 0) return

        setState(
            produce(s => {
                s.popup.show = false
                s.products[index].loading = true
            })
        )

        httpx({
            url: `/api/admin/products/${state.popup.product.id}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200)
                    return addAlert({
                        type: 'error',
                        subject: 'حذف ناموفق!',
                        content: 'حذف محصول با خطا مواجح شد!',
                        timeout: 3,
                    })

                addAlert({
                    type: 'success',
                    subject: 'حذف موفق!',
                    content: 'محصول با موفقیت حذف شد',
                    timeout: 3,
                })
                setState(
                    produce(s => {
                        s.products.splice(index, 1)
                    })
                )
            },
        })
    }

    function product_update() {
        let p = state.popup.product

        if (!p) return

        let index = state.products.findIndex(s => s.slug === p.slug)

        if (index < 0) return

        setState(
            produce(s => {
                s.popup.show = false
                s.products[index].loading = true
            })
        )

        httpx({
            url: `/api/admin/products/${p.id}/`,
            method: 'PATCH',
            json: {
                slug: p.slug,
                name: p.name,
                code: p.code,
                detail: p.detail,
                tag_leg: p.tag_leg,
                tag_bed: p.tag_bed,
                best: p.best,
                price: p.price,
                count: p.count,
                description: p.description,
                specification: p.specification,
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
                        s.products[index] = { ...x.response, loading: false }
                    })
                )
            },
        })
    }

    const changed = createMemo(() => {
        let s = state.popup.product

        if (!s) return

        let index = state.products.findIndex(i => i.slug === s.slug)

        if (index < 0) return

        let p = state.products[index]

        let change =
            s.slug != p.slug ||
            s.name != p.name ||
            s.code != p.code ||
            s.detail != p.detail ||
            s.tag_leg != p.tag_leg ||
            s.tag_bed != p.tag_bed ||
            s.description != p.description ||
            s.price != p.price ||
            s.count != p.count ||
            s.best != p.best ||
            s.kind != p.kind

        if (!change) {
            if (
                Object.keys(s.specification).length !=
                Object.keys(p.specification).length
            )
                return true

            for (let [k, v] of Object.entries(s.specification)) {
                let ov = p.specification[k]
                if (ov == undefined || ov != v) return true
            }
        }

        return change
    })

    const formIsValid = (): boolean => {
        let p = state.popup.product

        if (!p.name || !p.slug || !p.code) {
            addAlert({
                type: 'error',
                subject: 'فرم را کامل پر کنید!',
                content: 'فرم به درستی کامل نشده است!',
                timeout: 3,
            })
            return false
        }

        if (!p.kind) {
            addAlert({
                type: 'error',
                subject: 'نوع محصول را مشخص کنید.',
                content: 'میز یا صندلی بودن محصول را انتخاب کنید.',
                timeout: 3,
            })
            return false
        }

        return true
    }

    return (
        <div
            class='product-popup'
            classList={{ show: state.popup.show }}
            onclick={() => {
                closePopup()
            }}
        >
            <form
                onsubmit={e => {
                    e.preventDefault()

                    if (!formIsValid()) return

                    if (state.popup.type === 'edit') {
                        if (!changed()) {
                            return addAlert({
                                type: 'error',
                                timeout: 3,
                                subject: 'مطلبی را عوض نکردید!',
                                content: '',
                            })
                        }

                        product_update()
                    } else {
                        product_add()
                    }
                }}
                onreset={e => {
                    e.preventDefault()

                    closePopup()
                }}
                class='popup-wrapper'
                onclick={e => e.stopPropagation()}
            >
                <button class='close icon' type='reset'>
                    <CloseIcon />
                </button>
                <div class='popup-section'>
                    <PopupOverview />
                    <PopupAdvanced />
                </div>

                <div class='popup-actions'>
                    <div class='ctas'>
                        <Show
                            when={state.popup.type === 'edit'}
                            fallback={
                                <button
                                    class='cta add description'
                                    type='submit'
                                >
                                    <PlusIcon />
                                    اضافه
                                </button>
                            }
                        >
                            <button
                                class='cta save description'
                                classList={{ disable: !changed() }}
                                type='submit'
                            >
                                <SaveIcon />
                                ذخیره
                            </button>

                            <Show when={self.perms.check(Perms.D_PRODUCT)}>
                                <button
                                    class='cta delete description'
                                    type='button'
                                    onclick={() => {
                                        setPopup({
                                            show: true,
                                            Icon: () => <TrashIcon />,
                                            content:
                                                'این عمل قابل بازگشت نیست!',
                                            title: 'حذف محصول؟',
                                            type: 'error',
                                            onSubmit() {
                                                product_delete()
                                            },
                                        })
                                    }}
                                >
                                    <TrashIcon />
                                    حذف
                                </button>
                            </Show>
                        </Show>
                    </div>
                    <div
                        class='tabs'
                        classList={{ advanced: state.popup.advanced }}
                    >
                        <button
                            class='tab description'
                            type='button'
                            onclick={() =>
                                setState(
                                    produce(s => {
                                        s.popup.advanced = false
                                    })
                                )
                            }
                        >
                            نگاه کلی
                        </button>
                        <button
                            class='tab description'
                            type='button'
                            onclick={() =>
                                setState(
                                    produce(s => {
                                        s.popup.advanced = true
                                    })
                                )
                            }
                        >
                            پیشرفته
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
