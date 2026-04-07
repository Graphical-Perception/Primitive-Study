import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';

interface Arc {
  id: number;
  curvature: number; // 곡률 각도 (1° ~ 359°)
  startX: number; // 시작점 x 좌표
  endX: number; // 끝점 x 좌표
  cy: number; // 고정된 y 좌표
}

function generateArcs(randomNum: number): { arcs: Arc[]; distinctCurvatures: number } {
  const curvatureTypes = randomNum; // 고유 곡률 종류 수
  const distinctCurvatures = Array.from(
    { length: curvatureTypes },
    (_, i) => Math.floor((i + 1) * (180 / (curvatureTypes + 1))), // 등간격 곡률 생성 (0 ~ 360)
  );
  const totalArcs = 20; // 총 10개의 호
  const arcs: Arc[] = [];
  const occupiedAreas: { startX: number; endX: number; cy: number }[] = []; // 점유된 영역 기록

  for (let i = 0; i < totalArcs; i++) {
    let startX: number; let endX: number; let cy: number; let
      isValidPosition: boolean;
    const curvature = distinctCurvatures[i % curvatureTypes]; // 곡률 선택

    do {
      // 두 고정된 점의 x 좌표와 y 좌표를 화면 내에서 랜덤 생성 (여백 고려)
      startX = Math.floor(Math.random() * 400) + 50; // 시작점 x 좌표 (50 ~ 450)
      endX = startX + 50; // 끝점 x 좌표 (고정 간격 50px)
      cy = Math.floor(Math.random() * 300) + 50; // y 좌표 (50 ~ 350)
      isValidPosition = true;

      // 기존 호들과 겹치는지 확인
      for (const area of occupiedAreas) {
        if (
          Math.abs(cy - area.cy) < 60 // y 좌표 간격
          && ((startX >= area.startX && startX <= area.endX) // x 좌표 겹침 확인
            || (endX >= area.startX && endX <= area.endX))
        ) {
          isValidPosition = false;
          break;
        }
      }
    } while (!isValidPosition);

    // 위치가 유효하다면 추가
    occupiedAreas.push({ startX, endX, cy });
    arcs.push({
      id: i, curvature, startX, endX, cy,
    });
  }

  return { arcs, distinctCurvatures: distinctCurvatures.length };
}

const CurvatureDiscriminabilityStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {

  const { taskid, test, time_limit } = parameters;
  const randomNum = parameters[taskid]

  const { arcs, distinctCurvatures } = generateArcs(randomNum);
  const [showArcs, setShowArcs] = useState<boolean>(true); // 호 표시 여부

  useEffect(() => {
    const timer = setTimeout(() => setShowArcs(false), time_limit); // 5초 후에 호 숨기기
    return () => clearTimeout(timer);
  }, []);

  const generateArcPath = (arc: Arc) => {
    const {
      startX, endX, cy, curvature,
    } = arc;
    const chordLength = Math.abs(endX - startX); // 두 점 사이의 거리
    const curvatureRadians = (curvature * Math.PI) / 180; // 곡률을 라디안으로 변환
    const radius = chordLength / (2 * Math.sin(curvatureRadians / 2)); // 반지름 계산

    const x1 = startX;
    const y1 = cy;
    const x2 = endX;
    const y2 = cy;

    const largeArcFlag = curvature > 180 ? 1 : 0; // 중심각이 180°를 넘으면 largeArcFlag를 1로 설정
    const sweepFlag = 1; // 시계 방향으로 호를 그리도록 설정

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      <svg width="500" height="400" style={{ border: '1px solid black' }}>

        {showArcs ? <>
          {arcs.map((arc) => (
            <g key={arc.id}>
              {/* 곡률 호 */}
              <path
                d={generateArcPath(arc)}
                fill="none"
                stroke="black"
                strokeWidth="2"
              />
              {/* 고정된 점들 */}
              {/* <circle cx={arc.startX} cy={arc.cy} r="3" fill="blue" />
              <circle cx={arc.endX} cy={arc.cy} r="3" fill="blue" /> */}
            </g>
          ))}
        </> :

          <foreignObject x="0" y="0" width="500" height="400">
            <div style={{ fontSize: '16px', textAlign: 'center' }}>
              <p>The arcs are hidden now!</p>
              <p>How many distinct curvatures did you see?</p>
            </div>
          </foreignObject>
        }
      </svg>
      {test &&
        <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>
          Answer:
          {' '}
          {distinctCurvatures}
        </div>
      }
    </div>
  );
};

export default CurvatureDiscriminabilityStudy;
