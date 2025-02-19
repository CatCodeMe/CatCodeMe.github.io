import remarkGfm from "remark-gfm"
import smartypants from "remark-smartypants"
import {QuartzTransformerPlugin} from "../types"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

export interface Options {
  enableSmartyPants: boolean
  linkHeadings: boolean
}

const defaultOptions: Options = {
  enableSmartyPants: true,
  linkHeadings: true,
}

export const GitHubFlavoredMarkdown: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "GitHubFlavoredMarkdown",
    markdownPlugins() {
      return opts.enableSmartyPants ? [remarkGfm, smartypants] : [remarkGfm]
    },
    htmlPlugins() {
      if (opts.linkHeadings) {
        return [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              content: (node: any) => ({
                type: "element",
                tagName: "span",
                properties: {
                  className: ["heading-level"],
                  "data-for": node.properties?.id,
                },
                children: [{
                  type: "text",
                  value: `#h${node.tagName.charAt(1)}`
                }]
              })
            },
          ],
        ]
      } else {
        return []
      }
    },
  }
}
