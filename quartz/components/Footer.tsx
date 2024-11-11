import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/footer.scss"
import {version} from "../../package.json"

interface Options {
    links: Record<string, string>
}

export default ((opts?: Options) => {
    const cc = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
    const quartz = "https://github.com/jackyzha0/quartz";
    const Footer: QuartzComponent = ({fileData}: QuartzComponentProps) => {
        const year = new Date().getFullYear();
        return (
            <footer>
                <p style="text-align:center;opacity:0.7;">Published By <a href={quartz} class="external">Quartz {version}</a> ©{year} / Obsidian | <a href={cc} class="external">CC BY-NC-SA 4.0</a></p>
                <div className="giscus"></div>
            </footer>
        )
    }

    Footer.css = style
    return Footer
}) satisfies QuartzComponentConstructor