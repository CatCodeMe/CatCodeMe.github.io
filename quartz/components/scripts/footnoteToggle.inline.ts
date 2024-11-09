console.log('🚀 Script loaded')

let notesContainer: HTMLDivElement | null = null
let readingMode = false
let originalTocPosition: { parent: HTMLElement; nextSibling: Node | null } | null = null
let handleScroll: (() => void) | null = null
let observer: MutationObserver | null = null

// 清理函数
const cleanup = () => {
    if (notesContainer) {
        notesContainer.remove()
        notesContainer = null
    }

    if (handleScroll) {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleScroll)
        window.removeEventListener('hashchange', handleScroll)
        window.removeEventListener('popstate', handleScroll)
        window.removeEventListener('wheel', handleScroll)
    }

    if (observer) {
        observer.disconnect()
        observer = null
    }
}

// 初始化边注
const initializeSideNotes = () => {
    console.log('🏁 Initializing side notes')
    cleanup()

    // 使用更精确的选择器定位脚注区域
    const footnotes = document.querySelector('article .footnotes')
    if (!footnotes) return

    const article = document.querySelector('article')
    if (!article) return

    // 创建容器
    notesContainer = document.createElement('div')
    notesContainer.className = 'side-notes-container'

    const articleReact = article.getBoundingClientRect()
    notesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: ${articleReact.right + 80}px;
        width: 300px;
        height: 100vh;
        pointer-events: none;
        z-index: 1000;
    `

    // 获取文章内的引用，排除弹出层中的引用
    const refs = Array.from(article.querySelectorAll('a[data-footnote-ref]')).filter(ref =>
        !ref.closest('.popover')
    )
    const notes = Array.from(footnotes.querySelectorAll('li[id^="user-content-fn-"]')).filter(note => {
        // 确保注释在文章内部而不是弹出层内
        return !note.closest('.popover') &&
            refs.some(ref => {
                const refId = ref.id.replace('user-content-fnref-', '')
                const noteId = note.id.replace('user-content-fn-', '')
                return refId === noteId
            })
    })

    console.log(`📝 Found ${refs.length} references and ${notes.length} notes`)
    if (refs.length === 0 || notes.length === 0) return

    // 滚动到指定元素，保持一定距离
    const scrollToElement = (element: Element) => {
        const offset = 80 // 距离顶部的偏移量
        const elementRect = element.getBoundingClientRect()
        const absoluteElementTop = elementRect.top + window.pageYOffset
        window.scrollTo({
            top: absoluteElementTop - offset,
            behavior: 'smooth'
        })
    }

    // 修改所有锚点链接的点击行为
    const adjustAnchorClick = () => {
        const allAnchors = document.querySelectorAll('a[href^="#"]')
        allAnchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault()
                const href = anchor.getAttribute('href')
                if (!href) return

                const targetElement = document.querySelector(href)
                if (targetElement) {
                    scrollToElement(targetElement)
                    // 更新 URL，但不触发默认滚动
                    history.pushState(null, '', href)
                }
            })
        })
    }

    // 更新滚动处理函数
    const updateNotePositions = () => {
        if (!notesContainer || !article) return
        console.log('📍 Updating note positions')

        refs.forEach((ref, index) => {
            const noteDiv = notesContainer?.children[index] as HTMLElement
            if (!noteDiv) return

            const refRect = ref.getBoundingClientRect()
            console.log(`Note ${index + 1} viewport top:`, refRect.top)

            noteDiv.style.top = `${refRect.top}px`

            const isVisible = refRect.top >= 0 && refRect.top <= window.innerHeight
            noteDiv.style.opacity = isVisible ? '1' : '0'
        })
    }

    handleScroll = () => {
        requestAnimationFrame(updateNotePositions)
    }

    // 创建边注
    refs.forEach((ref, index) => {
        const refId = ref.id.replace('user-content-fnref-', '')
        const note = notes.find(n => n.id === `user-content-fn-${refId}`)
        if (!note) return

        const noteDiv = document.createElement('div')
        noteDiv.className = 'side-note'
        noteDiv.dataset.noteId = refId

        noteDiv.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            transform: translateY(-50%);
            opacity: 0;
            transition: all 0.3s ease;
        `

        const content = note.cloneNode(true) as HTMLElement
        const backref = content.querySelector('.data-footnote-backref')
        const backrefHref = backref?.getAttribute('href') || `#user-content-fnref-${refId}`
        backref?.remove()

        noteDiv.innerHTML = `
            <div class="note-number" role="button" tabindex="0" data-href="${backrefHref}">${refId}</div>
            <div class="note-content">${content.innerHTML}</div>
        `
        // 修改点击事件，使用与原脚注相同的链接
        // const numberEl = noteDiv.querySelector('.note-number')
        // if (numberEl) {
        //     numberEl.addEventListener('click', (e) => {
        //         e.preventDefault()
        //         const href = numberEl.getAttribute('data-href')
        //         if (href) {
        //             const targetElement = document.querySelector(href)
        //             if (targetElement) {
        //                 scrollToElement(targetElement)
        //                 history.pushState(null, '', href)
        //                 updateNotePositions()
        //             }
        //         }
        //     })
        // }

        notesContainer.appendChild(noteDiv)
    })

    document.body.appendChild(notesContainer)

    // 监听所有可能的导航事件
    const handleNavigation = () => {
        console.log('🔗 Navigation detected')
        setTimeout(updateNotePositions, 10)
        setTimeout(updateNotePositions, 100)
        setTimeout(updateNotePositions, 500)
    }

    // 调整所有锚点链接
    adjustAnchorClick()
    // 监听点击事件
    // 监听点击事件
    const handleClicks = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const anchor = target.closest('a[href^="#"]')
        if (anchor) {
            e.preventDefault()
            const href = anchor.getAttribute('href')
            if (!href) return

            const targetElement = document.querySelector(href)
            if (targetElement) {
                scrollToElement(targetElement)
                // 更新 URL，但不触发默认滚动
                history.pushState(null, '', href)
                handleNavigation()
            }
        }
    }
    // 监听滚动结束
    let scrollTimeout: number | null = null
    const handleScrollEnd = () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout)
        }
        scrollTimeout = window.setTimeout(() => {
            updateNotePositions()
        }, 100) as unknown as number
    }

    // 添加事件监听
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    window.addEventListener('wheel', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScrollEnd, { passive: true })
    document.addEventListener('click', handleClicks, { capture: true })

    // 监听 URL 变化
    window.addEventListener('hashchange', handleNavigation)
    window.addEventListener('popstate', handleNavigation)

    // 监听内容变化
    observer = new MutationObserver((mutations) => {
        console.log('📄 Content changed')
        // 检查是否有相关变化
        const hasRelevantChanges = mutations.some(mutation => {
            return mutation.type === 'attributes' &&
                (mutation.target as Element).matches('a[href^="#"]') ||
                mutation.type === 'childList' ||
                mutation.type === 'characterData'
        })
        if (hasRelevantChanges) {
            handleNavigation()
        }
    })

    observer.observe(article, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeFilter: ['href', 'id', 'class'] // 只监听特定属性
    })

    // 初始化位置
    console.log('🎯 Initial position update')
    updateNotePositions()
    // 初始化时处理 URL hash
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash)
        if (targetElement) {
            setTimeout(() => {
                scrollToElement(targetElement)
            }, 100)
        }
    }
}

function setupFootnoteToggle() {
    console.log('📝 Setting up footnote toggle')

    const hasFootnotes = document.querySelector('.footnotes') !== null
    if (!hasFootnotes) {
        console.log('❌ No footnotes found, skipping setup')
        return
    }

    const search = document.querySelector('.search')
    const toc = document.querySelector('.toc') as HTMLElement | null

    if (!search) return

    // 创建按钮
    const button = document.createElement('button')
    button.className = 'sidebar-toggle-button'
    button.setAttribute('title', '阅读模式')
    button.setAttribute('aria-label', '阅读模式')
    button.setAttribute('aria-pressed', 'false')
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
    `

    // 创建阅读模式提示
    const createReadingModeHint = () => {
        const hint = document.createElement('div')
        hint.className = 'reading-mode-hint'
        hint.innerHTML = `
            <button class="exit-reading-mode" title="退出阅读模式">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            </button>
            <span class="hint-text">按 ESC 退出阅读模式</span>
        `
        document.body.appendChild(hint)

        hint.addEventListener('click', () => {
            readingMode = false
            toggleReadingMode(false)
            saveState(false)
        })
    }

    // 创建简单的提示
    const createWelcomeMessage = () => {
        const welcome = document.createElement('div')
        welcome.className = 'reading-mode-welcome'
        welcome.textContent = '进入阅读模式'
        document.body.appendChild(welcome)

        // 2秒后自动消失
        setTimeout(() => {
            welcome.style.opacity = '0'
            setTimeout(() => welcome.remove(), 300)
        }, 2000)
    }
    // 切换阅读模式
    const toggleReadingMode = (active: boolean) => {
        button.classList.toggle('active', active)

        const sidebars = document.querySelectorAll('.sidebar') as NodeListOf<HTMLElement>
        const center = document.querySelector('.center') as HTMLElement
        const leftSidebar = document.querySelector('.left.sidebar') as HTMLElement

        if (active) {
            createWelcomeMessage()

            sidebars.forEach(sidebar => {
                if (sidebar.classList.contains('left')) {
                    const children = Array.from(sidebar.children)
                    children.forEach(child => {
                        if (child !== toc) {
                            ;(child as HTMLElement).style.display = 'none'
                        }
                    })
                } else {
                    sidebar.style.display = 'none'
                }
            })

            if (toc) {
                originalTocPosition = {
                    parent: toc.parentElement as HTMLElement,
                    nextSibling: toc.nextSibling
                }
                if (leftSidebar) {
                    leftSidebar.appendChild(toc)
                    toc.classList.add('visible')
                }
            }

            createReadingModeHint()
            initializeSideNotes()
        } else {
            sidebars.forEach(sidebar => {
                sidebar.style.display = ''
                if (sidebar.classList.contains('left')) {
                    const children = Array.from(sidebar.children)
                    children.forEach(child => {
                        (child as HTMLElement).style.display = ''
                    })
                }
            })

            if (toc && originalTocPosition) {
                originalTocPosition.parent.insertBefore(
                    toc,
                    originalTocPosition.nextSibling
                )
                toc.classList.remove('visible')
                originalTocPosition = null
            }

            document.querySelector('.reading-mode-hint')?.remove()
            cleanup()
        }

        document.documentElement.classList.toggle('reading-mode', active)
        button.setAttribute('aria-pressed', active.toString())
    }

    const saveState = (state: boolean) => {
        localStorage.setItem('readingMode', state.toString())
    }

    const initializeFromState = () => {
        const savedState = localStorage.getItem('readingMode')
        if (savedState === 'true') {
            readingMode = true
            toggleReadingMode(true)
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && readingMode) {
            readingMode = false
            toggleReadingMode(false)
            saveState(false)
        }
    })

    button.addEventListener('click', () => {
        readingMode = !readingMode
        toggleReadingMode(readingMode)
        saveState(readingMode)
    })

    search.appendChild(button)
    initializeFromState()
}

// 页面加载和导航时初始化
document.addEventListener('nav', () => {
    const existingButton = document.querySelector('.sidebar-toggle-button')
    existingButton?.remove()
    setupFootnoteToggle()
})

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFootnoteToggle)
} else {
    setupFootnoteToggle()
}