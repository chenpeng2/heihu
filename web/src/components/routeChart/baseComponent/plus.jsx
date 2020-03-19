// @flow
import * as React from 'react';
import { blueViolet, white } from 'src/styles/color';
import { Icon, Popover } from 'src/components';
import styles from './styles.scss';

export const PLUS_SIZE = 14;

const baseContainerStyle = {
  width: PLUS_SIZE,
  height: PLUS_SIZE,
  fontSize: `${PLUS_SIZE}px`,
  color: blueViolet,
  background: white,
  borderRadius: '50%',
};

export type Props = {
  style?: {},
  normalProcessClick: () => {}, // 需要在这个函数中改变数据来实现整个processRouteGraph重新渲染
  parallelProcessClick: () => {},
  hideParallelProcessButton: boolean,
};

type State = {
  showDifferentProcessMenu: boolean,
};

class Plus extends React.Component<Props, State> {
  state = {
    showDifferentProcessMenu: false,
  };

  static PLUS_SIZE: number = PLUS_SIZE;

  handleNormalProcessClick = () => {
    const { normalProcessClick } = this.props;
    if (normalProcessClick) {
      normalProcessClick();
    }
  };

  handleParallelProcessClick = () => {
    const { parallelProcessClick } = this.props;
    if (parallelProcessClick) {
      parallelProcessClick();
    }
  };

  renderContent = (): React.Element<'div'> => {
    // const { hideParallelProcessButton } = this.props;
    return (
      <div>
        <div className={styles.plusHoverContainer} onClick={(): void => this.handleNormalProcessClick()}>
          普通工序
        </div>
        {/* {!hideParallelProcessButton ? ( */}
        {/* <div className={styles.plusHoverContainer} onClick={(): void => this.handleParallelProcessClick()}> */}
        {/* 并行工序组 */}
        {/* </div> */}
        {/* ) : null} */}
      </div>
    );
  };

  render(): React.Node {
    const { style } = this.props;

    return (
      <div
        style={{
          ...style,
          zIndex: 100,
          cursor: 'pointer',
        }}
      >
        <Icon type={'plus-circle'} style={baseContainerStyle} onClick={(): void => this.handleNormalProcessClick()} />
      </div>
    );
  }
}

export default Plus;
