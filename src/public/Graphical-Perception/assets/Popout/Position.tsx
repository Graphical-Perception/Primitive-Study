import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import CountDown from './CountDown';

interface Circle {
  id: number;
  x: number; // 원의 x 좌표
  y: number; // 원의 y 좌표
  isOutlier: boolean; // 비대칭 여부
}

function generatePositionPopoutCircles(isIncluded: boolean): { circles: Circle[]; hasOutlier: boolean } {
  const totalCircles = 10; // 총 점 개수
  const circles: Circle[] = [];
  const usedPositions: { x: number; y: number }[] = [];
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  const hasOutlier = isIncluded; // 50% 확률로 비대칭 점 포함

  for (let i = 0; i < totalCircles; i++) {
    let x: number; let y: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      x = Math.floor(Math.random() * 400) + 50; // x 좌표 (50 ~ 450)
      y = hasOutlier && i === 0 ? Math.floor(Math.random() * 30) + 250 : 200; // 비대칭 여부에 따라 y 위치 결정

      // 기존 점들과 겹치지 않도록 위치 확인
      isValidPosition = true;
      for (const pos of usedPositions) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < 30) { // 점끼리 최소 30px 거리 유지
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

    circles.push({
      id: i, x, y, isOutlier: hasOutlier && i === 0,
    });
  }

  return { circles, hasOutlier };
}

const PositionPopoutStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, time_limit } = parameters;
  const isIncluded = parameters[taskid]

  const { circles, hasOutlier } = generatePositionPopoutCircles(isIncluded);


  const [countdown, setCountdown] = useState<number>(3); // 3초 카운트다운
  const [showCircles, setShowCircles] = useState<boolean>(true); // 점 표시 여부

  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else {
      setShowCircles(true);
      const timer = setTimeout(() => setShowCircles(false), time_limit);
      return () => clearTimeout(timer);
    }
  }, [countdown]);


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
          <CountDown countdown={countdown} task="Position" />
        )
          :
          <>
            {showCircles && (
              <>
                {circles.map((circle) => (
                  <circle
                    key={circle.id}
                    cx={circle.x}
                    cy={circle.y}
                    r={10} // 점 크기
                    fill="red"
                  />
                ))}
              </>
            )}
          </>
        }

      </svg>

    </div>
  );
};

export default PositionPopoutStudy;

{/* <div>
          <p>Did you see a circle positioned differently?</p>
          <button type="button" onClick={() => handleResponse(true)}>Yes</button>
          <button type="button" onClick={() => handleResponse(false)}>No</button>
        </div> */}