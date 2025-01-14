import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import readingModeScript from "./scripts/readingMode.inline"
import readingModeStyle from "./styles/readingModeToggle.scss"

export default (() => {
  function SidebarNav(props: QuartzComponentProps) {
    return (
      <div class="sidebar-nav desktop-only">
        <div class="nav-buttons">
          <a href="/" class="nav-button" data-tooltip="首页">
            <i class="nav-icon">🏠</i>
            <span class="nav-text">Home</span>
          </a>
          <a href="/Archive" class="nav-button" data-tooltip="归档">
            <i class="nav-icon">📚</i>
            <span class="nav-text">Archive</span>
          </a>
          <a href="/tags" class="nav-button" data-tooltip="标签">
            <i class="nav-icon">🏷️</i>
            <span class="nav-text">Topics</span>
          </a>
          {/*<a href="/about" class="nav-button" data-tooltip="关于">*/}
          {/*  <i class="nav-icon">ℹ️</i>*/}
          {/*  <span class="nav-text">关于</span>*/}
          {/*</a>*/}
          <button 
            class="nav-button reading-mode-button reading-mode-toggle" 
            data-tooltip="阅读模式"
            title="阅读模式"
            aria-label="阅读模式"
          >
            <i class="nav-icon">📖</i>
            <span class="nav-text">Reading Mode</span>
            <div class="kbd-container">
              <kbd class="retro-key">⌘</kbd>
              <kbd class="retro-key">E</kbd>
            </div>
          </button>
        </div>
      </div>
    )
  }

  SidebarNav.beforeDOMLoaded = readingModeScript
  SidebarNav.css = readingModeStyle

  return SidebarNav
}) satisfies QuartzComponentConstructor 