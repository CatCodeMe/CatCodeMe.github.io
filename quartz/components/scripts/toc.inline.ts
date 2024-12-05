let currentObserver: IntersectionObserver | null = null

function createObserver() {
  if (currentObserver) {
    currentObserver.disconnect()
  }

  currentObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const slug = entry.target.id
      const tocEntryElement = document.querySelector(`a[data-for="${slug}"]`)
      const windowHeight = entry.rootBounds?.height
      if (windowHeight && tocEntryElement) {
        if (entry.boundingClientRect.y < windowHeight) {
          tocEntryElement.classList.add("in-view")
        } else {
          tocEntryElement.classList.remove("in-view")
        }
      }
    }
  })

  const headers = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]")
  if (currentObserver) {
    const observer = currentObserver
    headers.forEach((header) => observer.observe(header))
  }
}

function toggleToc(this: HTMLElement) {
  this.classList.toggle("collapsed")
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = this.nextElementSibling as HTMLElement | undefined
  if (!content) return
  content.classList.toggle("collapsed")
  content.style.maxHeight = content.style.maxHeight === "0px" ? content.scrollHeight + "px" : "0px"
}

function setupToc() {
  const toc = document.getElementById("toc")
  if (toc) {
    const collapsed = toc.classList.contains("collapsed")
    const content = toc.nextElementSibling as HTMLElement | undefined
    if (!content) return
    content.style.maxHeight = collapsed ? "0px" : content.scrollHeight + "px"
    toc.addEventListener("click", toggleToc)
    window.addCleanup(() => toc.removeEventListener("click", toggleToc))
  }
}

function setupTocListeners() {
  const tocLinks = document.querySelectorAll('#toc-content a')
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const targetId = link.getAttribute('data-for')
      if (!targetId) return
      
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        // 移除其他元素的动画类
        document.querySelectorAll('.target-animation').forEach(el => {
          el.classList.remove('target-animation')
        })
        
        // 滚动到目标位置，使用 block: 'start' 并设置 margin 来控制距离
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center' // 可以是 'start', 'center', 'end' 或 'nearest'
        })
        
        // 添加动画类
        targetElement.classList.add('target-animation')
        
        // 几秒后移除动画类
        setTimeout(() => {
          targetElement.classList.remove('target-animation')
        }, 2000)
      }
    })
  })
}

window.addEventListener("resize", setupToc)
document.addEventListener("nav", () => {
  setupToc()
  createObserver()
  setupTocListeners()
})
