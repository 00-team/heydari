import { addAlert } from 'comps/alert'
import LoadingDots from 'comps/loadingDots'
import {
    ArrowdownIcon,
    Calendar2Icon,
    CalendarIcon,
    ChairIcon,
    CloseIcon,
    DeleteIcon,
    ImageIcon,
    MinusIcon,
    PersonIcon,
    PlusIcon,
    SearchIcon,
    UpdatePersonIcon,
    UploadIcon,
} from 'icons'
import { MaterialModel, UserModel } from 'models'
import { httpx } from 'shared'
import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    onMount,
    Show,
} from 'solid-js'
import { createStore, produce, SetStoreFunction } from 'solid-js/store'
import { Perms, self } from 'store'
import { setPopup } from 'store/popup'

import './style/storage.scss'

export const IMAGE_MIMETYPE = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
]

type State = {
    show: boolean
    type: 'edit' | 'add'
    activeItem: MaterialModel
    loading: boolean
    page: number
    users: { [id: number]: UserModel }
    materials: MaterialModel[]
    search: string
}

const default_item: MaterialModel = {
    count: 0,
    created_at: 0,
    detail: '',
    name: '',
    id: 0,
    photo: null,
    updated_at: 0,
    created_by: 0,
    updated_by: 0,
}

const Storage = () => {
    const [state, setState] = createStore<State>({
        show: false,
        type: 'add',
        activeItem: { ...default_item },
        users: {},
        materials: [],
        loading: true,
        page: 0,
        search: '',
    })

    onMount(async () => {
        while (true) {
            let page = 0
            let len = await fetch_page(page)
            if (len < 32) {
                break
            }
        }
    })

    async function fetch_page(page: number): Promise<number> {
        return new Promise((ok, reject) => {
            httpx({
                url: '/api/admin/materials/',
                params: { page },
                method: 'GET',
                reject,
                onLoad(x) {
                    if (x.status != 200) return

                    setState(
                        produce(s => {
                            let users = x.response.users as UserModel[]
                            s.materials = s.materials.concat(
                                x.response.materials
                            )
                            for (let u of users) {
                                s.users[u.id] = u
                            }
                            s.loading = false
                        })
                    )

                    ok(x.response.materials.length)
                },
            })
        })
    }

    const who = (id: number): string => {
        if (id == self.user.id) {
            return self.user.name || self.user.phone
        }

        let user = state.users[id]
        if (!user) return 'N / A'
        return user.name || user.phone
    }

    function material_delete(id: number) {
        httpx({
            url: `/api/admin/materials/${id}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200) return

                setState(
                    produce(s => {
                        let ii = s.materials.findIndex(m => m.id == id)
                        if (ii != -1) {
                            s.materials.splice(ii, 1)
                        }
                    })
                )
            },
        })
    }

    const materials = createMemo(() => {
        let query = state.search.trim()
        if (query.length >= 3) {
            return state.materials.filter(m => m.name.search(query) != -1)
        }
        return state.materials
    })

    return (
        <div class='storage-container' classList={{ loading: state.loading }}>
            <Show when={!state.loading} fallback={<LoadingItems />}>
                <div class='storage-wrapper title_smaller'>
                    <div class='search-wrapper'>
                        <input
                            placeholder='جستجو کنید...'
                            oninput={e => {
                                setState({ search: e.currentTarget.value })
                            }}
                        />
                        <SearchIcon />
                    </div>
                    <Show when={self.perms.check(Perms.A_MATERIAL)}>
                        <button
                            class='main-cta title_smaller'
                            onclick={() => setState({ show: true })}
                        >
                            اضافه به انبار
                        </button>
                    </Show>

                    <div class='storage-items'>
                        <Show when={state.materials.length == 0}>
                            <div class='empty-storage'>انبار خالی است!</div>
                        </Show>
                        {materials().map(m => (
                            <Item
                                M={m}
                                onClick={() => {
                                    setState(
                                        produce(s => {
                                            s.show = true
                                            s.activeItem = { ...m }
                                            s.type = 'edit'
                                        })
                                    )
                                }}
                                onDel={() => material_delete(m.id)}
                                whoCreated={who(m.created_by)}
                                whoUpdated={who(m.updated_by)}
                            />
                        ))}
                    </div>
                </div>
            </Show>

            <Popup setState={setState} state={state} />
        </div>
    )
}

interface PopupProps {
    state: State
    setState: SetStoreFunction<State>
}
const Popup: Component<PopupProps> = P => {
    type Pstate = {
        name: string
        newCount: number
        imgUrl: string
        imgFile: File | null

        action: 'add' | 'sold'

        loading: boolean
    }

    const default_popup: Pstate = {
        name: '',
        newCount: 0,

        imgFile: null,
        imgUrl: '',

        action: 'add',

        loading: false,
    }

    const [state, setState] = createStore<Pstate>({ ...default_popup })

    function set_material(material: MaterialModel) {
        P.setState(
            produce(s => {
                let ii = s.materials.findIndex(i => i.id === material.id)
                if (ii == -1) {
                    console.warn('could not find material with id')
                    return
                }

                s.materials[ii] = material
            })
        )
    }

    createEffect(() => {
        setState({
            name: P.state.activeItem.name || '',
            newCount: 0,
            imgUrl: P.state.activeItem.photo || '',
            imgFile: null,
            action: 'add',
        })
    })

    onMount(() => {
        document.addEventListener('keydown', handle_esc)

        onCleanup(() => {
            document.removeEventListener('keydown', handle_esc)
        })
    })

    const changed = createMemo(() => {
        if (P.state.type !== 'edit') return true

        return (
            P.state.activeItem.name !== state.name ||
            state.newCount > 0 ||
            !state.imgUrl
        )
    })

    const handle_esc = (event: KeyboardEvent) => {
        if (event.key === 'Escape' || event.key === 'Esc') {
            return close_popup()
        }
    }

    const return_newCount = createMemo((): number =>
        state.action === 'add'
            ? P.state.activeItem.count + state.newCount
            : P.state.activeItem.count - state.newCount
    )

    const close_popup = () => {
        setState({ ...default_popup })

        P.setState(
            produce(s => {
                s.show = false
                s.type = 'add'
                s.activeItem = { ...default_item }
            })
        )
    }

    function on_submit() {
        if (return_newCount() < 0)
            return addAlert({
                type: 'error',
                timeout: 5,
                content: 'تعداد در انبار نمیتواند منفی باشد!',
                subject: 'خطا!',
            })
        if (state.name.length <= 0)
            return addAlert({
                type: 'error',
                timeout: 5,
                content: 'اسم آیتم نمیتواند خالی باشد!',
                subject: 'خطا!',
            })

        if (P.state.type === 'add') {
            if (!state.imgFile) {
                return addAlert({
                    type: 'error',
                    timeout: 5,
                    content: 'عکس آیتم نمیتواند خالی باشد!',
                    subject: 'خطا!',
                })
            }

            let data = new FormData()
            data.set('photo', state.imgFile)

            httpx({
                url: '/api/admin/materials/',
                method: 'POST',
                json: {
                    count: return_newCount(),
                    name: state.name,
                    detail: '',
                },
                onLoad(x) {
                    if (x.status != 200) return

                    P.setState(produce(s => s.materials.unshift(x.response)))

                    httpx({
                        url: `/api/admin/materials/${x.response.id}/photo/`,
                        method: 'PUT',
                        data,
                        onLoad(x) {
                            if (x.status != 200) return
                            set_material(x.response)
                        },
                    })
                },
            })
        }

        if (P.state.type === 'edit') {
            let id = P.state.activeItem.id
            let action = state.action === 'add' ? 'اضافه' : 'فروش'

            if (!state.imgUrl && !state.imgFile)
                return addAlert({
                    type: 'error',
                    timeout: 5,
                    content: 'عکس آیتم نمیتواند خالی باشد!',
                    subject: 'خطا!',
                })

            httpx({
                url: `/api/admin/materials/${id}/`,
                method: 'PATCH',
                json: {
                    count: return_newCount(),
                    name: state.name,
                    detail: '',
                },
                onLoad(x) {
                    if (x.status != 200) return

                    addAlert({
                        timeout: 5,
                        type: 'success',
                        subject: ` ${action} موفق! `,
                        content: 'آیتم شما با موفقیت به روز شد!',
                    })

                    set_material(x.response)
                },
            })

            if (state.imgFile) {
                let data = new FormData()
                data.set('photo', state.imgFile)

                httpx({
                    url: `/api/admin/materials/${id}/photo/`,
                    method: 'PUT',
                    data,
                    onLoad(x) {
                        if (x.status != 200) return
                        set_material(x.response)
                    },
                })
            }
        }

        close_popup()
    }

    return (
        <div
            class='popup-container'
            classList={{ show: P.state.show }}
            onclick={() => close_popup()}
        >
            <form
                class='popup-wrapper'
                onclick={e => {
                    e.stopImmediatePropagation()
                    e.stopPropagation()
                }}
                onsubmit={e => {
                    e.preventDefault()

                    if (!changed())
                        return addAlert({
                            type: 'info',
                            content: 'مطلبی رو عوض نکردید!',
                            subject: 'احتیاط!',
                            timeout: 5,
                        })

                    on_submit()
                }}
            >
                <button
                    class='close-form'
                    type='button'
                    onclick={() => close_popup()}
                >
                    <CloseIcon />
                </button>

                <div class='data-wrapper'>
                    <div class='img-container'>
                        <Show
                            when={state.imgUrl || state.imgFile}
                            fallback={
                                <UploadImage
                                    onUpload={file => {
                                        setState(
                                            produce(s => {
                                                s.imgFile = file
                                            })
                                        )
                                    }}
                                />
                            }
                        >
                            <div class='img-wrapper'>
                                <button
                                    class='delete-img'
                                    type='button'
                                    onclick={() =>
                                        setPopup({
                                            show: true,
                                            type: 'error',
                                            title: 'حذف عکس',
                                            content: 'از حذف عکس مطمعنید؟؟',
                                            Icon: () => <DeleteIcon />,
                                            onSubmit: () =>
                                                setState(
                                                    produce(s => {
                                                        s.imgFile = null
                                                        s.imgUrl = ''
                                                    })
                                                ),
                                        })
                                    }
                                >
                                    <DeleteIcon />
                                </button>
                                <img
                                    src={
                                        state.imgUrl
                                            ? `/record/mp-${P.state.activeItem.id}-${state.imgUrl}`
                                            : URL.createObjectURL(state.imgFile)
                                    }
                                />
                            </div>
                        </Show>
                    </div>
                    <div class='count-container'>
                        <div
                            class='count'
                            classList={{
                                error: return_newCount() < 0,
                            }}
                        >
                            <span>
                                {P.state.activeItem.count.toLocaleString()}
                            </span>
                        </div>
                        <div class='hold title_smaller'>موجودی فعلی</div>
                    </div>
                </div>

                <div class='inps-wrapper'>
                    <div class='inp-wrapper'>
                        <div class='holder'>
                            <ChairIcon />
                            اسم آیتم
                        </div>

                        <input
                            type='text'
                            class='name-inp'
                            placeholder='اسم آیتم...'
                            value={state.name}
                            oninput={e => setState({ name: e.target.value })}
                        />
                    </div>

                    <div class='counter-update'>
                        <div class='main-inp'>
                            <button
                                type='button'
                                class='icon plus'
                                onclick={() =>
                                    setState(
                                        produce(s => {
                                            s.newCount += 1
                                        })
                                    )
                                }
                            >
                                <PlusIcon />
                            </button>
                            <input
                                type='number'
                                inputMode='numeric'
                                min={0}
                                maxLength={20}
                                value={state.newCount}
                                placeholder={'تعداد...'}
                                oninput={e => {
                                    if (e.target.value.length >= 10)
                                        return e.preventDefault()

                                    let value = Math.ceil(
                                        e.target.valueAsNumber
                                    )

                                    setState({ newCount: value || 0 })
                                }}
                            />
                            <button
                                type='button'
                                class='icon minus'
                                onclick={() =>
                                    setState(
                                        produce(s => {
                                            if (s.newCount >= 1) s.newCount -= 1
                                        })
                                    )
                                }
                            >
                                <MinusIcon />
                            </button>
                        </div>
                        <div
                            class='counter-action'
                            classList={{ sold: state.action === 'sold' }}
                        >
                            <button
                                class='action added title_smaller'
                                onclick={() => setState({ action: 'add' })}
                                type='button'
                            >
                                اضافه
                            </button>
                            <button
                                class='action sold title_smaller'
                                onclick={() => setState({ action: 'sold' })}
                                type='button'
                            >
                                فروش
                            </button>
                        </div>
                    </div>

                    <button
                        class='popup-cta title_smaller'
                        type='submit'
                        classList={{ disable: !changed() }}
                    >
                        تایید
                    </button>
                </div>

                {/* 
                    <input
                        type='nunmber'
                        inputMode='numeric'
                        class='count-inp'
                    />

                    <div class='count-action'></div>

                    <button class='poopup-cta'></button> */}
            </form>
        </div>
    )
}

interface UploadImageProps {
    onUpload: (file: File) => void
}
const UploadImage: Component<UploadImageProps> = P => {
    return (
        <label
            class='upload-image'
            for='image-upload-inp'
            ondragenter={e => e.preventDefault()}
            ondragleave={e => e.preventDefault()}
            ondragover={e => e.preventDefault()}
            ondrop={e => {
                e.preventDefault()

                let file = e.dataTransfer.files[0]

                if (!IMAGE_MIMETYPE.includes(file.type))
                    return addAlert({
                        type: 'error',
                        timeout: 5,
                        content: 'فرمت واردی باید عکس باشد!',
                        subject: 'خطا!',
                    })

                P.onUpload(file)
            }}
        >
            <input
                type='file'
                id='image-upload-inp'
                accept='.jpg, .jpeg, .png, image/jpg, image/jpeg, image/png, image/webp'
                onchange={e => {
                    if (!e.target.files || !e.target.files[0]) return

                    const file = e.target.files[0]

                    if (!IMAGE_MIMETYPE.includes(file.type))
                        return addAlert({
                            type: 'error',
                            timeout: 5,
                            content: 'فرمت واردی باید عکس باشد!',
                            subject: 'خطا!',
                        })

                    P.onUpload(file)
                }}
            />

            <UploadIcon />

            <p class='title'>آپلود عکس</p>

            <span class='title_smaller'>
                فایل خود را اینجا بندازید یا کلیک کنید!
            </span>
        </label>
    )
}

const LoadingItems = () => {
    return (
        <div class='loading'>
            <div class='loading-wrapper'>
                <LoadingDots />
                <p>لطفا صبر کنید...</p>
            </div>
        </div>
    )
}

type ItemProps = {
    onClick: () => void
    onDel: () => void

    M: MaterialModel
    whoCreated: string
    whoUpdated: string
}
const Item: Component<ItemProps> = P => {
    let ref: HTMLElement

    const [show, setShow] = createSignal(false)

    createEffect(
        on(
            () => show(),
            show => {
                if (!ref) return

                if (!show) {
                    ref.style.height = '3.5rem'
                } else {
                    ref.style.height = `${ref.scrollHeight}px`
                }
            }
        )
    )

    const closeOnOutsideClick = (e: MouseEvent) => {
        if (ref && !ref.contains(e.target as Node)) {
            setShow(false)
        }
    }

    onMount(() => {
        ref.addEventListener('blur', close)
        onCleanup(() => {
            ref.removeEventListener('blur', close)
        })

        document.addEventListener('click', closeOnOutsideClick)

        onCleanup(() => {
            document.removeEventListener('click', closeOnOutsideClick)
        })
    })

    return (
        <div
            class='item'
            classList={{
                warn: P.M.count <= 50 && P.M.count > 20,
                red: P.M.count <= 20 && P.M.count >= 0,
            }}
            onclick={P.onClick}
        >
            <div class='img-container  '>
                <Show when={P.M.photo} fallback={<ImageIcon />}>
                    <img
                        src={`/record/mp-${P.M.id}-${P.M.photo}?q=${performance.now()}`}
                        alt=''
                    />
                </Show>
            </div>

            <div class='data-wrapper'>
                <div class='item-infos'>
                    <div class='item-name title_small'>{P.M.name}</div>

                    <div class='item-count-container'>
                        <div class='holder title_smaller'>موجودی فعلی</div>
                        <div class='item-count title'>
                            <span>{P.M.count.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div
                    class='item-advanced'
                    classList={{ active: show() }}
                    onclick={e => {
                        e.stopImmediatePropagation()
                        e.stopPropagation()

                        setShow(s => !s)
                    }}
                    ref={e => (ref = e)}
                >
                    <div class='items-dropdown description'>
                        <div class='holder'>اطلاعات بیشتر</div>
                        <ArrowdownIcon />
                    </div>
                    <div class='item-rows-wrapper'>
                        <div class='item-row'>
                            <div class='item-info  description'>
                                <div class='holder'>
                                    <CalendarIcon />
                                    ثبت
                                </div>
                                <div class='data'>
                                    <span>
                                        {new Date(
                                            P.M.created_at * 1000
                                        ).toLocaleDateString('fa-IR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}
                                    </span>
                                    <span class='time'>
                                        {new Date(
                                            P.M.created_at * 1000
                                        ).toLocaleTimeString('fa-IR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div class='item-info  description'>
                                <div class='holder'>
                                    <PersonIcon />
                                    ثبت توسط
                                </div>
                                <div class='data'>{P.whoCreated}</div>
                            </div>
                        </div>
                        <div class='item-row'>
                            <div class='item-info  description'>
                                <div class='holder'>
                                    <Calendar2Icon />
                                    بروزرسانی
                                </div>
                                <div class='data'>
                                    <span>
                                        {P.M.updated_at <= 0
                                            ? 'N / A'
                                            : new Date(
                                                  P.M.updated_at * 1000
                                              ).toLocaleDateString('fa-IR', {
                                                  year: 'numeric',
                                                  month: '2-digit',
                                                  day: '2-digit',
                                              })}
                                    </span>
                                    <span class='time'>
                                        {P.M.updated_at <= 0 ? (
                                            <></>
                                        ) : (
                                            new Date(
                                                P.M.updated_at * 1000
                                            ).toLocaleTimeString('fa-IR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            })
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div class='item-info  description'>
                                <div class='holder'>
                                    <UpdatePersonIcon />
                                    بروز توسط
                                </div>
                                <div class='data'>{P.whoUpdated}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Show when={self.perms.check(Perms.D_MATERIAL)}>
                <button
                    class='delete-cta description'
                    onclick={e => {
                        e.stopImmediatePropagation()
                        e.stopPropagation()

                        setPopup({
                            show: true,
                            title: 'حذف آیتم',
                            type: 'error',
                            Icon: () => <DeleteIcon />,
                            content: 'از حذف آیتم در انبار مطمعنید؟',
                            onSubmit: () => P.onDel(),
                        })
                    }}
                >
                    حذف از انبار
                    <DeleteIcon />
                </button>
            </Show>
        </div>
    )
}

export default Storage
