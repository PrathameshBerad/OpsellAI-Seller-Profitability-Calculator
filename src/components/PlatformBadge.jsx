import { PLATFORMS } from '../data/platforms';

export default function PlatformBadge({ platformId, size = 'sm' }) {
  const platform = PLATFORMS[platformId];
  if (!platform) return null;

  const isLg = size === 'md' || size === 'lg';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: 8,
      padding: isLg ? '5px 10px' : '3px 8px',
      fontSize: isLg ? 12 : 11,
      fontFamily: 'DM Sans, sans-serif',
      fontWeight: 600,
      backgroundColor: `${platform.color}12`,
      color: platform.color,
      border: `1px solid ${platform.color}28`,
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: isLg ? 7 : 6,
        height: isLg ? 7 : 6,
        borderRadius: '50%',
        backgroundColor: platform.color,
        flexShrink: 0,
        boxShadow: `0 0 5px ${platform.color}50`,
      }} />
      {platform.name}
    </span>
  );
}
