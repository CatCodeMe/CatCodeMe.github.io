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
    // Component.DesktopOnly(Component.RecentNotes({showTags: false})),
    Component.DesktopOnly(Component.Explorer()),
    Component.DesktopOnly(Component.OutLink()),
    // Component.Graph(),

  ],
  right: [
    Component.DesktopOnly(Component.PinNotes({showTags: false})),
    Component.DesktopOnly(Component.TableOfContents()),
    // Component.Graph(),
    // Component.Backlinks(),
    Component.DesktopOnly(Component.Carousel({
      images: [
        "/static/img/slogan.png",
        "/static/img/s1.png",
        "/static/img/s2.png",
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
