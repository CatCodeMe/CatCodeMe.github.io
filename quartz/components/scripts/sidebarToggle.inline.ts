function setupSidebarToggle() {
    // 防止重复初始化
    if (window.__sidebarToggleInitialized) {
        return;
    }

    window.__sidebarToggleInitialized = true;

    // 添加标志位防止重复触发
    let isToggling = false;
    let lastToggleTime = 0;
    const TOGGLE_COOLDOWN = 300; // 300ms 冷却时间

    const leftSidebar = document.querySelector<HTMLElement>('.left.sidebar')
    const rightSidebar = document.querySelector<HTMLElement>('.right.sidebar')

    function toggleSidebar(side: 'left' | 'right') {
        const now = Date.now();
        if (isToggling || (now - lastToggleTime) < TOGGLE_COOLDOWN) {
            return;
        }

        isToggling = true;
        lastToggleTime = now;

        const sidebar = side === 'left' ? leftSidebar : rightSidebar
        if (!sidebar) {
            isToggling = false;
            return;
        }

        const isCollapsed = sidebar.classList.contains('collapsed')

        if (!isCollapsed) {
            // 折叠
            sidebar.classList.add('collapsed')
            document.documentElement.classList.add(`${side}-sidebar-collapsed`)

            // 显示悬浮按钮
            const floatButton = sidebar.querySelector<HTMLButtonElement>(`.${side}-float-button`)
            if (floatButton) {
                floatButton.style.visibility = 'visible'
                floatButton.style.opacity = '1'
                floatButton.style.pointerEvents = 'auto'
            }
        } else {
            // 展开
            sidebar.classList.remove('collapsed')
            document.documentElement.classList.remove(`${side}-sidebar-collapsed`)

            // 隐藏悬浮按钮
            const floatButton = sidebar.querySelector<HTMLButtonElement>(`.${side}-float-button`)
            if (floatButton) {
                floatButton.style.visibility = 'hidden'
                floatButton.style.opacity = '0'
                floatButton.style.pointerEvents = 'none'
            }
        }

        // 保存状态
        localStorage.setItem(`sidebar-${side}-collapsed`, (!isCollapsed).toString())

        // 300ms 后重置标志位（与过渡动画时间匹配）
        setTimeout(() => {
            isToggling = false;
        }, TOGGLE_COOLDOWN);
    }

    // 创建并插入按钮到合适的位置
    // 创建并插入按钮到合适的位置
    function createToggleButtons() {
        // 只在有导航栏的页面创建按钮
        const nav = document.querySelector('nav.breadcrumb-container')
        if (!nav) {
            return null;
        }

        // 创建按钮容器
        const buttonContainer = document.createElement('div')
        buttonContainer.className = 'sidebar-toggle-container'

        // 创建左侧按钮
        const leftButton = document.createElement('button')
        leftButton.className = 'sidebar-toggle-button left-toggle-button'
        leftButton.setAttribute('data-toggle-sidebar', 'left')
        leftButton.setAttribute('type', 'button')
        leftButton.setAttribute('aria-label', 'Toggle left sidebar')
        leftButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 21 21">
<g fill="none" fill-rule="evenodd" stroke="#214257" stroke-linecap="round" stroke-linejoin="round">
<path d="M3.5 15.5v-10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2"/>
<path fill="#214257" d="M5.5 15.5v-10a2 2 0 0 1 2-2h-2c-1 0-2 .895-2 2v10c0 1.105 1 2 2 2h2a2 2 0 0 1-2-2"/>
<path d="m10.5 13.5l-3-3l3-3m5 3h-8"/></g></svg>`

        // 创建右侧按钮
        const rightButton = document.createElement('button')
        rightButton.className = 'sidebar-toggle-button right-toggle-button'
        rightButton.setAttribute('data-toggle-sidebar', 'right')
        rightButton.setAttribute('type', 'button')
        rightButton.setAttribute('aria-label', 'Toggle right sidebar')
        rightButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 21 21">
<g fill="none" fill-rule="evenodd" stroke="#214257" stroke-linecap="round" stroke-linejoin="round">
<path d="M3.5 15.5v-10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2"/>
<path fill="#214257" d="M15.5 15.5v-10a2 2 0 0 0-2-2h2c1 0 2 .895 2 2v10c0 1.105-1 2-2 2h-2a2 2 0 0 0 2-2"/>
<path d="m10.5 13.5l3-3l-3-3m3 3h-8"/></g></svg>`

        buttonContainer.appendChild(leftButton)
        buttonContainer.appendChild(rightButton)
        nav.appendChild(buttonContainer)

        return { leftButton, rightButton }
    }

    // 移除现有按钮并创建新按钮
    document.querySelectorAll('.sidebar-toggle-container').forEach(container => container.remove())
    const buttons = createToggleButtons()

    // 只在有按钮时添加事件监听器
    if (buttons) {
        const { leftButton, rightButton } = buttons

        leftButton.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSidebar('left')
        })

        rightButton.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSidebar('right')
        })
    }

    // 为浮动按钮添加事件监听器
    document.querySelectorAll<HTMLButtonElement>('[data-float-sidebar]').forEach(button => {
        const side = button.dataset.floatSidebar as 'left' | 'right'
        button.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSidebar(side)
        })
    })

    // 恢复保存的状态
    const leftCollapsed = localStorage.getItem('sidebar-left-collapsed') === 'true'
    const rightCollapsed = localStorage.getItem('sidebar-right-collapsed') === 'true'

    // 使用 requestAnimationFrame 确保 DOM 已经准备好
    requestAnimationFrame(() => {
        if (leftCollapsed) {
            toggleSidebar('left')
        }
        if (rightCollapsed) {
            toggleSidebar('right')
        }
    });
}

// 声明全局变量类型
declare global {
    interface Window {
        __sidebarToggleInitialized?: boolean;
    }
}

// 确保在页面加载和导航后都运行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebarToggle, { once: true })
} else {
    setupSidebarToggle()
}

// 使用防抖处理导航事件
let navTimeout: number | null = null;
document.addEventListener('nav', () => {
    if (navTimeout) {
        window.clearTimeout(navTimeout);
    }
    navTimeout = window.setTimeout(() => {
        window.__sidebarToggleInitialized = false;
        setupSidebarToggle();
    }, 100);
});