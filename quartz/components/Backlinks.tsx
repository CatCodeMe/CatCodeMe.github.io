import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/backlinks.scss"
import {resolveRelative, simplifySlug} from "../util/path"
import {i18n} from "../i18n"
import {classNames} from "../util/lang"

const Backlinks: QuartzComponent = ({
  fileData,
  allFiles,
  displayClass,
  cfg,
}: QuartzComponentProps) => {
  const slug = simplifySlug(fileData.slug!)
  const backlinkFiles = allFiles.filter((file) => file.links?.includes(slug))
  
  return (
    <div class={classNames(displayClass, "backlinks-container")}>
      <hr />
      <div class="backlinks">
        <h3>
          {i18n(cfg.locale).components.backlinks.title}
          <span class="backlink-count">{backlinkFiles.length}</span>
        </h3>
        <div class="backlink-items">
          {backlinkFiles.length > 0 ? (
            backlinkFiles.map((f) => (
              <a 
                href={resolveRelative(fileData.slug!, f.slug!)} 
                class="backlink-item internal"
              >
                <div class="backlink-title">{f.frontmatter?.title || f.slug}</div>
                {f.frontmatter?.description && (
                  <div class="backlink-description">{f.frontmatter.description}</div>
                )}
              </a>
            ))
          ) : (
            <div class="backlink-item no-backlinks">
              {i18n(cfg.locale).components.backlinks.noBacklinksFound}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

Backlinks.css = style
export default (() => Backlinks) satisfies QuartzComponentConstructor
