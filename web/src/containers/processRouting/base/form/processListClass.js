import _ from 'lodash';

import { arrayIsEmpty } from 'src/utils/array';
import { createUUID } from '../../util';

/*
 * 工序列表数据结构
 *
 * [{
 *   nodes: [{ nodeCode: number, processUUID: string, processContainerUUID: string ,process: {}, ...  }]
 *   processContainerUUID
 * }]
 *
 * */

class ProcessListClass {
  constructor(value) {
    this._value = this.formatProcessListData(value);
  }

  formatProcessListData = processListData => {
    const formatProcessData = processData => {
      if (!processData) return {};

      const containerUUID = processData.processContainerUUID || createUUID();
      if (processData && Array.isArray(processData.nodes)) {
        processData.nodes = processData.nodes.map(node => {
          const {
            qcConfigs,
            process,
            processUUID,
            nodeCode,
            id,
            successionMode,
            preparationTime,
            preparationTimeCategory,
            productDesc,
            workstationDetails,
            workstations,
            workstationGroups,
            attachments,
            deliverable,
          } = node;

          return {
            id,
            qcConfigs: qcConfigs || [],
            processUUID: processUUID || createUUID(),
            process: { code: process ? process.code : null, name: process ? process.name : null },
            nodeCode,
            processContainerUUID: containerUUID,
            successionMode,
            preparationTime,
            preparationTimeCategory,
            productDesc,
            workstationDetails,
            workstations,
            deliverable,
            workstationGroups,
            attachments,
          };
        });
      }

      if (!processData.processContainerUUID) {
        processData.processContainerUUID = containerUUID;
      }
      return processData;
    };

    if (!Array.isArray(processListData) || !processListData.length) {
      const containerUUID = createUUID();

      return [
        formatProcessData({
          processContainerUUID: containerUUID,
          nodes: [{ processUUID: createUUID(), nodeCode: 1, processContainerUUID: containerUUID }],
        }),
      ];
    }

    return processListData.map(processData => {
      return formatProcessData(processData);
    });
  };

  getMaxNodeCodeInProcessListData = () => {
    const processListData = this._value;
    const nodesArray = [];

    if (!Array.isArray(processListData)) return 0;
    processListData.forEach(item => {
      const { nodes } = item || {};
      if (!Array.isArray(nodes)) return;

      nodes.forEach(node => {
        const { nodeCode } = node || {};
        nodesArray.push(Number(nodeCode));
      });
    });

    return Math.max(...nodesArray);
  };

  addNormalProcessContainer = nodeContainerDataIndex => {
    const processListData = this._value;
    const maxNodeCode = this.getMaxNodeCodeInProcessListData();
    const containerUUID = createUUID();

    processListData.splice(nodeContainerDataIndex + 1, 0, {
      nodes: [{ processUUID: createUUID(), nodeCode: maxNodeCode + 1, processContainerUUID: containerUUID }],
      processContainerUUID: containerUUID,
    });
  };

  addParallelProcessContainer = nodeContainerDataIndex => {
    const processListData = this._value;
    const maxNodeCode = this.getMaxNodeCodeInProcessListData();
    const containerUUID = createUUID();

    processListData.splice(nodeContainerDataIndex + 1, 0, {
      nodes: [
        { processUUID: createUUID(), nodeCode: maxNodeCode + 1, processContainerUUID: containerUUID },
        { processUUID: createUUID(), nodeCode: maxNodeCode + 2, processContainerUUID: containerUUID },
      ],
      processContainerUUID: containerUUID,
    });
  };

  addParallelProcessChild = processContainerUUID => {
    const processContainer = this._findActiveProcessContainer(processContainerUUID);

    const maxNodeCode = this.getMaxNodeCodeInProcessListData();
    processContainer.nodes.push({ processUUID: createUUID(), nodeCode: maxNodeCode + 1, processContainerUUID });
  };

  deleteProcessContainer = processContainerUUID => {
    const processListData = this._value;

    const containerIndex = processListData.findIndex(
      container => container.processContainerUUID === processContainerUUID,
    );
    processListData.splice(containerIndex, 1);
  };

  deleteProcess = (processUUID, processContainerUUID) => {
    const processContainer = this._findActiveProcessContainer(processContainerUUID);

    processContainer.nodes = Array.isArray(processContainer.nodes)
      ? processContainer.nodes
          .map(item => {
            if (item && item.processUUID === processUUID) return null;
            return item;
          })
          .filter(a => a)
      : [];
  };

  _findActiveProcessContainer = activeProcessContainerUUID => {
    let _nodeContainer = null;
    const processListData = this._value;
    if (Array.isArray(processListData) && activeProcessContainerUUID) {
      processListData.forEach(container => {
        const { processContainerUUID } = container || {};
        if (activeProcessContainerUUID === processContainerUUID) {
          _nodeContainer = container;
        }
      });
    }
    return _nodeContainer;
  };

  _findActiveProcess = (activeProcessContainerUUID, activeProcessUUID) => {
    const _nodeContainer = this._findActiveProcessContainer(activeProcessContainerUUID) || null;
    let _activeProcess = null;

    if (_nodeContainer && activeProcessUUID) {
      const { nodes } = _nodeContainer;
      if (nodes && Array.isArray(nodes)) {
        nodes.forEach(node => {
          const { processUUID } = node || {};
          if (processUUID === activeProcessUUID) {
            _activeProcess = node;
          }
        });
      }
    }

    return _activeProcess;
  };

  findActiveProcess = (activeProcessContainerUUID, activeProcessUUID) => {
    return _.cloneDeep(this._findActiveProcess(activeProcessContainerUUID, activeProcessUUID));
  };

  findActiveProcessContainer = activeProcessContainerUUID => {
    return _.cloneDeep(this._findActiveProcessContainer(activeProcessContainerUUID));
  };

  addExtraDataForProcess = (activeProcessContainerUUID, activeProcessUUID, extraValue) => {
    let processListData = _.cloneDeep(this._value);
    if (Array.isArray(processListData) && activeProcessContainerUUID) {
      processListData = processListData.map(container => {
        if (
          container &&
          activeProcessContainerUUID === container.processContainerUUID &&
          activeProcessUUID &&
          container &&
          Array.isArray(container.nodes)
        ) {
          container.nodes = container.nodes.map(node => {
            const { processUUID } = node;
            // 只会将新的数据添加到其中。类似id这种数据会一直在其中
            if (processUUID === activeProcessUUID) {
              return Object.assign({}, { processUUID: activeProcessUUID }, node, extraValue, {
                workstationGroups: null,
              });
            }
            return node;
          });
        }
        return container;
      });
    }

    this._value = processListData;
  };

  findTheLastProcessUUIDAndProcessContainerUUID = () => {
    const processListData = this._value;
    const activeProcessContainer = processListData[processListData.length - 1];
    const activeProcess = activeProcessContainer ? activeProcessContainer.nodes[0] : null;

    return {
      activeProcessUUID: activeProcess ? activeProcess.processUUID : null,
      activeProcessContainerUUID: activeProcessContainer ? activeProcessContainer.processContainerUUID : null,
    };
  };

  getProcessListData = () => {
    return this._value;
  };

  // 将processList节点的顺序进行调换
  // activeProcessContainerUUID用于找到需要改变顺序的container
  // to是节点的目标index,也就是要去的位置。如果目标位置小于0放在队首，如果大于array.length，放在队尾
  // 改变成功返回true，否则返回false
  changeProcessContainerSequence = (activeProcessContainerUUID, to) => {
    // 对目标位置进行检查
    if (typeof to !== 'number') return false;

    let processListData = _.cloneDeep(this._value);
    // 原本有工序组，现在只有普通工序。所有container其实就代表了这个一个工序。在改变的时候只需要改变container
    const activeProcessContainer = this._findActiveProcessContainer(activeProcessContainerUUID);

    // 没有找到节点
    if (!activeProcessContainer) return false;

    // data为空
    if (arrayIsEmpty(processListData)) return false;

    // 先将data中的node删除
    processListData = processListData.filter(i => i && i.processContainerUUID !== activeProcessContainerUUID);

    // 将container添加到目标位置
    processListData.splice(to, 0, activeProcessContainer);

    this._value = processListData;
    return true;
  };
}

export default ProcessListClass;
