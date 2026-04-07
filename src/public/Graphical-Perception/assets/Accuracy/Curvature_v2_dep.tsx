import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';


const CurvatureStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {

  const { taskid, test } = parameters;
  const randomNum = parameters[taskid]
  const startAngle = Math.floor(Math.random() * 360); // 0° ~ 359° 사이의 랜덤 시작 각도



  const generateArcPath = () => {
    const centerX = 250; // 원의 중심 x 좌표
    const centerY = 250; // 원의 중심 y 좌표
    const radius = 100; // 원의 반지름

    const toRadians = (angle: number) => (angle * Math.PI) / 180;

    // 시작 각도와 끝 각도 계산
    const endAngle = (startAngle + randomNum) % 360;

    // 시작 점 좌표
    const startX = centerX + radius * Math.cos(toRadians(startAngle));
    const startY = centerY - radius * Math.sin(toRadians(startAngle));

    // 끝 점 좌표
    const endX = centerX + radius * Math.cos(toRadians(endAngle));
    const endY = centerY - radius * Math.sin(toRadians(endAngle));

    const largeArcFlag = randomNum > 180 ? 1 : 0;

    // SVG 호 경로
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px',
    }}
    >
      <>
        {/* Target Arc */}
        <svg width="500" height="500" style={{ border: '1px solid black' }}>
          {/* 원의 중심 */}
          {/* <circle cx="250" cy="250" r="5" fill="blue" /> */}
          {/* 호 */}
          <path d={generateArcPath()} fill="none" stroke="red" strokeWidth="2" />
        </svg>

        {/* 설명 텍스트 */}
        {test &&
          <>
            <div style={{ fontSize: '14px', marginTop: '20px' }}>
              The red arc starts at a random angle and has a curvature between 1° and 359°.
            </div>
            <div style={{ fontSize: '14px', marginTop: '20px' }}>
              Start Angle:
              {' '}
              {startAngle}
              °
            </div>
            <div style={{ fontSize: '14px', marginTop: '5px', color: 'red' }}>
              Curvature:
              {' '}
              {randomNum}
              °
            </div>
          </>
        }
      </>
    </div>
  );
};

export default CurvatureStudy;
