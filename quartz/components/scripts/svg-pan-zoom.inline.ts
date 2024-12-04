import svgPanZoom from 'svg-pan-zoom'

function createExpandButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.className = 'svg-expand-btn'
  button.title = '放大查看'
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 3h6M3 3v6M21 3h-6M21 3v6"/>
      <path d="M3 21h6M3 21v-6M21 21h-6M21 21v-6"/>
    </svg>
  `
  return button
}

function createModal(content: SVGElement): HTMLDivElement {
  const modal = document.createElement('div')
  modal.className = 'svg-modal'

  const modalContent = document.createElement('div')
  modalContent.className = 'svg-modal-content'

  const closeBtn = document.createElement('button')
  closeBtn.innerHTML = '×'
  closeBtn.className = 'svg-modal-close'
  closeBtn.title = '关闭 (点击或按 ESC)'

  const closeModal = () => {
    if (modalPanZoom) {
      modalPanZoom.destroy()
    }
    modal.remove()
    document.removeEventListener('keydown', handleEsc, true)

    // 重置焦点到 body
    document.body.focus()

    // 如果在阅读模式下，手动触发一个新的 keydown 事件
    if (document.body.classList.contains('reading-mode')) {
      setTimeout(() => {
        const newEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true
        })
        document.dispatchEvent(newEvent)
      }, 0)
    }
  }

  closeBtn.onclick = closeModal

  // 处理ESC键，使用捕获阶段
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // 检查是否处于阅读模式
      const readingMode = document.body.classList.contains('reading-mode')
      if (!readingMode || e.target === modal) {
        e.preventDefault()
        e.stopPropagation()
        closeModal()
      }
    }
  }

  // 在捕获阶段处理ESC事件
  document.addEventListener('keydown', handleEsc, true)

  const innerContainer = document.createElement('div')
  innerContainer.className = 'svg-pan-zoom-container'
  innerContainer.style.position = 'relative'
  innerContainer.setAttribute('data-svg-src', content.getAttribute('data-svg-src') || '')

  const clonedSvg = content.cloneNode(true) as SVGElement
  const existingControls = clonedSvg.querySelector('#svg-pan-zoom-controls')
  if (existingControls) {
    existingControls.remove()
  }

  clonedSvg.setAttribute('width', '100%')
  clonedSvg.setAttribute('height', '100%')
  clonedSvg.classList.add('mermaid-svg')

  innerContainer.appendChild(clonedSvg)
  modalContent.appendChild(closeBtn)
  modalContent.appendChild(innerContainer)
  modal.appendChild(modalContent)

  let modalPanZoom: any = null
  setTimeout(() => {
    modalPanZoom = svgPanZoom(clonedSvg, {
      panEnabled: true,
      controlIconsEnabled: true,
      zoomEnabled: true,
      dblClickZoomEnabled: true,
      mouseWheelZoomEnabled: true,
      preventMouseEventsDefault: true,
      zoomScaleSensitivity: 0.5,
      minZoom: 0.5,
      maxZoom: 10,
      fit: true,
      center: true,
    })
  }, 0)

  // 点击模态框背景时关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal()
    }
  })

  return modal
}

function createCopyButton(): HTMLButtonElement {
  const copyBtn = document.createElement('button')
  copyBtn.className = 'svg-copy-btn'
  copyBtn.title = '复制 Mermaid 代码'
  copyBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `

  const tooltip = document.createElement('div')
  tooltip.className = 'copy-tooltip'
  tooltip.textContent = 'Copied!'

  return copyBtn
}

// 定义 processSvg 函数
function processSvg(svg: Element) {
  if (!(svg instanceof SVGElement)) return
  
  try {
    const configStr = svg.getAttribute('data-svg-pan-zoom')
    const config = configStr ? JSON.parse(configStr) : {}

    if (svg.parentElement?.classList.contains('svg-pan-zoom-container')) {
      return
    }

    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')

    const wrapper = document.createElement('div')
    wrapper.className = 'svg-pan-zoom-container'
    wrapper.style.position = 'relative'
    wrapper.setAttribute('data-svg-src', svg.getAttribute('data-svg-src') || '')
    svg.parentNode?.insertBefore(wrapper, svg)
    wrapper.appendChild(svg)

    const expandBtn = createExpandButton()
    expandBtn.onclick = () => {
      const modal = createModal(svg)
      document.body.appendChild(modal)
    }
    wrapper.appendChild(expandBtn)

    const code = svg.getAttribute('data-mermaid-code')
    if (code) {
      const copyBtn = createCopyButton()
      const tooltip = document.createElement('div')
      tooltip.className = 'copy-tooltip'
      tooltip.textContent = 'Copied!'
      wrapper.appendChild(tooltip)

      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(code)
          tooltip.classList.add('show')
          setTimeout(() => {
            tooltip.classList.remove('show')
          }, 2000)
        } catch (err) {
          console.error('复制失败:', err)
        }
      }
      wrapper.appendChild(copyBtn)
    }

    svgPanZoom(svg, {
      panEnabled: true,
      controlIconsEnabled: true,
      zoomEnabled: true,
      dblClickZoomEnabled: true,
      mouseWheelZoomEnabled: true,
      preventMouseEventsDefault: true,
      zoomScaleSensitivity: 0.5,
      minZoom: 0.5,
      maxZoom: 10,
      fit: true,
      center: true,
      ...config
    })
  } catch (error) {
    console.error('svg-pan-zoom 初始化失败:', error)
  }
}

// 修改 enableSvgPanZoom 函数，使用 processSvg
function enableSvgPanZoom() {
  const mermaidSvgs = document.querySelectorAll('svg.mermaid-svg')
  mermaidSvgs.forEach(processSvg)
}

const initializeSvgPanZoom = () => {
  document.querySelectorAll('svg[data-svg-pan-zoom]').forEach(processSvg)
}

// 添加 Popover SVG 处理函数
const initializePopoverSvg = (popoverContent: Element) => {
  popoverContent.querySelectorAll('svg[data-svg-pan-zoom]').forEach(processSvg)
}

// 监听 popover 内容变化
const observePopovers = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (node.classList.contains('popover')) {
            // 当 popover 被添加时，处理其中的 SVG
            initializePopoverSvg(node)
          }
        }
      })
    })
  })

  // 监听整个文档的变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

window.addEventListener('load', () => {
  initializeSvgPanZoom()
  observePopovers()
})

// 导出需要的函数
export {
  initializeSvgPanZoom,
  initializePopoverSvg,
  processSvg
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enableSvgPanZoom)
} else {
  enableSvgPanZoom()
}

document.addEventListener('nav', enableSvgPanZoom);