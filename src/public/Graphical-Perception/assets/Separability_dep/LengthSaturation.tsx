import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Rectangle {
  id: number;
  length: number; // 사각형 가로 길이
  saturation: number; // 채도 (0 ~ 100)
  x: number; // 사각형의 x 좌표
  y: number; // 사각형의 y 좌표
}

function generateSeparabilityRectangles(
  fixedLength: boolean,
  fixedSaturation: boolean,
): Rectangle[] {
  const totalRectangles = 10; // 총 사각형 수
  const rectangles: Rectangle[] = [];
  const usedPositions: { x: number; y: number }[] = []; // 점유된 위치 기록
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  // 고정 또는 랜덤 값을 정의
  const lengthValues = fixedLength
    ? [50] // 고정된 길이
    : [50, 100]; // 두 가지 길이
  const saturationValues = fixedSaturation
    ? [50] // 고정된 채도
    : [30, 70]; // 두 가지 채도

  for (let i = 0; i < totalRectangles; i++) {
    let length: number; let saturation: number; let x: number; let y: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      // 랜덤으로 두 가지 값 중 하나 선택
      length = lengthValues[Math.floor(Math.random() * lengthValues.length)];
      saturation = saturationValues[Math.floor(Math.random() * saturationValues.length)];
      x = Math.floor(Math.random() * 400) + 50; // x 좌표 (50 ~ 450)
      y = Math.floor(Math.random() * 300) + 50; // y 좌표 (50 ~ 350)

      // 기존 사각형들과 겹치는지 확인
      isValidPosition = true;
      for (const pos of usedPositions) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < length + 20) {
          isValidPosition = false;
          break;
        }
      }

      if (attempts > maxAttempts) {
        isValidPosition = true; // 시도 초과 시 강제로 종료
        break;
      }
    } while (!isValidPosition);

    // 위치가 유효하다면 추가
    usedPositions.push({ x, y });
    rectangles.push({
      id: i, length, saturation, x, y,
    });
  }

  return rectangles;
}

const LengthSaturationSeparabilityStudy: React.FC<StimulusParams<{ taskid: string; fixedLength: boolean; fixedSaturation: boolean }>> = ({
  parameters,
}) => {
  const { fixedLength, fixedSaturation, taskid } = parameters;
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [showRectangles, setShowRectangles] = useState<boolean>(true); // 사각형 표시 여부

  useEffect(() => {
    setRectangles(generateSeparabilityRectangles(fixedLength, fixedSaturation));
    const timer = setTimeout(() => setShowRectangles(false), 5000); // 5초 후 사각형 숨기기
    return () => clearTimeout(timer);
  }, [fixedLength, fixedSaturation]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      {showRectangles ? (
        <svg width="500" height="400" style={{ border: '1px solid black' }}>
          {rectangles.map((rect) => (
            <rect
              key={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.length}
              height={20} // 고정된 높이
              fill={`hsl(0, ${rect.saturation}%, 50%)`} // 채도를 HSL 값으로 표현
              stroke="none"
            />
          ))}
        </svg>
      ) : (
        <div>
          <p>The rectangles are hidden now!</p>
          <p>
            Task:
            {' '}
            {taskid === 'saturation-separability' ? 'Separate the rectangles by saturation.' : 'Separate the rectangles by length.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LengthSaturationSeparabilityStudy;
