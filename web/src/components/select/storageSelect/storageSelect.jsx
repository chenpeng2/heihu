import React, { Component } from 'react';
import _ from 'lodash';
import { MultiCascader } from 'gc-rsuite';
import { Icon } from 'antd';
import { injectIntl } from 'react-intl';

import { changeChineseToLocale } from 'src/utils/locale/utils';
import { Tooltip, Select } from 'src/components';
import { getStorageList } from 'src/services/knowledgeBase/storage';
import { getQuery } from 'src/routes/getRouteParams';
import { primary, fontSub } from 'src/styles/color/index';

import { STORAGE } from './constants';
import styles from '../styles.scss';

require('gc-rsuite/styles/less/index.less');
require('../index.less');

const STORAGE_LEVEL = {
  storage: 1,
  firstStorage: 2,
  secondStorage: 3,
};

type Props = {
  match: any,
  cascaderStyle: any,
  storageSelectStyle: any,
  onChange: () => {},
  getDisabledItemsValue: () => {},
  value: any,
  params: any,
  intl: any
};

class StorageSelect extends Component {
  props: Props;
  state = {
    data: [{}],
    fetchId: 0, // fetchId为了阻止异步请求数据的顺序发生错乱
    value: [],
    disabledItemValues: [],
    activePaths: [],
    loading: false,
    initialStorage: false,
    useExternalActiveItems: false,
  };

  componentWillMount() {
    const queryMatch = getQuery(this.props.match);
    const { search, storage } = queryMatch;
    this.getStorageList(search || '', storage);
    this.setState({ initialStorage: storage || [] });
  }

  componentWillReceiveProps(nextProps) {
    const { value: oldValue } = this.props;
    const { value } = nextProps;
    if (!_.isEqual(value, oldValue)) {
      if (value && value.length) {
        const code = value[0].split(',')[1] || '';
        const level = value[0].split(',')[2];
        if (level !== STORAGE.WARE_HOUSE) {
          this.getStorageList(code, value);
        } else {
          this.getStorageList('', value, { warehouseCodes: code });
        }
      } else {
        this.getStorageList('');
      }
    }
  }

  onValuesChange = (value, triggerValue) => {
    const { getDisabledItemsValue } = this.props;
    const { data: treeData, disabledItemValues } = this.state;
    if (!value.length) {
      this.setState({ disabledItemValues: [] });
    }
    if (triggerValue) {
      if (getDisabledItemsValue) {
        getDisabledItemsValue(treeData, triggerValue, disabledItemValues);
      } else if (triggerValue.split(',')[2] === '3') {
        this.getDisabledTreeDataByLv2storage(treeData, value);
      } else {
        this.getDisabledTreeData(treeData, triggerValue);
      }
    }
  };

  handleChange = (value, e, triggerValue) => {
    const { onChange } = this.props;
    this.onValuesChange(value, triggerValue);
    this.setState({ value }, () => {
      if (typeof onChange === 'function') onChange(value);
    });
  };

  handleSearch = value => {
    this.getStorageList(value);
    this.setState({ value: [], disabledItemValues: [] });
  };

  handleOpen = () => {
    const { value } = this.props;
    if (!this.state.value.length && !(value && value.length)) {
      this.getStorageList('');
    }
  };

  getDisabledTreeData = (treeData, triggerValue) => {
    const { disabledItemValues } = this.state;
    treeData.forEach(n => {
      if (n.value !== triggerValue) {
        disabledItemValues.push(n.value);
      }
      if (n.children && n.children.length) {
        this.getDisabledTreeData(n.children, triggerValue);
      }
    });
    this.setState({ disabledItemValues });
  };

  getDisabledTreeDataByLv2storage = treeData => {
    const { disabledItemValues } = this.state;
    treeData.forEach(n => {
      disabledItemValues.push(n.value);
      if (n.children && n.children.length) {
        n.children.forEach(m => {
          disabledItemValues.push(m.value);
        });
      }
    });
    this.setState({ treeData });
  };

  formatTreeData = (data, level) => {
    data.forEach(n => {
      n.label = n.name;
      n.value = `${n.id},${n.code},${level}`;
      n.level = level;
      if (n.children && n.children.length) {
        this.formatTreeData(n.children, level + 1);
      }
    });
    return data;
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

  getItems = () => {
    const { data, activePaths } = this.state;
    const items = [data];
    if (activePaths && activePaths.length && activePaths[0].children) {
      items.push(activePaths[0].children);
      if (activePaths[1] && activePaths[1].children) {
        items.push(activePaths[1].children);
      }
    }
    return items;
  };

  getStorageList = async (value, initialStorage, extraParams) => {
    const { params } = this.props;
    const fetchId = this.state.fetchId + 1;
    this.setState({ fetchId, loading: true });
    const {
      data: {
        data: { data },
      },
    } = await getStorageList({ size: 20, ...params, ...extraParams, search: value });
    const treeData = this.formatTreeData(data, 1);
    if (fetchId >= this.state.fetchId) {
      this.setState({ data: treeData, loading: false, menuHeight: !(data && data.length) ? 35 : 254 }, () => {
        if (initialStorage && initialStorage.length) {
          this.getActivePaths(treeData, [], initialStorage[0].split(',')[0]);
          this.setState({ value: initialStorage });
          this.onValuesChange(initialStorage, initialStorage[0]);
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
          this.setState({ activePaths: [], items: [], value: [], disabledItemValues: [] });
        }
        this.setState({ useExternalActiveItems: true }, () => {
          this.setState({ useExternalActiveItems: false });
        });
      });
    }
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
    if (this.state.loading) {
      return (
        <p style={{ padding: 4, color: fontSub, textAlign: 'center' }}>
          <Icon style={{ marginRight: 4 }} type="loading" /> 加载中...
        </p>
      );
    }
    if (children.length === 0) {
      return <span style={{ color: fontSub, textAlign: 'center', marginLeft: 80 }}>无匹配结果</span>;
    }
    return menu;
  };

  render() {
    const { cascaderStyle, storageSelectStyle, intl } = this.props;
    const { data, disabledItemValues, activePaths, value, initialStorage, useExternalActiveItems } = this.state;
    const uncheckableItemValues = [];
    this.getUncheckableItemValues(data, uncheckableItemValues);
    const items = this.getItems();
    return (
      <div className={styles.storageSelect} style={{ ...storageSelectStyle }}>
        {(activePaths && activePaths.length) || !initialStorage.length ? (
          <MultiCascader
            block
            placeholder={changeChineseToLocale('请选择', intl)}
            searchPlaceholder={changeChineseToLocale('请输入仓位编码或名称', intl)}
            cascade={false}
            countable={false}
            menuHeight={this.state.menuHeight || 254}
            data={data}
            value={value.length ? value : this.props.value || []}
            style={{ width: '100%', height: '100%', color: primary, ...cascaderStyle }}
            renderMenuItem={label => <Tooltip text={label} length={6} />}
            renderMenu={this.renderMenu}
            disabledItemValues={disabledItemValues}
            onChange={this.handleChange}
            onSearch={_.debounce(this.handleSearch, 600)}
            activePaths={activePaths}
            items={items}
            useExternalActiveItems={useExternalActiveItems}
            onOpen={this.handleOpen}
            // container={() => { return document.getElementsByClassName(styles.storageSelect)[0]; }}
            renderValue={(value, selectedItems) => (
              <Tooltip text={selectedItems.map(item => item.label).join('，')} width={170} />
            )}
          />
        ) : (
          <Select placeholder={changeChineseToLocale('请选择', intl)} style={{ width: '100%', height: 28 }} />
        )}
      </div>
    );
  }
}

const getValueLevel = value => {
  if (value && typeof value[0] === 'string') return value.split(',')[2];
};

export const getStorageIds = ids => {
  if (!Array.isArray(ids)) {
    return null;
  }

  let firstStorageId = null;
  const secondStorageIds = [];
  let houseId = null;

  ids.forEach(id => {
    const level = getValueLevel(id);
    const value = id.split(',')[0];
    if (level === STORAGE_LEVEL.storage.toString()) {
      houseId = value;
    }

    // 如果选中一级仓库节点，那么其他的仓库disable，同一个仓库下的其他一级节点disable
    if (level === STORAGE_LEVEL.firstStorage.toString()) {
      firstStorageId = value;
    }

    // 如果选中二级仓库节点，不需要disable
    if (level === STORAGE_LEVEL.secondStorage.toString()) {
      secondStorageIds.push(value);
    }
  });
  return {
    firstStorageId,
    secondStorageIds: Array.isArray(secondStorageIds) && secondStorageIds.length ? secondStorageIds.join(',') : null,
    houseId,
  };
};

StorageSelect.getStorageIds = getStorageIds;

export default injectIntl(StorageSelect);
