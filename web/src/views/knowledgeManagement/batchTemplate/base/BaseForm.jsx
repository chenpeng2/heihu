import React from 'react';
import PropTypes from 'prop-types';
import { history } from 'routes';
import { FormItem, Input, Button, Spin, FormattedMessage } from 'components';
import { checkTwoSidesTrim } from 'components/form';

const width = 400;

class BaseForm extends React.PureComponent {
  state = {
    loading: false,
  };

  handleSubmit = () => {
    const {
      form: { validateFields },
    } = this.props;
    validateFields(async (err, values) => {
      if (!err) {
        this.setState({ loading: true });
        const { submitApi } = this.props;
        await submitApi(values).finally(() => {
          this.setState({ loading: false });
        });
        history.push('/knowledgeManagement/batch-template');
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      disabledFields = [],
    } = this.props;
    const { loading } = this.state;
    return (
      <div style={{ margin: 20 }}>
        <Spin spinning={loading}>
          <p style={{ fontSize: 16, marginBottom: 10 }}>
            <FormattedMessage defaultMessage={'创建电子批记录'} />
          </p>
          <div style={{ marginLeft: 20 }}>
            <FormItem label="批记录模板名称">
              {getFieldDecorator('templateName', {
                rules: [
                  { validator: checkTwoSidesTrim('批记录模板名称') },
                  { required: true, message: <FormattedMessage defaultMessage={'批记录模板名称必填'} /> },
                  { max: 100, message: <FormattedMessage defaultMessage={'最大不可超过100字符'} /> },
                ],
              })(<Input style={{ width }} disabled={disabledFields.includes('templateName')} />)}
            </FormItem>
            <FormItem label="批记录模板链接">
              {getFieldDecorator('templateUrl', {
                rules: [
                  { validator: checkTwoSidesTrim('批记录模板链接') },
                  { required: true, message: <FormattedMessage defaultMessage={'批记录模板链接必填'} /> },
                  { max: 1000, message: <FormattedMessage defaultMessage={'最大不可超过1000字符'} /> },
                ],
              })(<Input style={{ width }} />)}
            </FormItem>
          </div>
          <div style={{ display: 'flex', marginTop: 30, marginLeft: 135 }}>
            <Button
              type="default"
              style={{ marginRight: 20 }}
              onClick={() => {
                history.push('/knowledgeManagement/batch-template');
              }}
            >
              取消
            </Button>
            <Button onClick={this.handleSubmit}>保存</Button>
          </div>
        </Spin>
      </div>
    );
  }
}

BaseForm.propTypes = {
  submitApi: PropTypes.func,
  disabledFields: PropTypes.array,
};

export default BaseForm;
