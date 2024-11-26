import {QuartzTransformerPlugin} from "../types"
import {
  FullSlug,
  RelativeURL,
  SimpleSlug,
  simplifySlug,
  splitAnchor,
  stripSlashes,
  transformLink,
  TransformOptions,
} from "../../util/path"
import path from "path"
import {visit} from "unist-util-visit"
import isAbsoluteUrl from "is-absolute-url"
import {Root} from "hast"

interface Options {
  /** How to resolve Markdown paths */
  markdownLinkResolution: TransformOptions["strategy"]
  /** Strips folders from a link so that it looks nice */
  prettyLinks: boolean
  openLinksInNewTab: boolean
  lazyLoad: boolean
  externalLinkIcon: boolean
}

const defaultOptions: Options = {
  markdownLinkResolution: "absolute",
  prettyLinks: true,
  openLinksInNewTab: false,
  lazyLoad: false,
  externalLinkIcon: true,
}

export const CrawlLinks: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "LinkProcessing",
    htmlPlugins(ctx) {
      return [
        () => {
          return (tree: Root, file) => {
            const curSlug = simplifySlug(file.data.slug!)
            const outgoing: Set<SimpleSlug> = new Set()

            const transformOptions: TransformOptions = {
              strategy: opts.markdownLinkResolution,
              allSlugs: ctx.allSlugs,
            }

            visit(tree, "element", (node, _index, _parent) => {
              // Only transform `a` tags
              if (node.tagName === "a") {
                const props = node.properties
                const href = props?.href as string
                if (typeof href === "string") {
                  // Handle short domain names
                  const isShortDomain = /^[^/]+\.[^/]+$/.test(href)
                  if (isShortDomain) {
                    props.href = `https://${href}`
                  }
                  
                  // rewrite all links
                  let dest = props.href as RelativeURL
                  const classes = (props.className ?? []) as string[]
                  const isExternal = isAbsoluteUrl(dest) || isShortDomain
                  classes.push(isExternal ? "external" : "internal")

                  // Add external-icon class for specific domains
                  const domainMatch = dest.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
                  const domain = domainMatch ? domainMatch[1] : dest
                  
                  // Check if it's an RSS feed
                  const isRSSFeed = dest.includes("index.xml")
                  if (isRSSFeed) {
                    classes.push("external-icon")
                  }
                  
                  const hasSpecialIcon = isExternal && (
                    domain.includes("github.com") ||
                    domain.includes("twitter.com") ||
                    domain.includes("x.com") ||
                    domain.includes("google.com") ||
                    domain.includes("youtube.com") ||
                    domain.includes("stackoverflow.com") ||
                    domain.includes("reddit.com") ||
                    domain.includes("hackernews.com") ||
                    domain.includes("obsidian.md") ||
                    domain.includes("wikipedia.org") ||
                    domain.includes("quartz") ||
                    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(domain) // email address
                  )
                  
                  if (hasSpecialIcon) {
                    classes.push("external-icon")
                  } else if (isExternal && !isRSSFeed && opts.externalLinkIcon) {
                    // Only add arrow for external links without special icons and not RSS feeds
                    node.children.push({
                      type: "text",
                      value: " ↗",
                    })
                  }

                  // Check if the link has alias text
                  if (
                    node.children.length === 1 &&
                    node.children[0].type === "text" &&
                    node.children[0].value !== dest
                  ) {
                    classes.push("alias")
                  }
                  props.className = classes

                  if (isExternal && opts.openLinksInNewTab) {
                    props.target = "_blank"
                    props.rel = "noopener noreferrer"
                  }

                  // don't process external links or intra-document anchors
                  const isInternal = !(isAbsoluteUrl(dest) || dest.startsWith("#"))
                  if (isInternal) {
                    dest = node.properties.href = transformLink(
                      file.data.slug!,
                      dest,
                      transformOptions,
                    )

                    // url.resolve is considered legacy
                    // WHATWG equivalent https://nodejs.dev/en/api/v18/url/#urlresolvefrom-to
                    const url = new URL(dest, "https://base.com/" + stripSlashes(curSlug, true))
                    const canonicalDest = url.pathname
                    let [destCanonical, _destAnchor] = splitAnchor(canonicalDest)
                    if (destCanonical.endsWith("/")) {
                      destCanonical += "index"
                    }

                    // need to decodeURIComponent here as WHATWG URL percent-encodes everything
                    const full = decodeURIComponent(stripSlashes(destCanonical, true)) as FullSlug
                    const simple = simplifySlug(full)
                    outgoing.add(simple)
                    node.properties["data-slug"] = full
                  }

                  // rewrite link internals if prettylinks is on
                  if (
                    opts.prettyLinks &&
                    isInternal &&
                    node.children.length === 1 &&
                    node.children[0].type === "text" &&
                    !node.children[0].value.startsWith("#")
                  ) {
                    node.children[0].value = path.basename(node.children[0].value)
                  }
                }
              }

              // transform all other resources that may use links
              if (
                ["img", "video", "audio", "iframe"].includes(node.tagName) &&
                node.properties &&
                typeof node.properties.src === "string"
              ) {
                if (opts.lazyLoad) {
                  node.properties.loading = "lazy"
                }

                if (!isAbsoluteUrl(node.properties.src)) {
                  let dest = node.properties.src as RelativeURL
                  dest = node.properties.src = transformLink(
                    file.data.slug!,
                    dest,
                    transformOptions,
                  )
                  node.properties.src = dest
                }
              }
            })

            file.data.links = [...outgoing]
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    links: SimpleSlug[]
  }
}
