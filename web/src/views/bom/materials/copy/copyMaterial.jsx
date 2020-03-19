import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import withForm from 'src/components/form/index';
import log from 'utils/log';
import { Button, Spin, FormattedMessage } from 'src/components/index';
import { alertYellow } from 'src/styles/color/index';
import { formatValues, formatInitialValue } from 'containers/qcConfig/qcConfigList';
import { queryMaterialDetail, addMaterial } from 'src/services/bom/material';
import { isFraction, getFractionCompose } from 'src/utils/number';
import BasicInfo from 'src/containers/material/commonComponent/form/index';
import moment from 'src/utils/time';

import styles from './styles.scss';

type Props = {
  form: any,
  match: {
    params: {
      materialId: string,
    },
  },
  location: {
    pathname: String,
  },
};

export class CopyMaterial extends Component {
  props: Props;

  state = {
    loading: false,
    data: null,
  };

  componentDidMount() {
    const materialCode = _.get(this.props, 'match.params.materialCode');
    this.fetchData(decodeURIComponent(materialCode));
  }

  formatData = values => {
    const {
      replaceMaterialList: _replaceMaterialList,
      qcConfigDetails: _qcConfigDetails,
      attachmentDetails,
      unitConversions: _unitConversions,
      materialTypes,
      unitId,
      unitName,
      checkDate,
      qcStatus,
      qcOperator,
      issueWarehouseId,
      issueWarehouseName,
      ...rest
    } = values || {};

    const replaceMaterialList =
      _replaceMaterialList &&
      _replaceMaterialList.map(({ code, name }) => ({ material: { key: code, label: `${code}/${name}` } }));
    const qcConfigDetails = _qcConfigDetails && _qcConfigDetails.map(qcConfig => formatInitialValue(qcConfig));
    const attachments = attachmentDetails;
    const unitConversions =
      _unitConversions &&
      _unitConversions.map((x, i) => {
        const { slaveUnitId, slaveUnitName, ...rest } = x || {};
        return { slaveUnitId: { key: slaveUnitId, label: slaveUnitName }, ...rest, index: i };
      });
    const _materialTypes =
      Array.isArray(materialTypes) && materialTypes.length
        ? materialTypes
            .map(i => {
              const { id, name } = i || {};
              return { key: id, label: name };
            })
            .filter(i => i && i.key && i.label)
        : undefined;

    const res = {
      ...rest,
      unitConversions,
      replaceMaterialList,
      qcConfigDetails,
      attachments,
      materialTypes: _materialTypes,
      unitId: { key: unitId, label: unitName },
      materialCheckDate: checkDate ? moment(checkDate) : undefined,
      qualityStatus: qcStatus,
      qcOperatorId: qcOperator ? { key: qcOperator.id, label: qcOperator.name } : undefined,
      issueWarehouseId: issueWarehouseId ? { key: issueWarehouseId, label: issueWarehouseName } : undefined,
    };

    // 复制物料状态默认是启用中
    res.status = 1;

    return res;
  };

  fetchData = async code => {
    const { form } = this.props;

    // 获取数据
    this.setState({ loading: true });
    const { data } = await queryMaterialDetail(code);
    this.setState({ loading: false });
    const node = data && data.data;

    // 格式化data
    const formatData = this.formatData(node);

    this.setState({ data: formatData }, () => {
      // 将数据设置到form中
      const _formValue = _.cloneDeep(formatData);
      delete _formValue.materialCustomFields;
      delete _formValue.replaceMaterialList;

      form.setFieldsValue(formatData);
    });
  };

  submit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        try {
          const payload = this.formInstance.getPayload();
          const {
            specifications,
            attachments,
            qcConfigDetails,
            unitConversions,
            materialCustomFields,
            replaceMaterialList,
          } = payload;
          const attachmentsId = [];
          if (attachments && attachments.length > 0) {
            attachments.forEach(node => {
              if (node.restId) {
                attachmentsId.push(node.restId);
              } else {
                attachmentsId.push(node.id);
              }
            });
            delete payload.attachments;
            payload.attachments = attachmentsId;
          }

          payload.unitConversions = unitConversions;
          payload.materialCustomFields = Array.isArray(materialCustomFields)
            ? materialCustomFields.filter(i => i && i.keyValue)
            : [];
          if (qcConfigDetails) {
            qcConfigDetails.forEach(n => {
              if (n.checkType === 0) {
                if (!payload.inputFactoryQcConfigs) {
                  payload.inputFactoryQcConfigs = [n.id];
                } else {
                  payload.inputFactoryQcConfigs.push(n.id);
                }
              }
              if (n.checkType === 1) {
                if (!payload.outputFactoryQcConfigs) {
                  payload.outputFactoryQcConfigs = [n.id];
                } else {
                  payload.outputFactoryQcConfigs.push(n.id);
                }
              }
            });
            payload.qcConfigDetails = undefined;
          }
          payload.replaceMaterialList = replaceMaterialList && replaceMaterialList.map(({ key }) => key);
          payload.specifications = Array.isArray(specifications)
            ? specifications.map(i => {
                const { amount, unit } = i || {};
                if (isFraction(amount)) {
                  return {
                    ...getFractionCompose(amount),
                    unitId: unit,
                  };
                }
                return {
                  numerator: Number(amount),
                  denominator: 1,
                  unitId: unit,
                };
              })
            : null;

          addMaterial(payload)
            .then(res => {
              if (_.get(res, 'status') === 200) {
                this.context.router.history.push(`/bom/materials/${encodeURIComponent(payload.code)}/detail`);
              }
            })
            .catch(console.log);
        } catch (e) {
          log.error(e);
        }
      }
    });
  };

  getUnitForSelect = () => {
    const { unitId, unitConversions } = this.state.data;
    const res = [{ unit: { id: _.get(unitId, 'key'), name: _.get(unitId, 'label') }, key: 'mainUnit' }];
    if (Array.isArray(unitConversions) && unitConversions.length) {
      unitConversions.forEach((i, index) => {
        const { slaveUnitId } = i || {};
        res.push({ unit: { id: _.get(slaveUnitId, 'key'), name: _.get(slaveUnitId, 'label') }, key: index });
      });
    }

    return res;
  };

  render() {
    const { form } = this.props;
    const { data } = this.state;
    const {
      materialCheckDate,
      specifications,
      code,
      name,
      unitConversions,
      replaceMaterialList,
      materialCustomFields,
      validTime,
    } = data || {};

    return (
      <Spin spinning={this.state.loading}>
        <div id="copy_material" className={styles.editMaterial}>
          <FormattedMessage className={styles.header} defaultMessage={'复制物料'} />
          {data ? (
            <div>
              <BasicInfo
                ref={e => {
                  if (!this.formInstance) {
                    this.formInstance = e;
                  }
                }}
                form={form}
                mainMaterial={{ code, name }}
                unitConversions={unitConversions}
                replaceMaterialList={replaceMaterialList}
                materialCustomFields={materialCustomFields}
                unitsForSelect={this.getUnitForSelect()}
                specifications={specifications}
                validTime={validTime}
                materialCheckDate={materialCheckDate}
                copy
              />
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
                <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
                  保存
                </Button>
              </div>
              <p style={{ color: alertYellow, marginTop: 24, paddingLeft: 160 }}>
                <FormattedMessage
                  defaultMessage={'保存后所有调用该物料的物料清单、生产BOM、二维码、项目和任务，都会更新为最新信息。'}
                />
              </p>
            </div>
          ) : null}
        </div>
      </Spin>
    );
  }
}

CopyMaterial.contextTypes = {
  router: PropTypes.object.isRequired,
};

export const CopyMaterialForm = withForm(
  {
    showFooter: false,
  },
  CopyMaterial,
);

export default withRouter(CopyMaterialForm);
