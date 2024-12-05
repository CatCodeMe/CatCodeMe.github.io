import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/floatingButtons.scss"
import script from "./scripts/floatingButtons.inline.ts"
import {classNames} from "../util/lang"

interface FloatingButtonsOptions {
  position?: 'left' | 'right'
}

export default ((opts?: FloatingButtonsOptions) => {
  function FloatingButtons({ displayClass }: QuartzComponentProps) {
    const position = opts?.position || 'right'
    
    return (
      <div class={classNames(displayClass, "floating-buttons", `floating-${position}`)}>
        <div class="button-group">
          <button
            class="floating-button"
            title="回到顶部"
            data-action="scrollTop"
          >
            <span class="floating-button-tooltip">回到顶部</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <button
            class="floating-button"
            title="滚动到底部"
            data-action="scrollBottom"
          >
            <span class="floating-button-tooltip">滚动到底部</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button
            class="floating-button"
            title="全局图谱"
            data-action="graph"
          >
            <span class="floating-button-tooltip">全局图谱 ⌘</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11.983 21.462q-.978 0-1.664-.69t-.685-1.676q0-.84.534-1.49t1.332-.816v-2.478q-.39-.062-.717-.257t-.566-.491l-2.094 1.252q.064.173.095.363q.032.19.032.379q0 .985-.702 1.675t-1.68.69t-1.664-.689t-.685-1.673t.684-1.676t1.662-.693q.526 0 .983.207t.78.557l2.09-1.246q-.045-.164-.077-.347t-.032-.368q0-.183.032-.36t.095-.358l-2.088-1.213q-.323.369-.786.576q-.464.206-.997.206q-.977 0-1.662-.689T3.52 8.484t.685-1.676t1.664-.692t1.68.69t.702 1.675q0 .188-.022.377q-.022.188-.086.352l2.094 1.207q.239-.276.556-.469t.708-.254V7.196q-.798-.165-1.332-.818q-.533-.653-.533-1.493q0-.986.685-1.676t1.663-.69t1.68.69t.703 1.676q0 .84-.534 1.493t-1.332.818v2.518q.371.08.686.266q.314.186.553.462l2.138-1.219q-.063-.173-.095-.363t-.032-.38q0-.985.685-1.675t1.664-.69t1.68.69t.702 1.672t-.702 1.677t-1.683.692q-.518 0-.957-.206q-.439-.207-.762-.557l-2.144 1.219q.063.164.085.34q.023.175.023.358t-.032.352t-.076.333l2.144 1.27q.323-.35.762-.556q.44-.207.957-.207q.981 0 1.683.69q.702.688.702 1.672q0 .985-.702 1.677t-1.68.692t-1.664-.69t-.685-1.675q0-.198.032-.379t.095-.363l-2.12-1.252q-.238.296-.552.478q-.314.183-.705.264v2.485q.798.165 1.332.815t.533 1.49q0 .986-.702 1.676t-1.68.69m.007-1q.57 0 .972-.393t.403-.972q0-.58-.398-.973t-.986-.393q-.56 0-.953.403q-.393.402-.393.962t.393.963t.963.402m-6.116-3.538q.57 0 .972-.392q.403-.392.403-.972t-.398-.973t-.986-.394q-.56 0-.953.403q-.394.403-.394.963t.393.962q.394.403.963.403m12.23 0q.57 0 .973-.392t.403-.972t-.398-.973t-.987-.394q-.56 0-.953.403t-.393.963t.393.962t.963.403m-6.116-3.558q.57 0 .972-.392q.403-.392.403-.972t-.398-.973t-.986-.394q-.56 0-.953.403q-.394.403-.394.963t.394.962t.962.403M5.875 9.846q.57 0 .972-.392q.403-.392.403-.972t-.398-.973q-.398-.394-.986-.394q-.56 0-.953.403q-.394.403-.394.963t.393.962q.394.403.963.403m12.23 0q.57 0 .973-.392t.403-.972t-.398-.973q-.398-.394-.987-.394q-.56 0-.953.403t-.393.963t.393.962t.963.403M11.99 6.25q.57 0 .973-.392t.403-.972t-.399-.973q-.398-.394-.986-.394q-.56 0-.953.403t-.393.963t.393.962t.963.403" />
            </svg>
          </button>
          <button
            class="floating-button"
            title="快捷键"
            data-action="shortcuts"
          >
            <span class="floating-button-tooltip">快捷键</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20">
              <path fill="currentColor" d="M5 12.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m6.502-4.495a.752.752 0 1 0 0-1.505a.752.752 0 0 0 0 1.505m3.753-.753a.752.752 0 1 1-1.505 0a.752.752 0 0 1 1.505 0m-9.753.753a.752.752 0 1 0 0-1.505a.752.752 0 0 0 0 1.505M7.75 9.752a.752.752 0 1 1-1.505 0a.752.752 0 0 1 1.505 0m2.252.753a.752.752 0 1 0 0-1.505a.752.752 0 0 0 0 1.505m3.757-.753a.752.752 0 1 1-1.504 0a.752.752 0 0 1 1.504 0M8.503 8.005a.752.752 0 1 0 0-1.505a.752.752 0 0 0 0 1.505M2 5.5A1.5 1.5 0 0 1 3.5 4h13A1.5 1.5 0 0 1 18 5.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 13.5zM3.5 5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5z" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  FloatingButtons.css = style
  FloatingButtons.afterDOMLoaded = script
  return FloatingButtons
}) satisfies QuartzComponentConstructor