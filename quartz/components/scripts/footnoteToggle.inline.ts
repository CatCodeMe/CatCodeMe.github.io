function setupFootnoteToggle() {
    const rightSidebar = document.querySelector('.right.sidebar') as HTMLElement
    const toc = rightSidebar?.querySelector('.toc') as HTMLElement
    if (!toc) return

    const nav = document.querySelector('nav.breadcrumb-container')
    if (!nav || nav.querySelector('.sidebar-toggle-container')) return

    const toggleContainer = document.createElement('div')
    toggleContainer.className = 'sidebar-toggle-container'

    const button = document.createElement('button')
    button.className = 'sidebar-toggle-button'
    button.setAttribute('title', '阅读视图')
    button.setAttribute('aria-label', '阅读视图')
    button.setAttribute('aria-pressed', 'false')
    // 使用两个图标，默认显示关闭的书本
    button.innerHTML = `
    <svg class="book-closed" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
    <svg class="book-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
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
                // center.addEventListener('scroll', handleScroll, { passive: true, capture: true })
                center.addEventListener('wheel', handleScroll, { passive: true })
            }
        }

        requestAnimationFrame(updateNotePositions)
    }

    let originalTocPosition: { parent: HTMLElement; nextSibling: Node | null } | null = null

    // 添加 ESC 快捷键支持
    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Escape' && readingMode) {
            readingMode = false
            button.classList.remove('active')
            button.setAttribute('aria-pressed', 'false')
            cleanup()
            toggleReadingMode(false)
            saveState(false)
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

    // 创建提示框元素
    let tipElement: HTMLDivElement | null = null

    function createTip() {
        if (tipElement) return

        tipElement = document.createElement('div')
        tipElement.className = 'reading-mode-tip'
        tipElement.innerHTML = '按 Esc 退出阅读模式'
        document.body.appendChild(tipElement)

        // 延迟添加显示类，触发过渡动画
        requestAnimationFrame(() => {
            tipElement?.classList.add('visible')
        })
    }

    function removeTip() {
        if (!tipElement) return

        tipElement.classList.remove('visible')
        tipElement.addEventListener('transitionend', () => {
            tipElement?.remove()
            tipElement = null
        }, { once: true })
    }
    function toggleReadingMode(active: boolean) {
        const rightSidebar = document.querySelector('.right.sidebar') as HTMLElement

        if (active) {
            moveTocToSidebar()
            rightSidebar?.classList.add('collapsed')
            button.classList.add('reading-mode')
            setupEscListener(true)
            createTip()
        } else {
            rightSidebar?.classList.remove('collapsed')
            button.classList.remove('reading-mode')
            restoreToc()
            setupEscListener(false)
            removeTip()
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
            removeTip();
        }

    }

    function initializeFromState() {
        const isReadingMode = localStorage.getItem('reading-mode') === 'true'

        if (isReadingMode) {
            readingMode = true
            button.classList.add('active')
            button.setAttribute('aria-pressed', 'true')
            initialize()
            toggleReadingMode(true)
            setupEscListener(true)  // 确保在初始化时也设置 ESC 监听
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

    window.addCleanup?.(() => {
        cleanup();
        setupEscListener(false)  // 确保清理 ESC 监听
    })

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

// 确保在页面加载时也运行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFootnoteToggle)
} else {
    setupFootnoteToggle()
}