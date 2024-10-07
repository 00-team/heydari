const honorsSection = document.querySelector<HTMLElement>(
    '.about-page-honors#honors'
)
const honorTitle = honorsSection.querySelector<HTMLElement>('.honors-title')
const honorsWrapper =
    honorsSection.querySelector<HTMLElement>('.honors-wrapper')

const projectsSection = document.querySelector<HTMLElement>(
    '.about-page-projects'
)
const projectTitle =
    projectsSection.querySelector<HTMLElement>('.project-title')

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

        var observer2 = new IntersectionObserver(
            ([entry]) => {
                if (entry && entry.isIntersecting) {
                    projectTitle.className += ' active'

                    observer2.disconnect()
                }
            },
            {
                rootMargin: '-150px',
            }
        )

        observer2.observe(projectsSection)
    },
    false
)
