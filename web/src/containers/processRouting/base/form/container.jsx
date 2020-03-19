/**
 * @description: 利用ProcessList数据结构来最终汇聚数据。当内部form中的数据发生改变的时候，
 *  改变ProcessList中对应节点的数据, 将外部form中的processList数据替换, 然后重新渲染。
 *
 *  这样实现外部的form中永远是最新的数据。但内部没有和外部公用一个form。
 *
 *  同时类似id这种不需要进入内部form但是必须的数据无需在内部处理。直接在ProcessList数据结构中的format和init的时候处理就可以持久
 *
 * @date: 2019/6/19 下午3:10
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import { Button, message } from 'src/components';
import { border } from 'src/styles/color';
import log from 'utils/log';

import styles from './styles.scss';
import ProcessRouteGraph from './graph';
import EditProcessForm from './processForm';
import ProcessList from './processListClass';

const AntButton = Button.AntButton;

type Props = {
  value: [],
  form: any,
  isEdit: boolean,
  editGraph: boolean,
  organization: any,
  router: any,
};

class ProcessRouteGraphAndEditForm extends Component {
  props: Props;
  state = {
    activeProcessUUID: null,
    activeProcessContainerUUID: null,
    editContainerClass: null,
    ProcessListData: new ProcessList(),
  };

  componentDidMount() {
    this.setProcessData(this.props, () => {
      this.chooseInitialProcess();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.value, this.props.value)) {
      this.setProcessData(nextProps, () => {
        this.chooseInitialProcess();
      });
    }
  }

  setProcessData = (props, cb) => {
    if (!props) return null;

    const { value } = props;

    this.setState(
      {
        ProcessListData: new ProcessList(value), // 工艺路线数据的数据结构
      },
      () => {
        if (cb && typeof cb === 'function') {
          cb();
        }
      },
    );
  };

  // 如果没有选中的节点,选中最后一个节点
  chooseInitialProcess = () => {
    const { ProcessListData, activeProcessContainerUUID, activeProcessUUID } = this.state;
    if (!ProcessListData.findActiveProcess(activeProcessContainerUUID, activeProcessUUID)) {
      const res = ProcessListData.findTheLastProcessUUIDAndProcessContainerUUID();
      this.setState(res);
    }
  };

  isUpdate = async () => {
    const { ProcessListData } = this.state;
    const { activeProcessUUID, activeProcessContainerUUID } = this.state;

    const activeProcess = ProcessListData.findActiveProcess(activeProcessContainerUUID, activeProcessUUID); // 正在编辑的数据

    if (activeProcess) {
      delete activeProcess.processUUID;
      delete activeProcess.processContainerUUID;

      const processFormValue = await this.getFormValue();

      const deleteEmptyAttr = o => {
        if (o) {
          Object.entries(o).forEach(([key, value]) => {
            if (value === null || value === undefined || (Array.isArray(value) && !value.length)) {
              delete o[key];
            }
          });
          return o;
        }
      };

      const qcConfigCompare = (_q1s, _q2s) => {
        if (!_q1s && !_q2s) {
          return true;
        }
        if ((_q1s && _q1s.length) !== (_q2s && _q2s.length)) {
          return false;
        }
        for (let i = 0; i < _q1s.length; i += 1) {
          const _q1 = _.pick(_q1s[i], [
            'autoCreateQcTask',
            'name',
            'refId',
            'recordType',
            'checkType',
            'checkCountType',
            'checkCount',
            'keys',
          ]);
          const _q2 = _.pick(_q2s[i], [
            'autoCreateQcTask',
            'name',
            'refId',
            'recordType',
            'checkType',
            'checkCountType',
            'checkCount',
            'keys',
          ]);
          const q1 = deleteEmptyAttr(_q1);
          const q2 = deleteEmptyAttr(_q2);
          q1.qcCheckItemConfigs = q1.qcCheckItemConfigs && q1.qcCheckItemConfigs.map(e => deleteEmptyAttr(e));
          q2.qcCheckItemConfigs = q2.qcCheckItemConfigs && q2.qcCheckItemConfigs.map(e => deleteEmptyAttr(e));
          if (!_.isEqual(q1, q2)) {
            return false;
          }
        }
        return true;
      };

      const isEqualRes = _.isEqualWith(processFormValue, activeProcess, (x, y) => {
        const {
          qcConfigs: qcConfigsX,
          workstationDetails: _workstationDetails,
          workstationGroups: _workstationGroups,
          ...restX
        } = x;
        // 过滤后端拉取的初始值 workstationDetails 和 workstationGroups
        const { qcConfigs: qcConfigsY, workstationDetails, workstationGroups, ...restY } = y;
        const isQcConfigsEqual = qcConfigCompare(qcConfigsX, qcConfigsY);
        return isQcConfigsEqual && _.isEqual(deleteEmptyAttr(restX), deleteEmptyAttr(restY));
      });

      if (processFormValue && activeProcess && !isEqualRes) {
        return true;
      }
    }

    return false;
  };

  isSave = async () => {
    const _isUpdate = await this.isUpdate();
    return !_isUpdate;
  };

  getFormValue = async options => {
    if (this.processFormInstance) {
      const formValue = await this.processFormInstance.wrappedInstance.getPayload(options);
      return formValue;
    }
    return null;
  };

  // 改变active的工序
  changeActiveProcess = (processUUID, processContainerUUID) => {
    this.setState({
      activeProcessUUID: processUUID,
      activeProcessContainerUUID: processContainerUUID,
    });
  };

  // 保存工序的数据, 保存失败返回false
  saveProcess = async () => {
    const { ProcessListData } = this.state;
    const { form } = this.props;
    const { activeProcessUUID, activeProcessContainerUUID } = this.state;
    try {
      const processFormValue = await this.getFormValue();
      if (processFormValue) {
        ProcessListData.addExtraDataForProcess(activeProcessContainerUUID, activeProcessUUID, processFormValue);
        const newValue = ProcessListData.getProcessListData();

        // 在这里重新设置value。重新渲染
        form.setFieldsValue({
          processList: newValue,
        });

        return true;
      }
    } catch (e) {
      log.error(e);
    }

    return false;
  };

  render() {
    const { ProcessListData } = this.state;
    const { form, editGraph, isEdit } = this.props;
    const { activeProcessUUID, activeProcessContainerUUID, editContainerClass } = this.state;

    const activeProcessContainer = ProcessListData.findActiveProcessContainer(activeProcessContainerUUID) || null;
    const activeProcess = ProcessListData.findActiveProcess(activeProcessContainerUUID, activeProcessUUID) || null; // 正在编辑的数据

    const isActiveProcessContainerParallel =
      activeProcessContainer && Array.isArray(activeProcessContainer.nodes)
        ? activeProcessContainer.nodes.length > 1
        : false;

    return (
      <div style={{ border: `1px solid ${border}` }}>
        <ProcessRouteGraph
          draggable
          editing={editGraph}
          ProcessListData={ProcessListData}
          form={form}
          activeProcessUUID={activeProcessUUID}
          activeProcessContainerUUID={activeProcessContainerUUID}
          onNodeClick={async nodeData => {
            try {
              this.setState({ editContainerClass: styles.editContainerOnEdit });

              // 检查是否保存
              const _isSave = await this.isSave();
              if (!_isSave) {
                // 切换节点的时候自动保存
                const saveRes = await this.saveProcess();

                // 保存不成功那么退出
                if (!saveRes) return;
                message.success('保存成功!');
              }

              const { processUUID, processContainerUUID } = nodeData || {};
              this.changeActiveProcess(processUUID, processContainerUUID);
            } catch (e) {
              log.error(e);
            }
          }}
        />
        {activeProcessContainerUUID && activeProcessUUID && activeProcess ? (
          <div
            className={editContainerClass}
            style={{ padding: '30px 10px', borderTop: `1px solid ${border}`, position: 'relative' }}
          >
            {/* <div style={{ position: 'absolute', right: 10 }}>{this.renderFooterButton()}</div> */}
            <EditProcessForm
              editing={isEdit}
              key={activeProcessUUID}
              ProcessListData={ProcessListData}
              wrappedComponentRef={inst => (this.processFormInstance = inst)}
              initialData={activeProcess}
              activeProcessUUID={activeProcessUUID}
              activeProcessContainerUUID={activeProcessContainerUUID}
              isActiveProcessContainerParallel={isActiveProcessContainerParallel}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ProcessRouteGraphAndEditForm;
