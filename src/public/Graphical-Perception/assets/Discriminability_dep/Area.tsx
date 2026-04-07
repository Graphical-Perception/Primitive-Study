import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Square {
  id: number;
  x: number; // 정사각형의 시작 x 좌표
  y: number; // 정사각형의 시작 y 좌표
  size: number; // 정사각형의 한 변의 길이 (픽셀)
}

function generateSquares(randomNum: number): { squares: Square[]; distinctArea: number } {
  const areaTypes = randomNum;
  const sizeStep = Math.floor(100 / (areaTypes + 1)); // 등간격 크기
  const distinctSizes = Array.from({ length: areaTypes }, (_, i) => (i + 1) * sizeStep); // 등간격 크기 생성
  const totalSquares = 10; // 총 10개의 정사각형
  const squares: Square[] = [];

  const occupiedAreas: { x: number; y: number; size: number }[] = []; // 이미 점유된 영역 기록

  for (let i = 0; i < totalSquares; i++) {
    let x: number; let y: number; let isValidPosition: boolean;

    const size = distinctSizes[i % areaTypes]; // 크기 선택

    do {
      // x와 y를 화면 내에서 랜덤 생성 (여백을 고려)
      x = Math.floor(Math.random() * (500 - size - 20)) + 10; // 여백: 10px
      y = Math.floor(Math.random() * (400 - size - 20)) + 10; // 여백: 10px
      isValidPosition = true;

      // 기존 정사각형들과 겹치는지 확인
      for (const area of occupiedAreas) {
        if (
          x < area.x + area.size
          && x + size > area.x
          && y < area.y + area.size
          && y + size > area.y
        ) {
          isValidPosition = false;
          break;
        }
      }
    } while (!isValidPosition);

    // 위치가 유효하다면 추가
    occupiedAreas.push({ x, y, size });
    squares.push({
      id: i,
      x,
      y,
      size,
    });
  }

  return { squares, distinctArea: distinctSizes.length };
}

const AreaDiscriminabilityStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {


  const { taskid, test, time_limit } = parameters;
  const randomNum = parameters[taskid]


  const { squares, distinctArea } = generateSquares(randomNum);
  const [showSquares, setShowSquares] = useState<boolean>(true); // 정사각형 표시 여부

  useEffect(() => {
    const timer = setTimeout(() => setShowSquares(false), time_limit); // 5초 후에 정사각형 숨기기
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      {test &&
        <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>
          Answer:
          {' '}
          {distinctArea}
        </div>
      }

      <svg width="500" height="400" style={{ border: '1px solid black' }}>
        {showSquares ?
          <>
            {squares.map((square) => (
              <rect
                key={square.id}
                x={square.x}
                y={square.y}
                width={square.size}
                height={square.size}
                fill="lightgray"
                stroke="black"
                strokeWidth="2"
              />
            ))}
          </> :
          <foreignObject x="0" y="0" width="500" height="400">
            <div style={{ fontSize: '16px', textAlign: 'center' }}>
              <p>The squares are hidden now!</p>
              <p>How many distinct areas did you see?</p>
            </div>
          </foreignObject>
        }
      </svg>
    </div>
  );
};

export default AreaDiscriminabilityStudy;
