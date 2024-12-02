import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import {format as formatDateFn, formatISO} from "date-fns"
import readingTime from "reading-time"
import style from "./styles/banner.scss"

const TimeMeta = ({value}: { value: Date }) => (
  <time dateTime={formatISO(value)} title={formatDateFn(value, "ccc w")}>
    {formatDateFn(value, "yyyy/LL/dd HH:mm")}
  </time>
)

export default (() => {
  function Banner({ fileData, cfg, allFiles, displayClass }: QuartzComponentProps) {
    const bannerUrl = fileData.frontmatter?.banner
    if (!bannerUrl) {
      return null
    }

    // 处理 banner 路径
    let fullBannerPath = bannerUrl
    
    if (!bannerUrl.startsWith('http')) {
      // 如果不是 http 链接，确保有前缀 /
      fullBannerPath = bannerUrl.startsWith('/') ? bannerUrl : `/${bannerUrl}`
    }

    const tags = fileData.frontmatter?.tags
      ? (typeof fileData.frontmatter.tags === 'string' 
          ? fileData.frontmatter.tags.split(',').map(t => t.trim())
          : fileData.frontmatter.tags)
      : []
    
    const fileRelativePath = fileData.filePath?.replace("content/", "")
    const segments: JSX.Element[] = []

    if (fileData.dates) {
      if (fileData.dates.created) {
        segments.push(
          <span className="meta-item">
            🌱 <TimeMeta value={fileData.dates.created}/>
          </span>
        )
      }
      if (fileData.dates.modified) {
        segments.push(
          <span className="meta-item">
            🌴 <TimeMeta value={fileData.dates.modified}/>
          </span>
        )
      }
    }

    if (fileData.text) {
      const { minutes, words } = readingTime(fileData.text)
      segments.push(
        <span className="meta-item">
          ⌛️ {Math.ceil(minutes)}min, {words}words
        </span>
      )
    }

    if (fileRelativePath) {
      segments.push(
        <a
          href={`https://github.com/CatCodeMe/blog_from_obsidian/commits/main/${fileRelativePath}`}
          target="_blank"
          rel="noreferrer noopener nofollow"
          className="meta-item history-link"
          title="View history on GitHub"
        >
          Git-Blame
        </a>
      )
    }

    // Get breadcrumbs
    const firstEntry = {
      displayName: "~",
      path: "/",
    }
    const crumbs = [firstEntry]

    // Split slug into hierarchy/parts
    const slugParts = fileData.slug?.split("/")
    if (slugParts) {
      let currentPath = ""
      
      // Add intermediate paths
      for (let i = 0; i < slugParts.length - 1; i++) {
        const curPathSegment = slugParts[i]
        currentPath = currentPath ? `${currentPath}/${curPathSegment}` : curPathSegment
        
        // Try to find the folder's index file for title
        const folderFile = allFiles.find(f => f.slug === `${currentPath}/index`)
        const displayName = folderFile?.frontmatter?.title ?? curPathSegment
        
        crumbs.push({
          displayName: displayName.replaceAll("-", " "),
          path: `/${currentPath}`,
        })
      }

      // Add current page
      if (slugParts.at(-1) !== "index") {
        crumbs.push({
          displayName: fileData.frontmatter?.title ?? slugParts.at(-1)?.replaceAll("-", " ") ?? "",
          path: "",
        })
      }
    }
    
    return (
      <>
        <div className={`banner-wrapper ${displayClass ?? ""}`}>
          <div className="banner-container">
            <div 
              className="banner-image" 
              style={{ backgroundImage: `url(${fullBannerPath})` }}
            />
            <div className="banner-overlay" />
            <nav className="breadcrumb-container" aria-label="breadcrumbs">
              {crumbs.map((crumb, index) => (
                <div key={crumb.path} className="breadcrumb-element">
                  <a href={crumb.path}>{crumb.displayName}</a>
                  {index !== crumbs.length - 1 && <p> / </p>}
                </div>
              ))}
            </nav>
            <div className="banner-content">
              <div className="banner-header">
                <h1 className="banner-title">{fileData.frontmatter?.title}</h1>
                <div className="meta-info">
                  {segments}
                </div>
                {tags.length > 0 && (
                  <div className="meta-tags">
                    {tags.map((tag, i) => (
                      <a key={i} href={`/tags/${tag}`} className="tag">
                        {tag}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // 将 DOM 操作移到客户端
  Banner.beforeDOMLoaded = `
    if (document.querySelector('.banner-wrapper')) {
      document.documentElement.classList.add('has-banner')
    }
  `

  Banner.afterDOMLoaded = `
    window.removeEventListener('beforeunload', () => {
      document.documentElement.classList.remove('has-banner')
    })
    window.addEventListener('beforeunload', () => {
      document.documentElement.classList.remove('has-banner')
    })
  `

  Banner.css = style
  return Banner
}) satisfies QuartzComponentConstructor
