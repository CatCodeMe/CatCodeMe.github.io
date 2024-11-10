function setupCarousel() {
  const carousels = document.querySelectorAll<HTMLElement>('[data-carousel]')

  carousels.forEach(carousel => {
    const track = carousel.querySelector<HTMLElement>('.carousel-track')
    const slides = Array.from(carousel.querySelectorAll<HTMLElement>('[data-slide]'))
    if (!track || slides.length === 0) return

    const interval = Number(carousel.dataset.interval) || 3000
    const slideCount = slides.length
    let currentPosition = 0
    let isTransitioning = false

    // 使用 linear 效果实现最平滑的过渡
    function updatePosition(animate = true) {
      track.style.transition = animate 
        ? 'transform 0.4s linear' // 使用 linear 效果
        : 'none'
      track.style.transform = `translateX(${currentPosition}%)`
    }

    // 切换到下一张
    function moveNext() {
      if (isTransitioning) return
      isTransitioning = true
      
      currentPosition -= 100
      if (currentPosition < -100 * (slideCount - 1)) {
        setTimeout(() => {
          currentPosition = 0
          updatePosition(false)
          isTransitioning = false
        }, 800)
      }
      updatePosition(true)
    }

    // 自动播放控制
    let autoplayTimer: number
    function startAutoplay() {
      stopAutoplay()
      autoplayTimer = window.setInterval(() => {
        moveNext()
      }, interval)
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = 0
      }
    }

    // 过渡结束事件
    track.addEventListener('transitionend', () => {
      isTransitioning = false
    })

    // 鼠标悬停控制
    carousel.addEventListener('mouseenter', stopAutoplay)
    carousel.addEventListener('mouseleave', startAutoplay)

    // 初始化
    updatePosition(false)
    startAutoplay()
  })
}

document.addEventListener('nav', () => setTimeout(setupCarousel, 0))
document.addEventListener('DOMContentLoaded', setupCarousel)

document.addEventListener('nav', () => setTimeout(setupCarousel, 0))
document.addEventListener('DOMContentLoaded', setupCarousel)

// 页面加载和导航时初始化
document.addEventListener('nav', () => setTimeout(setupCarousel, 0))
document.addEventListener('DOMContentLoaded', setupCarousel)