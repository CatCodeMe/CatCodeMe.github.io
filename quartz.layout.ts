import {PageLayout, SharedLayout} from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
    head: Component.Head(),
    header: [],
    afterBody: [],
    footer: Component.Footer(),
}

// 创建条件渲染组件
const ConditionalWrapper = (component: any): any => {
    const originalComponent = component()
    const Wrapper: any = (props: any) => {
        if (props.fileData.frontmatter?.banner) {
            return null
        }
        return originalComponent(props)
    }
    Wrapper.css = originalComponent.css
    Wrapper.beforeDOMLoaded = originalComponent.beforeDOMLoaded
    Wrapper.afterDOMLoaded = originalComponent.afterDOMLoaded
    return Wrapper
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
    beforeBody: [
        // Component.Banner(),
        // ConditionalWrapper(Component.Breadcrumbs),
        // ConditionalWrapper(Component.ArticleTitle),
        // ConditionalWrapper(Component.ContentMeta),
        // ConditionalWrapper(Component.TagList),

        Component.Breadcrumbs(),
        Component.ArticleTitle(),
        Component.ContentMeta(),
    ],
    left: [
        Component.PageTitle(),
        Component.MobileOnly(Component.Spacer()),
        Component.Search(),
        Component.DesktopOnly(Component.SidebarNav()),
        // Component.DesktopOnly(Component.RecentNotes({
        //     showTags: false,
        //     linkToMore: "/Archive",
        //     limit: 5,
        //     filter: (f) => !f.filePath?.includes("/Archive")
        // })),
        Component.DesktopOnly(Component.Explorer({
            folderClickBehavior: 'collapse',
        })),
        Component.DesktopOnly(Component.FloatingButtons({
            position: 'right',
        })),
        // Component.TagList(),
    ],
    right: [
        Component.DesktopOnly(Component.Graph({
            localGraph: {
                showTags: false
            },
            globalGraph: {
                showTags: false
            }
        })),
        Component.DesktopOnly(Component.TableOfContents()),
    ],
    afterBody: [
        Component.PageNavigation(),
        Component.Backlinks(),
        Component.Comments({
        }),
    ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
    beforeBody: [
        Component.Banner(),
        ConditionalWrapper(Component.Breadcrumbs),
        ConditionalWrapper(Component.ArticleTitle),
        ConditionalWrapper(Component.ContentMeta),
    ],
    left: [
        Component.PageTitle(),
        Component.MobileOnly(Component.Spacer()),
        Component.Search(),
        Component.DesktopOnly(Component.SidebarNav()),
        Component.DesktopOnly(Component.Explorer({
            folderClickBehavior: 'collapse',
        })),
        // Component.DesktopOnly(Component.RecentNotes({
        //     showTags: false,
        //     linkToMore: "/Archive",
        //     limit: 5,
        //     filter: (f) => !f.filePath?.includes("/Archive")
        // })),
        Component.DesktopOnly(Component.FloatingButtons({
            position: 'right'
        })),
    ],
    right: [
        Component.DesktopOnly(Component.Graph({
            localGraph: {
                showTags: false
            },
            globalGraph: {
                showTags: false
            }
        }))
    ],
    afterBody: [
        Component.PageNavigation(),
    ],
}
