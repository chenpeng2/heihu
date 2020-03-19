import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Form, FormItem, Input, withForm, Spin } from 'src/components';
import { TreeSelect } from 'antd';
import { getStorageList } from 'src/services/knowledgeBase/storage';
import {
  addFeedingStorageByWorkshop,
  addFeedingStorageByProdline,
  addFeedingStorageByWorkstation,
} from 'src/services/knowledgeBase/relatedStorage';
import { getStoreHouseByWorshop } from 'src/services/knowledgeBase/storeHouse';
import { black, sliverGrey } from 'src/styles/color';
import styles from './styles.scss';

type Props = {
  form: any,
  record: any,
  setAddedData: () => {},
  workshopId: string,
  parentClass: string,
};
const TreeNode = TreeSelect.TreeNode;

class AddInputStorage extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    focus: false,
  };

  componentDidMount() {
    this.getStorageList();
  }

  getStorageList = value => {
    const params = { status: 1 };
    const { workshopId } = this.props;
    if (value) {
      params.search = value;
    }
    this.setState({ loading: true });
    getStoreHouseByWorshop(workshopId, 1)
      .then(res => {
        const data = res.data.data;
        this.setAllData(data);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  setAllData = data => {
    const { record } = this.props;
    const selectedData = [];
    const feedingStorageList = _.cloneDeep(record.feedingStorageList);
    const allData = data.concat(selectedData);
    if (feedingStorageList && feedingStorageList.length) {
      const level2Storage = this.getLevel2Storage(data, 0, []).map(n => `${n.code}${n.name}`);
      const _feedingStorageList = feedingStorageList.map(n => {
        if (!level2Storage.includes(`${n.code}${n.name}`)) {
          return n;
        }
        return null;
      });
      _feedingStorageList.filter(n => n).forEach(n => {
        n.level = 2;
        if (n.status === 0) {
          n.isEnabledFeedingStorage = false;
        } else {
          n.isEnabledFeedingStorage = true;
        }
        allData.unshift(n);
      });
    }
    this.setState({ data: _.uniqBy(allData, 'code') });
  }

  getLevel2Storage = (data, level, storage) => {
    data.forEach(n => {
      if (level === 2) {
        storage.push(n);
      }
      if (n.children && n.children.length) {
        this.getLevel2Storage(n.children, level + 1, storage);
      }
    });
    return storage;
  }

  getTreeData = (data, level) => {
    data.forEach(n => {
      n.label = n.name;
      n.key = JSON.stringify({ code: n.code, name: n.name, status: n.status });
      n.status = n.status;
      n.isEnabledFeedingStorage = n.isEnabledFeedingStorage;
      n.level = String(level);
      if (n.children && n.children.length) {
        this.getTreeData(n.children, level + 1);
      }
    });
    return data;
  }

  submit = () => {
    const { form, record, setAddedData } = this.props;
    const { type } = record;
    const id = record.id.split(':')[1];
    const { getFieldValue } = form;
    const codes = getFieldValue('codes');
    let addFeedingStorage = () => {};
    switch (type) {
      case 'WORKSHOP':
        addFeedingStorage = addFeedingStorageByWorkshop;
        break;
      case 'PRODUCTION_LINE':
        addFeedingStorage = addFeedingStorageByProdline;
        break;
      case 'WORKSTATION':
        addFeedingStorage = addFeedingStorageByWorkstation;
        break;
      default:
        addFeedingStorage = () => {};
    }
    setAddedData(codes.map(n => JSON.parse(n)), record);
    return addFeedingStorage(id, codes.map(n => JSON.parse(n).code));
  }

  renderTreeNode = treeData => {
    const { loading } = this.state;
    return (
      treeData.map(node => {
        const { key, label, children, level, status, isEnabledFeedingStorage } = node;
        return (
          <TreeNode
            value={key}
            notFoundContent={loading ? <Spin size="small" /> : null}
            disabled={isEnabledFeedingStorage && status ? false
              : ((level !== '3' && !children) ||
                (children ? level === '1' && children.filter(node => node.children).length === 0 : false))
            }
            title={
              <span style={{ color: (isEnabledFeedingStorage && status) || level === '3' ? black : sliverGrey }}>
                {label}
              </span>
            }
            key={`${key}-${level}`}
          >
            {children ? this.renderTreeNode(children) : null}
          </TreeNode>
        );
      })
    );
  }

  render() {
    const { form, record, parentClass } = this.props;
    const { changeChineseToLocale } = this.context;
    const { feedingStorageList } = record;
    const { data } = this.state;
    const { getFieldDecorator } = form;
    const ele = document.getElementsByClassName(parentClass);

    return (
      <div style={{ marginLeft: 130 }} >
        <Form>
          <FormItem label="投料仓位">
            {getFieldDecorator('codes',
              { initialValue: feedingStorageList.map(n => JSON.stringify({ code: n.code, name: n.name, status: n.status })) },
            )(
              <TreeSelect
                style={{ width: 300 }}
                treeCheckable
                allowClear
                treeDefaultExpandAll
                getPopupContainer={() => document.getElementsByClassName(parentClass)[0]}
                filterTreeNode
                onFocus={() => {
                  setTimeout(() => {
                    const input = ele[ele.length - 1].getElementsByClassName('ant-input')[0];
                    if (input) {
                      input.focus();
                    }
                  }, 200);
                }}
                placeholder={changeChineseToLocale('请选择投料仓位')}
              >
                <TreeNode
                  disabled
                  value={'inputSearch'}
                  key={'inputSearch'}
                  title={
                    <Input
                      placeholder={''}
                      value={this.state.inputValue}
                      onChange={value => {
                        this.setState({ inputValue: value });
                        this.getStorageList(value);
                      }}
                      onFocus={() => { this.getStorageList(''); }}
                      onBlur={() => { this.setState({ inputValue: '' }); }}
                    />
                  }
                />
                {this.renderTreeNode(data && this.getTreeData(data, 1) || [])}
              </TreeSelect>,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

AddInputStorage.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({ showFooter: true }, AddInputStorage);
