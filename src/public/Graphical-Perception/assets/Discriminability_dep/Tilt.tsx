import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Line {
  id: number;
  x: number; // 선분 시작점 x 좌표
  y: number; // 선분 시작점 y 좌표
  baseAngle?: number; // 기준선 기울기 (0° ~ 180°)
  angle: number; // 기울기 또는 각도 (0° ~ 180°)
  length: number; // 선분 길이
}

interface StudyProps {
  taskid: 'angle-disc' | 'tilt-disc' | 'parallel-angle-disc'; // 모드 선택
}

function generateLines(taskid: 'angle-disc' | 'tilt-disc' | 'parallel-angle-disc', randomNum: number): { lines: Line[], distinctAngles: number } {
  const angleTypes = randomNum; // 각도 종류 수
  const angleStep = Math.floor(165 / (angleTypes + 1)); // 등간격 각도
  const distinctAngles = Array.from({ length: angleTypes }, (_, i) => (i + 1) * angleStep); // 등간격 각도 생성
  const totalLines = 30; // 총 30개의 선분
  const lines: Line[] = [];

  const occupiedAreas: { x: number; y: number; radius: number }[] = []; // 이미 점유된 영역 기록

  for (let i = 0; i < totalLines; i++) {
    let x: number; let y: number; let angle: number; let baseAngle: number; let isValidPosition: boolean;

    const length = 30; // 선분 길이 고정 (30px)

    do {
      // x와 y를 화면 내에서 랜덤 생성 (여백 포함)
      x = Math.random() * (500 - length * 2) + length; // x 좌표 (30px 여백 포함)
      y = Math.random() * (400 - length * 2) + length; // y 좌표 (30px 여백 포함)
      isValidPosition = true;

      // 기존 점유된 영역과의 거리 확인
      for (const area of occupiedAreas) {
        const distance = Math.sqrt((x - area.x) ** 2 + (y - area.y) ** 2);
        if (distance < area.radius + length) {
          isValidPosition = false;
          break;
        }
      }
    } while (!isValidPosition);

    // 위치가 유효하면 점유된 영역으로 추가
    occupiedAreas.push({ x, y, radius: length });

    if (taskid === 'angle-disc') {
      baseAngle = Math.random() * 181; // 기준선 기울기 (0° ~ 180°)
      angle = distinctAngles[i % angleTypes]; // 각도 선택
      lines.push({
        id: i,
        x,
        y,
        baseAngle,
        angle,
        length,
      });
    } else if (taskid === 'parallel-angle-disc') {
      baseAngle = 0; // 기준선은 항상 수평
      angle = distinctAngles[i % angleTypes]; // 각도 선택
      lines.push({
        id: i,
        x,
        y,
        baseAngle,
        angle,
        length,
      });
    } else {
      angle = distinctAngles[i % angleTypes]; // 각도 선택
      lines.push({
        id: i,
        x,
        y,
        angle,
        length,
      });
    }
  }

  return { lines, distinctAngles: distinctAngles.length };
}

const DiscriminabilityStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {

  const { taskid, test, time_limit } = parameters;
  const randomNum = parameters[taskid]

  const { lines, distinctAngles } = generateLines(taskid, randomNum);
  const [showLines, setShowLines] = useState<boolean>(true); // 선분 표시 여부

  useEffect(() => {
    const timer = setTimeout(() => setShowLines(false), time_limit); // 5초 후에 선분 숨기기
    return () => clearTimeout(timer);
  }, [taskid]);

  const generateLinePath = (x: number, y: number, angle: number, length: number) => {
    // 각도를 라디안으로 변환
    const radians = (angle * Math.PI) / 180;

    // 선분 끝점 계산
    const x2 = x + Math.cos(radians) * length;
    const y2 = y - Math.sin(radians) * length;

    return { x2, y2 };
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      {test &&
        <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>
          Answer:
          {' '}
          {distinctAngles}
        </div>
      }
      <svg width="500" height="400" style={{ border: '1px solid black' }}>

        {showLines ?
          <>
            {lines.map((line) => {
              const {
                x, y, baseAngle, angle, length,
              } = line;

              if (taskid === 'angle-disc' && baseAngle !== undefined) {
                // 기준선 및 기울어진 선 생성
                const line1 = generateLinePath(x, y, baseAngle, length); // 기준선
                const line2 = generateLinePath(x, y, baseAngle + angle, length); // 기울어진 선
                return (
                  <g key={line.id}>
                    <line x1={x} y1={y} x2={line1.x2} y2={line1.y2} stroke="black" strokeWidth="2" />
                    <line x1={x} y1={y} x2={line2.x2} y2={line2.y2} stroke="black" strokeWidth="2" />
                  </g>
                );
              }

              if (taskid === 'parallel-angle-disc' && baseAngle !== undefined) {
                // 수평 기준선 및 기울어진 선 생성
                const line1 = generateLinePath(x, y, baseAngle, length); // 수평 기준선
                const line2 = generateLinePath(x, y, baseAngle + angle, length); // 기울어진 선
                return (
                  <g key={line.id}>
                    <line x1={x} y1={y} x2={line1.x2} y2={line1.y2} stroke="black" strokeWidth="2" />
                    <line x1={x} y1={y} x2={line2.x2} y2={line2.y2} stroke="black" strokeWidth="2" />
                  </g>
                );
              }

              if (taskid === 'tilt-disc') {
                // 기울어진 선만 생성
                const linePath = generateLinePath(x, y, angle, length);
                return (
                  <g key={line.id}>
                    <line x1={x} y1={y} x2={linePath.x2} y2={linePath.y2} stroke="black" strokeWidth="2" />
                  </g>
                );
              }

              return null;
            })}
          </> :
          <foreignObject x="0" y="0" width="500" height="400">
            <div style={{ fontSize: '16px', textAlign: 'center' }}>
              <p>The lines are hidden now!</p>
              <p>How many distinct angles did you see?</p>
            </div>
          </foreignObject>
        }
      </svg>

    </div >
  );
};

export default DiscriminabilityStudy;
