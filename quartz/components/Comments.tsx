import {QuartzComponentConstructor} from "./types"

export default (() => {
  function Footer() {
    return (
        <script src="https://giscus.app/client.js"
                data-repo="catcodeme/blog_from_obsidian"
                data-repo-id="R_kgDOLVYtRw"
                data-category="Announcements"
                data-category-id="DIC_kwDOLVYtR84Cd1tB"
                data-mapping="pathname"
                data-strict="0"
                data-reactions-enabled="1"
                data-emit-metadata="0"
                data-input-position="top"
                data-theme="light_high_contrast"
                data-lang="en"
                data-loading="lazy"
                crossOrigin="anonymous"
                async>
        </script>
    )
  }

  return Footer
}) satisfies QuartzComponentConstructor
