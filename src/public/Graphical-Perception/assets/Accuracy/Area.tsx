import React, { useEffect, useState, useCallback } from 'react';
import { StimulusParams } from '../../../../store/types';
import { random } from 'lodash';
import DrawElement from '../DrawElement';

const AreaComparison: React.FC<StimulusParams<any>> = ({ parameters, setAnswer }) => {

  const { taskid, test } = parameters;
  const randomNum = parameters[taskid]



  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {test && <div style={{ fontSize: '18px', color: 'red', marginBottom: '10px' }}>Answer: {randomNum}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', gap: '20px' }}>
        <DrawElement area={randomNum} />
      </div>
    </div>
  );
};

export default AreaComparison;
