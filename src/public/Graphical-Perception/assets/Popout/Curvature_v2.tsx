import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Arc {
  id: number;
  centerX: number; // 원의 중심 x 좌표
  centerY: number; // 원의 중심 y 좌표
  radius: number; // 반지름
  curvature: number; // 곡률 각도
  startAngle: number; // 시작 각도
  isOutlier: boolean; // 다른 곡률 여부
}

function generateCurvaturePopoutArcs(taskid: string): { arcs: Arc[]; hasOutlier: boolean } {
  const totalArcs = 10; // 총 호 개수
  const arcs: Arc[] = [];
  const occupiedCenters: { centerX: number; centerY: number }[] = [];
  const radius = 30; // 고정 반지름
  const baseCurvature = Math.random() * 100 + 50; // 기본 곡률 (50° ~ 150° 랜덤)
  const outlierCurvature = Math.random() * 60 + 150; // 다른 곡률 (150° ~ 210° 랜덤)
  const hasOutlier = Math.random() < 0.5; // 50% 확률로 다른 곡률 포함

  for (let i = 0; i < totalArcs; i++) {
    let centerX: number;
    let centerY: number;
    let isValidPosition: boolean;

    do {
      // 중심 좌표 랜덤 생성 (여백 포함)
      centerX = Math.random() * (500 - 2 * radius - 20) + radius + 10;
      centerY = Math.random() * (400 - 2 * radius - 20) + radius + 10;
      isValidPosition = true;

      // 기존 중심들과 겹치지 않도록 확인
      for (const center of occupiedCenters) {
        const distance = Math.sqrt((centerX - center.centerX) ** 2 + (centerY - center.centerY) ** 2);
        if (distance < 2 * radius + 10) {
          isValidPosition = false;
          break;
        }
      }
    } while (!isValidPosition);

    occupiedCenters.push({ centerX, centerY });

    arcs.push({
      id: i,
      centerX,
      centerY,
      radius,
      curvature:
        hasOutlier && i === totalArcs - 1
          ? outlierCurvature
          : baseCurvature,
      startAngle: taskid.includes('random') ? Math.random() * 360 : 0, // 랜덤 또는 고정 시작 각도
      isOutlier: hasOutlier && i === totalArcs - 1,
    });
  }

  return { arcs, hasOutlier };
}

const CurvaturePopoutStudy: React.FC<StimulusParams<{ taskid: string }>> = ({
  parameters,
  setAnswer,
}) => {
  const { taskid } = parameters;
  const { arcs, hasOutlier } = generateCurvaturePopoutArcs(taskid);
  const [showArcs, setShowArcs] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowArcs(false), 1000); // 1초 후 호 숨기기
    return () => clearTimeout(timer);
  }, []);

  const handleResponse = (response: boolean) => {
    setAnswer({
      status: true,
      answers: { taskid, hasOutlier, userResponse: response },
    });
  };

  const generateArcPath = (arc: Arc) => {
    const {
      centerX, centerY, radius, curvature, startAngle,
    } = arc;

    const toRadians = (angle: number) => (angle * Math.PI) / 180;

    const endAngle = (startAngle + curvature) % 360;

    // 시작 점 좌표
    const startX = centerX + radius * Math.cos(toRadians(startAngle));
    const startY = centerY - radius * Math.sin(toRadians(startAngle));

    // 끝 점 좌표
    const endX = centerX + radius * Math.cos(toRadians(endAngle));
    const endY = centerY - radius * Math.sin(toRadians(endAngle));

    const largeArcFlag = curvature > 180 ? 1 : 0;
    const sweepFlag = 0; // 시계 방향

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20px',
      }}
    >
      <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>
        Answer:
        {' '}
        {hasOutlier ? 'Yes' : 'No'}
      </div>
      {showArcs ? (
        <svg width="500" height="400" style={{ border: '1px solid black' }}>
          {arcs.map((arc) => (
            <g key={arc.id}>
              {/* 호 */}
              <path
                d={generateArcPath(arc)}
                fill="none"
                stroke="black"
                strokeWidth="2"
              />
              {/* 중심점 */}
              <circle cx={arc.centerX} cy={arc.centerY} r="2" fill="black" />
            </g>
          ))}
        </svg>
      ) : (
        <svg width="500" height="400" style={{ border: '1px solid black' }}></svg>

      )}
    </div>
  );
};

export default CurvaturePopoutStudy;


{/* <div>
          <p>Did you see an arc with a different curvature?</p>
          <button type="button" onClick={() => handleResponse(true)}>Yes</button>
          <button type="button" onClick={() => handleResponse(false)}>No</button>
        </div> */}