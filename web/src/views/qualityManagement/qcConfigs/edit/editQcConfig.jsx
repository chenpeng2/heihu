import React, { Component } from 'react';
import _ from 'lodash';
import { Button, openModal, Spin, Text } from 'components';
import log from 'utils/log';
import QcConfigBase, { formatInitialValue, formatValues } from 'containers/qcConfig/qcConfigBase';
import { getQcConfigDetail, createQcConfig, editQcConfig } from 'src/services/qcConfig';
import { queryMaterialDetail } from 'src/services/bom/material';
import SaveConfirmModal from './saveConfirmModal';
import EditConfirmModal from './editConfirmModal';
import styles from './styles.scss';
import { toQcConfigDetail, toQcConfigsList } from '../../navigation';

class EditQcConfig extends Component {
  props: {
    match: {
      params: {
        id: string,
      },
    },
    id: string,
    type: string,
    handleExtraSubmit: () => {},
    onCancel: () => {},
    unitsForSelect: any,
  };
  state = {
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { match, id } = this.props;
    const qcConfigId = id || _.get(match, 'params.id');
    this.setState({ loading: true });
    await getQcConfigDetail({ id: qcConfigId }).then(({ data: { data } }) => {
      Promise.all(data.qcConfigMaterials.map(n => queryMaterialDetail(n.materialCode)))
        .then(res => {
          res.forEach((n, index) => {
            if (data.qcConfigMaterials && data.qcConfigMaterials[index]) {
              data.qcConfigMaterials[index].unitConversions = _.get(n, 'data.data.unitConversions');
              data.qcConfigMaterials[index].unitName = _.get(n, 'data.data.unitName');
              data.qcConfigMaterials[index].unitId = _.get(n, 'data.data.unitId');
            }
          });
          this.setState({ data: formatInitialValue(data), loading: false });
        })
        .catch(e => {
          log.error(e);
          this.setState({ loading: false });
        });
    });
  };

  submit = async (values, useNewQcConfig) => {
    try {
      const { match, id } = this.props;
      const qcConfigId = id || _.get(match, 'params.id');
      const formatedValues = formatValues(values);
      const params = { id: qcConfigId, ...formatedValues };
      const { handleExtraSubmit } = this.props;
      const changeQcConfig = useNewQcConfig ? createQcConfig : editQcConfig;
      this.setState({ loading: true });
      const res = await changeQcConfig(params);
      if (useNewQcConfig) {
        params.newId = _.get(res, 'data.data.id');
      }
      const statusCode = _.get(res, 'data.statusCode');
      if (statusCode === 200) {
        const data = _.get(res, 'data.data');
        if (
          data.hasDependency &&
          this.state.data.qcCheckItemConfigs.length !== formatedValues.qcCheckItemConfigs.length
        ) {
          this.setState({ visible: true });
        }
        if (handleExtraSubmit) {
          handleExtraSubmit(params);
        }
        this.handleLink(true, data.id);
      }
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getValues = () => {
    const values = this.qcConfigBase.wrappedInstance.getPayload();
    if (!values) {
      return;
    }
    this.showConfirm(values);
  };

  showConfirm = values => {
    const { type } = this.props;
    openModal({
      children: <EditConfirmModal type={type} values={values} submit={this.submit} />,
      footer: null,
      style: { marginTop: 50 },
      maskClosable: true,
      width: '30%',
    });
  };

  handleLink = (isEdit, qcConfigId) => {
    const { type, onCancel } = this.props;
    const { router } = this.context;
    if (!type) {
      if (isEdit) {
        router.history.push(toQcConfigDetail(qcConfigId));
      } else {
        router.history.push(toQcConfigsList());
      }
    } else {
      onCancel();
    }
  };

  render() {
    const { match, type, unitsForSelect } = this.props;
    const { data, visible, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <div className={styles.container}>
          {!type ? (
            <div className={styles.header}>
              <Text>编辑质检方案</Text>
            </div>
          ) : null}
          <QcConfigBase
            match={match}
            wrappedComponentRef={ref => {
              if (ref) {
                this.qcConfigBase = ref;
              }
            }}
            edit
            unitsForSelect={unitsForSelect}
            initialValue={data}
            type={type}
            style={{ padding: '20px 40px 20px 20px' }}
          />
          <div className={styles.footer}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => {
                this.handleLink(false);
              }}
            >
              取消
            </Button>
            <Button type="primary" className={styles.ok} onClick={this.getValues}>
              保存
            </Button>
            <SaveConfirmModal
              onVisibleChange={value => {
                this.setState({ visible: value });
              }}
              visible={visible}
            />
          </div>
        </div>
      </Spin>
    );
  }
}

EditQcConfig.contextTypes = {
  router: {},
};

export default EditQcConfig;
