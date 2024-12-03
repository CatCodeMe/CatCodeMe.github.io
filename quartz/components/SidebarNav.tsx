import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import readingModeScript from "./scripts/readingMode.inline"
import readingModeStyle from "./styles/readingModeToggle.scss"

export default (() => {
  function SidebarNav(props: QuartzComponentProps) {
    // 更准确地检测Mac系统
    const isMac = typeof navigator !== 'undefined' && 
      (/macintosh|macintel/i.test(navigator.userAgent) || 
       /Mac|iPod|iPhone|iPad/.test(navigator.platform))
    
    // Mac系统统一显示⌘符号
    const modifierKey = isMac ? '⌘' : 'Ctrl'

    return (
      <div class="sidebar-nav">
        <div class="nav-buttons">
          <a href="/" class="nav-button" data-tooltip="首页">
            <i class="nav-icon">🏠</i>
            <span class="nav-text">首页</span>
          </a>
          <a href="/archive" class="nav-button" data-tooltip="归档">
            <i class="nav-icon">📚</i>
            <span class="nav-text">归档</span>
          </a>
          <a href="/tags" class="nav-button" data-tooltip="标签">
            <i class="nav-icon">🏷️</i>
            <span class="nav-text">标签</span>
          </a>
          <a href="/about" class="nav-button" data-tooltip="关于">
            <i class="nav-icon">ℹ️</i>
            <span class="nav-text">关于</span>
          </a>
          <button 
            class="nav-button reading-mode-button reading-mode-toggle" 
            data-tooltip="阅读模式"
            title={`阅读模式 (${modifierKey}+E)`}
            aria-label="阅读模式"
          >
            <i class="nav-icon">📖</i>
            <span class="nav-text">阅读模式</span>
            <div className="kbd-container">
              <kbd className="retro-key">{modifierKey}</kbd>
              <kbd className="retro-key">E</kbd>
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