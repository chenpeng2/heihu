import React, { Component } from 'react';
import _ from 'lodash';

import { Button, Spin, message } from 'src/components';
import { editType, getTypeDetail } from 'src/services/knowledgeBase/exceptionalEvent';
import BaseForm from './baseForm';

type Props = {
  style: {},
  onClose: () => {},
  form: {},
  fetchData: () => {},
  typeId: string,
};

class EditType extends Component {
  props: Props;
  state = {
    loading: false,
    typeDetail: null,
  };

  componentDidMount() {
    const { typeId } = this.props;
    if (!typeId) return null;

    this.setState({ loading: true });
    getTypeDetail(typeId)
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ typeDetail: data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  renderForm = () => {
    const { typeDetail } = this.state;

    return <BaseForm ref={inst => (this.formInst = inst)} initialValue={typeDetail} />;
  };

  renderFooterButtons = () => {
    const { onClose, fetchData, typeId } = this.props;
    const buttonStyle = { width: 114 };

    return (
      <div style={{ paddingBottom: 35 }}>
        <div style={{ display: 'flex', width: 280, margin: 'auto' }}>
          <Button
            type={'default'}
            style={{ ...buttonStyle, marginRight: 40 }}
            onClick={() => {
              if (onClose && typeof onClose === 'function') onClose();
            }}
          >
            取消
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => {
              this.formInst.validateFieldsAndScroll((err, values) => {
                if (err) return;

                const { name, priority, overdueDate } = values || {};
                editType(typeId, {
                  name,
                  priority,
                  overdueTimeout: overdueDate,
                }).then(() => {
                  message.success('编辑异常类型成功');
                  if (typeof onClose === 'function') onClose();
                  if (typeof fetchData === 'function') fetchData();
                });
              });
            }}
          >
            完成
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.state;

    return (
      <Spin spinning={loading}>
        {this.renderForm()}
        {this.renderFooterButtons()}
      </Spin>
    );
  }
}

export default EditType;
