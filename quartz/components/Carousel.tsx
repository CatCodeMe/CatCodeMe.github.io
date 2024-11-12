import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/carousel.scss"
import script from "./scripts/carousel.inline"

// 定义轮播图配置接口
export interface CarouselOptions {
  images: Array<{
    src: string  // 图片路径
    type: 'svg' | 'image'  // 图片类型
    clickable?: boolean  // 是否可点击，默认 false
  }>
  interval?: number  // 轮播间隔时间
}

export default ((opts: CarouselOptions): QuartzComponent => {
  function Carousel({ displayClass, cfg }: QuartzComponentProps) {
    const { images, interval = 5000 } = opts
    if (!images || images.length === 0) return null
    const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--local')

    const fullBaseUrl = isDev ? `http://${cfg.baseUrl}` : `https://${cfg.baseUrl}`
    return (
      <div class={`carousel ${displayClass ?? ""}`}>
        <div class="carousel-container" data-carousel data-interval={interval}>
          <div class="carousel-track">
            {images.map((image, index) => (
              <div class="carousel-slide" data-slide>
                {/* 根据图片类型和是否可点击渲染不同的结构 */}
                {image.type === 'svg' ? (
                  <object
                    class={`svg-content ${image.clickable ? 'clickable' : ''}`}
                    type="image/svg+xml"
                    data={fullBaseUrl + image.src}
                  >
                    <img src={fullBaseUrl + image.src} alt={`Slide ${index + 1}`} />
                  </object>
                ) : (
                  <img
                    class={image.clickable ? 'clickable' : ''}
                    src={fullBaseUrl + image.src}
                    alt={`Slide ${index + 1}`}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  Carousel.css = style
  Carousel.afterDOMLoaded = script
  return Carousel
}) satisfies QuartzComponentConstructor