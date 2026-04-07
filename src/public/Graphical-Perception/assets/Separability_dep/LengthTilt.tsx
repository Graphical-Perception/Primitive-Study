import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Line {
  id: number;
  length: number; // 선분 길이
  tilt: number; // 기울기 각도
  x: number; // 시작점 x 좌표
  y: number; // 시작점 y 좌표
}

function generateSeparabilityLines(
  fixedLength: boolean,
  fixedTilt: boolean,
): Line[] {
  const totalLines = 10; // 총 선분 수
  const lines: Line[] = [];
  const usedPositions: { x: number; y: number }[] = []; // 점유된 위치 기록
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  // 고정 또는 랜덤 값을 정의
  const lengthValues = fixedLength
    ? [50] // 고정된 길이
    : [50, 100]; // 두 가지 길이
  const tiltValues = fixedTilt
    ? [15] // 고정된 기울기
    : [-15, 15]; // 두 가지 기울기

  for (let i = 0; i < totalLines; i++) {
    let length: number; let tilt: number; let x: number; let y: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      // 랜덤으로 두 가지 값 중 하나 선택
      length = lengthValues[Math.floor(Math.random() * lengthValues.length)];
      tilt = tiltValues[Math.floor(Math.random() * tiltValues.length)];
      x = Math.floor(Math.random() * 400) + 50; // x 좌표 (50 ~ 450)
      y = Math.floor(Math.random() * 300) + 50; // y 좌표 (50 ~ 350)

      // 기존 선분들과 겹치는지 확인
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
    lines.push({
      id: i, length, tilt, x, y,
    });
  }

  return lines;
}

const LengthTiltSeparabilityStudy: React.FC<StimulusParams<{ taskid: string; fixedLength: boolean; fixedTilt: boolean }>> = ({
  parameters,
}) => {
  const { fixedLength, fixedTilt, taskid } = parameters;
  const [lines, setLines] = useState<Line[]>([]);
  const [showLines, setShowLines] = useState<boolean>(true); // 선분 표시 여부

  useEffect(() => {
    setLines(generateSeparabilityLines(fixedLength, fixedTilt));
    const timer = setTimeout(() => setShowLines(false), 5000); // 5초 후 선분 숨기기
    return () => clearTimeout(timer);
  }, [fixedLength, fixedTilt]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      {showLines ? (
        <svg width="500" height="400" style={{ border: '1px solid black' }}>
          {lines.map((line) => {
            const x2 = line.x + line.length * Math.cos((line.tilt * Math.PI) / 180);
            const y2 = line.y - line.length * Math.sin((line.tilt * Math.PI) / 180);
            return (
              <line
                key={line.id}
                x1={line.x}
                y1={line.y}
                x2={x2}
                y2={y2}
                stroke="black"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      ) : (
        <div>
          <p>The lines are hidden now!</p>
          <p>
            Task:
            {' '}
            {taskid === 'tilt-separability' ? 'Separate the lines by tilt.' : 'Separate the lines by length.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LengthTiltSeparabilityStudy;
