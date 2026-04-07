import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import CountDown from './CountDown';

interface Line {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isOutlier: boolean; // 다른 길이 여부
}

function generateLengthPopoutLines(isIncluded: boolean): { lines: Line[]; hasOutlier: boolean } {
  const totalLines = 10; // 총 선 개수
  const lines: Line[] = [];
  const usedPositions: { x: number; y: number }[] = [];
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  const hasOutlier = isIncluded; // 50% 확률로 다른 길이 포함
  const baseLength = 50; // 기본 길이
  const outlierLength = 100; // 다른 길이 100

  for (let i = 0; i < totalLines; i++) {
    let x1: number; let y1: number; let x2: number; let y2: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      x1 = Math.floor(Math.random() * 400) + 50; // x1 좌표 (50 ~ 450)
      y1 = Math.floor(Math.random() * 300) + 50; // y1 좌표 (50 ~ 350)

      const length = hasOutlier && i === 0 ? outlierLength : baseLength; // 다른 길이 적용

      x2 = x1 + length; // 길이에 따라 x2 계산
      y2 = y1;

      // 기존 선분들과 겹치지 않도록 위치 확인
      isValidPosition = true;
      for (const pos of usedPositions) {
        const distance = Math.sqrt((x1 - pos.x) ** 2 + (y1 - pos.y) ** 2);
        if (distance < length) {
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
    usedPositions.push({ x: x1, y: y1 });

    lines.push({
      id: i, x1, y1, x2, y2, isOutlier: hasOutlier && i === 0,
    });
  }

  return { lines, hasOutlier };
}

const LengthPopoutStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, time_limit } = parameters;
  const isIncluded = parameters[taskid]

  const { lines, hasOutlier } = generateLengthPopoutLines(isIncluded);

  const [countdown, setCountdown] = useState<number>(3); // 3초 카운트다운
  const [showLines, setShowLines] = useState<boolean>(true);

  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else {
      setShowLines(true);
      const timer = setTimeout(() => setShowLines(false), time_limit);
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
          <CountDown countdown={countdown} task="Length" />
        )
          :
          <>
            {showLines &&
              <>
                {lines.map((line) => (
                  <line
                    key={line.id}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
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

export default LengthPopoutStudy;

{/* <div>
          <p>Did you see a line with a different length?</p>
          <button type="button" onClick={() => handleResponse(true)}>Yes</button>
          <button type="button" onClick={() => handleResponse(false)}>No</button>
        </div> */}