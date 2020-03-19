import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Button, message } from 'components';
import PropTypes from 'prop-types';
import withForm from 'components/form';
import { arrayIsEmpty } from 'src/utils/array';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { addMachiningMaterial } from 'src/services/knowledgeBase/equipment';
import Base from './base';
import ConfirmModal from './confirmModal';
import { formatParams } from '../equipmentType/base/formatValue';
import { MACHINING_MATERIAL_TYPE_TOOLING } from './constants';
import { getMachiningMaterialListUrl } from './utils';
import styles from './styles.scss';

type Props = {
  form: any,
  intl: any,
};

const customLanguage = getCustomLanguage();

class CreateMachiningMaterial extends Component {
  props: Props;

  state = {
    loading: false,
    visible: false,
  };

  formatParams = value => {
    const { outputMaterials, taskStrategies } = this.state;
    const params = {};
    Object.keys(value).forEach(prop => {
      if (value[prop] || value[prop] === false) {
        switch (prop) {
          case 'attachmentIds':
          case 'pictureIds':
            params[prop] = value[prop].map(n => n.restId);
            break;
          case 'type':
          case 'toolingType':
          case 'unitId':
            params[prop] = value[prop].key;
            break;
          case 'deviceProp':
            {
              const deviceProp = _.compact(Object.values(value[prop]));
              params.metricIds = _.compact(deviceProp.map(n => n.metric.key));
            }
            break;
          default:
            params[prop] = value[prop];
        }
      }
    });
    if (!arrayIsEmpty(outputMaterials)) {
      const materialGroups = outputMaterials.map(n => _.compact(n.materialGroup));
      params.outputMaterials = materialGroups;
    }
    if (taskStrategies) {
      // 经过策略相关的formatParams
      params.taskStrategies = taskStrategies.map(n => formatParams(n));
    }
    if (value.mgmtLifeCycle) {
      const { scan, warnConfig, reportTemplateId, acceptanceCheck } = value;
      params.repairTaskConfig = {
        scan,
        warnConfig,
        reportTemplateId,
        acceptanceCheck,
      };
    }
    return params;
  };

  onSubmitModuleOut = value => {
    this.setState({ outputMaterials: value });
  };

  handleStrategySubmit = taskStrategies => {
    this.setState({ taskStrategies });
  };

  onTypeChange = type => {
    this.setState({ type });
  };

  submit = () => {
    const { type } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      // 为了保存生命周期开启后的表单值，仅会隐藏，所以对表单空值校验做特殊处理
      if (
        err &&
        !(type === MACHINING_MATERIAL_TYPE_TOOLING && err.toolingType) &&
        (values.mgmtLifeCycle && err.reportTemplateId)
      ) {
        return null;
      }
      const params = this.formatParams(values);
      if (values.status === '1') {
        this.setState({ visible: true, params });
      } else {
        this.addMachiningMaterial(params);
      }
    });
  };

  addMachiningMaterial = params => {
    addMachiningMaterial(params).then(() => {
      const { router } = this.context;
      const { changeChineseTemplateToLocale } = this.context;
      message.success(changeChineseTemplateToLocale('创建{machiningMaterial}成功', {
        machiningMaterial: customLanguage.equipment_machining_material,
      }));
      router.history.push(getMachiningMaterialListUrl());
    });
  };

  render() {
    const { form, intl } = this.props;
    const { outputMaterials, visible, type, params } = this.state;

    return (
      <div id="create_material" className={styles.createMachiningMaterial}>
        <p className={styles.header}>{`${changeChineseToLocale('创建', intl)}${customLanguage.equipment_machining_material}`}</p>
        <Base
          outputMaterials={outputMaterials}
          onTypeChange={this.onTypeChange}
          onSubmitModuleOut={this.onSubmitModuleOut}
          handleStrategySubmit={this.handleStrategySubmit}
          form={form}
        />
        <div style={{ paddingLeft: 160, paddingTop: 5, marginBottom: 50 }}>
          <div className={styles.footer}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => {
                const { router } = this.context;
                if (router) {
                  router.history.push(getMachiningMaterialListUrl());
                }
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              className={styles.ok}
              onClick={() => {
                this.submit();
              }}
            >
              保存
            </Button>
            <ConfirmModal
              onVisibleChange={value => {
                this.setState({ visible: value });
              }}
              type={type}
              action={'create'}
              visible={visible}
              onConfirm={() => {
                this.addMachiningMaterial(params);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

CreateMachiningMaterial.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withRouter(
  withForm({ showPageFooter: true, footerStyle: { marginLeft: 150 } }, injectIntl(CreateMachiningMaterial)),
);
