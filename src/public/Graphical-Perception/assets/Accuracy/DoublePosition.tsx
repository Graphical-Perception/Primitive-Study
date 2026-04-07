import React, { useEffect, useState, useCallback } from 'react';
import { StimulusParams } from '../../../../store/types';
import { random } from 'lodash';
import { r } from 'react-router/dist/development/fog-of-war-Ckdfl79L';

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
  const offsetRange = 50; // 어긋남 정도 (픽셀)
  const centerX = screenSize / 2;
  const centerY = screenSize / 2;

  let base = Math.random() * (1 - randomNum);

  let random1, random2;
  if (Math.random() > 0.5) {
    random1 = base;
    random2 = randomNum + base;
  }
  else {
    random2 = base;
    random1 = randomNum + base;
  }


  if (taskid === 'common-single-horizontal') {
    return [
      {
        id: 'line1', x1: centerX - lineLength / 2, y1: centerY - 50, x2: centerX + lineLength / 2, y2: centerY - 50, points: [random1],
      },
      {
        id: 'line2', x1: centerX - lineLength / 2, y1: centerY + 50, x2: centerX + lineLength / 2, y2: centerY + 50, points: [random2],
      },
    ];
  } if (taskid === 'common-single-vertical') {
    return [
      {
        id: 'line1', x1: centerX - 50, y1: centerY - lineLength / 2, x2: centerX - 50, y2: centerY + lineLength / 2, points: [random1],
      },
      {
        id: 'line2', x1: centerX + 50, y1: centerY - lineLength / 2, x2: centerX + 50, y2: centerY + lineLength / 2, points: [random2],
      },
    ];
  } if (taskid === 'common-double-horizontal') {
    return [
      {
        id: 'line1', x1: centerX - lineLength / 2, y1: centerY, x2: centerX + lineLength / 2, y2: centerY, points: [random1, random2],
      },
    ];
  } if (taskid === 'common-double-vertical') {
    return [
      {
        id: 'line1', x1: centerX, y1: centerY - lineLength / 2, x2: centerX, y2: centerY + lineLength / 2, points: [random1, random2],
      },
    ];
  } if (taskid === 'unaligned-horizontal') {
    const offset = Math.random() * offsetRange + 50 / 2; // 어긋난 범위 : 50 ~ 100
    return [
      {
        id: 'line1', x1: centerX - lineLength / 2 - offset, y1: centerY - 50, x2: centerX + lineLength / 2 - offset, y2: centerY - 50, points: [random1],
      },
      {
        id: 'line2', x1: centerX - lineLength / 2 + offset, y1: centerY + 50, x2: centerX + lineLength / 2 + offset, y2: centerY + 50, points: [random2],
      },
    ];
  } if (taskid === 'unaligned-vertical') {
    const offset = (Math.random() * offsetRange + 50) / 2; // 어긋난 범위 : 50 ~ 100
    return [
      {
        id: 'line1', x1: centerX - 50, y1: centerY - lineLength / 2 - offset, x2: centerX - 50, y2: centerY + lineLength / 2 - offset, points: [random1],
      },
      {
        id: 'line2', x1: centerX + 50, y1: centerY - lineLength / 2 + offset, x2: centerX + 50, y2: centerY + lineLength / 2 + offset, points: [random2],
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
    setLines(generateLines(taskid, size, randomNum / 100));
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
            {`taskid: ${taskid}`}
            <tspan x="10" dy="20">Line length : 300 pixels</tspan>
            <tspan x="10" dy="20">Points : </tspan>
            {lines.flatMap((line) => line.points.map((point, index) => (
              <tspan key={`${line.id}-point-${index}`} dx={10}>
                {`${(point * 100).toFixed(0)}%`}
              </tspan>
            )))}
            {lines.length !== 0 && (
              lines.length === 2 ? (
                <tspan x="10" dy="20" fill="red">
                  Difference:
                  {' '}
                  {(Math.abs(lines[0].points[0] - lines[1].points[0]) * 100).toFixed(2)}
                  %
                </tspan>
              )
                : (
                  <tspan x="10" dy="20" fill="red">
                    Difference:
                    {' '}
                    {(Math.abs(lines[0].points[0] - lines[0].points[1]) * 100).toFixed(2)}
                    %
                  </tspan>
                )
            )}
            {taskid.includes('unaligned') && (
              lines.length === 2 && (
                <tspan x="10" dy="20">
                  {taskid.includes('horizontal')
                    ? `OffsetX: ${Math.abs(lines[0].x1 - lines[1].x1).toFixed(2)} pixels`
                    : `OffsetY: ${Math.abs(lines[0].y1 - lines[1].y1).toFixed(2)} pixels`}
                </tspan>
              )
            )}
          </text>
        }
      </svg>
    </div>
  );
};

export default PositionAccuracyExperiment;
