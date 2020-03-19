// @flow
import * as React from 'react';
import { border } from 'src/styles/color';

export const LINE_WIDTH = 40;

const lineStyle = {
  width: LINE_WIDTH,
  borderTop: `1px solid ${border}`,
  display: 'inline-block',
};

const containerStyle = {
  display: 'inline-block',
};

export type Props = {
  style?: {},
};

class Line extends React.Component<Props, {}> {
  state = {};

  render(): React.Element<'div'> {
    const { style } = this.props;
    return (
      <div style={{ ...containerStyle, ...style }}>
        <span style={lineStyle} />
      </div>
    );
  }
}


export default Line;
