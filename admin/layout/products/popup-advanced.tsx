import { Select } from 'comps'
import { setState, state, tags } from './shared'
import { addAlert } from 'comps/alert'
import { ArrowdownIcon, TrashIcon, WarningIcon } from 'icons'
import {
    Accessor,
    Component,
    createMemo,
    createSignal,
    Match,
    Show,
    Switch,
} from 'solid-js'
import { produce } from 'solid-js/store'
import { setPopup } from 'store/popup'
import { Perms, self } from 'store'
import { ProductTagModel } from 'models'

export const PopupAdvanced = () => {
    const [showSpec, setShowSpec] = createSignal(false)

    const ptags = createMemo(() => {
        return tags[state.popup.product.kind]
    })

    const any_tags = createMemo(() => {
        let pt = ptags()
        return pt.bed.length != 0 || pt.leg.length != 0
    })

    return (
        <div class='advanced' classList={{ hide: !state.popup.advanced }}>
            <div class='specs-container' classList={{ active: showSpec() }}>
                <div class='specs-head' onclick={() => setShowSpec(s => !s)}>
                    <span class='title_small'>مشخصات فنی</span>
                    <ArrowdownIcon />
                </div>
                <div class='specs-wrapper'>
                    <button
                        type='button'
                        class='spec-add title_smaller'
                        onClick={e => {
                            e.preventDefault()
                            let val = 'توضیح'
                            let key = `عنوان جدید ${Object.keys(state.popup.product.specification).length + 1}`

                            if (key in state.popup.product.specification)
                                return addAlert({
                                    type: 'error',
                                    timeout: 3,
                                    subject: 'عنوان تکراری!',
                                    content:
                                        'عنوان جدید رو به چیزه دیگری تغییر بدید.',
                                })

                            setState(
                                produce(s => {
                                    if (s.popup.product)
                                        s.popup.product.specification[key] = val
                                })
                            )
                        }}
                    >
                        اضافه کردن
                    </button>
                    <SpecificationTable
                        s={state.popup.product.specification}
                        del={key =>
                            setState(
                                produce(s => {
                                    delete s.popup.product.specification[key]
                                })
                            )
                        }
                        set_key={(old, nky) => {
                            setState(
                                produce(s => {
                                    const spec = s.popup.product.specification
                                    if (!(old in spec)) return
                                    // Create a new object while preserving the key order
                                    let newSpec: typeof spec = {}
                                    Object.keys(spec).forEach(key => {
                                        if (key === old) {
                                            newSpec[nky] = spec[key]!
                                        } else {
                                            newSpec[key] = spec[key]!
                                        }
                                    })
                                    s.popup.product.specification = newSpec
                                })
                            )
                        }}
                        set_val={(key, val) => {
                            setState(
                                produce(s => {
                                    s.popup.product.specification[key] = val
                                })
                            )
                        }}
                    />
                </div>
            </div>

            <textarea
                class='extra-detail description'
                cols='30'
                rows='10'
                value={state.popup.product.detail}
                oninput={e =>
                    setState(
                        produce(s => {
                            s.popup.product.detail = e.target.value
                        })
                    )
                }
                placeholder='توضیحات کامل...'
            ></textarea>

            <Show when={self.perms.check(Perms.V_PRODUCT_TAG) && any_tags()}>
                <ProductTags tags={ptags} />
            </Show>
        </div>
    )
}

type SPP = {
    s: { [key: string]: string }
    del(key: string): void
    set_key(old: string, nky: string): void
    set_val(key: string, val: string): void
}
const SpecificationTable: Component<SPP> = P => {
    return (
        <Show
            when={Object.keys(P.s || {}).length > 0}
            fallback={
                <div class='empty-specs title_small'>مشخصاتی ثبت نشده!</div>
            }
        >
            {Object.entries(P.s).map(([key, value]) => (
                <div class='spec-row'>
                    <input
                        class='row-holder description'
                        type='text'
                        value={key}
                        onblur={e => P.set_key(key, e.currentTarget.value)}
                    />
                    <input
                        class='row-data description'
                        type='text'
                        value={value}
                        onblur={e => P.set_val(key, e.currentTarget.value)}
                    />
                    <button
                        role='button'
                        class='delete-row'
                        onClick={e => {
                            setPopup({
                                show: true,
                                type: 'error',
                                title: 'حذف ردیف',
                                content: 'بعد از حذف قادر به بازگشت آن نیست!',
                                Icon: () => <TrashIcon />,
                                onSubmit() {
                                    P.del(key)
                                },
                            })

                            e.preventDefault()
                        }}
                    >
                        <TrashIcon />
                    </button>
                </div>
            ))}
        </Show>
    )
}

type PTP = {
    tags: Accessor<{
        bed: ProductTagModel[]
        leg: ProductTagModel[]
    }>
}
const ProductTags: Component<PTP> = P => {
    const NO_TAG = { display: '---', idx: null as number | null }

    const leg_tags = createMemo(() =>
        [NO_TAG].concat(P.tags().leg.map(t => ({ display: t.name, idx: t.id })))
    )
    const bed_tags = createMemo(() =>
        [NO_TAG].concat(P.tags().bed.map(t => ({ display: t.name, idx: t.id })))
    )

    const default_leg = createMemo(() => {
        return (
            leg_tags().find(i => i.idx === state.popup.product.tag_leg) ||
            NO_TAG
        )
    })
    const default_bed = createMemo(() => {
        return (
            bed_tags().find(i => i.idx === state.popup.product.tag_bed) ||
            NO_TAG
        )
    })

    return (
        <div class='product-tags'>
            <Show
                when={state.popup.product?.kind}
                fallback={
                    <div class='tag-error title_small'>
                        <WarningIcon />
                        دسته بندی محصول را نتخاب نکردید
                    </div>
                }
            >
                <div class='tag-wrapper title_smaller'>
                    <p>
                        پایه{' '}
                        <Show when={state.popup.product.kind} fallback='محصول'>
                            <Switch>
                                <Match
                                    when={state.popup.product.kind === 'chair'}
                                >
                                    صندلی
                                </Match>
                                <Match
                                    when={state.popup.product.kind === 'table'}
                                >
                                    میز
                                </Match>
                            </Switch>
                        </Show>
                    </p>

                    <Select
                        disabled={!self.perms.check(Perms.C_PRODUCT)}
                        items={leg_tags()}
                        onChange={v =>
                            setState(
                                produce(s => {
                                    s.popup.product.tag_leg = v.idx
                                })
                            )
                        }
                        default={default_leg()}
                    />
                </div>

                <div class='tag-wrapper title_smaller'>
                    <p>
                        دسته{' '}
                        <Show when={state.popup.product.kind} fallback='محصول'>
                            <Switch>
                                <Match
                                    when={state.popup.product.kind === 'chair'}
                                >
                                    صندلی
                                </Match>
                                <Match
                                    when={state.popup.product.kind === 'table'}
                                >
                                    میز
                                </Match>
                            </Switch>
                        </Show>
                    </p>

                    <Select
                        disabled={!self.perms.check(Perms.C_PRODUCT)}
                        items={bed_tags()}
                        onChange={v =>
                            setState(
                                produce(s => {
                                    s.popup.product.tag_bed = v.idx
                                })
                            )
                        }
                        default={default_bed()}
                    />
                </div>
            </Show>
        </div>
    )
}
