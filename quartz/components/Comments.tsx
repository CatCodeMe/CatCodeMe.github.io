import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"

export default ((opts: Options) => {
    const Comments: QuartzComponent = ({displayClass, fileData, cfg}: QuartzComponentProps) => {
        // 默认关闭评论
        const disableComment: boolean =
            !fileData.frontmatter?.comments || fileData.frontmatter?.comments === "false"
        if (disableComment) {
            return <></>
        }

        return (
            <script src="https://giscus.app/client.js"
                    data-repo="catcodeme/blog_from_obsidian"
                    data-repo-id="R_kgDOLVYtRw"
                    data-category="Announcements"
                    data-category-id="DIC_kwDOLVYtR84Cd1tB"
                    data-mapping="pathname"
                    data-strict="0"
                    data-reactions-enabled="0"
                    data-emit-metadata="0"
                    data-input-position="top"
                    data-theme="light"
                    data-lang="en"
                    data-loading="lazy"
                    crossOrigin="anonymous"
                    async>
            </script>
        )
    }
    return Comments
}) satisfies QuartzComponentConstructor<Options>
