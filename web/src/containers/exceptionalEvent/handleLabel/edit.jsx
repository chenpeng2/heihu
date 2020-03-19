import React, { Component } from 'react';
import _ from 'lodash';

import { Button, Spin, message } from 'src/components';
import { editLabel, getLabelDetail } from 'src/services/knowledgeBase/exceptionalEvent';
import BaseForm from './baseForm';

type Props = {
  style: {},
  onClose: () => {},
  form: {},
  fetchData: () => {},
  labelId: string,
};

class Edit extends Component {
  props: Props;
  state = {
    loading: false,
    labelDetail: null,
  };

  componentDidMount() {
    const { labelId } = this.props;
    if (!labelId) return null;

    this.setState({ loading: true });
    getLabelDetail(labelId)
      .then(res => {
        const data = _.get(res, 'data.data');
        const { name } = data || {};

        this.setState({ labelDetail: { name } });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  renderForm = () => {
    const { labelDetail } = this.state;

    return <BaseForm ref={inst => (this.formInst = inst)} initialValue={labelDetail} />;
  };

  renderFooterButtons = () => {
    const { onClose, fetchData, labelId } = this.props;
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

                const { name } = values || {};
                editLabel(labelId, {
                  name,
                }).then(() => {
                  message.success('编辑处理标签成功');
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

export default Edit;
