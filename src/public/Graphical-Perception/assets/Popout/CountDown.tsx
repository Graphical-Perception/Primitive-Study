
import { Divider } from '@mantine/core';
const CountDown = ({ countdown, task }: { countdown: number, task?: string }) => {
  return (
    <foreignObject x="0" y="0" width="500" height="400">
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        width: '100%', height: '100%', fontSize: '24px', fontWeight: 'bold', color: 'red',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      }}>
        <div style={{ marginTop: '20px', fontSize: '25px', color: 'black' }}>
          Find a different <span style={{ fontSize: '45px', color: 'red' }}>{task}</span>.
        </div>
        <Divider my="xs" />
        <div style={{ marginBottom: '10px', fontSize: '28px', color: 'black' }}>
          Starting in
        </div>
        <div style={{
          fontSize: '48px', fontWeight: 'bold', color: '#ff4500',
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          opacity: countdown > 0 ? 1 : 0,
          transform: countdown > 0 ? 'scale(1)' : 'scale(0.8)',
        }}>
          {countdown}
        </div>
        <div style={{ marginTop: '10px', fontSize: '28px', color: 'black' }}>
          Second{countdown !== 1 ? 's' : ''}
        </div>
      </div>
    </foreignObject>
  )
}

export default CountDown;