import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import CountDown from './CountDown';

interface Circle {
  id: number;
  x: number; // 원의 x 좌표
  y: number; // 원의 y 좌표
  color: string; // 원의 색상
}

function generateHuePopoutCircles(isIncluded: boolean): { circles: Circle[]; hasBlueCircle: boolean } {
  const totalCircles = 10; // 총 점 개수
  const circles: Circle[] = [];
  const usedPositions: { x: number; y: number }[] = []; // 점유된 위치 기록
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  const hasBlueCircle = isIncluded; // 파란색 점이 포함될 확률 50%

  for (let i = 0; i < totalCircles; i++) {
    let x: number; let y: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      x = Math.floor(Math.random() * 400) + 50; // x 좌표 (50 ~ 450)
      y = Math.floor(Math.random() * 300) + 50; // y 좌표 (50 ~ 350)

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

    // 색상 설정
    const color = hasBlueCircle && i === 0 ? 'blue' : 'red'; // 마지막 점에 파란색 할당

    circles.push({
      id: i, x, y, color,
    });
  }

  return { circles, hasBlueCircle };
}

const HuePopoutStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, time_limit } = parameters;
  const isIncluded = parameters[taskid]

  const { circles, hasBlueCircle } = generateHuePopoutCircles(isIncluded);

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

      <svg width="500" height="400" style={{ border: '1px solid black' }}>
        {countdown > 0 ? (
          <CountDown countdown={countdown} task="Hue" />
        )
          :
          <>
            {showCircles &&
              <>
                {circles.map((circle) => (
                  <circle
                    key={circle.id}
                    cx={circle.x}
                    cy={circle.y}
                    r={10} // 점 크기
                    fill={circle.color}
                  />
                ))}
              </>
            }
          </>
        }
      </svg>
      {test &&
        <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>
          Answer:
          {' '}
          {hasBlueCircle ? 'Yes' : 'No'}
        </div>
      }
    </div>
  );
};

export default HuePopoutStudy;

{/* <div>
  <p>Did you see a blue circle?</p>
  <button type="button" onClick={() => handleResponse(true)}>Yes</button>
  <button type="button" onClick={() => handleResponse(false)}>No</button>
</div> */}