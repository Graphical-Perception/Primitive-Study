import React from 'react';

interface DrawProps {
  position?: [number, number]; // [x, y], 0~100 입력 → 0~1로 변환
  length?: number; // 선분 길이 (0~100 입력 → 0~1로 변환)
  tilt?: number; // 기울기 (0~180)
  area?: number | null; // 면적 (0~100 입력 → 0~1로 변환)
  luminance?: number; // 색상 밝기 (0~100 입력 → 0~1로 변환)
  saturation?: number; // 색상 채도 (0~100 입력 → 0~1로 변환)
  curvature?: number; // 곡률 (0~180 입력)
  colorHue?: 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'black';
  shape?: 'line' | 'circle' | 'square' | 'triangle' | 'star' | 'cross';
}

const DrawElement: React.FC<DrawProps> = ({
  position = [50, 50], // 0~100 범위
  length = 50,
  tilt = 0,
  area = null,
  luminance = 50,
  saturation = 0,
  curvature = 0,
  colorHue = 'red',
  shape = 'line',
}) => {
  const screenSize = 500; // 캔버스 크기

  const pos = [position[0] / 100, position[1] / 100]; // 0~100 → 0~1
  const len = (length / 100) * screenSize;
  const tiltRad = (tilt / 180) * Math.PI;
  const curvAngle = curvature; // 0~180 범위
  const areaNorm = area !== null ? (area / 100) * screenSize * screenSize : null;

  const centerX = pos[0] * screenSize;
  const centerY = pos[1] * screenSize;

  // 색상 변환 (HLS -> RGB)
  const hueMap: Record<string, number> = {
    red: 0,
    green: 120,
    blue: 240,
    yellow: 60,
    purple: 300,
    black: 0,
  };
  const hue = hueMap[colorHue] || 0;
  const color = `hsl(${hue}, ${saturation}%, ${luminance}%)`;

  // 선의 시작점과 끝점 계산
  const x1 = centerX - (len / 2) * Math.cos(tiltRad);
  const y1 = centerY + (len / 2) * Math.sin(tiltRad);
  const x2 = centerX + (len / 2) * Math.cos(tiltRad);
  const y2 = centerY - (len / 2) * Math.sin(tiltRad);

  // 곡선의 중심과 반지름 계산
  let arcPath = '';

  if (curvature === 0) {
    // 직선
    arcPath = `
      M ${x1} ${y1}
      L ${x2} ${y2}
    `;
  } else {
    // 곡선
    const radius = len / (2 * Math.sin((curvAngle * Math.PI) / 360)); // 반지름 계산

    // 원의 중심 계산
    const arcCenterX = centerX - (radius * Math.sin(tiltRad));
    const arcCenterY = centerY + (radius * Math.cos(tiltRad));

    // SVG의 Arc Command 생성
    const largeArcFlag = curvAngle > 180 ? 1 : 0;
    arcPath = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
    `;
  }

  return (
    <svg width={screenSize} height={screenSize} style={{ border: '1px solid black' }}>
      {areaNorm !== null ? (
        // 사각형 (면적이 있는 경우)
        <rect
          x={centerX - Math.sqrt(areaNorm) / 2}
          y={centerY - Math.sqrt(areaNorm) / 2}
          width={Math.sqrt(areaNorm)}
          height={Math.sqrt(areaNorm)}
          fill={color}
          transform={`rotate(${-tilt}, ${centerX}, ${centerY})`}
        />
      ) : (
        // 직선 또는 곡선
        <path d={arcPath} fill="none" stroke={color} strokeWidth="10" />
      )}
    </svg>
  );
};

export default DrawElement;