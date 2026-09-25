import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function RoundedCheckIcon({ size = 12, color = '#FFFFFF', strokeWidth = 3.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
