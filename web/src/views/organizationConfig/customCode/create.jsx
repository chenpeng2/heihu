import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { message, Button, Spin } from 'src/components';
import { black } from 'src/styles/color';
import { createCustomCode } from 'src/services/systemConfig/customCode';
import log from 'src/utils/log';

import BasicForm from './baseComponent/form';
import { formatFormValueForSubmit, goToCustomCodeDetailPage } from './utils';

class Create extends Component {
  state = {
    loading: false,
  };

  renderButtons = () => {
    const { router } = this.context;
    const baseButtonStyle = { width: 114 };

    return (
      <div style={{ marginLeft: 120, paddingTop: 20 }}>
        <Button
          type={'default'}
          style={{ ...baseButtonStyle, marginRight: 60 }}
          onClick={() => {
            router.history.push('/customCode/list');
          }}
        >
          取消
        </Button>
        <Button
          style={baseButtonStyle}
          onClick={async () => {
            const formValue = this.BaseFormRef.wrappedInstance.getFormValue();
            if (!formValue) return;

            const submitValue = formatFormValueForSubmit(formValue);
            if (!submitValue) return;

            try {
              this.setState({ loading: true });
              const res = await createCustomCode(submitValue);
              if (res && res.status >= 200 && res.status < 300) {
                message.success('创建自定义编码成功');

                const id = _.get(res, 'data.data.id');
                goToCustomCodeDetailPage(router.history, id);
              }
            } catch (e) {
              log.error(e);
            } finally {
              this.setState({ loading: false });
            }
          }}
        >
          保存
        </Button>
      </div>
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading} >
        <div style={{ padding: '20px 20px' }}>
          <div style={{ fontSize: 16, color: black, marginBottom: 20 }}>创建自定义编码</div>
          <BasicForm wrappedComponentRef={inst => (this.BaseFormRef = inst)} />
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

Create.propTypes = {
  style: PropTypes.object,
};

Create.contextTypes = {
  router: PropTypes.any,
};

export default Create;
