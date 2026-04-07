import React, { useEffect, useState, useCallback } from 'react';
import { StimulusParams } from '../../../../store/types';
import { random } from 'lodash';

interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  points: number[];
}

function generateLines(taskid: string, screenSize: number, randomNum: number): Line[] {
  const lineLength = 300; // 선분 길이
  const margin = 20; // 여백
  const centerX = screenSize / 2;
  const centerY = screenSize / 2;

  if (taskid === 'single-h') {
    return [
      {
        id: 'line1', x1: centerX - lineLength / 2, y1: centerY, x2: centerX + lineLength / 2, y2: centerY, points: [randomNum / 100],
      },
      {
        id: 'line1', x1: centerX - lineLength / 2, y1: centerY - margin, x2: centerX - lineLength / 2, y2: centerY + margin, points: [],
      },
    ];
  } if (taskid === 'single-v') {
    return [
      {
        id: 'line1', x1: centerX, y1: centerY + lineLength / 2, x2: centerX, y2: centerY - lineLength / 2, points: [randomNum / 100],
      },
      {
        id: 'line1', x1: centerX - margin, y1: centerY + lineLength / 2, x2: centerX + margin, y2: centerY + lineLength / 2, points: [],
      },
    ];
  }
  return [];
}

const PositionAccuracyExperiment: React.FC<StimulusParams<any>> = ({
  parameters,
  setAnswer,
}) => {
  const { taskid, test } = parameters;
  const randomNum = parameters[taskid]

  const [lines, setLines] = useState<Line[]>([]);
  const size = 500;

  useEffect(() => {
    setLines(generateLines(taskid, size, randomNum));
  }, [taskid, size]);


  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <svg width={size} height={size} style={{ border: '1px solid black', cursor: 'pointer' }}>
        {/* 선분 */}
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="black"
            strokeWidth="2"
          />
        ))}

        {/* 점 */}
        {lines.flatMap((line) => line.points.map((point, index) => (
          <circle
            key={`${line.id}-point-${index}`}
            cx={line.x1 + point * (line.x2 - line.x1)}
            cy={line.y1 + point * (line.y2 - line.y1)}
            r="6"
            fill="red"
          />
        )))}

        {/* 설명 */}
        {test &&
          <text x="10" y="30" fontSize="14" fill="black">
            {`Mode: ${taskid}`}
            <tspan x="10" dy="20">Line length : 300 pixels</tspan>
            <tspan x="10" dy="20" fill="red">Ratio : </tspan>
            {lines.flatMap((line) => line.points.map((point, index) => (
              <tspan key={`${line.id}-point-${index}`} dx={10} fill="red">
                {`${(point * 100).toFixed(0)}%`}
              </tspan>
            )))}
          </text>
        }
      </svg>
    </div>
  );
};

export default PositionAccuracyExperiment;
