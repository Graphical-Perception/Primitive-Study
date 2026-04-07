import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import CountDown from './CountDown';

interface Shape {
  id: number;
  x: number; // 도형의 x 좌표
  y: number; // 도형의 y 좌표
  type: 'circle' | 'triangle' | 'square' | 'hexagon'; // 도형 종류
}

function generateShapePopoutShapes(targetShape: 'circle' | 'triangle' | 'square' | 'hexagon', isIncluded: boolean): { shapes: Shape[]; hasDifferentShape: boolean } {
  const totalShapes = 10; // 총 도형 개수
  const shapes: Shape[] = [];
  const usedPositions: { x: number; y: number }[] = [];
  const maxAttempts = 100; // 겹치지 않도록 시도 횟수 제한

  const hasDifferentShape = isIncluded; // 50% 확률로 다른 모양 포함


  for (let i = 0; i < totalShapes; i++) {
    let x: number; let y: number; let
      isValidPosition: boolean;
    let attempts = 0;

    do {
      attempts++;
      x = Math.floor(Math.random() * 400) + 50; // x 좌표 (50 ~ 450)
      y = Math.floor(Math.random() * 300) + 50; // y 좌표 (50 ~ 350)

      // 기존 도형들과 겹치지 않도록 위치 확인
      isValidPosition = true;
      for (const pos of usedPositions) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < 30) { // 도형끼리 최소 30px 거리 유지
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

    shapes.push({
      id: i,
      x,
      y,
      type: hasDifferentShape && i === 0 ? targetShape : 'circle',
    });
  }

  return { shapes, hasDifferentShape };
}

const ShapePopoutStudy: React.FC<StimulusParams<any>> = ({ parameters, setAnswer }) => {
  const { taskid, test, time_limit } = parameters;
  const isIncluded = parameters[taskid]
  const targetShape = (() => {
    switch (taskid) {
      case 'triangle-pop':
        return 'triangle';
      case 'square-pop':
        return 'square';
      case 'hexagon-pop':
        return 'hexagon';
      default:
        return 'circle'; // 기본값
    }
  })();

  const { shapes, hasDifferentShape } = generateShapePopoutShapes(targetShape, isIncluded);

  const [countdown, setCountdown] = useState<number>(3); // 3초 카운트다운
  const [showShapes, setShowShapes] = useState<boolean>(true); // 도형 표시 여부

  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else {
      setShowShapes(true);
      const timer = setTimeout(() => setShowShapes(false), time_limit);
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
          {hasDifferentShape ? 'Yes' : 'No'}
        </div>
      }
      <svg width="500" height="400" style={{ border: '1px solid black' }}>
        {countdown > 0 ? (
          <CountDown countdown={countdown} task={targetShape} />
        )
          :
          <>
            {showShapes &&
              <>
                {shapes.map((shape) => {
                  if (shape.type === 'circle') {
                    return <circle key={shape.id} cx={shape.x} cy={shape.y} r={10} fill="red" />;
                  }
                  if (shape.type === 'triangle') {
                    return (
                      <polygon
                        key={shape.id}
                        points={`${shape.x},${shape.y - 10} ${shape.x - 10},${shape.y + 10} ${shape.x + 10},${shape.y + 10}`}
                        fill="red"
                      />
                    );
                  }
                  if (shape.type === 'square') {
                    return (
                      <rect
                        key={shape.id}
                        x={shape.x - 10}
                        y={shape.y - 10}
                        width={20}
                        height={20}
                        fill="red"
                      />
                    );
                  }
                  // Default case
                  return (
                    <polygon
                      key={shape.id}
                      points={`${shape.x},${shape.y - 10} ${shape.x - 8},${shape.y - 5} ${shape.x - 8},${shape.y + 5} ${shape.x},${shape.y + 10} ${shape.x + 8},${shape.y + 5} ${shape.x + 8},${shape.y - 5}`}
                      fill="red"
                    />
                  );
                })}
              </>}
          </>
        }
      </svg>
    </div>
  );
};

export default ShapePopoutStudy;

{/* <div>
<p>Did you see a different shape?</p>
<button type="button" onClick={() => handleResponse(true)}>Yes</button>
<button type="button" onClick={() => handleResponse(false)}>No</button>
</div> */}