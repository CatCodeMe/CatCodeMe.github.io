import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  return (
    <div 
      class="not-found-page"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        color: "white",
      }}
    >
      {/* Background image with overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/static/404.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.8)",
        zIndex: -2,
      }} />
      
      {/* Dark overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: -1,
      }} />

      {/* Content */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          padding: "2.5rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          minWidth: "300px",
        }}>
          <p style={{ fontSize: "1.5rem", margin: "0 0 1.5rem 0", color: "white" }}>{i18n(cfg.locale).pages.error.notFound}</p>
          <p id="countdown" style={{ fontSize: "1.2rem", margin: "0 0 1.5rem 0", opacity: 0.9, color: "white" }}>
            10 秒后自动返回首页
          </p>
          <a 
            href={baseDir}
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "1.1rem",
              padding: "0.5rem 1.5rem",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "2rem",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            {i18n(cfg.locale).pages.error.home}
          </a>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var countdown = 10;
            var countdownEl = document.getElementById('countdown');
            var hasHistory = window.history.length > 1;
            var targetText = hasHistory ? "上一页" : "首页";
            
            function updateCountdown() {
              if (countdownEl) {
                countdownEl.textContent = countdown + ' 秒后自动返回' + targetText;
              }
              
              if (countdown <= 0) {
                if (hasHistory) {
                  window.history.back();
                } else {
                  window.location.href = '${baseDir}';
                }
                return;
              }
              
              countdown--;
              setTimeout(updateCountdown, 1000);
            }
            
            setTimeout(updateCountdown, 1000);
          })();
        `
      }} />
    </div>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
