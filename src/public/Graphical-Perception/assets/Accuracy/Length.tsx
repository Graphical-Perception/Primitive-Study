import React, { useEffect, useState } from 'react';
import { StimulusParams } from '../../../../store/types';
import DrawElement from '../DrawElement';

const LineLengthComparison: React.FC<StimulusParams<any>> = ({ parameters }) => {
  const { taskid, test } = parameters;
  const randomNum = parameters[taskid];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {test && <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>Answer: {randomNum}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', gap: '20px' }}>
        <DrawElement length={randomNum} tilt={taskid.includes('horizontal') ? 0 : 90} />
      </div>
    </div>
  );
};

export default LineLengthComparison;