import {QuartzTransformerPlugin} from "../types"
import rehypeExpressiveCode, {
    ExpressiveCodePlugin,
    PluginFramesOptions,
    RehypeExpressiveCodeOptions,
    ThemeObjectOrShikiThemeName
} from "rehype-expressive-code"
import {pluginLineNumbers} from '@expressive-code/plugin-line-numbers'
import {pluginCollapsibleSections} from '@expressive-code/plugin-collapsible-sections'

interface Options extends Partial<RehypeExpressiveCodeOptions> {
    themes?: ThemeObjectOrShikiThemeName[]
    plugins?: ExpressiveCodePlugin[]
    styleOverrides?: {
    }
    frames?: boolean | PluginFramesOptions
    textMarkers?: boolean
    minSyntaxHighlightingColorContrast?: number
    useThemedScrollbars?: boolean
    useThemedSelectionColors?: boolean
    useDarkModeMediaQuery?: boolean
}

const defaultOptions: Options = {
    themes: [
      // "github-light",
      "rose-pine-dawn",
      "tokyo-night",
    ],
    plugins: [
        pluginLineNumbers(),
        pluginCollapsibleSections(),
    ],
    styleOverrides: {
        collapsibleSections: {
            collapsePreserveIndent: true,
            closedPaddingBlock: '0',
            closedLineHeight: '3rem',
            closedFontFamily: 'inherit',
            closedTextColor: 'inherit',
            closedBackgroundColor: 'var(--lightgray)'
        },
        // codePaddingInline: "1rem"
    },
    tabWidth: 2,
    textMarkers: true,
    minSyntaxHighlightingColorContrast: 5.5,
    useThemedScrollbars: true,
    useThemedSelectionColors: false,
    useDarkModeMediaQuery: true,
}

export const SyntaxHighlighting: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
    const opts = {
        ...defaultOptions,
        ...userOpts,
    }

    return {
        name: "SyntaxHighlighting",
        htmlPlugins() {
            return [
                [rehypeExpressiveCode, opts],
            ]
        },
    }
}
