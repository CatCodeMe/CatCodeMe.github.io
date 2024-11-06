let cleanupFunctions: (() => void)[] = []

function setupCarousel() {
  // 清理之前的轮播图实例
  cleanupFunctions.forEach(cleanup => cleanup())
  cleanupFunctions = []

  const carousels = document.querySelectorAll<HTMLElement>('[data-carousel]')

  carousels.forEach(carousel => {
    const track = carousel.querySelector<HTMLElement>('.carousel-track')
    const slides = Array.from(carousel.querySelectorAll<HTMLElement>('[data-slide]'))
    if (!track || slides.length === 0) return

    const interval = Number(carousel.dataset.interval) || 5000
    let currentIndex = 0
    let autoplayTimer: number

    // 克隆第一张图片并添加到末尾，用于实现无缝循环
    const firstSlideClone = slides[0].cloneNode(true) as HTMLElement
    track.appendChild(firstSlideClone)
    const totalSlides = slides.length + 1

    function updateSlidePosition(animate = true) {
      if (animate) {
        if ("style" in track) {
          track.style.transition = 'transform 0.5s ease-in-out'
        }
      } else {
        if ("style" in track) {
          track.style.transition = 'none'
        }
      }
      if ("style" in track) {
        track.style.transform = `translateX(-${currentIndex * 100}%)`
      }
    }

    function moveToSlide(index: number) {
      currentIndex = index

      // 如果到达克隆的幻灯片（最后一张）
      if (currentIndex === totalSlides - 1) {
        updateSlidePosition(true) // 先展示过渡动画

        // 动画结束后立即跳回第一张
        setTimeout(() => {
          currentIndex = 0
          updateSlidePosition(false)
        }, 500)
      } else {
        updateSlidePosition(true)
      }
    }

    function nextSlide() {
      moveToSlide(currentIndex + 1)
    }

    function prevSlide() {
      if (currentIndex === 0) {
        currentIndex = totalSlides - 1
        updateSlidePosition(false)
        setTimeout(() => {
          currentIndex--
          updateSlidePosition(true)
        }, 50)
      } else {
        moveToSlide(currentIndex - 1)
      }
    }

    function startAutoplay() {
      stopAutoplay()
      autoplayTimer = window.setInterval(nextSlide, interval)
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
      }
    }

    // 按钮事件
    carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-button]').forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.carouselButton === 'next') {
          nextSlide()
        } else {
          prevSlide()
        }
      })
    })

    // 处理过渡结束事件
    track.addEventListener('transitionend', () => {
      if (currentIndex === totalSlides - 1) {
        currentIndex = 0
        updateSlidePosition(false)
      }
    })

    // 鼠标悬停时暂停自动播放
    carousel.addEventListener('mouseenter', stopAutoplay)
    carousel.addEventListener('mouseleave', startAutoplay)

    // 初始化
    updateSlidePosition(false)
    startAutoplay()

    // 收集清理函数
    const cleanup = () => {
      stopAutoplay()
      // 移除所有事件监听器
      carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-button]')
          .forEach(button => {
            button.removeEventListener('click', () => {
              if (button.dataset.carouselButton === 'next') {
                nextSlide()
              } else {
                prevSlide()
              }
            })
          })
      track.removeEventListener('transitionend', () => {
        if (currentIndex === totalSlides - 1) {
          currentIndex = 0
          updateSlidePosition(false)
        }
      })
      carousel.removeEventListener('mouseenter', stopAutoplay)
      carousel.removeEventListener('mouseleave', startAutoplay)
    }

    cleanupFunctions.push(cleanup)

    cleanupFunctions.push(cleanup)
  })
}

// 监听页面切换事件
document.addEventListener('nav', () => {
  // 等待 DOM 更新完成
  setTimeout(setupCarousel, 0)
})

// 初始加载
document.addEventListener('DOMContentLoaded', setupCarousel)