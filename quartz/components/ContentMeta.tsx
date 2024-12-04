import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import readingTime from "reading-time"
import {classNames} from "../util/lang"
import type {JSX} from "preact"

const TimeMeta = ({value}: { value: Date }) => {
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

export default ((opts?: Partial<ContentMetaOptions>) => {
    // Merge options with defaults
    const options: ContentMetaOptions = {...defaultOptions, ...opts}

    function ContentMetadata({cfg, fileData, displayClass}: QuartzComponentProps) {
        const text = fileData.text
        const fileRelativePath = fileData.filePath?.replace("content/", "");

        if (fileRelativePath === "index.md") {
            return null
        }

        if (text) {
            const segments: JSX.Element[] = []

            if (fileData.dates) {
                if (fileData.dates.created) {
                    segments.push(
                        <span>
              🌱 <TimeMeta value={fileData.dates.created}/>
            </span>,
                    )
                }
                if (fileData.dates.modified) {
                    segments.push(
                        <span>
              🌴 <TimeMeta value={fileData.dates.modified}/>
            </span>,
                    )
                }
            }

            // Display reading time if enabled
            if (options.showReadingTime) {
                const {minutes, words: _words} = readingTime(text)
                segments.push(<span>⌛️ {Math.ceil(minutes)}min, {_words}words</span>)
            }

            segments.push(
                <a
                    href={`https://github.com/CatCodeMe/blog_from_obsidian/commits/main/${fileRelativePath}`}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    class="external"
                >
                    Git-Blame
                </a>,
            )

            return (
                <p class={classNames(displayClass, "content-meta")}>
                    {segments.map((meta, idx) => (
                        <>
                            {meta}
                            {idx < segments.length - 1 ? <br/> : null}
                        </>
                    ))}
                </p>
            )
        } else {
            return null
        }
    }

    ContentMetadata.css = `
  .content-meta {
    display:flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10;

    margin-top: 0;
    color: var(--gray);
  }
  `
    return ContentMetadata
}) satisfies QuartzComponentConstructor
