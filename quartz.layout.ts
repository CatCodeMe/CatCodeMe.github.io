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
    Component.Banner(),
    ConditionalWrapper(Component.Breadcrumbs),
    ConditionalWrapper(Component.ArticleTitle),
    ConditionalWrapper(Component.ContentMeta),
    ConditionalWrapper(Component.TagList),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.Explorer()),
    Component.FloatingButtons({
      position: 'right',
      buttons: [
        { icon: '⬆️', title: 'Scroll to Top', action: 'scrollTop' },
        { icon: '⬇️', title: 'Scroll to Bottom', action: 'scrollBottom' },
      ]
    }),
    Component.DesktopOnly(Component.PinNotes({showTags: false})),

    // Component.DesktopOnly(Component.Carousel({
    //   images: [
    //     {
    //       src: "/static/img/site.svg",
    //       type: "svg",
    //       clickable: false  // SVG 中的链接可点击
    //     },
    //     {
    //       src: "/static/img/outlink.svg",
    //       type: "svg",
    //       clickable: true  // SVG 中的链接可点击
    //     },
    //   ]
    // })),
  ],
  right: [
    Component.DesktopOnly(Component.ReadingModeToggle()),
    Component.DesktopOnly(Component.Graph()),
    // Component.DesktopOnly(Component.PinNotes({showTags: false})),
    Component.DesktopOnly(Component.TableOfContents()),
    
  ],
  afterBody: [
    Component.Comments(),
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
    Component.Search(),
    Component.DesktopOnly(Component.Explorer()),
    Component.FloatingButtons({
      position: 'right',
      buttons: [
        { icon: '⬆️', title: 'Scroll to Top', action: 'scrollTop' },
        { icon: '⬇️', title: 'Scroll to Bottom', action: 'scrollBottom' },
      ]
    }),
    Component.DesktopOnly(Component.Graph()),
  ],
  right: [
    Component.ReadingModeToggle(),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
}
