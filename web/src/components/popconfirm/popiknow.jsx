import React from 'react';
import { Popover, Icon } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import Button from '../button';

import styles from './index.scss';

class Popiknow extends React.PureComponent<any> {
  state = { visible: false };
  render() {
    const { intl, title, children, iconType, iconStyle, onConfirm, content, footer, ...rest } = this.props;
    const { visible } = this.state;
    return (
      <Popover
        content={
          <div className={styles.popikonwContent}>
            <div className="ant-popover-message">
              <Icon type={iconType || 'close-circle'} style={iconStyle} />
              <div className="ant-popover-message-title">{typeof title === 'string' ? changeChineseToLocale(title, intl) : title}</div>
              <div style={{ paddingLeft: 20 }}>{content}</div>
            </div>
            <div className="ant-popover-buttons">
              {footer || (
                <Button
                  size="small"
                  onClick={() => {
                    if (typeof onConfirm === 'function') {
                      onConfirm();
                    }
                    this.setState({ visible: false });
                  }}
                >
                  知道了
                </Button>
              )}
            </div>
          </div>
        }
        arrowPointAtCenter
        trigger="click"
        visible={visible}
        onVisibleChange={visible => {
          this.setState({ visible });
        }}
        {...rest}
      >
        {children}
      </Popover>
    );
  }
}

export default injectIntl(Popiknow);
