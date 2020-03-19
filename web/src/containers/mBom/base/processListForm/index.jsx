import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Button, message } from 'components';
import { round, mathJs, formatFraction, getFractionString, fraction } from 'src/utils/number';
import log from 'utils/log';

import EditProcessForm from '../editProcessForm';
import ProcessRouteGraph from '../processRouteGraph';
import { findMaterial } from '../util';
import styles from './styles.scss';

const AntButton = Button.AntButton;

type Props = {
  value: [],
  form: any,
  processRouting: {
    processList: [],
  },
  eBom: {
    rawMaterialList: [],
  },
  bindEBomToProcessRouting: boolean,
};

class ProcessListForm extends Component {
  props: Props;

  state = {
    processContainerNo: 0,
    processNo: 0,
    open: false,
  };

  componentWillMount() {
    const { value, eBom, processRouting } = this.props;
    if (eBom) {
      const materialList = _.cloneDeep(eBom.rawMaterialList.filter(e => e.regulatoryControl))
        .map(i => {
          if (i.amountFraction) {
            i.amount = getFractionString(i.amountFraction);
          } else {
            i.amount = round(i.amount);
          }
          return i;
        })
        .reduce((res, ele) => {
          const material = findMaterial(ele.materialCode, res);
          if (material) {
            material.amount = formatFraction(mathJs.add(fraction(material.amount), fraction(ele.amount)));
          } else {
            res.push(ele);
          }
          return res;
        }, []);
      if (value) {
        // 所以需要在物料列表中把所有结点的投入产出扣除
        value.forEach(({ nodes }) => {
          const { inputMaterials, outputMaterial } = nodes[0];

          // 需要把这一次填写的投入产出物料的数量扣除
          if (Array.isArray(inputMaterials)) {
            inputMaterials.forEach(inputMaterial => {
              const { material, amount } = inputMaterial;
              const rawMaterial = findMaterial(material.code, materialList);
              if (rawMaterial) {
                rawMaterial.amount = formatFraction(
                  mathJs.subtract(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
                );
              }
            });
          }
          if (outputMaterial && outputMaterial.material) {
            const { material, amount } = outputMaterial;
            const rawMaterial = findMaterial(material.code, materialList);
            if (rawMaterial) {
              rawMaterial.amount = formatFraction(
                mathJs.subtract(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
              );
            }
          }
        });
      }
      this.setState({ materialList });
    }
    this.setState({ value: value || (processRouting && processRouting.processList) });
  }

  componentWillReceiveProps(nextProps) {
    const { processRouting, eBom, value } = nextProps;
    console.log(value);
    if (!_.isEqual(this.props.eBom, nextProps.eBom) || !_.isEqual(this.props.value, value)) {
      if (eBom) {
        const materialList = _.cloneDeep(eBom.rawMaterialList.filter(e => e.regulatoryControl))
          .map(i => {
            if (i.amountFraction) {
              i.amount = getFractionString(i.amountFraction);
            } else {
              i.amount = round(i.amount);
            }
            return i;
          })
          .reduce((res, ele) => {
            const material = findMaterial(ele.materialCode, res);
            if (material) {
              material.amount = formatFraction(mathJs.add(fraction(material.amount), fraction(ele.amount)));
            } else {
              res.push(ele);
            }
            return res;
          }, []);
        if (value) {
          // 所以需要在物料列表中把所有结点的投入产出扣除
          value.forEach(({ nodes }) => {
            const { inputMaterials, outputMaterial } = nodes[0];

            // 需要把这一次填写的投入产出物料的数量扣除
            if (Array.isArray(inputMaterials)) {
              inputMaterials.forEach(inputMaterial => {
                const { material, amount } = inputMaterial;
                const rawMaterial = findMaterial(material.code, materialList);
                if (rawMaterial) {
                  rawMaterial.amount = formatFraction(
                    mathJs.subtract(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
                  );
                }
              });
            }
            if (outputMaterial && outputMaterial.material) {
              const { material, amount } = outputMaterial;
              const rawMaterial = findMaterial(material.code, materialList);
              if (rawMaterial) {
                rawMaterial.amount = formatFraction(
                  mathJs.subtract(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
                );
              }
            }
          });
        }
        this.setState({ materialList });
      } else {
        this.setState({ materialList: [] });
      }
    }
    if (!_.isEqual(this.props.processRouting, nextProps.processRouting)) {
      this.setState({
        processContainerNo: 0,
        processNo: 0,
      });
    }
    if (!nextProps.value) {
      this.setState({
        value: processRouting && processRouting.processList,
        // processContainerNo: 0,
        // processNo: 0,
      });
    } else if (!_.isEqual(nextProps.value, this.state.value)) {
      this.setState({
        value: nextProps.value,
        // processContainerNo: 0,
        // processNo: 0,
      });
    }
  }

  getFormValue = () => {
    if (this.processFormInstance) {
      return this.processFormInstance.wrappedInstance.getPayload();
    }
    return null;
  };

  isUpdate = () => {
    const { value, processContainerNo, processNo } = this.state;
    const { bindEBomToProcessRouting } = this.props;
    let nodeData;
    const nodeContainerData = _.cloneDeep(value[processContainerNo]);
    if (nodeContainerData && processNo !== 'nothing') {
      nodeData = nodeContainerData.nodes[processNo];
    } else {
      nodeData = nodeContainerData;
    }
    if (nodeData && nodeData.process) {
      const { workstationGroups, workstations, productDesc, attachments } = nodeData;
      const { _workstationGroups, _workstations, _productDesc, _attachments } = nodeData.process;

      delete nodeData.id;
      delete nodeData.processUUID;
      delete nodeData.process;
      delete nodeData.qcConfigFiles;
      delete nodeData.orgId;
      delete nodeData.seq;
      delete nodeData.workstationDetails;
      delete nodeData.workstationGroupDetails;
      delete nodeData.processCode;
      delete nodeData.createdAt;
      delete nodeData.updatedAt;
      delete nodeData.processName;
      delete nodeData.processRoutingCode;

      nodeData.workstationGroups =
        (workstationGroups && workstationGroups.map(({ id, name }) => ({ id, name }))) ||
        (_workstationGroups && _workstationGroups.map(({ id, name }) => ({ id, name })));
      nodeData.workstations =
        (workstations && workstations.map(({ id, name }) => ({ id: String(id), name }))) ||
        (_workstations && _workstations.map(({ id, name }) => ({ id: String(id), name })));
      nodeData.productDesc = productDesc || _productDesc;
      nodeData.attachments = attachments || _attachments;

      const processFormValue = _.cloneDeep(this.getFormValue());

      const deleteEmptyAttr = o => {
        if (o) {
          Object.entries(o).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
              delete o[key];
            }
          });
          return o;
        }
      };
      const rawMaterialCompare = (m1, m2) => {
        if (m1 && m2) {
          const code1 = _.get(m1, 'material.code');
          const code2 = _.get(m2, 'material.code');
          return code1 === code2 && m1.amount === m2.amount;
        }
        return m1 === m2;
      };

      const qcConfigCompare = (_q1s, _q2s) => {
        if (!_q1s && !_q2s) {
          return true;
        }
        if ((_q1s && _q1s.length) !== (_q2s && _q2s.length)) {
          return false;
        }
        for (let i = 0; i < _q1s.length; i += 1) {
          const q1 = _.pick(_q1s[i], ['id']);
          const q2 = _.pick(_q2s[i], ['id']);
          if (!_.isEqual(q1, q2)) {
            return false;
          }
        }
        return true;
      };

      const isEqualRes = _.isEqualWith(processFormValue, nodeData, (_x, _y) => {
        const x = deleteEmptyAttr(_x);
        const y = deleteEmptyAttr(_y);
        const { outputMaterial: outputMaterialX, inputMaterials: inputMaterialsX, qcConfigs: qcConfigsX, ...restX } = x;
        const { outputMaterial: outputMaterialY, inputMaterials: inputMaterialsY, qcConfigs: qcConfigsY, ...restY } = y;
        const isEqualOutputMaterial =
          bindEBomToProcessRouting === false || _.isEqualWith(outputMaterialX, outputMaterialY, rawMaterialCompare);
        const isEqualInputMaterials =
          bindEBomToProcessRouting === false ||
          _.isEqualWith(inputMaterialsX, inputMaterialsY, (inputMaterialsX, inputMaterialsY) => {
            if (
              (!inputMaterialsX || inputMaterialsX.length === 0) &&
              (!inputMaterialsY || inputMaterialsY.length === 0)
            ) {
              return true;
            }
            return _.isEqual(
              inputMaterialsX &&
                inputMaterialsX.map(({ amount, material, materialProductionMode }) => ({
                  amount,
                  materialCode: _.get(material, 'code'),
                  materialProductionMode,
                })),
              inputMaterialsY &&
                inputMaterialsY.map(({ amount, material, materialProductionMode }) => ({
                  amount,
                  materialCode: _.get(material, 'code'),
                  materialProductionMode,
                })),
            );
          });
        const isQcConfigsEqual = qcConfigCompare(qcConfigsX, qcConfigsY);
        return isEqualOutputMaterial && isEqualInputMaterials && isQcConfigsEqual && _.isEqual(restX, restY);
      });

      if (!processFormValue) {
        return true;
      }

      return nodeData && !isEqualRes;
    }
  };

  saveFormValue = () => {
    try {
      const { form, bindEBomToProcessRouting } = this.props;
      const { value, materialList } = this.state;
      const { processContainerNo, processNo } = this.state;
      const processListValue = this.processFormInstance.wrappedInstance.getPayload();
      if (!processListValue) {
        return;
      }
      const _value = _.cloneDeep(value);
      // 单个工序结点
      const { workstations, workstationGroups, attachments, productDesc, ...rest } = processListValue;
      const nodeContainerData = _value[processContainerNo];
      if (processListValue) {
        const {
          process,
          inputMaterials: oldInputMaterials,
          outputMaterial: oldOutputMaterial,
        } = nodeContainerData.nodes[processNo];
        const { inputMaterials, outputMaterial } = rest;
        if (bindEBomToProcessRouting) {
          // 需要把上一次填写的投入产出物料的数量加回去
          if (Array.isArray(oldInputMaterials)) {
            oldInputMaterials.forEach(oldInputMaterial => {
              const { material, amount } = oldInputMaterial;
              const rawMaterial = findMaterial(material.code, materialList);
              if (rawMaterial) {
                rawMaterial.amount = formatFraction(
                  mathJs.add(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
                );
              }
            });
          }
          if (oldOutputMaterial && oldOutputMaterial.material) {
            const { material, amount } = oldOutputMaterial;
            const rawMaterial = findMaterial(material.code, materialList);
            if (rawMaterial) {
              rawMaterial.amount = formatFraction(
                mathJs.add(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
              );
            }
          }
          // 需要把这一次填写的投入产出物料的数量扣除
          if (Array.isArray(inputMaterials)) {
            inputMaterials.forEach(inputMaterial => {
              const { material, amount } = inputMaterial;
              const rawMaterial = findMaterial(material.code, materialList);
              if (rawMaterial) {
                rawMaterial.amount = formatFraction(
                  mathJs.subtract(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
                );
              }
            });
          }
          if (outputMaterial && outputMaterial.material) {
            const { material, amount } = outputMaterial;
            const rawMaterial = findMaterial(material.code, materialList);
            if (rawMaterial) {
              rawMaterial.amount = formatFraction(
                mathJs.subtract(mathJs.fraction(rawMaterial.amount.toString()), mathJs.fraction(amount.toString())),
              );
            }
          }
        }
        nodeContainerData.nodes[processNo] = {
          process: {
            ...process,
          },
          ...rest,
          workstations,
          workstationGroups,
          productDesc,
          attachments,
        };
        if (bindEBomToProcessRouting === false) {
          delete nodeContainerData.nodes[processNo].inputMaterials;
          delete nodeContainerData.nodes[processNo].outputMaterial;
        }
        form.setFieldsValue({
          processList: _value,
        });
        this.setState({ value: _value, materialList });
        // message.success('保存成功');
        return _value;
      }
    } catch (err) {
      log.error(err);
      return false;
    }
  };

  scrollButtonIntoView = () => {
    const domButton = ReactDOM.findDOMNode(this.saveButtonRef);

    if (!domButton) return;

    domButton.scrollIntoView();
    this.shinningButton();
  };

  shinningButton = () => {
    const domButton = ReactDOM.findDOMNode(this.saveButtonRef);

    if (!domButton) return;

    const lastClassName = domButton.getAttribute('class');

    domButton.setAttribute('class', `${_.replace(lastClassName, styles.buttonOnShinning, '')}`);
    domButton.setAttribute('class', `${styles.buttonOnShinning} ${lastClassName}`);
  };

  renderForm = () => {
    const { form, processRouting, ...rest } = this.props;
    const { value, processContainerNo, processNo, materialList } = this.state;
    return (
      <EditProcessForm
        className={`${styles.lighting} ${styles.processForm}`}
        key={`${processRouting && processRouting.code}-${processContainerNo}-${processNo}`}
        wrappedComponentRef={ref => (this.processFormInstance = ref)}
        initialData={value[processContainerNo] && value[processContainerNo].nodes[processNo]}
        allData={value}
        processContainerNo={processContainerNo}
        processNo={processNo}
        processRouting={processRouting}
        materialList={materialList}
        {...rest}
      />
    );
  };

  render() {
    const { form } = this.props;
    const { value, processContainerNo, processNo } = this.state;
    console.log(value, processContainerNo, processNo);

    return (
      <div style={{ position: 'relative' }}>
        <ProcessRouteGraph
          style={{
            border: '1px solid #02b980',
          }}
          editing
          value={value}
          form={form}
          activeNodeIndex={{ processContainerNo, processNo }}
          onNodeClick={(a, nodeDataIndex, dataContainerIndex, allData) => {
            try {
              const activeProcess = allData[processContainerNo].nodes[processNo] || null; // 正在编辑的数据
              if (!this.saveFormValue()) {
                return;
              }
              // 检查是否保存
              const nodeContainerData = allData[dataContainerIndex];
              console.log(dataContainerIndex, nodeDataIndex);
              this.setState({
                processContainerNo: nodeContainerData ? dataContainerIndex : 'nothing',
                processNo: nodeContainerData ? nodeDataIndex : 'nothing',
              });
            } catch (e) {
              log.error(e);
            }
          }}
        />
        {value && value.length && processContainerNo !== 'nothing' && processNo !== 'nothing'
          ? this.renderForm()
          : null}
      </div>
    );
  }
}

export default ProcessListForm;
