import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { message, Button, withForm, FormItem, Form, Input } from 'src/components';
import { manualGenerateProductBatchCode } from 'src/services/productBatchCode';
import { checkTwoSidesTrim, checkStringLength, supportSpecialCharacterValidator } from 'src/components/form';

class PopoverForManualCreateProductBatchCode extends Component {
  state = {};

  render() {
    const { close, form, projectCode, cbForSuccess } = this.props;
    const { getFieldDecorator } = form;

    const buttonStyle = {
      width: 100,
      display: 'inline-block',
    };

    return (
      <div>
        <Form>
          <FormItem>{getFieldDecorator('code', {
            rules: [
              {
                validator: checkTwoSidesTrim('产品批次号'),
              },
              {
                validator: checkStringLength(100),
              },
              {
                validator: supportSpecialCharacterValidator('产品批次号'),
              },
            ],
          })(<Input style={{ width: 300 }} />)}</FormItem>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="default"
            onClick={() => {
              form.resetFields();
              if (typeof close === 'function') {
                close();
              }
            }}
            style={{ ...buttonStyle, marginRight: 10 }}
          >
            {'取消'}
          </Button>
          <Button
            onClick={() => {
              form.validateFieldsAndScroll((err, value) => {
                if (err) return null;
                if (!projectCode) return null;
                const { code } = value || {};

                manualGenerateProductBatchCode({
                  batchNumbers: [code],
                  projectCode,
                }).then(() => {
                  message.success('手工创建产品批次号成功');
                  form.resetFields();
                  if (typeof close === 'function') {
                    close();
                  }
                  if (typeof cbForSuccess === 'function') {
                    cbForSuccess(code);
                  }
                });
              });
            }}
            style={buttonStyle}
          >
            {'确定'}
          </Button>
        </div>
      </div>
    );
  }
}

PopoverForManualCreateProductBatchCode.propTypes = {
  style: PropTypes.object,
  projectCode: PropTypes.string,
  close: PropTypes.any,
  form: PropTypes.any,
  cbForSuccess: PropTypes.any,
};

export default withForm({ showFooter: false }, PopoverForManualCreateProductBatchCode);
