const honorsSection = document.querySelector<HTMLElement>(
    '.about-page-honors#honors'
)
const honorTitle = honorsSection.querySelector<HTMLElement>('.honors-title')

const honorsWrapper =
    honorsSection.querySelector<HTMLElement>('.honors-wrapper')

document.addEventListener(
    'DOMContentLoaded',
    () => {
        var observer = new IntersectionObserver(
            ([entry]) => {
                if (entry && entry.isIntersecting) {
                    honorTitle.className += ' active'
                    honorsWrapper.className += ' active'

                    observer.disconnect()
                }
            },
            {
                rootMargin: '-150px',
            }
        )

        observer.observe(honorsSection)
    },
    false
)
