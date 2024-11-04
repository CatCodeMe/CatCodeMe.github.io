import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"

const OutLink: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const styles = {
    linkContainer: {
      width: '90%',
      // margin: '0 auto',
      // border: 'solid 1px var(--dark)',
      // padding: "0.5rem"
    },
    flex: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      // border: 'hide 1px var(--dark)'
    },
  };

  const noAIBadgePath = `/static/Written-By-Human-Not-By-AI-Badge-white.svg`;

  return (
      <div class="linkContainer" style={styles.linkContainer}>
        <div class="flex" style={styles.flex}>
          {cfg.outLink?.map(({name, iconifyName, url, style}) => (
              <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={name}
                  style={style}
              >
                <iconify-icon icon={iconifyName} style="font-size: 18px"
                              height="2em"></iconify-icon>
              </a>
          ))}
        </div>
        <div>
          <a href="https://notbyai.fyi" target="_blank"><img src={noAIBadgePath}
                                                             title="not-by-ai"/></a>
        </div>
      </div>
  );
}

export default (() => OutLink) satisfies QuartzComponentConstructor
