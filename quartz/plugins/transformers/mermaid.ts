import {QuartzTransformerPlugin} from "../types"
import rehypeMermaid from "rehype-mermaid"
import {visit} from "unist-util-visit"
import {Element} from "hast"
import {JSResource} from "../../util/resources"
import svgPanZoomScript from "../../components/scripts/svg-pan-zoom.inline"

interface Options {
  strategy?: 'img-png' | 'img-svg' | 'inline-svg' | 'pre-mermaid'
  dark?: boolean
  mermaidConfig?: object
}

const defaultOptions: Options = {
  strategy: 'inline-svg',
  dark: false,
  mermaidConfig: {
    theme: 'default',
    themeVariables: {
      fontFamily: 'LXGW WenKai Screen',
    }
  }
}

export const Mermaid: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = {
    ...defaultOptions,
    ...userOpts,
  }

  return {
    name: "Mermaid",
    externalResources() {
      const js: JSResource[] = []
      js.push({
        script: svgPanZoomScript,
        loadTime: "afterDOMReady",
        moduleType: "module",
        contentType: "inline",
      })

      return {
        js,
      }
    },
    htmlPlugins() {
      return [
        [rehypeMermaid, opts],
        () => (tree) => {
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
              
              node.properties.className = [...classes, 'mermaid-svg']
            }
          })
        }
      ]
    }
  }
} 