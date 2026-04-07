import React, { useEffect, useState, useCallback } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function generateLines(randomNum: number): { baseLine: Line; angleLine: Line; angle: number } {
  const centerX = 250; // 화면 중앙 x 좌표
  const centerY = 250; // 화면 중앙 y 좌표
  const lineLength = 150; // 선분 길이
  const baseAngle = Math.random() * 180; // 기준 선분의 각도 (0° ~ 180° 랜덤)
  // const angleDifference = Math.random() * 180; // 두 선분 사이의 각도 (0° ~ 180° 랜덤)
  const angleDifference = randomNum

  // 기준 선분의 끝점 계산
  const baseRadians = (baseAngle * Math.PI) / 180;
  const baseLine: Line = {
    id: 'base-line',
    x1: centerX,
    y1: centerY,
    x2: centerX + lineLength * Math.cos(baseRadians),
    y2: centerY - lineLength * Math.sin(baseRadians),
  };

  // 교차 선분의 끝점 계산
  const angleRadians = ((baseAngle + angleDifference) * Math.PI) / 180;
  const angleLine: Line = {
    id: 'angle-line',
    x1: centerX,
    y1: centerY,
    x2: centerX + lineLength * Math.cos(angleRadians),
    y2: centerY - lineLength * Math.sin(angleRadians),
  };

  return { baseLine, angleLine, angle: angleDifference };
}

const AnglePrediction: React.FC<StimulusParams<any>> = ({
  parameters,
  setAnswer,
}) => {
  const { taskid, test } = parameters;
  const randomNum = parameters[taskid]

  const [lines, setLines] = useState<{ baseLine: Line; angleLine: Line; angle: number } | null>(null);

  useEffect(() => {
    setLines(generateLines(randomNum));
  }, []);

  const handleResponse = useCallback(() => {
    if (lines) {
      setAnswer({
        status: true,
        answers: {
          [taskid]: lines.angle, // 실제 각도를 저장
        },
      });
    }
  }, [lines, setAnswer, taskid]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <svg width="500" height="500" style={{ border: '1px solid black', cursor: 'pointer' }} onClick={handleResponse}>
        {lines && (
          <>
            {/* 기준 선분 */}
            <line
              x1={lines.baseLine.x1}
              y1={lines.baseLine.y1}
              x2={lines.baseLine.x2}
              y2={lines.baseLine.y2}
              stroke="black"
              strokeWidth="4"
            />
            {/* 교차 선분 */}
            <line
              x1={lines.angleLine.x1}
              y1={lines.angleLine.y1}
              x2={lines.angleLine.x2}
              y2={lines.angleLine.y2}
              stroke="black"
              strokeWidth="4"
            />
          </>
        )}
        {/* 설명 텍스트 */}
        {test &&
          <text x="10" y="30" fontSize="14" fill="black">
            Predict the angle between the two black lines.
            <tspan x="10" dy="20" fill="red">
              Angle:
              {' '}
              {Math.round(lines?.angle || 0)}
            </tspan>
          </text>
        }
      </svg>
    </div>
  );
};

export default AnglePrediction;
