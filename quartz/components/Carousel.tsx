import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/carousel.scss"
import script from "./scripts/carousel.inline"

export interface CarouselOptions {
  images: string[]
  interval?: number // 添加可选的 interval 配置
}

export default ((opts: CarouselOptions): QuartzComponent => {
  function Carousel({ displayClass,cfg }: QuartzComponentProps) {
    const { images, interval = 5000 } = opts // 设置默认值为 5000ms
    if (!images || images.length === 0) return null

    const baseURL = cfg.baseUrl ?? "";
    return (
        <div class={`carousel ${displayClass ?? ""}`}>
          <div class="carousel-container" data-carousel data-interval={interval}>
            {/* 其余部分保持不变 */}
            <div class="carousel-track">
              {images.map((image, index) => (
                  <div class="carousel-slide" data-slide>
                    <img
                        src={baseURL + image}
                        alt={`Slide ${index + 1}`}
                        loading="lazy"
                    />
                  </div>
              ))}
            </div>

            <button class="carousel-button prev" data-carousel-button="prev">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button class="carousel-button next" data-carousel-button="next">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        </div>
    )
  }

  Carousel.css = style
  Carousel.afterDOMLoaded = script
  return Carousel
}) satisfies QuartzComponentConstructor