import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
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
            <footer class="footer">
                <div class="footer-content">
                    <p class="footer-text">
                        Powered By <a href={quartz} class="external">Quartz {version}</a>
                        ©{year} / <a href={ob} class="external">Obsidian</a> / 
                        <a href={ccm} class="external">GitPage</a> | 
                        <a href={cc} class="external">CC BY-NC-SA 4.0</a>
                    </p>
                    <div class="giscus"></div>
                </div>
            </footer>
        )
    }

    Footer.css = `
        .footer {
            margin-top: auto;
            padding: 2rem 0;
            width: 100%;
            position: relative;
            z-index: var(--z-bottom);
        }

        .footer-content {
            position: relative;
            z-index: var(--z-bottom);
            max-width: var(--container-width);
            margin: 0 auto;
        }

        .giscus {
            position: relative;
            z-index: var(--z-bottom);
        }

        .footer-text {
            position: relative;
            z-index: var(--z-bottom);
            text-align: center;
            opacity: 0.7;
        }
    `
    return Footer
}) satisfies QuartzComponentConstructor