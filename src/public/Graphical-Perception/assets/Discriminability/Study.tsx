import React from 'react';
import DrawElement from '../DrawElement';
import { StimulusParams } from '../../../../store/types';

const DiscriminabilityStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test } = parameters;
  const randomNum = parameters[taskid];

  if (!Array.isArray(randomNum) || randomNum.length !== 2) {
    throw new Error('randomNum must be an array of two numbers');
  }

  const task_name = ((taskid: string) => {
    if (taskid.includes('length')) return 'Length';
    if (taskid.includes('tilt')) return 'Tilt';
    if (taskid.includes('area')) return 'Area';
    if (taskid.includes('curvature')) return 'Curvature';
    if (taskid.includes('saturation')) return 'Saturation';
    if (taskid.includes('luminance')) return 'Luminance';
  })(taskid);

  // DrawElement에 전달할 props 구성
  const getProps = (taskid: string, value: number) => {
    const props: Record<string, number> = {};

    if (taskid.includes('length')) props.length = value;
    if (taskid.includes('tilt')) props.tilt = value;
    if (taskid.includes('area')) props.area = value;
    if (taskid.includes('curvature')) props.curvature = value;
    if (taskid.includes('saturation')) {
      props.saturation = value;
      props.area = 25;
    }
    if (taskid.includes('luminance')) {
      props.luminance = value;
      props.area = 25;
    }

    return props;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <div style={{ textAlign: 'center', fontSize: '30px', marginBottom: '10px' }}>
        Are the two elements the <br />
        <span style={{ color: 'red', fontWeight: 'bold' }}>SAME {task_name}?</span>
      </div>

      {test && <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>Answer: {randomNum}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', gap: '20px' }}>
        <DrawElement {...getProps(taskid, randomNum[0])} />
        <DrawElement {...getProps(taskid, randomNum[1])} />
      </div>
    </div>
  );
};

export default DiscriminabilityStudy;