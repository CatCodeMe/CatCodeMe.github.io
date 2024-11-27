import {QuartzConfig} from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

// 获取当前环境
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--local')
/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "🪴 8Cats & Me",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "zh-CN",
    baseUrl: isDev ? "localhost:8080" : "8cat.life",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "LXGW WenKai Screen",
        body: "LXGW WenKai Screen",
        code: "Fire Code",
      },
      colors: {
        lightMode: {
          light: "#f9f4ee",        // 温暖的米色背景
          lightgray: "#ebe6e0",    // 调整为更温暖的浅灰色
          gray: "#c0b8b0",         // 中性偏暖的灰色
          darkgray: "#5a534d",     // 深灰带一点褐调
          dark: "#8b2e2e",         // 稍微柔和的深红色
          secondary: "#2c5875",     // 更柔和的蓝色
          tertiary: "#8fb5ac",     // 略微提亮的青绿色
          highlight: "#C4D7C472", // 更柔和的高亮色
          textHighlight: "#ffdb4d88", // 温暖的黄色高亮
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false, mermaid: true }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents({maxDepth: 3}),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest", openLinksInNewTab: true }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.HardLineBreaks()
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
