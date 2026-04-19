/**
 * Unified SVG icon set — Lucide-style 24x24, 1.6 stroke.
 *
 * Replaces every emoji/unicode glyph previously used across the UI
 * (⚙️ 👑 ✓ ✕ ↑ ↓ ↕ ▾ ◆ ◎ ◔ ⚠ $ % ↗ ↩ ?). All icons share the same visual
 * language: stroke-based, rounded joins, currentColor so they inherit the
 * parent `color`. Props: `size` (default 16), any other SVG attrs.
 */

const BASE = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

function svg(props, children) {
  const { size = 16, className = '', style, title, ...rest } = props || {};
  return (
    <svg
      {...BASE}
      width={size}
      height={size}
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const IconGear = (p) => svg(p, (
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>
));

export const IconCheck = (p) => svg(p, <path d="M4 12.5 10 18 20 6" />);

export const IconClose = (p) => svg(p, (
  <>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </>
));

export const IconChevronDown = (p) => svg(p, <path d="M6 9l6 6 6-6" />);
export const IconChevronUp   = (p) => svg(p, <path d="M6 15l6-6 6 6" />);
export const IconArrowUp     = (p) => svg(p, (
  <>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </>
));
export const IconArrowDown   = (p) => svg(p, (
  <>
    <path d="M12 5v14" />
    <path d="M19 12l-7 7-7-7" />
  </>
));
export const IconArrowUpDown = (p) => svg(p, (
  <>
    <path d="M7 4v16" />
    <path d="M4 7l3-3 3 3" />
    <path d="M17 20V4" />
    <path d="M20 17l-3 3-3-3" />
  </>
));
export const IconTrendingUp  = (p) => svg(p, (
  <>
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="14 7 21 7 21 14" />
  </>
));

export const IconDollar = (p) => svg(p, (
  <>
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </>
));
export const IconPercent = (p) => svg(p, (
  <>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </>
));
export const IconPayout = (p) => svg(p, (
  <>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <path d="M12 14v3" />
    <path d="M10 16l2 2 2-2" />
  </>
));

export const IconCrown = (p) => svg(p, (
  <>
    <path d="M3 18h18" />
    <path d="M3 8l4 4 5-7 5 7 4-4v10H3V8z" />
  </>
));

export const IconSparkle = (p) => svg(p, (
  <>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="M6 6l2 2" />
    <path d="M16 16l2 2" />
    <path d="M6 18l2-2" />
    <path d="M16 8l2-2" />
  </>
));

export const IconLink = (p) => svg(p, (
  <>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
  </>
));

export const IconMail = (p) => svg(p, (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </>
));

export const IconDownload = (p) => svg(p, (
  <>
    <path d="M12 4v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </>
));

export const IconPlus = (p) => svg(p, (
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
));

export const IconMinus = (p) => svg(p, <path d="M5 12h14" />);

export const IconX = IconClose;

export const IconTrash = (p) => svg(p, (
  <>
    <polyline points="4 6 20 6" />
    <path d="M9 6V4h6v2" />
    <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </>
));

export const IconRefresh = (p) => svg(p, (
  <>
    <path d="M20 12a8 8 0 0 1-14 5.7L4 16" />
    <path d="M4 12a8 8 0 0 1 14-5.7L20 8" />
    <polyline points="20 4 20 8 16 8" />
    <polyline points="4 20 4 16 8 16" />
  </>
));

export const IconInfo = (p) => svg(p, (
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="10" x2="12" y2="16" />
    <line x1="12" y1="7" x2="12.01" y2="7" />
  </>
));

export const IconHelp = (p) => svg(p, (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 .3c0 1.6-2.5 2-2.5 3.7" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
));

export const IconAlert = (p) => svg(p, (
  <>
    <path d="M12 3 2 21h20L12 3z" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
));

export const IconSearch = (p) => svg(p, (
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </>
));

export const IconUndo = (p) => svg(p, (
  <>
    <polyline points="3 10 8 5 8 15" />
    <path d="M3 10h10a8 8 0 1 1 0 8h-2" />
  </>
));

export const IconShare = (p) => svg(p, (
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
));

// Brand mark — stylized diamond/cube for OpsellAI wordmark
export const IconBrand = (p) => svg(p, (
  <>
    <path d="M12 2 3 8v8l9 6 9-6V8l-9-6z" />
    <path d="M3 8l9 6 9-6" />
    <path d="M12 14v8" />
  </>
));

// Fee-row semantic icons
export const IconCircleDot = (p) => svg(p, (
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </>
));
