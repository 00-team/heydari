import { addAlert } from 'comps/alert'
import { CloseIcon, PlusIcon, SaveIcon, TrashIcon, WarningIcon } from 'icons'
import { httpx, Perms } from 'shared'
import { Component, createMemo, onCleanup, onMount, Show } from 'solid-js'
import { produce, unwrap } from 'solid-js/store'
import { self } from 'store'
import { setPopup } from 'store/popup'
import { PopupAdvanced } from './popup-advanced'
import { PopupOverview } from './popup-overview'
import { product_add } from './product-add'
import { popup_clear, setState, state } from './shared'

export const ProductPopup: Component = () => {
    let ac = new AbortController()
    let formRef: HTMLFormElement

    onMount(() => {
        escHandle()
        EnterHandle()

        onCleanup(() => {
            ac.abort()
        })
    })

    onCleanup(() => {
        popup_clear()
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
    function EnterHandle() {
        document.addEventListener(
            'keydown',
            e => {
                if (e.key === 'Enter' && state.popup.show) {
                    if (!formRef) return

                    e.preventDefault()
                    formRef.requestSubmit()
                }
            },
            { signal: ac.signal }
        )
    }

    const closePopup = () => {
        if (changedInfo() || changedPhotos()) {
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

        popup_clear()
    }

    function product_delete() {
        let popup = unwrap(state.popup)

        let index = state.products.findIndex(p => p.slug === popup.product.slug)

        if (index < 0) return

        setState(
            produce(s => {
                s.products[index]!.loading = true
            })
        )
        popup_clear()

        httpx({
            url: `/api/admin/products/${popup.product.id}/`,
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

    async function product_update() {
        let p = unwrap(state.popup)

        let index = state.products.findIndex(s => s.slug === p.product.slug)

        if (index < 0) return

        setState(
            produce(s => {
                s.products[index]!.loading = true
            })
        )

        const uploadPromises: Promise<void>[] = []

        if (changedInfo()) {
            uploadPromises.push(
                new Promise<void>(resolve => {
                    httpx({
                        url: `/api/admin/products/${p.product.id}/`,
                        method: 'PATCH',
                        json: {
                            slug: p.product.slug,
                            name: p.product.name,
                            code: p.product.code,
                            detail: p.product.detail,
                            tag_leg: p.product.tag_leg,
                            tag_bed: p.product.tag_bed,
                            best: p.product.best,
                            price: p.product.price,
                            count: p.product.count,
                            description: p.product.description,
                            specification: p.product.specification,
                        },
                        onLoad(x) {
                            resolve()

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

                            let index = state.products.findIndex(
                                s => s.slug === p.product.slug
                            )

                            if (index < 0) return

                            setState(
                                produce(s => {
                                    s.products[index] = {
                                        ...x.response,
                                        loading: true,
                                    }
                                })
                            )
                        },
                    })
                })
            )
        }

        if (changedPhotos()) {
            p.files.forEach(f => {
                if (!f.file) return

                uploadPromises.push(
                    new Promise<void>((resolve, reject) => {
                        const data = new FormData()
                        data.set('photo', f.file!)

                        httpx({
                            url: `/api/admin/products/${p.product.id}/photos/`,
                            method: 'PUT',
                            data,
                            onLoad(x) {
                                if (x.status !== 200) return reject()

                                setState(
                                    produce(s => {
                                        const idx = s.products.findIndex(
                                            i => i.id === p.product.id
                                        )
                                        if (idx >= 0)
                                            s.products[idx]!.photos =
                                                x.response.photos
                                    })
                                )
                                resolve()
                            },
                            onError() {
                                reject()
                            },
                        })
                    })
                )
            })
        }

        popup_clear()

        await Promise.all(uploadPromises).catch(() => {
            addAlert({
                type: 'error',
                subject: 'آپلود ناموفق!',
                content: 'آپلود عکس با خطا مواجه شد',
                timeout: 3,
            })
        })
        setState(
            produce(s => {
                const idx = s.products.findIndex(i => i.id === p.product.id)
                if (idx >= 0) s.products[idx]!.loading = false
            })
        )
    }

    const changedInfo = createMemo(() => {
        // return false
        let s = state.popup.product

        if (!s) return

        let index = state.products.findIndex(i => i.slug === s.slug)

        if (index < 0) return

        let p = state.products[index]!

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

    const changedPhotos = createMemo(() => {
        let s = state.popup

        return s.files.some(file => file.file)
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
                        if (!changedInfo() && !changedPhotos()) {
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
                class='popup-wrapper'
                onclick={e => e.stopPropagation()}
                ref={e => (formRef = e)}
            >
                <button
                    class='close icon'
                    type='button'
                    onclick={() => {
                        closePopup()
                    }}
                >
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
                                classList={{
                                    disable: !changedInfo() && !changedPhotos(),
                                }}
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
