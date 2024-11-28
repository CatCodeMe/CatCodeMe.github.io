import svgPanZoom from 'svg-pan-zoom'

function createExpandButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.className = 'svg-expand-btn'
  button.title = '放大查看'
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7"/>
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
  
  const svgContainer = document.createElement('div')
  svgContainer.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
  `
  
  // 深度克隆 SVG，但排除控制按钮
  const clonedSvg = content.cloneNode(true) as SVGElement
  // 移除已存在的控制按钮
  const existingControls = clonedSvg.querySelector('#svg-pan-zoom-controls')
  if (existingControls) {
    existingControls.remove()
  }
  
  clonedSvg.setAttribute('width', '100%')
  clonedSvg.setAttribute('height', '100%')
  clonedSvg.classList.add('mermaid-svg')
  
  svgContainer.appendChild(clonedSvg)
  modalContent.appendChild(closeBtn)
  modalContent.appendChild(svgContainer)
  modal.appendChild(modalContent)

  // 等待 DOM 更新后初始化 SVG Pan Zoom
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
      center: true
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

  // 创建提示框
  const tooltip = document.createElement('div')
  tooltip.className = 'copy-tooltip'
  tooltip.textContent = '已复制!'
  
  return copyBtn
}

function enableSvgPanZoom() {
  const mermaidSvgs = document.querySelectorAll('svg.mermaid-svg')
  
  mermaidSvgs.forEach((svg) => {
    if(svg instanceof SVGElement) {
      try {
        // 读取配置
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
        svg.parentNode?.insertBefore(wrapper, svg)
        wrapper.appendChild(svg)
        
        // 添加放大按钮
        const expandBtn = createExpandButton()
        expandBtn.onclick = () => {
          const modal = createModal(svg)
          document.body.appendChild(modal)
        }
        wrapper.appendChild(expandBtn)

        // 添加复制代码按钮
        const code = svg.getAttribute('data-mermaid-code')
        if (code) {
          const copyBtn = createCopyButton()
          const tooltip = document.createElement('div')
          tooltip.className = 'copy-tooltip'
          tooltip.textContent = '已复制!'
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
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enableSvgPanZoom)
} else {
  enableSvgPanZoom()
}

document.addEventListener('nav', enableSvgPanZoom)

let resizeTimer: ReturnType<typeof setTimeout>
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(enableSvgPanZoom, 100)
})

export default enableSvgPanZoom 