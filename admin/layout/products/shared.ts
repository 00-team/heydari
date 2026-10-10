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
    loading: true,
})

export function popup_init(product: ProductModel, type: popupType['type']) {
    const p: ProductModel = JSON.parse(JSON.stringify(product))

    const files: popupType['files'] = p.photos.map(url => ({
        url,
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

const SORT_WITH_IDS: string[] = [
    // 100 series
    '100CF',
    '100F',
    '101',
    '102',
    '103',
    '104',
    '107A',
    '107c',
    '108A',
    '109A',
    '110A',
    '112',
    '113',

    // 200 series
    '202',
    '203',
    '204L',
    '207A',
    '207C',
    '208A',
    '209A',
    '210A',
    '220L',

    // 300 series
    '301',
    '302',
    '303',
    '304',
    '307A',
    '308A',
    '309A',
    '310A',
    '340',

    // 400 series
    '400AD',
    '401',
    '401C',
    '402',
    '402AD',
    '403',
    '404',
    '407A',
    '407C',
    '408A',
    '409A',
    '410A',

    // 500 series
    '540LM',

    // 600 series
    '600',
    '601CL',
    '602L',
    '603L',
    '607c',

    // 700 series
    '700',
    '700S',
    '710AV',
    '710AVF',
    '710v',
    '710vVF',

    // 800 series
    '800S',
    '801F',
    '801JV',
    '810A',
    '810AV',
    '810-F',
    '810F',
    '810V',

    // 900 series
    '900',
    '900A',
    '900AV',
    '900-J',
    '900J',
    '900V',
    '900VJ',
    '902',
    '903',
    '904',

    // S1000 series
    's1000',
    'S1000F',
    'S1000FM',
    'S1000FS',
    'S1000R',
    'S1000S',
    'S1000V',
    'S1000VF',
    'S1000VS',

    // Tables: T series
    'T4',
    'T4S',
    'T5',
    'T5D',
    'T6',
    'T6W',
    'T6WW',
    'T10',
    'T11',
    'T12',
    'T13',
    'T14',
    'T17',
    'T120',
    'T-bar',
    'T-CT150-H45',
    'TH4',

    // Other product codes
    'ALBORZ',
    'C-OF-LP',
    'C-OFS-LP',
    'C-PL-s1005',
    'C-PR-LJP',
    'C-PR-LP',
    'C-SR-LP',
    'C-TR-LP',
    'C-ZA-LR',
    'C-ZAL-LRA',
    'C-ZD-LR',
    'C-ZD-LW',
    'C-ZDL-LR',
    'C-ZR-LR',
    'C-ZZL-LR',
    'FOLDING',
    'lahestani',
    'lahestani-openi',
    'persian',
    'planter',
    'SHAMIM',
    'St2',
    'ST3',
    'tedi',
    'WILSON',
    'WILSON-OPENI',
    'z510',
    'z520',
]
export const SORT_PRIORITY = new Map(
    SORT_WITH_IDS.map((code, index) => [code, index])
)
