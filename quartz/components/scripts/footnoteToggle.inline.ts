function setupFootnoteToggle() {
    // 检查是否有 TOC，没有则不显示按钮
    const rightSidebar = document.querySelector('.right.sidebar') as HTMLElement
    const toc = rightSidebar?.querySelector('.toc') as HTMLElement
    if (!toc) return

    const nav = document.querySelector('nav.breadcrumb-container')
    if (!nav || nav.querySelector('.footnote-toggle-button')) return

    const toggleContainer = document.createElement('div')
    toggleContainer.className = 'footnote-toggle-container'

    const button = document.createElement('button')
    button.className = 'footnote-toggle-button'
    button.setAttribute('title', '切换阅读模式')
    button.setAttribute('aria-label', '切换阅读模式')
    button.setAttribute('aria-pressed', 'false')
    button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  `

    toggleContainer.appendChild(button)
    nav.appendChild(toggleContainer)

    let notesContainer: HTMLDivElement | null = null
    let readingMode = false
    let originalTocParent: HTMLElement | null = null
    let originalToc: HTMLElement | null = null

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

    function initialize() {
        if (!notesContainer) {
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

    let originalTocPosition: { parent: HTMLElement; nextSibling: Node | null } | null = null

    // 添加 ESC 快捷键支持
    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Escape' && readingMode) {
            button.click()
        }
    }

    // 注册和清理 ESC 事件监听
    function setupEscListener(active: boolean) {
        if (active) {
            document.addEventListener('keydown', handleKeyPress)
        } else {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }

    function moveTocToSidebar() {
        const toc = document.querySelector('.right.sidebar .toc') as HTMLElement
        const leftSidebar = document.querySelector('.left.sidebar') as HTMLElement
        const leftSidebarChildren = leftSidebar?.children || []

        if (!toc || !leftSidebar) return

        originalTocPosition = {
            parent: toc.parentElement as HTMLElement,
            nextSibling: toc.nextSibling
        }

        leftSidebar.appendChild(toc)
        toc.style.display = 'block'

        const tocContent = toc.querySelector('#toc-content ul.overflow') as HTMLElement
        if (tocContent) {
            tocContent.style.maxHeight = 'none'
        }

        requestAnimationFrame(() => {
            Array.from(leftSidebarChildren).forEach(child => {
                if (child.classList.contains('toc')) return
                child.classList.add('hidden')
            })
            toc.classList.add('visible')
        })
    }

    function restoreToc() {
        const toc = document.querySelector('.left.sidebar .toc') as HTMLElement
        const leftSidebar = document.querySelector('.left.sidebar') as HTMLElement
        const leftSidebarChildren = leftSidebar?.children || []

        if (!toc || !leftSidebar || !originalTocPosition) return

        // 先恢复 TOC 到原始位置，避免延迟
        if (originalTocPosition.nextSibling) {
            originalTocPosition.parent.insertBefore(toc, originalTocPosition.nextSibling)
        } else {
            originalTocPosition.parent.appendChild(toc)
        }

        // 立即恢复其他元素显示
        Array.from(leftSidebarChildren).forEach(child => {
            child.classList.remove('hidden')
        })

        // 恢复 TOC 样式
        toc.classList.remove('visible')
        const tocContent = toc.querySelector('#toc-content ul.overflow') as HTMLElement
        if (tocContent) {
            tocContent.style.removeProperty('max-height')
        }
    }

    function toggleReadingMode(active: boolean) {
        const rightSidebar = document.querySelector('.right.sidebar') as HTMLElement

        if (active) {
            moveTocToSidebar()
            rightSidebar?.classList.add('collapsed')
            button.classList.add('reading-mode')
            setupEscListener(true)
        } else {
            rightSidebar?.classList.remove('collapsed')
            button.classList.remove('reading-mode')
            restoreToc()
            setupEscListener(false)
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

        if (readingMode) {
            restoreToc()
            setupEscListener(false)
        }
    }

    function initializeFromState() {
        const isReadingMode = localStorage.getItem('reading-mode') === 'true'

        if (isReadingMode) {
            button.classList.add('active')
            button.setAttribute('aria-pressed', 'true')
            initialize()
            toggleReadingMode(true)
        }
    }

    function saveState(isActive: boolean) {
        if (isActive) {
            localStorage.setItem('reading-mode', 'true')
        } else {
            localStorage.removeItem('reading-mode')
        }
    }

    button.addEventListener('click', () => {
        readingMode = !readingMode
        const isActive = button.classList.toggle('active')
        button.setAttribute('aria-pressed', isActive.toString())

        if (isActive) {
            initialize()
            toggleReadingMode(true)
            saveState(true)
        } else {
            cleanup()
            toggleReadingMode(false)
            saveState(false)
        }
    })

    window.addCleanup?.(() => cleanup())

    // 初始化状态
    initializeFromState()
}

// 页面加载和导航时初始化
document.addEventListener('nav', () => {
    const existingButton = document.querySelector('.footnote-toggle-button')
    if (existingButton) {
        existingButton.remove()
    }
    setupFootnoteToggle()
})