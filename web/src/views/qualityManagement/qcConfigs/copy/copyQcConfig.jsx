import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Button } from 'components';
import log from 'utils/log';
import QcConfigBase, { formatInitialValue, formatValues } from 'containers/qcConfig/qcConfigBase';
import { getQcConfigDetail, createQcConfig } from 'src/services/qcConfig';
import { queryMaterialDetail } from 'src/services/bom/material';
import styles from './styles.scss';
import { toQcConfigDetail, toQcConfigsList } from '../../navigation';

class CopyQcConfig extends Component {
  props: {
    match: {
      params: {
        id: string,
      },
    },
  };
  state = {};

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    await getQcConfigDetail({ id }).then(({ data: { data } }) => {
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

  submit = async () => {
    try {
      const { router } = this.context;
      const values = this.qcConfigBase.wrappedInstance.getPayload();
      if (!values) {
        return;
      }
      const res = await createQcConfig(formatValues(values));
      const statusCode = _.get(res, 'data.statusCode');
      if (statusCode === 200) {
        const data = _.get(res, 'data.data');
        router.history.push(toQcConfigDetail(data.id));
      }
    } catch (e) {
      log.error(e);
    }
  };

  render() {
    const { data } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.header}>复制质检方案</div>
        <QcConfigBase
          wrappedComponentRef={ref => {
            if (ref) {
              this.qcConfigBase = ref;
            }
          }}
          initialValue={data}
          style={{ padding: '20px 40px 20px 20px' }}
        />
        <div className={styles.footer}>
          <Button
            className={styles.cancel}
            type="ghost"
            onClick={() => this.context.router.history.push(toQcConfigsList())}
          >
            取消
          </Button>
          <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

CopyQcConfig.contextTypes = {
  router: {},
};

export default CopyQcConfig;
