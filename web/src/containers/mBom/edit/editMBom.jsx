import React, { Component } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { withRouter, Prompt } from 'react-router-dom';
import { Button, message, Spin } from 'components';
import { editMBom } from 'src/services/bom/mbom';
import { formatToUnix } from 'utils/time';
import withForm from 'components/form';
import { convertPreparationTime } from 'src/containers/processRouting/util';
import { LEAVING_MESSAGE } from '../base/constant';

import { getRightAmount } from '../util';
import BaseForm from '../base';
import { changeChineseToLocaleWithoutIntl } from '../../../utils/locale/utils';

const confirm = Modal.confirm;

class EditMBom extends Component {
  props: {
    match: {
      params: {
        mBomId: String,
      },
    },
    viewer?: any,
    relay: {},
    processRouting: {},
    form: {
      getFieldDecorator: () => {},
      getFieldValue: () => {},
      setFieldsValue: () => {},
    },
    router: any,
  };
  state = {
    loading: false,
  };

  submit = async () => {
    const { form } = this.props;
    if (!this.formInstance.checkSave()) {
      return;
    }
    const value = form.getFieldsValue();
    const { processList } = value;
    if (!this.formInstance.checkProcessList(processList)) {
      return null;
    }
    this.formInstance.checkVirtualMaterial(value, this.updateMBom);
  };

  updateMBom = async value => {
    const {
      materialCode: { key: materialString },
      defNum,
      ebomVersion,
      validFrom,
      validTo,
      processList,
      unitId,
      processRoutingCode,
      bindEBomToProcessRouting,
      ...rest
    } = value;
    const _processList =
      processList &&
      processList.map(({ nodes, inputMaterial, outputMaterial, ...rest }, index) => ({
        nodes: nodes.map(
          ({
            nodeCode,
            inputMaterials,
            primaryMaterialCode,
            outputMaterial,
            productDesc,
            preparationTime,
            preparationTimeCategory,
            attachments,
            deliverable,
            process: { code: processCode },
            workstations,
            workstationGroups,
            qcConfigs,
            toolings,
          }) => {
            const { material, amount, currentUnitId } = outputMaterial || {};
            const nextNode = processList[index + 1] && processList[index + 1].nodes[0];
            return {
              nodeCode,
              processCode,
              primaryMaterialCode,
              preparationTime: convertPreparationTime(preparationTime, preparationTimeCategory),
              preparationTimeCategory,
              deliverable,
              workstationGroups: workstationGroups && workstationGroups.map(e => e.id),
              workstations: workstations && workstations.map(e => e.id),
              // 投入物料必须有material
              inputMaterials:
                (bindEBomToProcessRouting || !ebomVersion) && Array.isArray(inputMaterials)
                  ? inputMaterials.map(
                      ({ material: { code }, amount, currentUnitId, materialProductionMode, amountFraction }) => {
                        return {
                          materialCode: code,
                          ...(amountFraction ? { amountFraction } : {}),
                          ...getRightAmount(amount),
                          currentUnitId,
                          materialProductionMode,
                        };
                      },
                    )
                  : null,
              // 产出物料只要填了数量即可
              outputMaterial:
                bindEBomToProcessRouting || !ebomVersion
                  ? {
                      materialCode: material && material.code,
                      ...getRightAmount(outputMaterial && outputMaterial.amount),
                      materialProductionMode: _.get(nextNode, 'preMaterialProductionMode'),
                      currentUnitId,
                    }
                  : null,
              productDesc,
              toolings:
                toolings && toolings.map(e => ({ toolingCode: e.toolingCode && e.toolingCode.key, count: e.count })),
              attachments: attachments && attachments.filter(e => e).map(e => e.id),
              qcConfigs:
                qcConfigs &&
                qcConfigs
                  .filter(e => e)
                  .map(qcConfig => {
                    return qcConfig.id;
                  }),
            };
          },
        ),
        ...rest,
      }));
    const lastProcessGroup = _processList && _processList[_processList.length - 1];
    if (lastProcessGroup && lastProcessGroup.nodes.length > 1) {
      lastProcessGroup.outputMaterial = {
        materialCode: JSON.parse(materialString).code,
        amount: defNum,
      };
    } else if (lastProcessGroup && lastProcessGroup.nodes.length === 1) {
      lastProcessGroup.nodes[0].outputMaterial = {
        materialCode: JSON.parse(materialString).code,
        amount: defNum,
      };
    }
    const payload = {
      id: this.props.match.params.mBomId,
      defNum,
      materialCode: JSON.parse(materialString).code,
      validFrom: validFrom ? formatToUnix(validFrom) : '',
      validTo: validTo ? formatToUnix(validTo) : '',
      status: 1,
      ebomVersion: ebomVersion ? JSON.parse(ebomVersion).version : null,
      processRoutingCode: processRoutingCode.key,
      processList: _processList,
      bindEBomToProcessRouting,
      ...rest,
    };
    this.setState({ loading: true });
    const {
      data: { statusCode, data },
    } = await editMBom(payload).finally(() => {
      this.setState({ loading: false });
    });
    if (sensors) {
      sensors.track('web_bom_mBom_edit', {});
    }
    if (statusCode === 200) {
      message.success('编辑成功');
      this.setState({ confirmType: 'success' }, () => {
        this.context.router.history.push(`/bom/mbom/${data}/detail`);
      });
    }
  };

  render() {
    const { form, router, match } = this.props;
    const { confirmType, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <Prompt message={changeChineseToLocaleWithoutIntl(LEAVING_MESSAGE)} when={confirmType !== 'success'} />
        <BaseForm
          ref={e => {
            if (e) {
              this.formInstance = e;
            }
          }}
          match={match}
          form={form}
          edit
          router={router}
        />
        <div
          style={{
            justifyContent: 'center',
            marginBottom: 10,
            display: 'flex',
          }}
        >
          <Button
            type="ghost"
            onClick={() => this.context.router.history.push('/bom/mbom')}
            style={{
              margin: '0 20px',
              width: 114,
              height: 32,
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            onClick={() => this.submit()}
            style={{
              margin: '0 20px',
              width: 114,
              height: 32,
            }}
          >
            保存
          </Button>
        </div>
      </Spin>
    );
  }
}

EditMBom.contextTypes = {
  router: {},
};

const EditMBomForm = withForm({}, EditMBom);

export default withRouter(EditMBomForm);
