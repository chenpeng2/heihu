import React, { Component } from 'react';
import { blacklakeGreen, paleGreen } from 'src/styles/color/index';

type Props = {
  style: any,
  schedule: number,
  text: string,
  onClick: () => {},
};

const progressStyle = {
  borderRadius: 18,
  border: `1px solid ${blacklakeGreen}`,
  marginRight: 8,
  backgroundClip: 'content-box',
  position: 'absolute',
  width: '100%',
  height: '100%',
  wordBreak: 'keep-all',
};

class TaskProgress extends Component {
  props: Props;

  state = {};
  render() {
    const { style, schedule, text, onClick } = this.props;
    const newStyle = {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      width: 200,
      height: 16,
      color: blacklakeGreen,
      ...style,
    };
    const backgroundColor = style && style.backgroundColor || paleGreen;
    const completedProgressWidth = (1 - schedule) * newStyle.width;

    return (
      <div style={newStyle} onClick={onClick}>
        <span style={{ ...progressStyle, paddingRight: completedProgressWidth, backgroundColor }} />
        <span style={{ position: 'absolute' }}>{text}</span>
      </div>
    );
  }
}

export default TaskProgress;
