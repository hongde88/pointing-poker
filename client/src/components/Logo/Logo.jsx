import React from 'react';
import propType from 'prop-types';
// import BrushIcon from '@material-ui/icons/BrushTwoTone';

const Logo = ({ size }) => {
  const letters = [
    { letter: 'P', color: 'mediumvioletred' },
    { letter: 'O', color: 'orange' },
    { letter: 'I', color: 'yellowgreen' },
    { letter: 'N', color: 'slateblue' },
    { letter: 'T', color: 'blueviolet' },
    { letter: 'I', color: 'purple' },
    { letter: 'N', color: 'mediumvioletred' },
    { letter: 'G', color: 'orange' },
    { letter: '-', color: 'yellowgreen' },
    { letter: 'P', color: 'slateblue' },
    { letter: 'O', color: 'blueviolet' },
    { letter: 'K', color: 'purple' },
    { letter: 'E', color: 'mediumvioletred' },
    { letter: 'R', color: 'orange' },
  ];

  const sizeInPx = size === 'lg' ? 96 : 48;
  // const iconStyle = { width: sizeInPx, height: sizeInPx, fill: 'lightblue' };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: size === 'sm' ? 'start' : 'center',
      }}
    >
      {letters.map((letter, idx) => (
        <span
          key={idx}
          style={{
            color: letter.color,
            fontSize: `${sizeInPx}px`,
          }}
        >
          {letter.letter}
        </span>
      ))}
      {/* <BrushIcon style={iconStyle} /> */}
    </div>
  );
};

Logo.defaultProps = {
  size: 'lg',
};

Logo.propType = {
  size: propType.string,
};

export default Logo;
