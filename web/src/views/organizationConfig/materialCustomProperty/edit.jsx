import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';

import BaseForm from 'src/containers/materilCustomProperty/base/form';
import { black } from 'src/styles/color/index';
import { Button, Spin } from 'src/components/index';
import { queryMaterialCustomField, updateMaterialCustomField } from 'src/services/bom/material';
import log from 'src/utils/log';

class EditMaterialCustomProperty extends Component {
  state = {
    loading: false,
    data: [],
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = async () => {
    this.setState({ loading: true });

    try {
      const res = await queryMaterialCustomField();
      const data = _.get(res, 'data.data');
      this.setState({ data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  submitValue = async () => {
    const formIns = this.formRef;

    if (formIns && formIns.wrappedInstance) {
      const value = formIns.wrappedInstance.getFormValue();
      if (value) {
        return await updateMaterialCustomField(value);
      }
    }

    return null;
  };

  renderFooter = () => {
    const { router } = this.context;
    const baseStyle = { width: 120 };

    return (
      <div style={{ display: 'flex', margin: '10px 0px 0px 20px' }}>
        <Button
          type={'default'}
          style={{ ...baseStyle }}
          onClick={() => {
            router.history.push('/customProperty/material/materialCustomPropertyDetail');
          }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 50 }}
          onClick={async () => {
            const res = await this.submitValue();
            if (res) {
              router.history.push('/customProperty/material/materialCustomPropertyDetail');
            }
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  render() {
    const { loading, data } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ color: black, fontSize: 16, margin: 20 }}>物料自定义字段</div>
        <BaseForm initialData={data} wrappedComponentRef={inst => (this.formRef = inst)} />
        {this.renderFooter()}
      </Spin>
    );
  }
}

EditMaterialCustomProperty.propTypes = {
  style: PropTypes.object,
};

EditMaterialCustomProperty.contextTypes = {
  router: PropTypes.any,
};

export default withRouter(EditMaterialCustomProperty);
