export function RoughFilters() {
  return (
    <svg width="0" height="0" className="hidden absolute">
      <defs>
        {/* Light roughness for subtle wobbles on small elements */}
        <filter id="rough-light">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        
        {/* Medium roughness for cards and containers */}
        <filter id="rough-medium">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        
        {/* Heavy roughness for big display elements */}
        <filter id="rough-heavy">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
