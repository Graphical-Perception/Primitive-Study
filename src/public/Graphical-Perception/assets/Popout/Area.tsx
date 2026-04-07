import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import CountDown from './CountDown';

interface Square {
  id: number;
  x: number; // 사각형의 x 좌표
  y: number; // 사각형의 y 좌표
  size: number; // 사각형 크기
  isOutlier: boolean; // 다른 크기 여부
}

function generateAreaPopoutSquares(isIncluded: boolean): { squares: Square[]; hasOutlier: boolean } {
  const totalSquares = 10; // 총 사각형 개수
  const squares: Square[] = [];
  const usedPositions: { x: number; y: number }[] = [];
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  const hasOutlier = isIncluded; // 50% 확률로 다른 크기 포함
  const baseSize = 20; // 기본 크기
  const outlierSize = Math.random() * 20 + 40; // 다른 크기 (40 ~ 60)

  for (let i = 0; i < totalSquares; i++) {
    let x: number; let y: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      x = Math.floor(Math.random() * 400) + 50; // x 좌표 (50 ~ 450)
      y = Math.floor(Math.random() * 300) + 50; // y 좌표 (50 ~ 350)

      // 기존 사각형들과 겹치지 않도록 위치 확인
      isValidPosition = true;
      for (const pos of usedPositions) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < baseSize + 10) { // 사각형끼리 최소 간격 유지
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

    squares.push({
      id: i,
      x,
      y,
      size: hasOutlier && i === 0 ? outlierSize : baseSize,
      isOutlier: hasOutlier && i === 0,
    });
  }

  return { squares, hasOutlier };
}

const AreaPopoutStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, time_limit } = parameters;
  const isIncluded = parameters[taskid]

  const { squares, hasOutlier } = generateAreaPopoutSquares(isIncluded);

  const [countdown, setCountdown] = useState<number>(3); // 3초 카운트다운
  const [showSquares, setShowSquares] = useState<boolean>(true);

  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else {
      setShowSquares(true);
      const timer = setTimeout(() => setShowSquares(false), time_limit);
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
          <CountDown countdown={countdown} task="Area" />
        )
          :
          <>
            {showSquares &&
              <>
                {squares.map((square) => (
                  <rect
                    key={square.id}
                    x={square.x}
                    y={square.y}
                    width={square.size}
                    height={square.size}
                    fill="red"
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

export default AreaPopoutStudy;

{/* <div>
  <p>Did you see a rectangle with a different size?</p>
  <button type="button" onClick={() => handleResponse(true)}>Yes</button>
  <button type="button" onClick={() => handleResponse(false)}>No</button>
</div> */}