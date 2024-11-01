import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/footer.scss"
import {version} from "../../package.json"

interface Options {
    links: Record<string, string>
}

export default ((opts?: Options) => {
    const Footer: QuartzComponent = ({fileData}: QuartzComponentProps) => {
        const year = new Date().getFullYear();
        const noAIBadgePath = `/static/Written-By-Human-Not-By-AI-Badge-white.svg`;
        return (
            <footer>
                <p style="text-align:center;opacity:0.7;">───✱*.｡:｡✱*.:｡✧*.｡✰*.: Published By Quartz {version} ©{year} :.✰*｡.*✧｡:.*✱｡:｡.*✱───</p>
                <div className="giscus"></div>
            </footer>
        )
    }

    Footer.css = style
    return Footer
}) satisfies QuartzComponentConstructor