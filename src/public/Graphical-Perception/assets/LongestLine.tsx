import { useCallback, useRef } from 'react';
import { StimulusParams } from '../../../store/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LongestLine({ parameters, setAnswer }: StimulusParams<any>) {
  const { taskid, lines } = parameters;
  const ref = useRef(null);

  const clickCallback = useCallback(
    (e: React.MouseEvent) => {
      // Get clicked line ID
      const target = e.target as SVGLineElement;
      const lineId = target.id;

      // Set answer in reVISit
      setAnswer({
        status: true,
        answers: {
          [taskid]: lineId,
        },
      });
    },
    [setAnswer, taskid],
  );

  return (
    <div
      className="Chart__wrapper"
      ref={ref}
      onClick={clickCallback}
      style={{ height: '650px' }}
    >
      <svg id="longest_line_svg" width={600} height={400} style={{ border: '1px solid black' }}>
        {lines.map((line: { id: string; x1: number; y1: number; x2: number; y2: number; color: string }) => (
          <line
            key={line.id}
            id={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth="5"
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>
    </div>
  );
}

export default LongestLine;
