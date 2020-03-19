import React, { Component } from 'react';
import _ from 'lodash';
import { Button, Text } from 'components';
import log from 'utils/log';
import QcConfigBase, { formatValues } from 'containers/qcConfig/qcConfigBase';
import { createQcConfig } from 'src/services/qcConfig';
import { showLoading } from 'src/utils/loading';
import styles from './styles.scss';
import { toQcConfigDetail, toQcConfigsList } from '../../navigation';

class CreateQcConfig extends Component {
  props: {
    match: {},
    type: string,
    handleExtraSubmit: () => {},
    onCancel: () => {},
    handlePrarentCancel: () => {},
    unitsForSelect: [],
  };
  state = {};

  submit = async () => {
    const { handleExtraSubmit } = this.props;
    const values = this.qcConfigBase.wrappedInstance.getPayload();
    if (!values) {
      return;
    }
    showLoading(true);
    const params = formatValues(values);
    const res = await createQcConfig(params);
    const statusCode = _.get(res, 'data.statusCode');
    if (statusCode === 200) {
      const data = _.get(res, 'data.data');
      if (handleExtraSubmit) {
        params.id = data.id;
        handleExtraSubmit(params);
      }
      this.handleLink(true, data.id);
    }
    showLoading(false);
  };

  handleLink = (isEdit, qcConfigId) => {
    const { type, onCancel, handlePrarentCancel } = this.props;
    const { router } = this.context;
    if (!type) {
      if (isEdit) {
        router.history.push(toQcConfigDetail(qcConfigId));
      } else {
        router.history.push(toQcConfigsList());
      }
    } else {
      onCancel();
      handlePrarentCancel();
    }
  };

  render() {
    const { match, type, unitsForSelect } = this.props;
    return (
      <div className={styles.container}>
        {!type ? (
          <div className={styles.header}>
            <Text>创建质检方案</Text>
          </div>
        ) : null}
        <QcConfigBase
          match={match}
          wrappedComponentRef={ref => {
            if (ref) {
              this.qcConfigBase = ref;
            }
          }}
          style={{ padding: '20px 40px 20px 20px' }}
          unitsForSelect={unitsForSelect}
          type={type}
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
          <Button type="primary" className={styles.ok} onClick={this.submit}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

CreateQcConfig.contextTypes = {
  router: {},
};

export default CreateQcConfig;
