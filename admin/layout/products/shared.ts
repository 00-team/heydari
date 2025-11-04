import { EMPTY_PRODUCT, ProductModel, ProductTagModel } from 'models'
import { createStore, produce } from 'solid-js/store'

type TagState = {
    [k in ProductTagModel['kind']]: {
        [k in ProductTagModel['part']]: ProductTagModel[]
    }
}
export const [tags, setTags] = createStore<TagState>({
    chair: { leg: [], bed: [] },
    table: { leg: [], bed: [] },
})

type popupType = {
    show: boolean
    type: 'edit' | 'add'
    product: ProductModel
    advanced: boolean

    errorSec: 'name' | 'slug' | 'code' | 'id' | 'img' | 'description' | null
    errorText: string

    files: {
        url: string | null
        file: File | null
    }[]
}

type filtersType = {
    best: boolean | null
    onlyChair: boolean
    onlyTable: boolean
}

type stateType = {
    search: string

    filters: filtersType

    popup: popupType

    products: ProductModel[]
    page: number
    loading: boolean
}
export { type stateType as PRODUCTS_STATE }
export const [state, setState] = createStore<stateType>({
    search: '',
    filters: {
        best: null,
        onlyChair: false,
        onlyTable: false,
    },
    popup: {
        show: false,
        type: 'add',
        product: EMPTY_PRODUCT,
        advanced: false,

        errorSec: 'name',
        errorText: '',

        files: [],
    },

    products: [],
    page: 0,
    loading: true,
})

export function popup_init(product: ProductModel, type: popupType['type']) {
    let p: ProductModel = JSON.parse(JSON.stringify(product))

    let files: popupType['files'] = p.photos.map(u => ({
        url: u,
        file: null,
    }))

    setState(
        produce(s => {
            s.popup = {
                show: true,
                type,
                product: p,
                advanced: false,
                errorSec: null,
                errorText: '',
                files,
            }
        })
    )
}

export function popup_clear() {
    setState(
        produce(s => {
            s.popup = {
                show: false,
                type: 'add',
                product: EMPTY_PRODUCT,
                advanced: false,

                errorSec: 'name',
                errorText: '',

                files: [],
            }
        })
    )
}
