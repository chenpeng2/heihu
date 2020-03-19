import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { black } from 'src/styles/color';
import { message, Button, Spin, FormItem } from 'src/components';
import { getCustomRuleDetail, updateCustomRule } from 'src/services/systemConfig/customRule';
import log from 'src/utils/log';

import BaseForm from './baseComponent/form';
import { formatFormDataToSubmit } from './utils';

class Edit extends Component {
  state = {
    loading: false,
  };

  componentDidMount() {
    this.fetchCustomRuleDetail();
  }

  fetchCustomRuleDetail = async () => {
    this.setState({ loading: true });
    const id = _.get(this.props, 'match.params.id');

    try {
      const res = await getCustomRuleDetail({ action: id });
      const data = _.get(res, 'data.data');
      this.setState({ detailData: data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderButtons = () => {
    const { router } = this.context;
    const baseButtonStyle = { width: 114 };

    return (
      <FormItem label={' '}>
        <Button
          type={'default'}
          style={{ ...baseButtonStyle, marginRight: 60 }}
          onClick={() => {
            router.history.go(-1);
          }}
        >
          取消
        </Button>
        <Button
          style={baseButtonStyle}
          onClick={async () => {
            const formValue = this.BaseFormRef.wrappedInstance.getFormValue();
            if (!formValue) return;

            try {
              this.setState({ loading: true });
              const id = _.get(this.props, 'match.params.id');
              const res = await updateCustomRule({ ...formatFormDataToSubmit(formValue), action: id });
              if (res && res.status === 200) {
                message.success('更新自定义规则成功');
                this.context.router.history.push('/customRule/list');
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
      </FormItem>
    );
  };

  render() {
    const { detailData, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ padding: 20 }}>
          <div style={{ color: black, fontSize: 16, marginBottom: 20 }}>编辑自定义规则</div>
          <BaseForm initialData={detailData} wrappedComponentRef={inst => (this.BaseFormRef = inst)} />
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

Edit.propTypes = {
  style: PropTypes.object,
  match: PropTypes.any,
};

Edit.contextTypes = {
  router: PropTypes.any,
};

export default withRouter(Edit);
