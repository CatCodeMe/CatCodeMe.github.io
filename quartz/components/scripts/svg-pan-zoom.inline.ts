import svgPanZoom from 'svg-pan-zoom'

function enableSvgPanZoom() {
  const mermaidSvgs = document.querySelectorAll('svg.mermaid-svg')
  
  mermaidSvgs.forEach((svg) => {
    if(svg instanceof SVGElement) {
      try {
        if (svg.parentElement?.classList.contains('svg-pan-zoom-container')) {
          return
        }

        svg.setAttribute('width', '100%')
        svg.setAttribute('height', '100%')
        
        const wrapper = document.createElement('div')
        wrapper.className = 'svg-pan-zoom-container'
        svg.parentNode?.insertBefore(wrapper, svg)
        wrapper.appendChild(svg)
        
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
          center: true
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