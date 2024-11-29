import {QuartzTransformerPlugin} from "../types"
import rehypeMermaid from "rehype-mermaid"
import {visit} from "unist-util-visit"
import {Element} from "hast"
import {JSResource} from "../../util/resources"
//@ts-ignore
import svgPanZoomScript from "../../components/scripts/svg-pan-zoom.inline.ts"

interface Options {
  strategy?: 'img-png' | 'img-svg' | 'inline-svg' | 'pre-mermaid'
  dark?: boolean
  mermaidConfig?: object
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
  }
}

const defaultOptions: Options = {
  strategy: 'inline-svg',
  dark: false,
  mermaidConfig: {
    theme: 'default',
    themeVariables: {
      fontFamily: 'LXGW WenKai Screen',
    }
  },
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
    preventMouseEventsDefault: true
  }
}

export const Mermaid: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = {
    ...defaultOptions,
    ...userOpts,
    svgPanZoom: {
      ...defaultOptions.svgPanZoom,
      ...userOpts?.svgPanZoom
    }
  }

  // 存储代码的 Map，使用文件路径作为前缀以支持多文件
  const mermaidCodeMap = new Map<string, string>()

  return {
    name: "Mermaid",
    markdownPlugins() {
      return [
        () => (tree, file) => {
          let index = 0
          visit(tree, 'code', (node: any) => {
            if (node.lang === 'mermaid') {
              // 使用文件路径和索引创建唯一ID
              const id = `${file.path}-${index++}`
              mermaidCodeMap.set(id, node.value)
              // 存储ID以便后续匹配
              node.data = node.data || {}
              node.data.mermaidId = id
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
    },
    htmlPlugins() {
      return [
        [rehypeMermaid, opts],
        () => (tree, file) => {
          let index = 0
          visit(tree, 'element', (node: Element) => {
            if (
              node.tagName === 'svg' &&
              typeof node.properties?.id === 'string' &&
              node.properties.id.startsWith('mermaid-')
            ) {
              const classes = Array.isArray(node.properties.className)
                ? node.properties.className
                : node.properties.className
                  ? [node.properties.className]
                  : []

              node.properties.className = [...classes, 'mermaid-svg'] as string[]

              // 使用相同的文件路径和索引获取代码
              const id = `${file.path}-${index++}`
              const mermaidCode = mermaidCodeMap.get(id)

              if (mermaidCode) {
                node.properties['data-mermaid-code'] = mermaidCode
              }

              const svgPanZoomConfig = { ...opts.svgPanZoom }
              node.properties['data-svg-pan-zoom'] = JSON.stringify(svgPanZoomConfig)
            }
          })
        }
      ]
    }
  }
} 