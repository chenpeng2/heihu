import React, { Component, Fragment } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { withRouter, Prompt } from 'react-router-dom';
import { message, Spin, Button } from 'components';
import { addMBom } from 'src/services/bom/mbom';
import { formatToUnix } from 'utils/time';
import withForm from 'components/form';
import { convertPreparationTime } from 'src/containers/processRouting/util';
import { LEAVING_MESSAGE } from '../base/constant';

import BaseForm from '../base';
import { getRightAmount, setMbomVersionInLocalStorage } from '../util';
import { changeChineseToLocaleWithoutIntl } from '../../../utils/locale/utils';

const confirm = Modal.confirm;

class CreateMBom extends Component {
  props: {
    match: {
      params: {},
    },
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

  addMBom = async value => {
    const {
      materialCode: { key: materialString },
      ebomVersion,
      validFrom,
      validTo,
      processList,
      processRoutingCode,
      defNum,
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
            toolings,
            preparationTime,
            preparationTimeCategory,
            deliverable,
            process: { code: processCode },
            workstations,
            workstationGroups,
            attachments,
            qcConfigs,
          }) => {
            const { material, currentUnitId, amount } = outputMaterial || {};
            const nextNode = processList[index + 1] && processList[index + 1].nodes[0];
            return {
              nodeCode,
              processCode,
              primaryMaterialCode,
              preparationTime: convertPreparationTime(preparationTime, preparationTimeCategory),
              preparationTimeCategory,
              toolings:
                toolings && toolings.map(e => ({ toolingCode: e.toolingCode && e.toolingCode.key, count: e.count })),
              deliverable,
              workstationGroups: workstationGroups && workstationGroups.map(e => e.id),
              workstations: workstations && workstations.map(e => e.id),
              inputMaterials: Array.isArray(inputMaterials)
                ? inputMaterials.map(({ material: { code }, amount, currentUnitId, materialProductionMode }) => {
                    return {
                      materialCode: code,
                      ...getRightAmount(amount),
                      currentUnitId,
                      materialProductionMode,
                    };
                  })
                : null,
              // TODO 产出物料只填数量也可以提交
              outputMaterial: {
                materialCode: material && material.code,
                ...getRightAmount(amount),
                materialProductionMode: _.get(nextNode, 'preMaterialProductionMode'),
                currentUnitId,
              },
              productDesc,
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
      ...rest,
      defNum,
      materialCode: JSON.parse(materialString).code,
      validFrom: validFrom ? formatToUnix(validFrom) : '',
      validTo: validTo ? formatToUnix(validTo) : '',
      status: 1,
      ebomVersion: ebomVersion ? JSON.parse(ebomVersion).version : null,
      processRoutingCode: processRoutingCode.key,
      processList: _processList,
    };
    this.setState({ loading: true });
    const {
      data: { statusCode, data },
    } = await addMBom(payload).finally(() => {
      this.setState({ loading: false });
    });

    if (sensors) {
      sensors.track('web_bom_mBom_create', {
        CreateMode: '手动创建',
        amount: 1,
      });
    }

    if (statusCode === 200) {
      message.success('创建成功');
      setMbomVersionInLocalStorage(payload ? payload.version : null);
      this.setState({ confirmType: 'success' }, () => {
        this.context.router.history.push(`/bom/mbom/${data.id}/detail`);
      });
    }
  };

  submit = async () => {
    const { form } = this.props;
    this.formInstance.checkSave();
    const value = form.getFieldsValue();
    const { processList } = value;
    if (!this.formInstance.checkProcessList(processList)) {
      return null;
    }
    this.formInstance.checkVirtualMaterial(value, this.addMBom);
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

CreateMBom.contextTypes = {
  router: {},
};

const CreateMBomForm = withRouter(withForm({}, CreateMBom));

export default CreateMBomForm;
