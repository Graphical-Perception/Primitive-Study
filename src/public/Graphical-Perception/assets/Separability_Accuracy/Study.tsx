import React, { useEffect } from 'react';
import DrawElement from '../DrawElement';
import { StimulusParams } from '../../../../store/types';

const DiscriminabilityStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, seperable, compared } = parameters;
  const randomNum = parameters[taskid];
  const [randomProp, setRandomProp] = React.useState<Record<string, number | number[]>>({});

  // DrawElement에 전달할 props 구성
  const getProps = (taskid: string, randomNum: number) => {
    const props: Record<string, number | number[]> = {};
    const value = randomNum;

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

    if (taskid.includes('area') && compared == 'tilt') {
      props[compared] = Math.random() * 45; //0 ~ 45;
    }
    else if (taskid.includes('tilt') && compared == 'area') {
      props[compared] = Math.random() * 50; //0 ~ 50;
    }
    else if (compared == 'area') {
      props[compared] = Math.random() * 100; //0 ~ 100;
    }
    else if (compared == 'tilt' || compared == 'curvature') {
      props[compared] = Math.random() * 180; //0 ~ 180;
    }
    else if (compared == 'position') {
      if (taskid.includes('length')) {
        props[compared] = [Math.random() * (100 - value) + value / 2, Math.random() * 100]
      }
      else if (taskid.includes('area')) {
        const length_of_area = Math.sqrt(value / 100) * 100;
        props[compared] = [Math.random() * (100 - length_of_area) + length_of_area / 2, Math.random() * (100 - length_of_area) + length_of_area / 2]
      }
    }
    else {
      props[compared] = Math.random() * 100; //0 ~100
    }


    return props;
  };

  useEffect(() => {
    setRandomProp(getProps(taskid, randomNum));
  }, [taskid, randomNum, compared]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {test && <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>Answer: {randomNum}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', gap: '20px' }}>
        <DrawElement {...randomProp} />
      </div>
      <div style={{ marginTop: '10px', fontSize: '16px', color: 'gray', textAlign: 'left', alignSelf: 'flex-start' }}>
        ※ Only consider the elements related to {taskid}. Ignore all others.
      </div>
    </div>
  );
};

export default DiscriminabilityStudy;