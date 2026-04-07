import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import CountDown from './CountDown';

interface Arc {
  id: number;
  x: number; // 호의 중심 x 좌표
  y: number; // 호의 중심 y 좌표
  radius: number; // 반지름
  curvature: number; // 곡률 각도
  isOutlier: boolean; // 다른 곡률 여부
}

function generateCurvaturePopoutArcs(isIncluded: boolean): { arcs: Arc[]; hasOutlier: boolean } {
  const totalArcs = 10; // 총 호 개수
  const arcs: Arc[] = [];
  const usedPositions: { x: number; y: number }[] = [];
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  const hasOutlier = isIncluded; // 50% 확률로 다른 곡률 포함
  const baseCurvature = 60; // 기본 곡률
  const outlierCurvature = 180; // 다른 곡률 (120° ~ 180°)
  const radius = 50; // 고정 반지름

  for (let i = 0; i < totalArcs; i++) {
    let x: number; let y: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      x = Math.floor(Math.random() * 400) + 50; // x 좌표 (50 ~ 450)
      y = Math.floor(Math.random() * 300) + 50; // y 좌표 (50 ~ 350)

      // 기존 호들과 겹치지 않도록 위치 확인
      isValidPosition = true;
      for (const pos of usedPositions) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < radius * 2) { // 호끼리 최소 간격 유지
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

    arcs.push({
      id: i,
      x,
      y,
      radius,
      curvature: hasOutlier && i === 0 ? outlierCurvature : baseCurvature,
      isOutlier: hasOutlier && i === 0,
    });
  }

  return { arcs, hasOutlier };
}

const CurvaturePopoutStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, time_limit } = parameters;
  const isIncluded = parameters[taskid]

  const { arcs, hasOutlier } = generateCurvaturePopoutArcs(isIncluded);

  const [countdown, setCountdown] = useState<number>(3); // 3초 카운트다운
  const [showArcs, setShowArcs] = useState<boolean>(true);

  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else {
      setShowArcs(true);
      const timer = setTimeout(() => setShowArcs(false), time_limit);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateArcPath = (x: number, y: number, len: number, curvature: number) => {
    const radius = len / (2 * Math.sin((curvature * Math.PI) / 360)); // 반지름 계산

    const largeArcFlag = curvature > 180 ? 1 : 0;
    const startX = x - len / 2;
    const startY = y;
    const endX = x + len / 2
    const endY = y;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      {test &&
        <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>
          Answer:
          {' '}
          {hasOutlier ? 'Yes' : 'No'}
        </div>
      }

      <svg width="500" height="400" style={{ border: '1px solid black' }}>
        {countdown > 0 ? (
          <CountDown countdown={countdown} task="Curvature" />
        )
          :
          <>
            {showArcs &&
              <>
                {arcs.map((arc) => (
                  <path
                    key={arc.id}
                    d={generateArcPath(arc.x, arc.y, arc.radius, arc.curvature)}
                    fill="none"
                    stroke="red"
                    strokeWidth="5"
                  />
                ))}
              </>
            }
          </>
        }
      </svg>
    </div>
  );
};

export default CurvaturePopoutStudy;


{/* <div>
<p>Did you see an arc with a different curvature?</p>
<button type="button" onClick={() => handleResponse(true)}>Yes</button>
<button type="button" onClick={() => handleResponse(false)}>No</button>
</div> */}