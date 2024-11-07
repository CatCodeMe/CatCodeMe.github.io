function setupFootnoteToggle() {
    const nav = document.querySelector('nav.breadcrumb-container')
    if (!nav || nav.querySelector('.footnote-toggle-button')) return

    const toggleContainer = document.createElement('div')
    toggleContainer.className = 'footnote-toggle-container'

    const button = document.createElement('button')
    button.className = 'footnote-toggle-button'
    button.setAttribute('title', '切换侧边脚注')
    button.setAttribute('aria-label', '切换侧边脚注')
    button.setAttribute('aria-pressed', 'false')
    button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  `

    toggleContainer.appendChild(button)
    nav.appendChild(toggleContainer)

    let notesContainer: HTMLDivElement | null = null

    function isInViewport(element: HTMLElement, buffer: number = 100): boolean {
        const elemRect = element.getBoundingClientRect()
        const windowHeight = window.innerHeight
        return (
            elemRect.top >= -buffer &&
            elemRect.bottom <= windowHeight + buffer
        )
    }

    function updateNotePositions() {
        if (!notesContainer) return

        const refs = document.querySelectorAll('a[id^="user-content-fnref-"]')
        const notes = notesContainer.querySelectorAll('.side-note')

        notes.forEach((note, index) => {
            const ref = refs[index] as HTMLElement
            if (!ref) return

            if (isInViewport(ref)) {
                const refRect = ref.getBoundingClientRect()
                const top = refRect.top + window.scrollY

                note.style.top = `${top}px`

                if (!note.classList.contains('visible')) {
                    note.classList.remove('leaving')
                    note.classList.add('entering')
                    requestAnimationFrame(() => {
                        note.classList.add('visible')
                    })
                }
            } else if (note.classList.contains('visible')) {
                note.classList.remove('entering')
                note.classList.add('leaving')
                note.addEventListener('animationend', () => {
                    if (!isInViewport(ref)) {
                        note.classList.remove('visible')
                    }
                }, { once: true })
            }
        })
    }

    const handleScroll = debounce(() => {
        requestAnimationFrame(updateNotePositions)
    }, 16)

    function debounce(func: Function, wait: number) {
        let timeout: number
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = window.setTimeout(later, wait)
        }
    }

    function toggleRightSidebar(show: boolean) {
        const rightSidebar = document.querySelector('.right.sidebar') as HTMLElement
        if (!rightSidebar) return

        if (show) {
            rightSidebar.classList.remove('collapsed')
            localStorage.removeItem('sidebar-right-collapsed')
        } else {
            rightSidebar.classList.add('collapsed')
            localStorage.setItem('sidebar-right-collapsed', 'true')
        }
    }

    function cleanup() {
        const center = document.querySelector('.center')
        if (center) {
            center.removeEventListener('scroll', handleScroll, { capture: true })
            center.removeEventListener('wheel', handleScroll)
        }
        notesContainer?.remove()
        notesContainer = null
        toggleRightSidebar(true)
    }

    function initialize() {
        if (!notesContainer) {
            toggleRightSidebar(false)

            notesContainer = document.createElement('div')
            notesContainer.className = 'side-notes-container'

            const refs = document.querySelectorAll('a[id^="user-content-fnref-"]')
            const notes = document.querySelectorAll('.footnotes li[id^="user-content-fn-"]')

            refs.forEach((ref, index) => {
                const note = notes[index]
                if (!note) return

                const noteDiv = document.createElement('div')
                noteDiv.className = 'side-note'

                const content = note.cloneNode(true) as HTMLElement
                content.querySelector('.data-footnote-backref')?.remove()

                noteDiv.innerHTML = `
          <div class="note-number">${index + 1}</div>
          <div class="note-content">${content.innerHTML}</div>
        `

                noteDiv.querySelector('.note-number')?.addEventListener('click', () => {
                    ref.scrollIntoView({ behavior: 'smooth' })
                })

                notesContainer?.appendChild(noteDiv)
            })

            document.body.appendChild(notesContainer)

            const center = document.querySelector('.center')
            if (center) {
                center.addEventListener('scroll', handleScroll, { passive: true, capture: true })
                center.addEventListener('wheel', handleScroll, { passive: true })
            }
        }

        requestAnimationFrame(updateNotePositions)
    }

    button.addEventListener('click', () => {
        const isActive = button.classList.toggle('active')
        button.setAttribute('aria-pressed', isActive.toString())
        if (isActive) {
            initialize()
        } else {
            cleanup()
        }
    })

    // 页面加载时检查按钮状态
    const isActive = button.classList.contains('active')
    if (isActive) {
        toggleRightSidebar(false)
    }

    window.addCleanup?.(() => cleanup())
}

// 确保在页面加载和导航后都运行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFootnoteToggle)
} else {
    setupFootnoteToggle()
}
document.addEventListener('nav', setupFootnoteToggle)