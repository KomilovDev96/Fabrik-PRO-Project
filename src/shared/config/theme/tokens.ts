import { theme as antdTheme, type ThemeConfig } from 'antd'

export type ThemeMode = 'light' | 'dark'

/**
 * Brand palette ported from the TailAdmin design system (Untitled UI scale).
 * Mapped onto Ant Design's seed tokens so the whole component library follows it.
 */
const palette = {
  brand: '#465fff',
  brandHover: '#3641f5',
  brandActive: '#2a31d8',
  success: '#12b76a',
  warning: '#fb6514',
  error: '#f04438',
  info: '#0ba5ec',
} as const

const sharedToken: ThemeConfig['token'] = {
  colorPrimary: palette.brand,
  colorInfo: palette.info,
  colorSuccess: palette.success,
  colorWarning: palette.warning,
  colorError: palette.error,
  colorLink: palette.brand,
  borderRadius: 8,
  fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 14,
}

/** Build the full Ant Design theme config for the given mode. */
export function buildTheme(mode: ThemeMode): ThemeConfig {
  return {
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      ...sharedToken,
      colorPrimaryHover: palette.brandHover,
      colorPrimaryActive: palette.brandActive,
      ...(mode === 'dark'
        ? { colorBgLayout: '#0c111d', colorBgContainer: '#1a2231' }
        : { colorBgLayout: '#f9fafb', colorBgContainer: '#ffffff' }),
    },
    components: {
      Layout: {
        siderBg: mode === 'dark' ? '#101828' : '#ffffff',
        headerBg: mode === 'dark' ? '#1a2231' : '#ffffff',
        bodyBg: mode === 'dark' ? '#0c111d' : '#f9fafb',
      },
      Menu: {
        itemBorderRadius: 8,
        itemSelectedBg: mode === 'dark' ? '#262e89' : '#ecf3ff',
        itemSelectedColor: palette.brand,
      },
    },
  }
}
