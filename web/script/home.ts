export {}

const stickyButton = document.querySelector<HTMLElement>('a.main.hero-button')

stickyButton.addEventListener('mousemove', e => {
    const pos = stickyButton.getBoundingClientRect()
    const mx = e.clientX - pos.left - pos.width / 2
    const my = e.clientY - pos.top - pos.height / 2

    stickyButton.style.transform = `
        translate(${mx * 0.15}px ,${my * 0.3}px)
        rotate3d(${mx * -0.1}, ${my * -0.3}, 0, 12deg)
    `
})
stickyButton.addEventListener('mouseenter', e => {
    stickyButton.style.transition = ''
})
stickyButton.addEventListener('mouseleave', e => {
    // stickyButton.className = 'hero-btn main'
    stickyButton.style.transform = ''
    stickyButton.style.transition = '0.2s ease'
})

let heroWrapper = document.querySelector<HTMLElement>('.hero-wrapper')
let htmlWord = heroWrapper.querySelector<HTMLElement>('span.typer-word')
let aTags = heroWrapper.querySelectorAll('.hero-img-container .img-wrapper')

type WORD = {
    w: string
    id: string
}
const words: WORD[] = [
    {
        w: 'اداری',
        id: 'office',
    },
    {
        w: 'آموزشی',
        id: 'edu3',
    },
    {
        w: 'خانگی',

        id: 'home',
    },
    { w: 'استادیومی', id: 'stadium' },
    {
        w: 'آموزشی',
        id: 'edu2',
    },
    {
        w: 'رستورانی',
        id: 'restaurant',
    },
    {
        w: 'ویلایی',
        id: 'villa',
    },

    {
        w: 'آموزشی',
        id: 'edu',
    },
]
const DELETE_DELAY = 1000
const START_DELAY = 250

function sleep(ms: number) {
    return new Promise<void>(res => setTimeout(res, ms))
}

let stopRequested = false // set true to stop the loop

async function runTyper() {
    if (!htmlWord) {
        console.error('htmlWord not found — aborting typer.')
        return
    }

    let idx = 0
    while (!stopRequested) {
        const current = words[idx]
        if (!current) {
            idx = 0
            continue
        }
        const str = current.w

        // type
        for (let i = 1; i <= str.length; i++) {
            if (!htmlWord) {
                stopRequested = true
                break
            }
            htmlWord.innerText = str.slice(0, i)
            await sleep(100)
        }

        if (stopRequested) break

        // wait before deleting
        await sleep(DELETE_DELAY)

        // delete
        for (let i = str.length; i >= 0; i--) {
            if (!htmlWord) {
                stopRequested = true
                break
            }
            htmlWord.innerText = str.slice(0, i)
            await sleep(50)
        }

        if (stopRequested) break

        await sleep(START_DELAY)

        idx = (idx + 1) % words.length

        toggleImgs(idx)
    }
}

function toggleImgs(id: number) {
    if (aTags.length == 0) return

    let tags = Array.from(aTags)

    tags.forEach(a => a.classList.toggle('active', false))

    tags[id].classList.toggle('active', true)
}
runTyper()
