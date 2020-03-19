import React, { Component } from 'react';
import _ from 'lodash';
import { TreeSelect } from 'antd';

import { fontSub } from 'src/styles/color';
import { queryWorkstationGroup } from 'src/services/workstation';

export const getTreeData = data => {
  const _data = data.filter(a => a && Array.isArray(a.workstations) && a.workstations.length !== 0);

  return _data.map(group => {
    const { name, id, workstations } = group || {};

    const obj = { title: name, label: name, value: `parent-${id}`, key: `parent-${id}` };
    obj.children = Array.isArray(workstations)
      ? workstations
          .map(node => {
            const { name, id, status } = node || {};
            if (status === 1) {
              return { label: name, value: `child-${id}`, key: `child-${id}`, status, title: name };
            }
            return null;
          })
          .filter(a => a)
      : [];

    return obj;
  });
};

export const deleteParentPrefix = s => {
  if (s && s.toString().indexOf('-') !== -1) {
    const strings = s.split('-');
    return {
      type: strings[0],
      value: strings[1],
    };
  }

  return null;
};

type Props = {
  style: {},
  onChange: () => {},
  form: any,
  fields: string,
};

class WorkStationSelect extends Component {
  props: Props;
  state: {
    treeData: [], // 工位的treeData
    workstationsPrompt: {
      text: '', // 提示语
    },
    selectedWorkstationGroups: [],
  };

  componentDidMount() {
    this.fetchDataAndSetData();
  }

  fetchDataAndSetData = () => {
    queryWorkstationGroup().then(res => {
      const workstationGroups = _.get(res, 'data.data');

      this.setState({ treeData: getTreeData(workstationGroups) });
    });
  };

  disableTreeData = selectValues => {
    const { form, fields } = this.props;
    const { treeData } = this.state;

    let _treeData = treeData;
    // 需要提示用户选中了什么工位组，工位组下面有几个工位
    const selectedWorkstationGroups = [];

    // 需要改变disable，所以需要改变treeData
    if (_treeData && Array.isArray(_treeData)) {
      _treeData = _treeData.map(item => {
        const { value: groupValue, children } = item;

        item.children = children.map(c => {
          return { ...c, disabled: false };
        });

        selectValues.forEach(selectItem => {
          const { value: _selectValue } = selectItem || {};
          if (_selectValue === groupValue) {
            // 需要提示用户选中了什么工位组，工位组下面有几个启用中工位
            selectedWorkstationGroups.push({
              workstationGroupName: selectItem && selectItem.label,
              childrenLength: Array.isArray(children) && children.length,
            });

            // 删除被选中的这个工位组下面的selected children
            children.forEach(({ value: childValue }) => {
              selectValues = selectValues.map(a => {
                const { value: selectedValue } = a || {};
                if (selectedValue === childValue) {
                  return null;
                }
                return a;
              });
            });

            // 如果选中的是工位组，那么children都是disabled，
            item.children = children.map(c => {
              return { ...c, disabled: true };
            });
          }
        });
        return item;
      });
    }

    this.setState(
      {
        treeData: _treeData,
        selectedWorkstationGroups,
      },
      () => {
        const fieldsValue = { [fields]: selectValues.filter(a => a) };
        form.setFieldsValue(fieldsValue);
      },
    );
  };

  getWorkstationsPrompt = selectValues => {
    const { treeData } = this.state;

    // 需要提示用户选中了什么工位组，工位组下面有几个工位
    const selectedWorkstationGroups = [];

    if (Array.isArray(selectValues) && Array.isArray(treeData)) {
      treeData.map(item => {
        const { value: groupValue, children } = item;

        selectValues.forEach(selectItem => {
          const { value: _selectValue } = selectItem || {};
          if (_selectValue === groupValue) {
            // 需要提示用户选中了什么工位组，工位组下面有几个启用中工位
            selectedWorkstationGroups.push({
              workstationGroupName: selectItem && selectItem.label,
              childrenLength: Array.isArray(children) && children.length,
            });
          }
        });
        return item;
      });
    }

    this.setState({
      selectedWorkstationGroups,
    });
  };

  filterTreeNode = (value, node) => {
    return node.props.title.indexOf(value) > -1;
  };

  onChangeForWorkstation = (value, ...rest) => {
    const { onChange } = this.props;

    this.disableTreeData(value);
    this.getWorkstationsPrompt(value);

    if (onChange && typeof onChange === 'function') {
      onChange(value, ...rest);
    }
  };

  render() {
    const { treeData, selectedWorkstationGroups } = this.state || {};

    const tProps = {
      style: { width: 300 },
      dropdownStyle: { maxHeight: 400, overflow: 'auto' },
      filterTreeNode: this.filterTreeNode,
      treeData,
      treeNodeFilterProp: 'label',
      placeholder: '请选择',
      showSearch: true,
      allowClear: true,
      treeCheckable: true,
      treeCheckStrictly: true,
    };

    return (
      <div style={{ marginTop: 7 }}>
        {treeData ? <TreeSelect {...tProps} {...this.props} onChange={this.onChangeForWorkstation} /> : null}
        <div style={{ color: fontSub, marginLeft: 5, width: 600 }}>
          {Array.isArray(selectedWorkstationGroups) && selectedWorkstationGroups.length
            ? selectedWorkstationGroups
                .map(({ workstationGroupName, childrenLength }) => {
                  if (!workstationGroupName) return null;
                  if (childrenLength === 0) {
                    return `"${workstationGroupName}"下没有可选择工位`;
                  }
                  return `已选中"${workstationGroupName}"下全部${childrenLength}个工位`;
                })
                .filter(a => a)
                .join(',')
            : null}
        </div>
      </div>
    );
  }
}

export default WorkStationSelect;
