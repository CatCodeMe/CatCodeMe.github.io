import {PageLayout, SharedLayout} from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer(),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    // Component.DesktopOnly(Component.Graph()),

    Component.DesktopOnly(Component.Explorer()),

    Component.DesktopOnly(Component.OutLink()),

  ],
  right: [
    Component.DesktopOnly(Component.PinNotes({showTags: false})),
    // Component.DesktopOnly(Component.Graph()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.Carousel({
      images: [
        {
          src: "/static/img/site.svg",
          type: "svg",
          clickable: false  // SVG 中的链接可点击
        },
        {
          src: "/static/img/outlink.svg",
          type: "svg",
          clickable: true  // SVG 中的链接可点击
        },
        {
          src: "/static/img/s1.png",
          type: "image",
        },
      ],
      interval: 3000
    })),
  ],
  afterBody: [
    Component.Comments(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    // Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.DesktopOnly(Component.PinNotes({showTags: false})),
    Component.DesktopOnly(Component.Carousel({
      images: [
        "/static/img/s1.png",
        "/static/img/s2.png",
        "/static/img/s3.png",
      ],
      interval: 3000
    })),
  ],
  afterBody: [],
}
