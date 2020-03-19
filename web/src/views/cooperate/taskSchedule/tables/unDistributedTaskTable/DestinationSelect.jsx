import React from 'react';
import { TreeSelect } from 'components';
import SecondStorageSelect from 'src/containers/materialRequest/base/form/secondeStorageSelect';
import { getFeedingStorageByWorkstation } from 'services/workstation';

class DestinationSelect extends React.PureComponent<any> {
  state = {
    hasFeeding: undefined,
    data: null,
  };

  componentDidMount = async () => {
    const {
      data: { data },
    } = await getFeedingStorageByWorkstation(this.props.workstationId);
    if (data.length === 0) {
      this.setState({ hasFeeding: false });
    } else {
      const treeData = data.map(({ id, name, children }) => ({
        title: name,
        key: `1-${id}`,
        value: `1-${id}`,
        disabled: true,
        children:
          children &&
          children.map(({ id, name, children }) => ({
            title: name,
            key: `2-${id}`,
            value: `2-${id}`,
            disabled: true,
            children:
              children &&
              children.map(({ id, name }) => ({
                title: name,
                key: `3-${id}`,
                value: `3-${id}`,
              })),
          })),
      }));
      this.setState({ data: treeData, hasFeeding: true });
    }
  };

  render() {
    const { hasFeeding, data } = this.state;
    if (typeof hasFeeding === 'undefined') {
      return <div />;
    }
    if (hasFeeding) {
      return <TreeSelect treeData={data} style={{ width: 150 }} {...this.props} labelInValue />;
    }
    return <SecondStorageSelect style={{ width: 150 }} {...this.props} />;
  }
}

export default DestinationSelect;
