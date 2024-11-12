function setupFloatingButtons() {
  const buttonGroups = document.querySelectorAll<HTMLElement>('.button-group')
  
  // 防抖函数
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | undefined
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        func(...args)
      }, wait)
    }
  }
  
  // 更新滚动进度
  function updateScrollProgress() {
    const center = document.querySelector('.center')
    if (!center) return

    const windowHeight = window.innerHeight
    const centerHeight = center.scrollHeight
    const centerTop = center.getBoundingClientRect().top
    const maxScroll = centerHeight - windowHeight
    
    // 修正滚动位置计算
    const scrolled = Math.max(0, -centerTop)
    let scrollPercent = Math.min(100, Math.round((scrolled / maxScroll) * 100))
    
    // 特殊处理顶部和底部的情况
    if (Math.abs(centerTop) <= 100) { // 顶部，允许1px误差
      scrollPercent = 0
    } else if (Math.abs(centerTop + centerHeight - windowHeight) <= 100) { // 底部，允许1px误差
      scrollPercent = 100
    }
    
    const indicators = document.querySelectorAll('.progress-indicator')
    indicators.forEach(indicator => {
      indicator.textContent = `${scrollPercent}%`
    })
  }

  // 带防抖的更新函数
  const debouncedUpdate = debounce(updateScrollProgress, 16)

  // 处理按钮点击
  function handleButtonClick(e: Event) {
    const button = (e.target as Element).closest('[data-action]')
    if (!button) return
    
    const action = (button as Element).getAttribute('data-action')
    const center = document.querySelector('.center')
    if (!center) return

    const header = document.querySelector('header')
    const headerHeight = header?.offsetHeight || 0

    switch (action) {
      case 'scrollTop':
        // 滚动到 center 的第一个子元素，考虑 header 高度
        const firstElement = center.firstElementChild
        if (firstElement) {
          firstElement.scrollIntoView({ behavior: 'smooth' })
          // 监听滚动动画
          const topScrollInterval = setInterval(() => {
            updateScrollProgress()
            const currentTop = firstElement.getBoundingClientRect().top
            if (Math.abs(currentTop - headerHeight) <= 1) {
              clearInterval(topScrollInterval)
              updateScrollProgress()
            }
          }, 50)
        }
        break
      case 'scrollBottom':
        // 滚动到 center 的最后一个子元素
        const lastElement = center.lastElementChild
        if (lastElement) {
          lastElement.scrollIntoView({ behavior: 'smooth' })
          // 监听滚动动画
          const bottomScrollInterval = setInterval(() => {
            updateScrollProgress()
            const currentBottom = lastElement.getBoundingClientRect().bottom
            if (Math.abs(currentBottom - window.innerHeight) <= 1) {
              clearInterval(bottomScrollInterval)
              updateScrollProgress()
            }
          }, 50)
        }
        break
    }
  }

  // 设置事件监听
  let ticking = false
  const scrollHandler = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        debouncedUpdate()
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('wheel', scrollHandler, { passive: true })
  window.addEventListener('scroll', scrollHandler, { passive: true })

  buttonGroups.forEach(group => {
    group.addEventListener('click', handleButtonClick)
  })

  // 初始化进度
  updateScrollProgress()

  // 在组件卸载时清理事件监听
  return () => {
    window.removeEventListener('wheel', scrollHandler)
    window.removeEventListener('scroll', scrollHandler)
    buttonGroups.forEach(group => {
      group.removeEventListener('click', handleButtonClick)
    })
  }
}

// 页面加载和导航时初始化
document.addEventListener('nav', () => {
  const cleanup = setupFloatingButtons()
  document.addEventListener('nav', cleanup)
})

document.addEventListener('DOMContentLoaded', setupFloatingButtons)