import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import withForm from 'components/form';
import { Button, message, Spin } from 'components';
import { arrayIsEmpty } from 'src/utils/array';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { editMachiningMaterial, getMachiningMaterialDetail } from 'src/services/knowledgeBase/equipment';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { formatParams, formatValue } from '../equipmentType/base/formatValue';
import Base from './base';
import ConfirmModal from './confirmModal';
import styles from './styles.scss';

type Props = {
  form: any,
  intl: any,
  match: {},
};

const customLanguage = getCustomLanguage();

class EditMachiningMaterial extends Component {
  props: Props;

  state = {
    loading: false,
    data: null,
  };

  async componentWillMount() {
    const { match } = this.props;
    const {
      params: { code },
    } = match;
    this.setState({ loading: true });
    const {
      data: { data },
    } = await getMachiningMaterialDetail(decodeURIComponent(code));
    const { outputMaterials } = data;
    const config = outputMaterials.map(materials => {
      return {
        materialGroup: materials.map(material => {
          const {
            outputMaterialCode,
            outputMaterialName,
            outputAmount,
            outputMaterialPrimaryUnitName,
            unitName,
          } = material;
          return {
            outputMaterialCode,
            outputMaterialName,
            outputAmount,
            unitName: outputMaterialPrimaryUnitName || unitName,
          };
        }),
        isSaved: true,
        isInitialMaterial: true,
      };
    });
    this.setState({ data, taskStrategies: data.taskStrategies || [], loading: false, outputMaterials: config });
  }

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
      params.taskStrategies = taskStrategies.map(n => {
        if (n.orgId) {
          return formatParams(formatValue(n));
        }
        return formatParams(n);
      });
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

  submit = () => {
    const { match } = this.props;
    const {
      params: { code },
    } = match;
    const { router, changeChineseTemplateToLocale } = this.context;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return null;
      const params = this.formatParams(values);
      editMachiningMaterial(decodeURIComponent(code), params).then(() => {
        message.success(changeChineseTemplateToLocale('编辑{machiningMaterial}成功', {
          machiningMaterial: customLanguage.equipment_machining_material,
        }));
        router.history.go(-1);
      });
    });
  };

  handleStrategySubmit = taskStrategies => {
    this.setState({ taskStrategies });
  };

  onSubmitModuleOut = value => {
    this.setState({ outputMaterials: value });
  };

  onTypeChange = type => {
    this.setState({ type });
  };

  render() {
    const { form, intl } = this.props;
    const { getFieldValue } = form;
    const { loading, data, outputMaterials, taskStrategies, type, visible } = this.state;
    const { draft } = data || {};
    return (
      <Spin spinning={loading}>
        {data ? (
          <div id="edit_material">
            <p className={styles.header}>{`${changeChineseToLocale('编辑', intl)}${customLanguage.equipment_machining_material}`}</p>
            <Base
              edit
              outputMaterials={outputMaterials}
              onTypeChange={this.onTypeChange}
              taskStrategies={taskStrategies}
              onSubmitModuleOut={this.onSubmitModuleOut}
              handleStrategySubmit={this.handleStrategySubmit}
              form={form}
              data={data}
            />
            <div style={{ paddingLeft: 160, marginBottom: 50 }}>
              <div className={styles.footer}>
                <Button
                  className={styles.cancel}
                  type="ghost"
                  onClick={() => {
                    const { router } = this.context;
                    if (router) {
                      router.history.go(-1);
                    }
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  className={styles.ok}
                  onClick={() => {
                    const status = getFieldValue('status');
                    if (draft && status === '1') {
                      this.setState({ visible: true });
                    } else {
                      this.submit();
                    }
                  }}
                >
                  保存
                </Button>
              </div>
            </div>
            <ConfirmModal
              onVisibleChange={value => {
                this.setState({ visible: value });
              }}
              type={type || data.type}
              action={'edit'}
              visible={visible}
              onConfirm={this.submit}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}
      </Spin>
    );
  }
}

EditMachiningMaterial.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withRouter(withForm({ showPageFooter: true, footerStyle: { marginLeft: 150 } }, injectIntl(EditMachiningMaterial)));
