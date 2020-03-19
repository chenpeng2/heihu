import React, { Component } from 'react';
import { LocaleProvider } from 'antd';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import Modal from 'antd/lib/modal';
import store from 'store';
import { ConnectedRouter } from 'connected-react-router';
import 'antd/lib/modal/style';

import { history } from 'src/routes';
import {
  changeChineseToLocale,
  changeChineseTemplateToLocale,
  getLocale,
  getInitialLanguageType,
} from 'src/utils/locale/utils';

import GcLocaleProvider from 'src/utils/locale/GcLocaleProvider';

import Button from '../button';
import styles from './index.scss';

// 关闭所有modal的函数。
const eles = [];
export const closeModal = () => {
  eles.forEach(div => {
    if (div.parentNode) {
      ReactDOM.unmountComponentAtNode(div);
      div.parentNode.removeChild(div);
    }
  });
};

type Props = {
  context: any,
  children: Element,
  onClose: () => {},
  onCancel: () => {},
  onOk: () => {},
  style: any,
  innerContainerStyle: any,
  visible: boolean,
  onSuccess: () => {},
  wrapClassName: string,
  match: {},
  cancelText: String,
  okText: String,
  okType: String,
  width: Number,
  autoClose: Boolean,
  disabledRelayModalClassname: String,
  okButton: Element,
};

class ModalWithContext extends Component {
  props: Props;

  state = {
    loading: false,
  };

  getChildContext() {
    const { intl } = this.context;
    const _changeChineseToLocale = text => changeChineseToLocale(text, intl);
    const _changeChineseTemplateToLocale = (text, params) => changeChineseTemplateToLocale(text, params, intl);

    if (!this.props.context) {
      return {
        // 国际化的方法
        changeChineseToLocale: _changeChineseToLocale,
        changeChineseTemplateToLocale: _changeChineseTemplateToLocale,
      };
    }

    const { router, relayVariables } = this.props.context;

    return {
      router,
      relayVariables,
      // 国际化的方法
      changeChineseToLocale: _changeChineseToLocale,
      changeChineseTemplateToLocale: _changeChineseTemplateToLocale,
    };
  }

  componentDidMount() {
    if (this.props.wrapClassName === styles.ganttModal) {
      setTimeout(() => {
        const antModal = document.querySelector(`.${styles.ganttModal}>.ant-modal`);
        const top = parseInt(antModal.style.top, 10);
        if (antModal.clientHeight + top + 60 > window.outerHeight) {
          // 60,计算modal超出底部时候的误差
          // 超出屏幕底部时候
          const bottom = antModal.clientHeight - top;
          antModal.style.top = 'auto';
          antModal.style.bottom = `${bottom}px`;
          if (top < antModal.clientHeight) {
            // 超出屏幕顶部时候
            antModal.style.bottom = 0;
          }
        }
      });
    }
  }

  render() {
    const { intl } = this.context;
    const {
      title,
      children,
      onOk,
      visible,
      onCancel,
      onClose,
      wrapClassName,
      match,
      style,
      innerContainerStyle,
      cancelText,
      okText,
      width,
      okType,
      disabledRelayModalClassname,
      autoClose = true,
      okButton,
      ...rest
    } = this.props;

    const { location } = match || {};
    const { params } = location || {};

    const _onCancel = () => {
      if (onCancel) {
        onCancel();
      }
      this.props.onClose();
    };

    const newChildren = React.cloneElement(children, {
      ...params,
      ...rest,
      onOk: async data => {
        if (onOk) {
          await onOk(data);
        }
        _onCancel();
      },
      onClose,
      onCancel: _onCancel,
      style: {
        maxHeight: window.innerHeight * 0.8 - 150,
        overflowY: 'auto',
        overflowX: 'hidden',
        ...innerContainerStyle,
      },
    });
    const innerCancelText = changeChineseToLocale(cancelText || '取消', intl);
    const innerOkText = changeChineseToLocale(okText || '确定', intl);
    const innerTitle = typeof title === 'string' ? changeChineseToLocale(title, intl) : title;
    const footer = [
      <Button type="default" onClick={_onCancel} className={styles.footerCancel}>
        {innerCancelText}
      </Button>,
      okButton || (
        <Button
          className={styles.footerOk}
          type={okType}
          onClick={async () => {
            if (onOk) {
              await onOk();
            }
            if (autoClose) {
              _onCancel();
            }
          }}
        >
          {innerOkText}
        </Button>
      ),
    ];
    const innerWidth = width || 815;
    const innerWrapClassName = `${disabledRelayModalClassname ? '' : 'relay-modal'} ${wrapClassName}`;
    const innerStyle = { top: 50, ...style };
    return (
      <Modal
        title={typeof title === 'string' ? changeChineseToLocale(title, intl) : title}
        width={innerWidth}
        wrapClassName={innerWrapClassName}
        maskClosable={false}
        onOk={onOk}
        visible={visible}
        onClose={onClose}
        onCancel={_onCancel}
        style={innerStyle}
        footer={footer}
        title={innerTitle}
        {...rest}
      >
        {newChildren}
      </Modal>
    );
  }
}
ModalWithContext.contextTypes = {
  intl: {},
};

ModalWithContext.childContextTypes = {
  router: PropTypes.object,
  relayVariables: PropTypes.object,
  changeChineseToLocale: PropTypes.any,
  changeChineseTemplateToLocale: PropTypes.any,
};

// props参数是一些属性。包括styles
// context参数包括relay的router
// match参数 对应路由的信息 主要是params和state
const GetOpenModal = (
  props: {},
  context: {},
  match: {
    location: {
      params: {},
      state: {},
    },
  },
) => {
  const div = document.createElement('div');
  div.className = 'modalContainer';

  document.getElementById('root').appendChild(div);

  // 将div放入eles是为了实现关闭所有modal的函数。
  eles.push(div);

  // 关闭modal函数border-top
  const close = () => {
    if (div.parentNode) {
      ReactDOM.unmountComponentAtNode(div);
      div.parentNode.removeChild(div);
    }
  };

  // 国际化
  const languageType = getInitialLanguageType();
  const appLocale = getLocale(languageType);
  addLocaleData(...appLocale.data);

  ReactDOM.render(
    <LocaleProvider locale={appLocale.antd}>
      <IntlProvider locale={appLocale.locale} messages={appLocale.messages} formats={appLocale.formats}>
        <GcLocaleProvider locale={appLocale}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <ModalWithContext visible onClose={close} onCancel={close} {...props} context={context} match={match} />
            </ConnectedRouter>
          </Provider>
        </GcLocaleProvider>
      </IntlProvider>
    </LocaleProvider>,
    div,
  );
};

GetOpenModal.AntModal = Modal;

export default GetOpenModal;
