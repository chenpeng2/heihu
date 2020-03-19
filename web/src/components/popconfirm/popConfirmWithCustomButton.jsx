// 为工艺路线和项目写的自定义popConfirm。具体使用可以查看工艺路线和项目的状态改变组件
import React, { Component } from 'react';
import { Icon, Popover, Button } from 'src/components';
import { error } from 'src/styles/color';
import log from 'src/utils/log';

const baseStyle = {
  display: 'flex',
};

type Props = {
  text: string,
  style: {},
  iconType: string,
  iconStyle: {},
  textStyle: {},
  okText: string,
  cancelText: string,
  onCancel: () => {},
  onConfirm: () => {},
  children: any,
  getButtonElement: any, // 自定义button
  visible: boolean,
  visibleChangeCb: () => {}, // 当popConfirm visible改变的时候的回调函数
};

class PopConfirmWithCustomButton extends Component {
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
    this.handleVisibleChange(false);
  };

  handleVisibleChange = visible => {
    const { visibleChangeCb } = this.props;
    this.setState({ visible });
    if (typeof visibleChangeCb === 'function') visibleChangeCb(visible);
  };

  renderButton = () => {
    const { okText, cancelText, onCancel, onConfirm, getButtonElement } = this.props;

    if (getButtonElement) {
      return getButtonElement();
    }

    // 如果有cancelText那么就会有cancel button
    return (
      <div className="ant-popover-buttons">
        {cancelText ? (
          <Button
            size={'small'}
            onClick={async () => {
              try {
                if (typeof onCancel === 'function') {
                  await onCancel();
                }
              } catch (e) {
                log.error(e);
              } finally {
                this.hide();
              }
            }}
            type={'default'}
            style={{ marginRight: 10 }}
          >
            {cancelText}
          </Button>
        ) : null}
        <Button
          type={'default'}
          size={'small'}
          onClick={async () => {
            try {
              if (typeof onConfirm === 'function') {
                await onConfirm();
              }
            } catch (e) {
              log.error(e);
            } finally {
              this.hide();
            }
          }}
        >
          {okText || '知道了'}
        </Button>
      </div>
    );
  };

  renderAlert = () => {
    const { iconType, text, iconStyle, textStyle } = this.props;
    return (
      <div className="ant-popover-message">
        <Icon type={iconType || 'close-circle'} style={{ color: error, lineHeight: 1.3, ...iconStyle }} />
        <div style={{ paddingLeft: 20, ...textStyle }}>{text}</div>
      </div>
    );
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
    const { style, children, ...rest } = this.props;
    const { visible } = this.state;

    return (
      <Popover
        style={{ ...baseStyle, ...style }}
        content={this.renderContent()}
        visible={visible}
        trigger="click"
        onVisibleChange={visible => {
          this.handleVisibleChange(visible);
        }}
        {...rest}
      >
        {children}
      </Popover>
    );
  }
}

export default PopConfirmWithCustomButton;
