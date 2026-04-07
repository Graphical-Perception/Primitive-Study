import React from 'react';
import DrawElement from '../DrawElement';
import { StimulusParams } from '../../../../store/types';

const Separability_Default_Value = [25, 75]
const Separability_Default_Tilt_Curvature = [45, 135]

const DiscriminabilityStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, seperable, compared } = parameters;
  const randomNum = parameters[taskid];

  if (!Array.isArray(randomNum) || randomNum.length !== 2) {
    throw new Error('randomNum must be an array of two numbers');
  }

  // DrawElement에 전달할 props 구성
  const getProps = (taskid: string, randomNum: number[], index: number) => {
    const props: Record<string, number | number[]> = {};
    const value = randomNum[index];

    if (taskid.includes('length')) props.length = value;
    if (taskid.includes('tilt')) props.tilt = value;
    if (taskid.includes('area')) props.area = value;
    if (taskid.includes('curvature')) props.curvature = value;
    if (taskid.includes('saturation')) {
      props.saturation = value;
    }
    if (taskid.includes('luminance')) {
      props.luminance = value;
    }

    if (compared == 'area') {
      props[compared] = 25;
    }
    else if (taskid.includes('area') && compared == 'tilt') {
      props[compared] = Separability_Default_Tilt_Curvature[index] / 4;
    }
    else if (taskid.includes('tilt') && compared == 'area') {
      props[compared] = Separability_Default_Value[index] / 2;
    }
    else if (compared == 'tilt' || compared == 'curvature') {
      props[compared] = Separability_Default_Tilt_Curvature[index];
    }
    else if (compared == 'position') {
      props[compared] = [Math.random() * 50 + 25, Math.random() * 50 + 25];
    }
    else {
      props[compared] = Separability_Default_Value[index];
    }


    return props;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {test && <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>Answer: {randomNum}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', gap: '20px' }}>
        <DrawElement {...getProps(taskid, randomNum, 0)} />
        <DrawElement {...getProps(taskid, randomNum, 1)} />
      </div>
    </div>
  );
};

export default DiscriminabilityStudy;