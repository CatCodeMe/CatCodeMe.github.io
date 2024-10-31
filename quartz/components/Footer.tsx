import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/footer.scss"
import {version} from "../../package.json"
import {isHomePage} from "../util/path";

interface Options {
    links: Record<string, string>
}

export default ((opts?: Options) => {
    const Footer: QuartzComponent = ({fileData}: QuartzComponentProps) => {
        const year = new Date().getFullYear();
        const noAIBadgePath = `/static/Written-By-Human-Not-By-AI-Badge-white.svg`;
        return (
            <footer>
                {
                    isHomePage(fileData.filePath || "") ? "" :
                        (
                            <div className="note-end">
                                {/*<a href="https://quartz.jzhao.xyz">🖋 Quartz v{version} ©{year}</a>*/}
                                <a href="https://notbyai.fyi" target="_blank"><img src={noAIBadgePath} title="not-by-ai"/></a>
                            </div>
                        )
                }
                <hr/>
                <ul>
                    <li>
                        <a href="https://obsidian.md" target="_blank" title="obsidian">
                            <iconify-icon icon="skill-icons:obsidian-light" style="font-size: 18px"
                                          height="2em"></iconify-icon>
                        </a>
                    </li>
                    <li>
                        <a href="https://catcodeme.github.io/index.xml" target="_blank" title="rss">
                            <iconify-icon icon="mdi:rss-box" style="color: #ff8a05;font-size: 18px"
                                          height="2em"></iconify-icon>
                        </a>
                    </li>

                    <li>
                        <iconify-icon icon="gg:format-slash" style="color: black;font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>

                    <li>
                        <a href="https://github.com/CatCodeMe" target="_blank" title="github">
                            <iconify-icon icon="openmoji:github" style="font-size: 18px"
                                          height="2em"></iconify-icon>
                        </a>
                    </li>

                    <li>
                        <iconify-icon icon="gg:format-slash" style="color: black;font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>

                    <li>
                        <iconify-icon icon="mdi:creative-commons" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                    <li>
                        <iconify-icon icon="ri:creative-commons-by-line" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                    <li>
                        <iconify-icon icon="tabler:creative-commons-nc" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                    <li>
                        <iconify-icon icon="tabler:creative-commons-nd" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                </ul>
                <hr/>
                <div className="giscus"></div>
            </footer>
        )
    }

    Footer.css = style
    return Footer
}) satisfies QuartzComponentConstructor