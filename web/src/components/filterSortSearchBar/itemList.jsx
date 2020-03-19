import React from 'react';

export default ({ children, style }: { children: any, style: {} }) => {
  return <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', width: '80%', ...style }}>{children}</div>;
};
