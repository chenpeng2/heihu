import React, { Component } from 'react';
import { Icon } from 'components';
import { alertYellow } from 'src/styles/color/index';
import { isPromise } from 'utils/promise';
import ReactDOM from 'react-dom';
import styles from './styles.scss';

type Props = {
  undoFn: () => {},
  onClose: () => {},
  children: () => {},
  options: {
    message: string,
  },
};

class Undo extends Component {
  props: Props;
  state = {};

  renderDefaultAlert = props => {
    const { options, undoFn, onClose } = props;
    const { message } = options;
    return (
      <div className={styles.undoAlert}>
        <div className={styles.message}>
          <Icon type="exclamation-circle" color={alertYellow} style={{ marginRight: 5 }} />
          <span>{message}</span>
        </div>
        <div
          onClick={() => {
            const _res = undoFn();
            if (isPromise(_res)) {
              _res.then(onClose);
              return null;
            }
            onClose();
            return null;
          }}
          className={styles.undoButton}
        >
          点击撤销
        </div>
        <div onClick={onClose} className={styles.closeButton}>
          关闭
        </div>
      </div>
    );
  };

  render() {
    const { options, undoFn, children, onClose, ...rest } = this.props;
    const newChildren = children && React.cloneElement(children, { ...options, ...rest, onClose, undoFn });
    setTimeout(onClose, 15000);
    return (
      <div
        style={{
          position: 'absolute',
          top: 50,
          width: '100%',
          zIndex: 1000,
        }}
      >
        {newChildren || this.renderDefaultAlert(this.props)}
      </div>
    );
  }
}

const openUndo = (
  props: {
    undoFn: () => {},
    children: () => {},
  },
  options,
) => {
  const div = document.createElement('div');
  document.querySelector('[class^=layoutMain]').appendChild(div);
  const closeMask = () => {
    if (div.parentNode) {
      ReactDOM.unmountComponentAtNode(div);
      div.parentNode.removeChild(div);
    }
  };
  ReactDOM.render(<Undo options={options} onClose={closeMask} {...props} />, div);
};

export default openUndo;
