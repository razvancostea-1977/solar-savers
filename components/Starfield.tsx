
import React from 'react';
import { Stars } from '@react-three/drei';

const Starfield: React.FC = () => {
  return (
    <Stars
      radius={300}
      depth={50}
      count={15000}
      factor={7}
      saturation={0}
      fade
      speed={1}
    />
  );
};

export default Starfield;
