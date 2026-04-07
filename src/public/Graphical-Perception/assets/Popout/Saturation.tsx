import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import { count } from 'console';
import CountDown from './CountDown';

interface Circle {
  id: number;
  x: number; // 원의 x 좌표
  y: number; // 원의 y 좌표
  saturation: number; // 채도 값 (0 ~ 100)
}

function generateSaturationPopoutCircles(isIncluded: boolean): { circles: Circle[]; hasPopout: boolean } {
  const totalCircles = 10; // 총 점 개수
  const circles: Circle[] = [];
  const usedPositions: { x: number; y: number }[] = []; // 점유된 위치 기록
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  const popoutSaturation = 90; // Popout 채도
  const baseSaturation = 20; // 기본 채도
  const hasPopout = isIncluded; // 50% 확률로 Popout 생성

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

    // 채도 설정
    const saturation = hasPopout && i === 0 ? popoutSaturation : baseSaturation;

    circles.push({
      id: i, x, y, saturation,
    });
  }

  return { circles, hasPopout };
}

const SaturationPopoutStudy: React.FC<StimulusParams<any>> = ({ parameters, setAnswer }) => {
  const { taskid, test, time_limit } = parameters;
  const isIncluded = parameters[taskid]

  const { circles, hasPopout } = generateSaturationPopoutCircles(isIncluded);


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
          {hasPopout ? 'Yes' : 'No'}
        </div>
      }
      <svg width="500" height="400" style={{ border: '1px solid black' }}>
        {countdown > 0 ?
          <CountDown countdown={countdown} task="Saturation" /> :
          <>
            {showCircles &&
              <>
                {circles.map((circle) => (
                  <circle
                    key={circle.id}
                    cx={circle.x}
                    cy={circle.y}
                    r={10} // 점 크기
                    fill={`hsl(0, ${circle.saturation}%, 50%)`} // 채도를 HSL 색상으로 표현
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

export default SaturationPopoutStudy;

{/* <div>
          <p>Did you see a circle with higher saturation?</p>
          <button type="button" onClick={() => handleResponse(true)}>Yes</button>
          <button type="button" onClick={() => handleResponse(false)}>No</button>
        </div> */}