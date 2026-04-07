import React, { useEffect, useState, useCallback } from 'react';
import { StimulusParams } from '../../../../store/types';

interface LinePair {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lengthMultiplier: number; // 비교 선분의 길이 배율
}

function generateLinePairs(taskid: string, screenSize: number, randomNum: number): LinePair[] {
  // const baseLength = Math.random() * 100 + 100; // 기준 선분 길이
  const baseLength = 20;
  const margin = taskid.includes('unaligned') ? 125 : 50; // 여백
  const offset = taskid.includes('unaligned') ? 100 : 0; // 어긋남 설정
  const lengthMultiplier = randomNum;
  const centerX = screenSize / 2;
  const centerY = screenSize / 2;

  if (taskid === 'aligned-horizontal') {
    return [
      {
        id: 'base-line',
        x1: margin,
        y1: centerY + 25,
        x2: margin + baseLength,
        y2: centerY + 25,
        lengthMultiplier: 1,
      },
      {
        id: 'compare-line',
        x1: margin,
        y1: centerY - 25,
        x2: margin + baseLength * lengthMultiplier,
        y2: centerY - 25,
        lengthMultiplier,
      },
    ];
  } if (taskid === 'aligned-vertical') {
    return [
      {
        id: 'base-line',
        x1: centerX - 25,
        y1: screenSize - margin - baseLength,
        x2: centerX - 25,
        y2: screenSize - margin, // 아래쪽을 고정
        lengthMultiplier: 1,
      },
      {
        id: 'compare-line',
        x1: centerX + 25,
        y1: screenSize - margin - baseLength * lengthMultiplier,
        x2: centerX + 25,
        y2: screenSize - margin, // 아래쪽을 고정
        lengthMultiplier,
      },
    ];
  } if (taskid === 'unaligned-horizontal-length') {
    return [
      {
        id: 'base-line',
        x1: margin,
        y1: centerY + 25,
        x2: margin + baseLength,
        y2: centerY + 25,
        lengthMultiplier: 1,
      },
      {
        id: 'compare-line',
        x1: margin + offset,
        y1: centerY - 25,
        x2: margin + offset + baseLength * lengthMultiplier,
        y2: centerY - 25,
        lengthMultiplier,
      },
    ];
  } if (taskid === 'unaligned-vertical-length') {
    return [
      {
        id: 'base-line',
        x1: centerX - 25,
        y1: screenSize - margin,
        x2: centerX - 25,
        y2: screenSize - margin - baseLength,
        lengthMultiplier: 1,
      },
      {
        id: 'compare-line',
        x1: centerX + 25,
        y1: screenSize - margin - offset, // 위쪽 시작점 어긋남
        x2: centerX + 25,
        y2: screenSize - margin - offset - baseLength * lengthMultiplier, // 길이 배율 반영
        lengthMultiplier,
      },
    ];
  }
  return [];
}

const LineLengthComparison: React.FC<StimulusParams<any>> = ({
  parameters,
  setAnswer,
}) => {
  const { taskid, test } = parameters;
  const randomNum = parameters[taskid]

  const [lines, setLines] = useState<LinePair[]>([]);
  const screenSize = 500;

  useEffect(() => {
    setLines(generateLinePairs(taskid, screenSize, randomNum));
  }, [taskid]);

  const handleResponse = useCallback(
    () => {
      setAnswer({
        status: true,
        answers: {
          [taskid]: lines[1].lengthMultiplier, // 비교 선분의 배율 반환
        },
      });
    },
    [setAnswer, taskid, lines],
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <svg width={screenSize} height={screenSize} onClick={handleResponse} style={{ border: '1px solid black', cursor: 'pointer' }}>
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.id === 'base-line' ? 'blue' : 'red'}
            strokeWidth="4"
          />
        ))}

        {test &&
          <text x="10" y="30" fontSize="14" fill="black">
            {`taskid: ${taskid}.`}
            <tspan x="10" dy="20">Baselinelength : 150 pixels</tspan>
            {lines.length !== 0
              && (
                <tspan x="10" dy="20" fill="red">
                  Ratio:
                  {' '}
                  {lines[1].lengthMultiplier.toFixed(2)}
                </tspan>
              )}
            {lines.length === 2 && taskid.includes('unaligned')
              && (
                taskid.includes('horizontal')
                  ? (
                    <tspan x="10" dy="20">
                      Offset:
                      {' '}
                      {Math.round(lines[1].x1 - lines[0].x1)}
                    </tspan>
                  )
                  : (
                    <tspan x="10" dy="20">
                      Offset:
                      {' '}
                      {Math.round(lines[0].y1 - lines[1].y1)}
                    </tspan>
                  )
              )}

          </text>
        }
      </svg>
    </div>
  );
};

export default LineLengthComparison;
