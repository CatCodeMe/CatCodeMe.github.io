import {QuartzTransformerPlugin} from "../types"
import rehypeInlineSVG from "@jsdevtools/rehype-inline-svg"
import {visit} from "unist-util-visit"
import {Element} from "hast"
//@ts-ignore
import svgPanZoomScript from "../../components/scripts/svg-pan-zoom.inline.ts"
import {JSResource} from "../../util/resources"

interface Options {
  maxImageSize?: number
  maxTotalSize?: number
  svgPanZoom?: {
    zoomEnabled?: boolean
    controlIconsEnabled?: boolean
    fit?: boolean
    center?: boolean
    zoomScaleSensitivity?: number
    minZoom?: number
    maxZoom?: number
    panEnabled?: boolean
    dblClickZoomEnabled?: boolean
    mouseWheelZoomEnabled?: boolean
    preventMouseEventsDefault?: boolean
    optimizeSvg?: boolean
  }
  label?: {
    text?: string
    enabled?: boolean
    excalidraw?: {
      text?: string
      enabled?: boolean
    }
  }
}

const defaultOptions: Options = {
  maxImageSize: 100000,  // 100kb
  maxTotalSize: 1000000, // 1MB，默认是 maxImageSize 的 10 倍
  svgPanZoom: {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,
    zoomScaleSensitivity: 0.5,
    minZoom: 0.5,
    maxZoom: 10,
    panEnabled: true,
    dblClickZoomEnabled: true,
    mouseWheelZoomEnabled: true,
    preventMouseEventsDefault: true,
    optimizeSvg: true
  },
  label: {
    text: 'svg',
    enabled: true,
    excalidraw: {
      text: 'excalidraw',
      enabled: true
    }
  }
}

export const InlineSVG: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const maxImageSize = userOpts?.maxImageSize ?? defaultOptions.maxImageSize
  const maxTotalSize = Math.max(
    userOpts?.maxTotalSize ?? defaultOptions.maxTotalSize,
    maxImageSize * 2  // 至少是 maxImageSize 的两倍
  )

  const opts = {
    ...defaultOptions,
    ...userOpts,
    maxImageSize,
    maxTotalSize,
    svgPanZoom: {
      ...defaultOptions.svgPanZoom,
      ...userOpts?.svgPanZoom
    }
  }

  // 抽取共同的 SVG 处理逻辑
  const processSvg = (node: Element, className?: string) => {
    const svgPanZoomConfig = { ...opts.svgPanZoom }
    node.properties['data-svg-pan-zoom'] = JSON.stringify(svgPanZoomConfig)

    // 获取现有的类名
    const classes = className 
      ? [className]
      : Array.isArray(node.properties.className)
        ? node.properties.className
        : typeof node.properties.className === 'string'
          ? [node.properties.className]
          : []

    // 检查是否是 excalidraw SVG
    const isExcalidraw = classes.includes('excalidraw-svg')

    // 设置新的类名
    if (isExcalidraw) {
      node.properties.className = [...classes, 'mermaid-svg']
    } else {
      node.properties.className = ['mermaid-svg']
    }

    // 设置标签文本
    if (opts.label?.enabled !== false) {
      if (isExcalidraw && opts.label?.excalidraw?.enabled !== false) {
        node.properties['data-svg-src'] = opts.label?.excalidraw?.text || 'excalidraw'
      } else {
        node.properties['data-svg-src'] = opts.label?.text || 'svg'
      }
    }
  }

  return {
    name: "InlineSVG",
    markdownPlugins() {
      return [
        () => (tree, file) => {
          visit(tree, 'html', (node: any) => {
            // 检查是否是 SVG 标签
            if (node.value?.startsWith('<svg')) {
              // 提取类名
              const classMatch = node.value.match(/class="([^"]*)"/)
              const className = classMatch ? classMatch[1] : ''
              const isExcalidraw = className.includes('excalidraw-svg')

              // 构建新的 SVG 标签
              const svgPanZoomConfig = { ...opts.svgPanZoom }
              const newClasses = isExcalidraw 
                ? `${className} mermaid-svg`
                : 'mermaid-svg'
              
              const dataSvgSrc = isExcalidraw && opts.label?.excalidraw?.enabled !== false
                ? opts.label?.excalidraw?.text || 'excalidraw'
                : opts.label?.text || 'svg'

              // 在开始标签后插入新的属性
              node.value = node.value.replace(
                /^<svg/,
                `<svg class="${newClasses}" data-svg-pan-zoom='${JSON.stringify(svgPanZoomConfig)}' data-svg-src="${dataSvgSrc}"`
              )
            }
          })
        }
      ]
    },
    htmlPlugins() {
      return [
        // 处理 img 标签的 SVG
        [rehypeInlineSVG, opts],
        // 处理转换后的 SVG
        () => (tree) => {
          visit(tree, 'element', (node: Element & { parent?: Element }) => {
            if (node.tagName === 'svg') {
              // 处理从 img 转换来的 SVG
              if (node.properties?.['data-inline-svg'] === true) {
                processSvg(node)
              }
              // 处理直接内嵌的 SVG（可能在 HTML 处理阶段被重新解析）
              else if (!node.properties?.['data-svg-pan-zoom']) {
                processSvg(node)
              }
            }
          })
        }
      ]
    },
    externalResources() {
      const js: JSResource[] = []
      js.push({
        script: svgPanZoomScript,
        loadTime: "afterDOMReady",
        contentType: "inline",
      })
      return { js }
    }
  }
} 