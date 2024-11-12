import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/floatingButtons.scss"
import script from "./scripts/floatingButtons.inline"

export interface FloatingButtonsOptions {
  position?: 'left' | 'right'
}

export default ((opts: FloatingButtonsOptions): QuartzComponent => {
  function FloatingButtons({ displayClass }: QuartzComponentProps) {
    const { position = 'right' } = opts
    
    return (
      <div class={`floating-buttons ${displayClass ?? ""}`} data-position={position}>
        <div class="button-group">
          <button 
            class="floating-button" 
            title="回到顶部"
            data-action="scrollTop"
          >
            ⬆️
            <span class="tooltip">回到顶部</span>
          </button>
          <div class="progress-indicator">0%</div>
          <button 
            class="floating-button" 
            title="到达底部"
            data-action="scrollBottom"
          >
            ⬇️
            <span class="tooltip">到达底部</span>
          </button>
        </div>
      </div>
    )
  }

  FloatingButtons.css = style
  FloatingButtons.afterDOMLoaded = script
  return FloatingButtons
}) satisfies QuartzComponentConstructor