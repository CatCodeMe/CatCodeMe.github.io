import micromorph from "micromorph"
import {FullSlug, getFullSlug, normalizeRelativeURLs, RelativeURL} from "../../util/path"

// adapted from `micromorph`
// https://github.com/natemoo-re/micromorph
const NODE_TYPE_ELEMENT = 1
let announcer = document.createElement("route-announcer")
const isElement = (target: EventTarget | null): target is Element =>
  (target as Node)?.nodeType === NODE_TYPE_ELEMENT
const isLocalUrl = (href: string) => {
  try {
    const url = new URL(href)
    if (window.location.origin === url.origin) {
      return true
    }
  } catch (e) {}
  return false
}

const isSamePage = (url: URL): boolean => {
  const sameOrigin = url.origin === window.location.origin
  const samePath = url.pathname === window.location.pathname
  return sameOrigin && samePath
}

const getOpts = ({ target }: Event): { url: URL; scroll?: boolean } | undefined => {
  if (!isElement(target)) return
  if (target.attributes.getNamedItem("target")?.value === "_blank") return
  const a = target.closest("a")
  if (!a) return
  if ("routerIgnore" in a.dataset) return
  const { href } = a
  if (!isLocalUrl(href)) return
  return { url: new URL(href), scroll: "routerNoscroll" in a.dataset ? false : undefined }
}

function notifyNav(url: FullSlug) {
  const event: CustomEventMap["nav"] = new CustomEvent("nav", { detail: { url } })
  document.dispatchEvent(event)
}

const cleanupFns: Set<(...args: any[]) => void> = new Set()
window.addCleanup = (fn) => cleanupFns.add(fn)

let p: DOMParser
async function navigate(url: URL, isBack: boolean = false) {
  // Add loading class at the start of navigation
  document.body.classList.add('loading')
  
  p = p || new DOMParser()
  const contents = await fetch(`${url}`)
    .then((res) => {
      const contentType = res.headers.get("content-type")
      if (contentType?.startsWith("text/html")) {
        return res.text()
      } else {
        window.location.assign(url)
      }
    })
    .catch((error) => {
      window.location.assign(url)
    })

  if (!contents) return

  // cleanup old
  cleanupFns.forEach((fn) => fn())
  cleanupFns.clear()

  const html = p.parseFromString(contents, "text/html")
  normalizeRelativeURLs(html, url)

  // 保存需要忽略的元素的选择器和属性
  const ignoredSelectors = Array.from(document.querySelectorAll('[data-router-ignore]')).map(el => {
    if (el instanceof HTMLLinkElement) {
      return {
        selector: `link[rel="stylesheet"][data-router-ignore]`,
        tagName: el.tagName.toLowerCase()
      }
    }
    if (el instanceof HTMLScriptElement) {
      const type = el.type || 'application/javascript'
      return {
        selector: `script[type="${type}"][data-router-ignore]`,
        tagName: el.tagName.toLowerCase(),
        type: type
      }
    }
    return null
  }).filter(Boolean)

  let title = html.querySelector("title")?.textContent
  if (title) {
    document.title = title
  } else {
    const h1 = document.querySelector("h1")
    title = h1?.innerText ?? h1?.textContent ?? url.pathname
  }
  if (announcer.textContent !== title) {
    announcer.textContent = title
  }
  announcer.dataset.persist = ""
  html.body.appendChild(announcer)

  // morph body
  micromorph(document.body, html.body)

  // 重新初始化组件
  const reinitComponents = () => {
    // 触发主题变更事件，以确保颜色和主题相关的组件能正确初始化
    const currentTheme = document.documentElement.getAttribute('saved-theme') || 'light'
    const event = new CustomEvent('themechange', {
      detail: {
        theme: currentTheme,
      },
    })
    document.dispatchEvent(event)
  }

  // 从新页面获取并更新忽略的元素
  ignoredSelectors.forEach(({selector, tagName, type}) => {
    const oldElement = document.querySelector(selector)
    const newElement = html.querySelector(selector) || html.querySelector(`script[data-router-ignore]`)

    if (oldElement && newElement) {
      // 复制新元素的属性到旧元素
      if (tagName === 'link') {
        const oldLink = oldElement as HTMLLinkElement
        const newLink = newElement as HTMLLinkElement
        oldLink.href = newLink.href
      } else if (tagName === 'script') {
        const parent = oldElement.parentNode
        if (parent) {
          // 移除旧的脚本
          oldElement.remove()
          // 创建新的脚本元素
          const newScript = document.createElement('script')
          newScript.src = (newElement as HTMLScriptElement).src
          newScript.type = type
          newScript.setAttribute('data-router-ignore', 'true')
          if (newElement.hasAttribute('spa-preserve')) {
            newScript.setAttribute('spa-preserve', '')
          }
          // 插入新的脚本，并在加载完成后重新初始化组件
          newScript.onload = () => {
            console.log('Script loaded:', newScript.src)
            reinitComponents()
          }
          console.log('Adding script:', newScript.src, 'type:', newScript.type)
          parent.appendChild(newScript)
        }
      }
    } else {
      console.log('Not found:', selector, 'in new page')
    }
  })

  // 在 morph 完成后添加动画
  const headerElements = document.querySelectorAll('.page-header, .banner-wrapper')
  const articleElements = document.querySelectorAll('article')

  // 先处理 header 元素
  headerElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.classList.remove('page-transition')
      void element.offsetHeight
      element.classList.add('page-transition')
    }
  })

  // 然后处理文章内容
  articleElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.classList.remove('page-transition')
      void element.offsetHeight
      element.classList.add('page-transition')
    }
  })

  // 移除 loading 类
  setTimeout(() => {
    document.body.classList.remove('loading')
  }, 100)

  // scroll into place and add history
  if (!isBack) {
    if (url.hash) {
      const el = document.getElementById(decodeURIComponent(url.hash.substring(1)))
      el?.scrollIntoView()
    } else {
      window.scrollTo({ top: 0 })
    }
  }

  // now, patch head
  const elementsToRemove = document.head.querySelectorAll(":not([spa-preserve])")
  elementsToRemove.forEach((el) => el.remove())
  const elementsToAdd = html.head.querySelectorAll(":not([spa-preserve])")
  elementsToAdd.forEach((el) => document.head.appendChild(el))

  // delay setting the url until now
  if (!isBack) {
    history.pushState({}, "", url)
  }
  notifyNav(getFullSlug(window))
  delete announcer.dataset.persist
}

window.spaNavigate = navigate

function createRouter() {
  if (typeof window !== "undefined") {
    window.addEventListener("click", async (event) => {
      const { url } = getOpts(event) ?? {}
      // dont hijack behaviour, just let browser act normally
      if (!url || event.ctrlKey || event.metaKey) return
      event.preventDefault()

      if (isSamePage(url) && url.hash) {
        const el = document.getElementById(decodeURIComponent(url.hash.substring(1)))
        el?.scrollIntoView()
        history.pushState({}, "", url)
        return
      }

      try {
        navigate(url, false)
      } catch (e) {
        window.location.assign(url)
      }
    })

    window.addEventListener("popstate", (event) => {
      const { url } = getOpts(event) ?? {}
      if (window.location.hash && window.location.pathname === url?.pathname) return
      try {
        navigate(new URL(window.location.toString()), true)
      } catch (e) {
        window.location.reload()
      }
      return
    })
  }

  return new (class Router {
    go(pathname: RelativeURL) {
      const url = new URL(pathname, window.location.toString())
      return navigate(url, false)
    }

    back() {
      return window.history.back()
    }

    forward() {
      return window.history.forward()
    }
  })()
}

createRouter()
notifyNav(getFullSlug(window))

if (!customElements.get("route-announcer")) {
  const attrs = {
    "aria-live": "assertive",
    "aria-atomic": "true",
    style:
      "position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px",
  }

  customElements.define(
    "route-announcer",
    class RouteAnnouncer extends HTMLElement {
      constructor() {
        super()
      }
      connectedCallback() {
        for (const [key, value] of Object.entries(attrs)) {
          this.setAttribute(key, value)
        }
      }
    },
  )
}
