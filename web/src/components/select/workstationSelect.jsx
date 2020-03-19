import * as React from 'react';
import { injectIntl } from 'react-intl';

import { getWorkStationGroup } from 'src/services/knowledgeBase';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { TreeSelect } from 'antd';

type propsType = {
  onChange: () => {},
  intl: any,
  filterStopWorkstation: boolean,
};

class WorkStationSelect extends React.Component<propsType> {
  state = {
    treeData: [],
  };

  componentDidMount() {
    this.setTreeData();
  }

  setTreeData = async () => {
    const { filterStopWorkstation } = this.props;
    const { data } = await getWorkStationGroup();
    const treeData = data.data.map(node => {
      let children = [];

      if (filterStopWorkstation) {
        children = node.workstations
          .filter(i => i && i.status === 1)
          .map(ws => ({
            label: ws.name,
            key: `${node.id}-${ws.id}`,
            value: ws.id,
          }));
      } else {
        children = node.workstations.map(ws => ({
          label: ws.name,
          key: `${node.id}-${ws.id}`,
          value: ws.id,
        }));
      }

      return {
        label: node.name,
        value: `parent-${node.id}`,
        key: node.id,
        disabled: true,
        children,
      };
    });
    this.setState({ treeData });
  };

  render() {
    const { treeData } = this.state;
    const { intl, placeholder, ...rest } = this.props;

    return (
      <TreeSelect
        placeholder={typeof placeholder === 'string' ? changeChineseToLocale(placeholder, intl) : placeholder}
        treeData={treeData}
        showSearch
        allowClear
        treeNodeFilterProp="label"
        dropdownStyle={{ maxHeight: 500 }}
        {...rest}
      />
    );
  }
}

export default injectIntl(WorkStationSelect);
