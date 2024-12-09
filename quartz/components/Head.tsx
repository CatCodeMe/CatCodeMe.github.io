import {i18n} from "../i18n"
import {FullSlug, joinSegments, pathToRoot} from "../util/path"
import {CSSResourceToStyleElement, JSResourceToScriptElement} from "../util/resources"
import {googleFontHref} from "../util/theme"
import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import {unescapeHTML} from "../util/escape";

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {

    // Get file description (priority: frontmatter > fileData > default)
    const fdDescription =
      fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title);
    let description = ""
    if (fdDescription) {
      description = unescapeHTML(fdDescription)
    }

    if (fileData.frontmatter?.socialDescription) {
      description = fileData.frontmatter?.socialDescription as string
    } else if (fileData.frontmatter?.description) {
      description = fileData.frontmatter?.description
    }


    const { css, js } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)

    const iconPath = joinSegments(baseDir, "static/favicon.ico");
    const ogImagePath = `https://${cfg.baseUrl}/static/og-image-20241111165404.webp`;
    const ogUrl = `${url}${fileData.filePath?.replace("content/","").replace(".md","")}`;

    return (
        <head>
            <title>{title}</title>
            <meta charSet="utf-8"/>
            {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
                <>
                    <link rel="preconnect" href="https://fonts.googleapis.com"/>
                    <link rel="preconnect" href="https://fonts.gstatic.com"/>
                    <link rel="stylesheet" href={googleFontHref(cfg.theme)}/>
                </>
            )}
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta property="og:title" content={title}/>
            <meta property="og:type" content="article"/>
            <meta property="og:url" content={ogUrl}/>
            <meta property="og:description" content={description}/>
            {cfg.baseUrl && <meta property="og:image" content={ogImagePath}/>}
            <meta property="og:width" content="1200"/>
            <meta property="og:height" content="675"/>
            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:image" content={ogImagePath}/>
            <meta name="twitter:title" content={title}/>
            <meta name="twitter:description" content={description}/>
            <meta name="twitter:creator" content="@hulj13"/>
            <meta name="twitter:site" content="@8cat.life"/>

            <meta name="description" content={description}/>
            <meta name="generator" content="Quartz"/>
            <link rel="icon" href={iconPath}/>
            <link rel="canonical" href={ogUrl}/>
            {cfg.baseUrl && (
              <>
                <link
                  rel="alternate"
                  type="application/rss+xml"
                  title={`${cfg.pageTitle} Feed`}
                  href={`https://${cfg.baseUrl}/index.xml`}
                />
              </>
            )}
            <link rel="stylesheet"
                  href="https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/style.css" spa-preserve/>
            <link rel="stylesheet"
                  href="https://cdn.jsdelivr.net/npm/firacode@6.2.0/distr/fira_code.css" spa-preserve/>
            {css.map((resource) => CSSResourceToStyleElement(resource, true))}
            {js
                .filter((resource) => resource.loadTime === "beforeDOMReady")
                .map((res) => JSResourceToScriptElement(res, true))}
            {/*<script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.0.0/dist/iconify-icon.min.js"></script>*/}
        </head>
    )
  }

    return Head
}) satisfies QuartzComponentConstructor
