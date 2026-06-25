import { theme } from 'antd'

interface LogoProps {
  /** Show the "FabriqPro" wordmark next to the mark. */
  showText?: boolean
  /** Mark height in px (text scales with it). */
  height?: number
}

/**
 * FabriqPro brand logo — the two-tone mark + wordmark, ported from the reference
 * project's branding component. The wordmark color follows the theme; the mark
 * keeps its brand colors (#5D87FF / #49BEFF).
 */
export function Logo({ showText = true, height = 30 }: LogoProps) {
  const { token } = theme.useToken()
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg height={height} viewBox="182 0 96 68" fill="none" aria-label="FabriqPro" style={{ display: 'block' }}>
        <path
          d="M243.999 67.3198C246.761 67.3198 249.018 65.0784 248.82 62.3241C248.307 55.194 246.698 48.1829 244.045 41.5576C240.774 33.39 235.98 25.9687 229.936 19.7175C223.892 13.4663 216.718 8.50755 208.821 5.12442C202.467 2.40203 195.745 0.742803 188.909 0.198525C186.156 -0.0206238 183.914 2.23858 183.914 5V62.3198C183.914 65.0812 186.153 67.3198 188.914 67.3198H243.999Z"
          fill="#5D87FF"
        />
        <path
          d="M216.001 67.3198C213.239 67.3198 210.982 65.0784 211.18 62.3241C211.693 55.194 213.302 48.1829 215.955 41.5576C219.226 33.39 224.02 25.9687 230.064 19.7175C236.108 13.4663 243.282 8.50755 251.179 5.12442C257.533 2.40203 264.255 0.742803 271.091 0.198525C273.844 -0.0206238 276.086 2.23858 276.086 5V62.3198C276.086 65.0812 273.847 67.3198 271.086 67.3198H216.001Z"
          fill="#49BEFF"
        />
      </svg>
      {showText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: Math.round(height * 0.62),
            letterSpacing: '-0.01em',
            lineHeight: 1,
            color: token.colorText,
          }}
        >
          FabriqPro
        </span>
      )}
    </span>
  )
}
