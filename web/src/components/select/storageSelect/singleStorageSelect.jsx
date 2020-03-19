import React, { Component } from 'react';
import _ from 'lodash';
import { Cascader } from 'gc-rsuite';
import { Icon } from 'antd';
import { injectIntl } from 'react-intl';
import { Tooltip, Select } from 'src/components';
import { getStorageList } from 'services/knowledgeBase/storage';
import { sliverGrey, primary, fontSub } from 'styles/color/index';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import styles from '../styles.scss';

require('gc-rsuite/styles/less/index.less');
require('../index.less');

function Loading() {
  const style = { padding: 4, marginTop: 10, color: fontSub, textAlign: 'center' };
  const iconStyle = { marginRight: 4 };
  return (
    <p style={style}>
      <Icon style={iconStyle} type="loading" /> 加载中...
    </p>
  );
}

function EmptyView() {
  const style = { color: fontSub, textAlign: 'center', marginLeft: 60 };
  return <span style={style}>无匹配结果</span>;
}

function Placeholder(props) {
  const { intl } = props;
  const style = { color: sliverGrey };
  return <span style={style}>{changeChineseToLocale('请选择', intl)}</span>;
}

function formatTreeData(data, level) {
  data.forEach(n => {
    n.label = n.name;
    n.value = `${n.id},${n.code},${level},${n.name}`;
    n.level = level;
    if (n.children && n.children.length) {
      formatTreeData(n.children, level + 1);
    }
  });
  return data;
}

type Props = {
  match: any,
  onChange: () => {},
  getContainer: () => {},
  isReset: boolean,
  disabled: boolean,
  value: any,
  params: any,
  type: any,
  style: any,
  cascaderStyle: any,
};

/** 仓位选择 */
class SingleStorageSelect extends Component {
  props: Props;
  state = {
    isInitial: true,
    fetchId: 0, // fetchId为了阻止异步请求数据的顺序发生错乱
    data: [{}],
    value: null,
    activePaths: [],
    disabledItemValues: [],
    loading: false,
    useExternalActiveItems: false,
  };

  componentDidMount() {
    const { value } = this.props;
    if (value) {
      const code = value.split(',')[1];
      this.getStorageList(code, value);
    } else {
      this.getStorageList('', value);
    }
  }

  componentDidUpdate(preProps) {
    const { value: newValue } = this.props;
    const { value: oldValue } = preProps;
    // 设置初始值的时候，如果初始值不在第一次搜到的结果里面，那么需要重新利用value，搜索一次
    if (!_.isEqual(oldValue, newValue)) {
      if (newValue) {
        const code = newValue.split(',')[1];
        this.getStorageList(code, newValue);
      } else {
        this.getStorageList('', newValue);
      }
    }
  }

  onChange = (value, e, triggerValue) => {
    const { onChange } = this.props;
    this.setState({ value }, () => {
      if (typeof onChange === 'function') onChange(value);
    });
  };

  onSearch = value => {
    this.getStorageList(value);
  };

  onOpen = () => {
    if (!this.state.value && !this.props.value) {
      this.getStorageList('');
    }
  };

  getActivePaths = (data, activePaths, id) => {
    for (let i = 0; i < data.length; i += 1) {
      activePaths.push(data[i]);
      if (`${data[i].id}` === id) {
        this.setState({ activePaths: _.cloneDeep(activePaths) });
        return null;
      }
      if (data[i].children && data[i].children.length) {
        this.getActivePaths(data[i].children, activePaths, id);
        activePaths.pop();
      } else {
        activePaths.pop();
      }
    }
  };

  getDisabledTreeData = treeData => {
    const { disabledItemValues } = this.state;
    treeData.forEach(n => {
      if (!(n.children && n.children.length) && n.level !== 3) {
        disabledItemValues.push(n.value);
      } else if (n.children && n.children.length) {
        this.getDisabledTreeData(n.children);
      }
    });
    this.setState({ disabledItemValues });
  };

  getItems = () => {
    const { data, activePaths } = this.state;
    const items = [data];
    if (activePaths && activePaths.length && activePaths[0].children) {
      items.push(activePaths[0].children);
      if (activePaths[1].children) {
        items.push(activePaths[1].children);
      }
    }
    return items;
  };

  getStorageList = async (value, initialStorage) => {
    const { params } = this.props;

    const fetchId = this.state.fetchId + 1;
    this.setState({ fetchId, loading: true });

    const {
      data: {
        data: { data },
      },
    } = await getStorageList({ size: 20, status: 1, ...params, search: value });

    if (fetchId >= this.state.fetchId) {
      const treeData = formatTreeData(data, 1);
      this.setState({ data: treeData, fetchId, menuHeight: !(data && data.length) ? 35 : 254 }, () => {
        this.getDisabledTreeData(treeData);
        if (initialStorage) {
          if (initialStorage.split(',')[2] !== 1) {
            this.getActivePaths(treeData, [], initialStorage.split(',')[0]);
          }
          this.setState({ value: initialStorage });
        } else if (value && data[0]) {
          let activeStorage = null;
          const firstStorage = data[0].children;
          for (let i = 0; i < firstStorage.length; i += 1) {
            if (firstStorage[i].children) {
              activeStorage = firstStorage[i].children[0];
              this.getActivePaths(treeData, [], activeStorage.value.split(',')[0]);
              break;
            }
          }
        } else {
          this.setState({ activePaths: [], items: [], value: null });
        }
        this.setState({ useExternalActiveItems: true }, () => {
          this.setState({ useExternalActiveItems: false });
        });
      });
    }
    this.setState({ loading: false });
  };

  getUncheckableItemValues = (data, uncheckableItemValues) => {
    data.forEach(n => {
      if (n.level !== 3) {
        uncheckableItemValues.push(n.value);
      }
      if (n.children && n.children.length) {
        this.getUncheckableItemValues(n.children, uncheckableItemValues);
      }
    });
  };

  renderMenu = (children, menu) => {
    if (this.state.loading) return <Loading />;
    if (children && children.length < 1) return <EmptyView />;
    return menu;
  };

  renderMenuItem = label => <Tooltip text={label} length={6} />;

  renderValue = (value, selectedItems) => {
    const label = Array.isArray(selectedItems) && selectedItems.length > 2 ? selectedItems[2].label : '';
    return <Tooltip text={label} width={170} />;
  };

  renderContent() {
    const { disabled, cascaderStyle, intl } = this.props;
    const { data, activePaths, value, initialStorage, useExternalActiveItems, disabledItemValues } = this.state;
    const uncheckableItemValues = [];
    this.getUncheckableItemValues(data, uncheckableItemValues);
    const items = this.getItems();
    const cascaderVisible = (activePaths && activePaths.length) || !initialStorage;
    const interCascaderStyle = { width: '100%', height: '100%', color: primary, ...cascaderStyle };
    const selectStyle = { width: '100%', height: 28, ...cascaderStyle };
    if (!cascaderVisible) return <Select placeholder="请选择" style={selectStyle} />;

    return (
      <Cascader
        placeholder={<Placeholder intl={intl} />}
        searchPlaceholder={changeChineseToLocale('请输入仓位编码或名称', intl)}
        cascade={false}
        countable={false}
        menuHeight={this.state.menuHeight || 254}
        data={data}
        value={value}
        style={interCascaderStyle}
        renderMenuItem={this.renderMenuItem}
        renderMenu={this.renderMenu}
        disabledItemValues={disabledItemValues}
        disabled={disabled}
        onChange={this.onChange}
        onSearch={_.debounce(this.onSearch, 600)}
        activePaths={activePaths}
        items={items}
        useExternalActiveItems={useExternalActiveItems}
        onOpen={this.onOpen}
        renderValue={this.renderValue}
      />
    );
  }

  render() {
    const { style } = this.props;
    return (
      <div className={styles.storageSelect} style={style}>
        {this.renderContent()}
      </div>
    );
  }
}

export default injectIntl(SingleStorageSelect);
