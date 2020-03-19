import React, { Component } from 'react';
import { Icon, Popover, Alert, Button } from 'components';
import { error, white } from 'src/styles/color';

const baseStyle = {
  display: 'flex',
};

type Props = {
  text: string,
  style: {},
  iconType: string,
  okText: string,
  cancelText: string,
  onCancel: () => {},
  onConfirm: () => {},
  children: any,
  getButtonElement: any,
  visible: boolean,
};

class PopConfirmForProcessRoute extends Component {
  props: Props;

  state = {
    visible: false,
  };

  componentDidMount() {
    const { visible } = this.props;
    this.setState({
      visible,
    });
  }

  componentWillReceiveProps() {
    const { visible } = this.props;
    this.setState({
      visible,
    });
  }

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  handleVisibleChange = visible => {
    this.setState({ visible });
  };

  renderButton = () => {
    const { okText, cancelText, onCancel, onConfirm, getButtonElement } = this.props;

    if (getButtonElement) {
      return getButtonElement();
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {cancelText ? (
          <Button
            size={'small'}
            onClick={async () => {
              if (onConfirm) {
                await onCancel();
              }
              this.hide();
            }}
            type={'default'}
          >
            {cancelText}
          </Button>
        ) : null}
        <Button
          type={'default'}
          size={'small'}
          onClick={async () => {
            if (onConfirm) {
              await onConfirm();
            }
            this.hide();
          }}
        >
          {okText || '知道了'}
        </Button>
      </div>
    );
  };

  renderAlert = () => {
    const { iconType, text } = this.props;
    return <Alert style={{ width: 204, background: white, border: 'none' }} message={text} iconType={iconType} showIcon type={'error'} />;
  };

  renderContent = () => {
    return (
      <div>
        {this.renderAlert()}
        {this.renderButton()}
      </div>
    );
  };

  render() {
    const { style, children } = this.props;
    const { visible } = this.state;
    return (
      <Popover
        style={{ ...baseStyle, ...style }}
        content={this.renderContent()}
        placement="topLeft"
        arrowPointAtCenter
        visible={visible}
        trigger="click"
        onVisibleChange={this.handleVisibleChange}
      >
        {/* TODO: antd如何实现的对children的onChange接管是用react.cloneElement吗？ */}
        {children}
      </Popover>
    );
  }
}

export default PopConfirmForProcessRoute;
