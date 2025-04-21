import { addAlert } from 'comps/alert'

export const IMAGE_MIMETYPE = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webm',
    'image/webp',
]

export function validate_image_format(file: File): boolean {
    if (!IMAGE_MIMETYPE.includes(file.type)) {
        addAlert({
            type: 'error',
            timeout: 5,
            content: 'فرمت واردی باید عکس باشد!',
            subject: 'خطا!',
        })
        return false
    }
    return true
}
