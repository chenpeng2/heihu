import * as React from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import { TreeSelect } from 'antd';

import { Input, message } from 'src/components';
import { getAreaList, getWorkShopChildren, getProdLineChildren } from 'services/knowledgeBase/area';
import { queryDefWorkstations, queryWorkstation } from 'src/services/workstation';
import { arrayIsEmpty } from 'utils/array';

const TreeNode = TreeSelect.TreeNode;

type propsType = {
  onChange: () => {},
  multiple: Boolean,
  treeCheckable: Boolean,
  onlyWorkstations: Boolean,
  onlyParent: Boolean,
  style: {},
  value: [],
  options: [],
  /*
   options里的值必须包含id 或 key
    options: [{
      id: ,
      key:,
    }]
  */
  formatNode: () => {},
  params: {},
  disableSearch: boolean,
};

export const WORKSTATION_TYPES = {
  WORKSTATION: 'WORKSTATION',
  WORKSHOP: 'WORKSHOP',
  PRODUCTION_LINE: 'PRODUCTION_LINE',
};

let _ismounted = false;

class WorkStationSelect extends React.Component<propsType> {
  state = {
    treeData: [],
    treeDefaultExpandAll: false,
  };

  async componentWillMount() {
    await this.setTreeData();
    const { options, value } = this.props;
    const { treeData } = this.state;
    if (options) {
      const treeData = (await this.formatOptions(options)) || [];
      this.setState({ treeData, key: Math.random() });
      return;
    }
    if (value) {
      const workstationIds = [];
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (!this.findNode(treeData, v.value)) {
            const [type, id] = v.value.split('-');
            workstationIds.push(id);
          }
        });
      } else if (value) {
        if (value.key) {
          workstationIds.push(value.key);
        } else {
          const [type, id] = value.value.split('-');
          workstationIds.push(id);
        }
      }
      if (workstationIds.length) {
        const {
          data: { data: workstations },
        } = await queryDefWorkstations({ ids: workstationIds.join(',') });
        const productionLineIds = _.uniq(workstations.map(e => e.productionLineId)).filter(e => e);
        const workshopIds = _.uniq(workstations.map(e => e.workshopId)).filter(e => e);

        for (const id of workshopIds) {
          const treeNode = this.findNode(treeData, `${WORKSTATION_TYPES.WORKSHOP}-${id}`);
          if (treeNode) {
            const {
              data: { data },
            } = await getWorkShopChildren(id, { enabled: true });
            treeNode.children = data.map(node => {
              return this.formatNode(node, treeNode);
            });
            treeNode.isSearched = true;
          }
        }
        for (const id of productionLineIds) {
          const treeNode = this.findNode(treeData, `${WORKSTATION_TYPES.PRODUCTION_LINE}-${id}`);
          if (treeNode) {
            const {
              data: { data },
            } = await getProdLineChildren(id, { enabled: true });
            treeNode.children = data.map(node => {
              return this.formatNode(node, treeNode, node => {
                node.isSearched = true;
              });
            });
          }
        }
        if (treeData && treeData.length) {
          this.setState({
            treeData,
            key: Math.random(),
            value: this.props.value,
          });
        }
      }
    }
    this.setState({ value: this.props.value });
  }

  componentDidMount() {
    _ismounted = true;
  }

  async componentWillReceiveProps(nextProps) {
    const { treeData } = this.state;
    const { value } = nextProps;

    if (nextProps.options) {
      if (!_.isEqual(this.props.options, nextProps.options)) {
        this.setState({ value });
        const treeData = await this.formatOptions(nextProps.options);
        this.setState({ treeData: treeData || [], key: Math.random() });
      } else {
        this.setState({ value });
      }
      return;
    }
    if ((this.state.value || value) && !_.isEqual(this.state.value, value)) {
      // 编辑时 需要把传入的value从后端拉去对应的选项
      const workstationIds = [];
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (!this.findNode(treeData, v.value)) {
            const [type, id] = v.value.split('-');
            workstationIds.push(id);
          }
        });
      } else if (value) {
        if (value.key) {
          workstationIds.push(value.key);
        } else {
          const [type, id] = value.value.split('-');
          workstationIds.push(id);
        }
      }

      if (workstationIds.length) {
        const {
          data: { data: workstations },
        } = await queryDefWorkstations({ ids: workstationIds.join(',') });
        const productionLineIds = _.uniq(workstations.map(e => e.productionLineId)).filter(e => e);
        const workshopIds = _.uniq(workstations.map(e => e.workshopId)).filter(e => e);

        for (const id of workshopIds) {
          const treeNode = this.findNode(treeData, `${WORKSTATION_TYPES.WORKSHOP}-${id}`);
          if (treeNode) {
            const {
              data: { data },
            } = await getWorkShopChildren(id, { enabled: true });
            treeNode.children = data.map(node => {
              return this.formatNode(node, treeNode, node => {
                node.isSearched = true;
              });
            });
          }
        }
        for (const id of productionLineIds) {
          const treeNode = this.findNode(treeData, `${WORKSTATION_TYPES.PRODUCTION_LINE}-${id}`);
          if (treeNode) {
            const {
              data: { data },
            } = await getProdLineChildren(id, { enabled: true });
            treeNode.children = data.map(node => {
              return this.formatNode(node, treeNode, node => {
                node.isSearched = true;
              });
            });
          }
        }

        if (treeData && treeData.length) {
          this.setState({
            treeData,
            key: Math.random(),
            value: nextProps.value,
          });
        }
      }
      this.setState({
        value,
      });
    }
  }

  componentWillUnmount() {
    _ismounted = false;
  }

  formatOptions = async options => {
    const { params } = this.props;
    const { data } = await getAreaList({ enabled: true, ...params });
    let treeData = data.data.children.map(node => {
      return this.formatNode(node);
    });

    if (options.length) {
      const workstationIds = options.map(e => e.id || e.key);
      const {
        data: { data: _workstations },
      } = await queryDefWorkstations({ ids: workstationIds.join(',') });
      const productionLineIds = _.uniq(_workstations.map(e => e.productionLineId)).filter(e => e);
      const workshopIds = _.uniq(_workstations.map(e => e.workshopId)).filter(e => e);

      treeData = treeData.filter(e => workshopIds.includes(e.id));

      for (const id of workshopIds) {
        const treeNode = this.findNode(treeData, `${WORKSTATION_TYPES.WORKSHOP}-${id}`);
        if (treeNode) {
          const {
            data: { data },
          } = await getWorkShopChildren(id, { enabled: true, ...params });
          treeNode.children = data
            .filter(
              e =>
                (e.type === WORKSTATION_TYPES.PRODUCTION_LINE && productionLineIds.includes(e.id)) ||
                (e.type === WORKSTATION_TYPES.WORKSTATION && workstationIds.includes(e.id)),
            )
            .map(node => {
              return this.formatNode(node, treeNode, node => {
                node.isSearched = true;
              });
            });
          treeNode.isSearched = true;
        }
      }
      for (const id of productionLineIds) {
        const treeNode = this.findNode(treeData, `${WORKSTATION_TYPES.PRODUCTION_LINE}-${id}`);
        if (treeNode) {
          const {
            data: { data },
          } = await getProdLineChildren(id, { enabled: true, ...params });
          treeNode.children = data
            .filter(e => workstationIds.includes(e.id))
            .map(node => {
              return this.formatNode(node, treeNode, node => {
                node.isSearched = true;
              });
            });
          treeNode.isSearched = true;
        }
      }
    }
    return treeData;
  };

  setTreeData = async () => {
    const { params } = this.props;

    const { data } = await getAreaList({ enabled: true, ...params });
    const _data = _.get(data, 'data.children');
    const treeData = arrayIsEmpty(_data)
      ? []
      : _data.map(node => {
          return this.formatNode(node);
        });
    this.setState({ treeData });
  };

  getWorkstationsFromOptions = value => {
    let res = [];
    const { treeData } = this.state;
    value.forEach(v => {
      const { value: _v } = v;
      const node = this.findNode(treeData, _v);
      if (node) {
        if (node.type === WORKSTATION_TYPES.WORKSTATION) {
          res.push(node);
        } else {
          res = res.concat(this.getWorkstationsFromOptions(node.children));
        }
      }
    });
    return res;
  };

  onChange = _value => {
    // 不考虑单选选择父亲的情况
    let value = _value;
    let option;
    const { treeData } = this.state;
    if (Array.isArray(value)) {
      if (this.props.options) {
        value = this.getWorkstationsFromOptions(value);
      } else {
        value.forEach(e => {
          const { value: _v } = e;
          const node = this.findNode(treeData, _v);
          if (node) {
            // e.parent = node.parent;
            e.children = node.children;
          }
        });
      }
    } else if (value) {
      console.log(value, option);
      const { value: v } = _value;
      option = this.findNode(treeData, v);
    }
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value, option);
    }
  };

  formatNode = (node, parent, cb) => {
    const { onlyWorkstations, onlyParent } = this.props;
    if (onlyParent && node.type === WORKSTATION_TYPES.WORKSTATION) {
      return undefined;
    }
    const res = {
      ...node,
      title: node.name,
      value: `${node.type}-${node.id}`,
      type: node.type,
      key: `${node.id}-${Math.random()}`,
      id: node.id,
      isLeaf: !node.children,
      disabled: node.type !== WORKSTATION_TYPES.WORKSTATION && onlyWorkstations,
      // parent,
    };
    res.children = node.children && node.children.map(ws => this.formatNode(ws, res, cb));
    if (cb) {
      cb(res);
    }
    return res;
  };

  findNode = (treeData, value) => {
    let res;
    const [type, id] = value.split('-');
    if (treeData) {
      treeData.forEach(node => {
        if (res) {
          return;
        }
        if (Number(node.id) === Number(id) && type === node.type) {
          res = node;
        } else {
          res = this.findNode(node.children, value);
        }
      });
    }
    return res;
  };

  mapTreeNode = data => {
    return (
      data &&
      data.map(item => {
        if (!item) {
          return null;
        }
        if (item.children) {
          return <TreeNode {...item}>{this.mapTreeNode(item.children)}</TreeNode>;
        }
        return <TreeNode {...item} />;
      })
    );
  };

  render() {
    const { params, style, options, disableSearch, dropdownStyle, ...rest } = this.props;
    const { treeData, value } = this.state;
    const nodes = _.cloneDeep(treeData);

    return (
      <TreeSelect
        key={this.state.key}
        treeDefaultExpandAll={!!this.props.options}
        ref={e => (this.treeSelect = e)}
        style={style}
        dropdownStyle={{ maxHeight: 400, ...dropdownStyle }}
        treeNodeFilterProp="title"
        loadData={async node => {
          const {
            props: { type, id, isSearched },
          } = node;
          if (isSearched) {
            return;
          }
          const dfs = e => {
            let res;
            let find;
            e.forEach(e => {
              if (find || !e) {
                return;
              }
              if (e.type === type && e.id === id) {
                res = e;
                find = true;
              } else if (e.children && e.children.length) {
                res = dfs(e.children);
                if (res) {
                  find = true;
                }
              }
            });

            return res;
          };
          if (type === WORKSTATION_TYPES.WORKSHOP) {
            const { treeData, value: _v } = this.state;
            const treeNode = dfs(treeData);
            const {
              data: { data },
            } = await getWorkShopChildren(id, { enabled: true, ...params });
            if (treeNode) {
              treeNode.children = data.map(node => {
                return this.formatNode(node, treeNode);
              });
              treeNode.isSearched = true;
            }
            this.setState({ treeData, value: _v });
            return data;
          } else if (type === WORKSTATION_TYPES.PRODUCTION_LINE) {
            const { treeData, value: _v } = this.state;
            const treeNode = dfs(treeData);
            const {
              data: { data },
            } = await getProdLineChildren(id, { enabled: true, ...params });
            if (treeNode) {
              treeNode.children = data.map(node => {
                return this.formatNode(node, treeNode);
              });
              treeNode.isSearched = true;
            }
            this.setState({ treeData, treeExpandedKeys: undefined, value: _v });
            return data;
          }
          return true;
        }}
        labelInValue
        allowClear
        {...rest}
        showCheckedStrategy={TreeSelect.SHOW_CHILDREN}
        value={value}
        onChange={this.onChange}
        onFocus={() => {
          setTimeout(() => {
            if (_ismounted && this.searchInput && ReactDOM.findDOMNode(this.searchInput)) {
              ReactDOM.findDOMNode(this.searchInput).focus();
            }
          }, 300);
        }}
        onBlur={() => {}}
      >
        {options || disableSearch ? null : (
          <TreeNode
            disabled
            disableCheckbox
            isLeaf
            value={'inputSearch'}
            key={'inputSearch'}
            title={
              <Input
                ref={e => {
                  this.searchInput = e;
                }}
                placeholder={''}
                onFocus={() => {
                  clearTimeout(this.timeoutID);
                }}
                onBlur={() => {
                  this.timeoutID = setTimeout(async () => {
                    if (!this.props.options) {
                      this.timeoutID = setTimeout(async () => {
                        const node = document.getElementsByClassName('ant-select-dropdown-hidden');
                        if (!(node && node.length) && this.treeSelect) {
                          // ReactDOM.findDOMNode(this.searchInput).focus();
                        } else {
                          const { value, oldValue, oldInputVale, oldTreeData } = this.state;
                          if (!value && oldValue) {
                            this.setState({
                              treeData: oldTreeData,
                              value: oldValue,
                              inputValue: oldInputVale,
                              oldValue: null,
                              oldInputVale: null,
                              key: Math.random(),
                            });
                          }
                        }
                      }, 300);
                    }
                  }, 300);
                }}
                style={{ marginLeft: -30 }}
                value={this.state.inputValue}
                onChange={async value => {
                  const { value: selectedValue, inputValue, treeData: oldTreeData } = this.state;
                  if (selectedValue) {
                    this.setState({ oldValue: selectedValue, oldInputVale: inputValue, oldTreeData, value: undefined });
                  }
                  this.setState({ inputValue: value });
                  const _params = value ? { key: value } : {};
                  const { data } = await getAreaList({ enabled: true, ...params, ..._params });
                  const treeData = data.data.children.map(node => {
                    return this.formatNode(node, null, node => {
                      if (value) {
                        node.isSearched = true;
                      } else {
                        node.isSearched = false;
                      }
                    });
                  });
                  this.setState({ treeData });
                }}
              />
            }
          />
        )}
        {this.mapTreeNode(nodes)}
      </TreeSelect>
    );
  }
}

// 用于从选中值中获取工位的id
export const getWorkstations = async data => {
  let _workstations = [];
  const productionLineIds = [];
  const workshopIds = [];
  if (!Array.isArray(data)) {
    return _workstations;
  }
  data.forEach(value => {
    const [type, id] = value.value.split('-');
    if (type === WORKSTATION_TYPES.WORKSTATION) {
      _workstations.push(id);
    } else if (type === WORKSTATION_TYPES.WORKSHOP) {
      workshopIds.push(id);
    } else if (type === WORKSTATION_TYPES.PRODUCTION_LINE) {
      productionLineIds.push(id);
    }
  });

  if (productionLineIds.length || workshopIds.length) {
    const {
      data: { data },
    } = await queryWorkstation({
      productionLineIds: productionLineIds.length ? productionLineIds.join(',') : undefined,
      workshopIds: workshopIds.length ? workshopIds.join(',') : undefined,
      status: 1,
    });

    if (Array.isArray(data)) _workstations = _workstations.concat(data.filter(e => e.status === 1).map(e => e.id));

    if (!_workstations.length) {
      message.error('所选区域或产线下没有工位!');
      return null;
    }
  }

  return _workstations;
};

export default WorkStationSelect;
