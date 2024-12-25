document.addEventListener('DOMContentLoaded', () => {
    setBlogsPagination()
})

function setBlogsPagination() {
    const paginationContainer =
        document.querySelector<HTMLElement>('.pagination')
    const paginationWrapper = paginationContainer.querySelector<HTMLElement>(
        '.pagination-wrapper'
    )

    const totalPages = parseInt(paginationContainer.dataset.pages) || 1
    let currentPage =
        parseInt(new URLSearchParams(window.location.search).get('page')) || 1

    console.log(totalPages, currentPage)

    if (totalPages <= 1) return (paginationContainer.innerHTML = '')

    // Previous button
    const prevButton = paginationContainer.querySelector<HTMLButtonElement>(
        'button.pagination-prev'
    )
    if (currentPage <= 1) prevButton.disabled = true
    prevButton.addEventListener('click', () => goToPage(currentPage - 1))

    // Next button
    const nextButton = paginationContainer.querySelector<HTMLButtonElement>(
        'button.pagination-next'
    )
    if (currentPage >= totalPages) nextButton.disabled = true
    nextButton.addEventListener('click', () => goToPage(currentPage + 1))

    let pageTags = paginationWrapper.querySelectorAll('a')

    // Page buttons
    for (let i = 1; i <= pageTags.length; i++) {
        if (i + 1 === currentPage) {
            pageTags[i].classList.add('active')
        }
    }

    function goToPage(page) {
        insert_param('page', page)
    }
}
