import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/footer.scss"
import {version} from "../../package.json"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
    const cc = "https://creativecommons.org/licenses/by-nc-sa/4.0/"
    const quartz = "https://github.com/jackyzha0/quartz"
    const ob = "https://obsidian.md"
    const ccm = "https://github.com/CatCodeMe/catcodeme.github.io"
    
    const Footer: QuartzComponent = ({fileData}: QuartzComponentProps) => {
        const year = new Date().getFullYear()
        return (
            <footer>
                <p>Powered By <a href={quartz} class="external">Quartz {version}</a>
                    ©{year} / <a href={ob} class="external">Obsidian</a> / <a href={ccm} class="external">GitPage</a> | <a href={cc} class="external">CC BY-NC-SA 4.0</a>
                </p>
                <div className="giscus"></div>
            </footer>
        )
    }

    Footer.css = style
    return Footer
}) satisfies QuartzComponentConstructor