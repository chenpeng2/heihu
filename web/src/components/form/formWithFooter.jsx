/**
 * @description: 自带提交，取消按钮的表单。
 *
 * @date: 2019/3/21 上午11:23
 */
import React, { Component } from 'react';
import PropsTypes from 'prop-types';

import Button from '../button';
import BaseForm from './baseForm';
import styles from './index.scss';

// 如果默认的footer不满足需求，不要修改这个组件。利用renderFooter函数
const FormWithFooter = (options, WrappedComponent) => {
  class InnerWrappedComponent extends Component {
    state = {};

    submit = () => {
      const { form, onSubmit } = this.props;

      const wrappedInstanceSubmit = this && this.wrappedInstance && this.wrappedInstance.submit;

      form.validateFieldsAndScroll((err, value) => {
        if (!err) {
          if (typeof onSubmit === 'function') {
            onSubmit(value);
          } else if (typeof wrappedInstanceSubmit === 'function') {
            wrappedInstanceSubmit(value);
          }
        }
      });
    };

    render() {
      const { showFooter, renderFooter, onCancel, onClose } = this.props || {};

      return (
        <div>
          {WrappedComponent}
          {showFooter ? (
            <div>
              {renderFooter ? (
                renderFooter()
              ) : (
                <div>
                  <Button
                    type="ghost"
                    onClick={() => {
                      if (typeof onCancel === 'function') onCancel();
                    }}
                    className={styles.footerButton}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.submit();
                      if (typeof onClose === 'function') onClose();
                    }}
                    className={styles.footerButton}
                  >
                    确认
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      );
    }
  }

  InnerWrappedComponent.propTypes = {
    form: PropsTypes.any,
  };

  return BaseForm(options, InnerWrappedComponent);
};

export default FormWithFooter;
