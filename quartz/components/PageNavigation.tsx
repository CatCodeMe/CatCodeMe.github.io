import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import {resolveRelative, simplifySlug} from "../util/path"
import style from "./styles/pageNavigation.scss"
import {i18n} from "../i18n"
import {classNames} from "../util/lang"

interface Options {
  showTitle: boolean
}

const defaultOptions = (): Options => ({
  showTitle: true,
})

const defaultSort = (a: any, b: any) => {
  // Always put index page first
  const slugA = a.slug?.toString() ?? ""
  const slugB = b.slug?.toString() ?? ""
  if (slugA === "index") return -1
  if (slugB === "index") return 1

  // Get paths and split into segments
  const pathA = simplifySlug(slugA).split("/")
  const pathB = simplifySlug(slugB).split("/")
  
  // Root files (except index) should be last
  const isRootA = pathA.length === 1
  const isRootB = pathB.length === 1
  if (isRootA && !isRootB) return 1
  if (!isRootA && isRootB) return -1
  
  // Compare full paths for non-root files
  const fullPathA = simplifySlug(slugA)
  const fullPathB = simplifySlug(slugB)
  return fullPathA.localeCompare(fullPathB, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

export default ((userOpts?: Partial<Options>) => {
  const PageNavigation: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(), ...userOpts }
    
    // Filter and sort pages
    const pages = allFiles
      .filter(page => {
        // Only filter out tags directory
        const slug = page.slug?.toString() ?? ""
        return !slug.startsWith("tags/")
      })
      .sort(defaultSort)
    
    // Find current page index
    const currentIndex = pages.findIndex((page) => page.slug === fileData.slug)
    if (currentIndex === -1) return null
    
    const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null
    const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null
    
    // For the last page, add a link to the index page
    const isLastPage = currentIndex === pages.length - 1
    const indexPage = isLastPage ? pages.find(page => page.slug === "index") : null

    // Function to get page icon based on href
    const getPageIcon = (page: QuartzPluginData) => {
      const href = resolveRelative(fileData.slug!, page.slug!)
      if (page.slug === "index") return "🏠"
      // Check if it's a folder page (ends with /)
      if (href.endsWith("/")) return "📁"
      return "📝"
    }

    return (
      <div class={classNames(displayClass, "page-navigation")}>
        <div class="page-navigation-content">
          {prevPage && (
            <a href={resolveRelative(fileData.slug!, prevPage.slug!)} class="prev">
              <span class="prev-label">← {i18n(cfg.locale).components.pageNavigation?.prevPage ?? "Previous"}</span>
              {opts.showTitle && <span class="page-title">{getPageIcon(prevPage)} {prevPage.frontmatter?.title}</span>}
            </a>
          )}
          {(nextPage || (isLastPage && indexPage)) && (
            <a 
              href={resolveRelative(fileData.slug!, (nextPage || indexPage)!.slug!)} 
              class="next" 
            >
              <span class="next-label">
                {isLastPage && indexPage 
                  ? "回到首页 →" 
                  : `${i18n(cfg.locale).components.pageNavigation?.nextPage ?? "Next"} →`
                }
              </span>
              {opts.showTitle && (
                <span class="page-title">
                  {getPageIcon(nextPage || indexPage!)} {(nextPage || indexPage)!.frontmatter?.title}
                </span>
              )}
            </a>
          )}
        </div>
      </div>
    )
  }

  PageNavigation.css = style
  return PageNavigation
}) satisfies QuartzComponentConstructor
