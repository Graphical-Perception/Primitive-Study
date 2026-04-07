import React from 'react';
import DrawElement from '../DrawElement';
import { StimulusParams } from '../../../../store/types';

const AccuracyStudy: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test, seperable } = parameters;
  const randomNum = parameters[taskid];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {test && <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>Answer: {randomNum}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', gap: '20px' }}>
        <DrawElement tilt={randomNum} />
      </div>
    </div>
  );
};

export default AccuracyStudy;