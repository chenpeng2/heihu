import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withForm, Button, Text, FormItem } from 'components';
import { withRouter } from 'react-router-dom';
import { showLoading } from 'src/utils/loading';
import { createQcTask } from 'src/services/qualityManagement/qcTask';
import { formatToUnix } from 'utils/time';
import { CHECK_TYPE } from 'src/views/qualityManagement/constants';

import QcTaskBaseForm from '../base/qcTaskBaseForm';

import styles from '../styles.scss';

type Props = {
  form: {
    validateFields: () => {},
  },
};

const buttonStyle = { width: 114, height: 32, marginRight: 40 };

class CreateQcTask extends Component {
  props: Props;
  state = {};

  formatData = data => {
    const {
      qrcode,
      supplierCode,
      operatorId,
      materialCode,
      checkMaterials,
      plannedStartTime,
      storageId,
      ...rest
    } = data;
    const candidates = operatorId.map(n => ({
      candidateId: n.key.split(':')[1],
      candidateType: n.key.split(':')[0] === 'workgroup' ? 2 : 1,
    }));
    return {
      ...rest,
      plannedStartTime: formatToUnix(plannedStartTime),
      storageId: storageId ? storageId.value.split('-')[1] : undefined,
      candidates,
      materialCode: materialCode && materialCode.key,
      checkMaterials: Array.isArray(checkMaterials)
        ? checkMaterials.map(({ code, id }) => ({ qrCode: code, materialUnitId: id }))
        : null,
    };
  };

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        showLoading(true);
        const params = this.formatData(values);
        createQcTask(params)
          .then(({ data: { data } }) => {
            const { code, checkType } = data || {};
            if (sensors) {
              sensors.track('web_quanlity_task_create', {
                type: CHECK_TYPE[checkType],
              });
            }
            if (code) {
              this.context.router.history.push(`/qualityManagement/qcTask/detail/${code}`);
            }
          })
          .catch(err => console.log(err));
      }
    });
  };

  render() {
    const { form } = this.props;

    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
          <p>
            <Text>创建质检任务</Text>
          </p>
        </div>
        <QcTaskBaseForm form={form} />
        <FormItem label={' '} style={{ marginTop: 30 }}>
          <Button
            type="default"
            style={buttonStyle}
            onClick={() => {
              const { router } = this.context;
              if (router) {
                router.history.go(-1);
              }
            }}
          >
            取消
          </Button>
          <Button type="primary" style={buttonStyle} onClick={this.onSubmit}>
            保存
          </Button>
        </FormItem>
      </div>
    );
  }
}

CreateQcTask.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, CreateQcTask));
