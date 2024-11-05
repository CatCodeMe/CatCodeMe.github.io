import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import {QuartzPluginData} from "../plugins/vfile"
import {byDateAndAlphabetical} from "./PageList"
import {Date, getDate} from "./Date"
import {GlobalConfiguration} from "../cfg"
import {i18n} from "../i18n"
import {classNames} from "../util/lang"
import {resolveRelative} from "../util/path";
import style from "./styles/pinNotes.scss"

interface Options {
  title?: string
  limit: number
  showTags: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 3,
  showTags: false,
  filter: () => true,
  sort: byDateAndAlphabetical(cfg),
})

export default ((userOpts?: Partial<Options>) => {
  const PinNotes: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }
    const pages = allFiles.filter((f) => opts.filter && !!f.frontmatter?.pin).sort(opts.sort)
    if(pages.length <= 0){
      return null;
    }
    return (
      <div class={classNames(displayClass, "pin-notes")}>
        <h3 id="pin-notes-title">{opts.title ?? i18n(cfg.locale).components.pinNotes.title}</h3>
        <ul class="pin-ul">
          {pages.slice(0, opts.limit).map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            return (
              <li class="pin-li">
                <div class="section">
                  <div class="desc">
                    <h4>
                      <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                        {title}
                      </a>
                    </h4>
                  </div>
                  {page.dates && (
                    <p class="meta">
                      <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  PinNotes.css = style;
  return PinNotes
}) satisfies QuartzComponentConstructor
