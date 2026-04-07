import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Line {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number; // 선분 길이
}

function generateLines(randomNum: number): { lines: Line[]; distinctLengths: number } {
  const lengthTypes = randomNum;
  const distinctLengths = Array.from({ length: lengthTypes }, (_, i) => 50 + i * 20); // 50부터 시작하여 20씩 증가하는 길이
  const totalLines = Math.floor(Math.random() * 10) + 10; // 10~19개의 선분
  const lines: Line[] = [];

  const usedPositions: { x: number; y: number }[] = []; // 겹치지 않도록 위치 기록

  for (let i = 0; i < totalLines; i++) {
    let x1: number; let y1: number; let
      length: number;
    do {
      x1 = Math.floor(Math.random() * 300) + 50; // x 위치(50~450)
      y1 = Math.floor(Math.random() * 300) + 50; // y 위치(50~350)
      length = distinctLengths[i % lengthTypes];

    } while (
      // eslint-disable-next-line no-loop-func
      usedPositions.some((pos) => Math.abs(pos.x - x1) < length && Math.abs(pos.y - y1) < 20) // 겹치지 않도록
    );

    usedPositions.push({ x: x1, y: y1 });

    const x2 = Math.min(x1 + length, 500); // 선분이 화면을 벗어나지 않도록 조정
    const y2 = y1;

    lines.push({
      id: i,
      x1,
      y1,
      x2,
      y2,
      length,
    });
  }

  return { lines, distinctLengths: distinctLengths.length };
}

const LengthDiscriminabilityStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {

  const { taskid, test, time_limit } = parameters;
  const randomNum = parameters[taskid]

  const { lines, distinctLengths } = generateLines(randomNum);
  const [showLines, setShowLines] = useState<boolean>(true); // 선분 표시 여부

  useEffect(() => {
    const timer = setTimeout(() => setShowLines(false), time_limit); // 5초 후에 선분 숨기기
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      <svg width="500" height="400" style={{ border: '1px solid black' }}>

        {showLines ? (
          <>
            {/* 선분 표시 */}
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
          </>
        ) : (
          <foreignObject x="0" y="0" width="500" height="400">
            <div style={{ fontSize: '18px', textAlign: 'center', backgroundColor: 'white' }}>
              <p>The lines are hidden now!</p>
              <p>How many distinct lengths did you see?</p>
            </div>
          </foreignObject>
        )}
      </svg>

      {test &&
        <div style={{ fontSize: '18px', color: 'red', marginTop: '10px' }}>
          Answer:
          {' '}
          {distinctLengths}
        </div>
      }
    </div>
  );
};

export default LengthDiscriminabilityStudy;
