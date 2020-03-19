import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { message, Button, Spin } from 'src/components';
import { black } from 'src/styles/color';
import { getCustomCodeDetail, editCustomCode } from 'src/services/systemConfig/customCode';
import log from 'src/utils/log';

import BasicForm from './baseComponent/form';
import { goToCustomCodeDetailPage, formatServiceDataToFormData, formatFormValueForSubmit } from './utils';

class Edit extends Component {
  state = {
    id: null,
    loading: false,
    detailData: null,
  };

  componentWillMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.id');
    this.setState({ id });
  }

  componentDidMount() {
    this.fetchAndSetDetailData();
  }

  fetchAndSetDetailData = async () => {
    const { id } = this.state;
    if (!id) return;

    try {
      this.setState({ loading: true });
      const res = await getCustomCodeDetail({ id });
      const data = _.get(res, 'data.data');
      this.setState({ detailData: data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderButtons = () => {
    const { id } = this.state;
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

              submitValue.id = id;
              const res = await editCustomCode(submitValue);
              if (res && res.status >= 200 && res.status < 300) {
                message.success('编辑自定义编码成功');
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
    const { loading, detailData } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ padding: '20px 20px' }}>
          <div style={{ fontSize: 16, color: black, marginBottom: 20 }}>编辑自定义编码</div>
          <BasicForm
            type={'edit'}
            initialData={formatServiceDataToFormData(detailData)}
            wrappedComponentRef={inst => (this.BaseFormRef = inst)}
          />
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
