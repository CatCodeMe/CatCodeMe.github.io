import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import readingTime from "reading-time"
import {classNames} from "../util/lang"
import style from "./styles/contentMeta.scss"

const TimeMeta = ({ value }: { value: Date }) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    const hours = String(value.getHours()).padStart(2, '0')
    const minutes = String(value.getMinutes()).padStart(2, '0')
    return <>{`${year}/${month}/${day} ${hours}:${minutes}`}</>
}

interface ContentMetaOptions {
    /**
     * Whether to display reading time
     */
    showReadingTime: boolean
}

const defaultOptions: ContentMetaOptions = {
    showReadingTime: true,
}

function ContentMetadataComponent({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text
    const fileRelativePath = fileData.filePath?.replace("content/", "")
    const description = fileData.frontmatter?.description || fileData.frontmatter?.desc

    if (fileRelativePath === "index.md") {
        return null
    }

    if (text) {
        const { minutes, words: _words } = readingTime(text)

        return (
            <div class={classNames(displayClass, "content-meta-wrapper")}>
                <div class="meta-container">
                    <div class="meta-description">
                        <div class="description-content">
                            <h4>About this article</h4>
                            {description ? (
                                <p class="description-text">{description}</p>
                            ) : (
                                <p class="description-placeholder">No description available</p>
                            )}
                        </div>
                    </div>

                    <div class="meta-stats">
                        <div class="stat-item">
                            <div class="stat-label">Created</div>
                            <div class="stat-value">
                                {fileData.dates?.created ? (
                                    <TimeMeta value={fileData.dates.created} />
                                ) : "—"}
                            </div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-label">Updated</div>
                            <div class="stat-value">
                                {fileData.dates?.modified ? (
                                    <TimeMeta value={fileData.dates.modified} />
                                ) : "—"}
                            </div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-label">Reading time</div>
                            <div class="stat-value reading-time">
                                <div>{Math.ceil(minutes)} min</div>
                                <div>{_words} words</div>
                            </div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-label">History</div>
                            <div class="stat-value">
                                <a
                                    href={`https://github.com/CatCodeMe/blog_from_obsidian/commits/main/${fileRelativePath}`}
                                    target="_blank"
                                    rel="noreferrer noopener nofollow"
                                    class="history-link external"
                                >
                                    View changes
                                </a>
                            </div>
                        </div>
                    </div>

                    {/*{fileData.frontmatter?.tags && fileData.frontmatter.tags.length > 0 && (*/}
                    {/*    <div class="meta-tags">*/}
                    {/*        <div class="stat-label">Tags</div>*/}
                    {/*        <ul class="tags">*/}
                    {/*            {fileData.frontmatter.tags.map((tag) => {*/}
                    {/*                const linkDest = pathToRoot(fileData.slug!) + `/tags/${slugTag(tag)}`*/}
                    {/*                return (*/}
                    {/*                    <li>*/}
                    {/*                        <a href={linkDest} class="internal tag-link">*/}
                    {/*                            {tag}*/}
                    {/*                        </a>*/}
                    {/*                    </li>*/}
                    {/*                )*/}
                    {/*            })}*/}
                    {/*        </ul>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>
        )
    } else {
        return null
    }
}

export default (() => {
    const ContentMetadata = (props: QuartzComponentProps) => {
        return <ContentMetadataComponent {...props} />
    }

    ContentMetadata.css = style
    return ContentMetadata
}) satisfies QuartzComponentConstructor
