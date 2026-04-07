import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Arc {
  id: number;
  curvature: number; // 곡률 각도 (1° ~ 359°)
  startAngle: number; // 시작 각도 (0° ~ 359°)
  centerX: number; // 원의 중심 x 좌표
  centerY: number; // 원의 중심 y 좌표
}

function generateArcs(taskid: string): { arcs: Arc[]; distinctCurvatures: number } {
  const curvatureTypes = Math.floor(Math.random() * 3) + 3; // 3~5개의 고유 곡률
  const distinctCurvatures = Array.from(
    { length: curvatureTypes },
    (_, i) => Math.floor((i + 1) * (360 / (curvatureTypes + 1))), // 등간격 곡률 생성
  );
  const totalArcs = 10; // 총 10개의 호
  const arcs: Arc[] = [];
  const radius = 30; // 모든 원의 반지름 고정
  const occupiedCenters: { x: number; y: number }[] = []; // 이미 점유된 영역 기록

  for (let i = 0; i < totalArcs; i++) {
    const curvature = distinctCurvatures[Math.floor(Math.random() * distinctCurvatures.length)]; // 랜덤 곡률 선택
    const startAngle = taskid === 'curvature-random-disc'
      ? Math.floor(Math.random() * 360) // 랜덤 시작 각도
      : 0; // 고정된 시작 각도

    let centerX: number;
    let centerY: number;
    let isValidPosition: boolean;

    do {
      // 중심 좌표 랜덤 생성 (여백 고려)
      centerX = Math.random() * (500 - 2 * radius - 20) + radius + 10; // 여백 포함
      centerY = Math.random() * (400 - 2 * radius - 20) + radius + 10; // 여백 포함
      isValidPosition = true;

      // 기존 원들과 겹치는지 확인
      for (const center of occupiedCenters) {
        const distance = Math.sqrt((centerX - center.x) ** 2 + (centerY - center.y) ** 2);
        if (distance < 2 * radius + 10) { // 최소 거리: 반지름의 두 배 + 여백
          isValidPosition = false;
          break;
        }
      }
    } while (!isValidPosition);

    occupiedCenters.push({ x: centerX, y: centerY });
    arcs.push({
      id: i,
      curvature,
      startAngle,
      centerX,
      centerY,
    });
  }

  return { arcs, distinctCurvatures: distinctCurvatures.length };
}

const CurvatureDiscriminabilityStudy: React.FC<StimulusParams<{ taskid: string }>> = ({ parameters }) => {
  const { taskid } = parameters;
  const { arcs, distinctCurvatures } = generateArcs(taskid);
  const [showArcs, setShowArcs] = useState<boolean>(true); // 호 표시 여부

  useEffect(() => {
    const timer = setTimeout(() => setShowArcs(false), 5000); // 5초 후에 호 숨기기
    return () => clearTimeout(timer);
  }, []);

  const generateArcPath = (arc: Arc) => {
    const {
      centerX, centerY, curvature, startAngle,
    } = arc;
    const radius = 30; // 반지름 고정

    const toRadians = (angle: number) => (angle * Math.PI) / 180;

    const endAngle = (startAngle - curvature + 360) % 360;

    // 시작 점 좌표
    const startX = centerX + radius * Math.cos(toRadians(startAngle));
    const startY = centerY - radius * Math.sin(toRadians(startAngle));

    // 끝 점 좌표
    const endX = centerX + radius * Math.cos(toRadians(endAngle));
    const endY = centerY - radius * Math.sin(toRadians(endAngle));

    const largeArcFlag = curvature > 180 ? 1 : 0;

    // SVG 호 경로
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${1} ${endX} ${endY}`;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>
        Answer:
        {' '}
        {distinctCurvatures}
      </div>
      {showArcs ? (
        <svg width="500" height="400" style={{ border: '1px solid black' }}>
          {arcs.map((arc) => (
            <g key={arc.id}>
              {/* 원의 중심 */}
              <circle cx={arc.centerX} cy={arc.centerY} r="3" fill="blue" />
              {/* 곡률 호 */}
              <path
                d={generateArcPath(arc)}
                fill="none"
                stroke="black"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
      ) : (
        <div style={{ fontSize: '16px', textAlign: 'center' }}>
          <p>The arcs are hidden now!</p>
          <p>How many distinct curvatures did you see?</p>
        </div>
      )}
    </div>
  );
};

export default CurvatureDiscriminabilityStudy;
