import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { message, Spin, Button } from 'src/components';
import BaseForm from 'src/containers/materialType/baseComponent/form';
import { black } from 'src/styles/color';
import { getMaterialTypeDetail, updateMaterialType } from 'src/services/bom/materialType';
import log from 'src/utils/log';
import { formatFormValue } from 'src/containers/materialType/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

const EDIT_MATERIAL = changeChineseToLocaleWithoutIntl('编辑物料类型');

class EditMaterialType extends Component {
  state = {
    data: null,
    loading: false,
  };

  async componentDidMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    this.fetchData(id);
  }

  fetchData = async () => {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    if (!id) return;

    this.setState({ loading: true });

    try {
      const res = await getMaterialTypeDetail(id);
      const data = _.get(res, 'data.data');
      this.setState({ data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderTitle = () => {
    return <div style={{ color: black, fontSize: 20, margin: '20px 0px' }}>{EDIT_MATERIAL}</div>;
  };

  renderButtons = () => {
    const { router } = this.context;
    const baseStyle = { width: 120 };

    const { match } = this.props;
    const id = _.get(match, 'params.id');

    return (
      <div style={{ marginLeft: 120 }}>
        <Button
          style={{ ...baseStyle }}
          type={'default'}
          onClick={() => {
            if (router) {
              router.history.push('/bom/materialTypes');
            }
          }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 10 }}
          onClick={async () => {
            if (!this.formRef) return null;
            const getFormValue = _.get(this.formRef, 'wrappedInstance.getFormValue');
            if (typeof getFormValue === 'function') {
              const value = getFormValue();
              if (value) {
                try {
                  await updateMaterialType({ ...formatFormValue(value), id });
                  message.success('编辑物料类型成功');
                  if (id) {
                    router.history.push(`/bom/materialTypes/${id}/detail`);
                  }
                } catch (e) {
                  log.error(e);
                }
              }
            }
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  render() {
    const { data } = this.state;
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ marginLeft: 20 }}>
          {this.renderTitle()}
          <BaseForm isEdit initialValue={data} wrappedComponentRef={inst => (this.formRef = inst)} />
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

EditMaterialType.propTypes = {
  style: PropTypes.object,
};

EditMaterialType.contextTypes = {
  router: PropTypes.any,
};

export default EditMaterialType;
