import React, { useEffect, useState, useCallback } from 'react';
import { StimulusParams } from '../../../../store/types';
import { random } from 'lodash';

interface Square {
  id: string;
  x: number;
  y: number;
  size: number; // 정사각형의 변 길이
}

function generateSquares(randomNum: number): { baseSquare: Square; compareSquare: Square; areaRatio: number } {
  const baseY = 350; // 두 정사각형의 아래쪽 y축 고정
  const baseSize = 30; // 기준 정사각형의 변 길이
  const areaRatio = randomNum;
  const compareSize = Math.sqrt(baseSize * baseSize * areaRatio); // 면적 비율로부터 변 길이를 계산

  return {
    baseSquare: {
      id: 'base-square',
      x: 100 - baseSize / 2, // 왼쪽 정사각형의 x 좌표
      y: baseY - baseSize, // 아래쪽 y축에 정렬
      size: baseSize,
    },
    compareSquare: {
      id: 'compare-square',
      x: 300 - compareSize / 2, // 오른쪽 정사각형의 x 좌표
      y: baseY - compareSize, // 아래쪽 y축에 정렬
      size: compareSize,
    },
    areaRatio,
  };
}

const AreaComparison: React.FC<StimulusParams<any>> = ({ parameters, setAnswer }) => {

  const { taskid, test } = parameters;
  const randomNum = parameters[taskid]

  const [squares, setSquares] = useState<{ baseSquare: Square; compareSquare: Square; areaRatio: number } | null>(null);

  useEffect(() => {
    setSquares(generateSquares(randomNum));
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <svg width="500" height="500" style={{ border: '1px solid black', cursor: 'pointer' }}>
        {squares && (
          <>
            {/* 기준 정사각형 */}
            <rect
              x={squares.baseSquare.x}
              y={squares.baseSquare.y}
              width={squares.baseSquare.size}
              height={squares.baseSquare.size}
              fill="black"
            />
            {/* 비교 정사각형 */}
            <rect
              x={squares.compareSquare.x}
              y={squares.compareSquare.y}
              width={squares.compareSquare.size}
              height={squares.compareSquare.size}
              fill="gray"
            />
          </>
        )}
        {/* 설명 텍스트 */}
        {test &&
          <text x="10" y="30" fontSize="14" fill="black">
            Predict the area ratio of the gray square to the black square
            <tspan x="10" dy="20" fill="red">
              Ratio:
              {' '}
              {(squares?.areaRatio || 0).toFixed(2)}
            </tspan>
          </text>
        }
      </svg>
    </div>
  );
};

export default AreaComparison;
