import React, { Component } from 'react';
import _ from 'lodash';
import { TreeSelect } from 'antd';
import { Form, FormItem, withForm, Spin } from 'src/components';
import { getStorageList } from 'src/services/knowledgeBase/storage';
import {
  addFinishedStorageByWorkshop,
  addFinishedStorageByProdline,
  addFinishedStorageByWorkstation,
} from 'src/services/knowledgeBase/relatedStorage';
import { getStoreHouseByWorshop } from 'src/services/knowledgeBase/storeHouse';
import { black, sliverGrey } from 'src/styles/color';

type Props = {
  form: any,
  record: any,
  setAddedData: () => {},
  workshopId: string,
};
const TreeNode = TreeSelect.TreeNode;

class AddFinishWorkStorage extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
  };

  componentWillMount() {
    this.getStorageList();
  }

  getStorageList = value => {
    const { workshopId } = this.props;
    const params = { status: 1 };
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
    const { finishedStorage } = record;
    if (finishedStorage) {
      finishedStorage.level = 2;
      if (finishedStorage.status === 0) {
        data.unshift(finishedStorage);
      }
    }
    this.setState({ data }, () => {
      const { form: { setFieldsValue } } = this.props;
      setFieldsValue({
        code: finishedStorage ?
          JSON.stringify({ code: finishedStorage.code, name: finishedStorage.name, status: finishedStorage.status })
        : '',
      });
    });
  }

  getTreeData = (data, level) => {
    data.forEach(n => {
      n.label = n.name;
      n.key = JSON.stringify({ code: n.code, name: n.name, status: n.status });
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
    const code = getFieldValue('code');
    let addFinishedStorage = () => {};
    switch (type) {
      case 'WORKSHOP':
        addFinishedStorage = addFinishedStorageByWorkshop;
        break;
      case 'PRODUCTION_LINE':
        addFinishedStorage = addFinishedStorageByProdline;
        break;
      case 'WORKSTATION':
        addFinishedStorage = addFinishedStorageByWorkstation;
        break;
      default:
        addFinishedStorage = () => {};
    }
    setAddedData(JSON.parse(code), record, 'finishedStorage');
    return addFinishedStorage(id, JSON.parse(code).code);
  }

  renderTreeNode = (treeData) => {
    const { loading } = this.state;
    return (
      treeData.map(node => {
        const { key, label, children, level } = node;
        return (
          <TreeNode
            value={key}
            notFoundContent={loading ? <Spin size="small" /> : null}
            disabled={level !== '3'}
            title={
              <span style={{ color: level === '3' ? black : sliverGrey }}>
                {label}
              </span>
            }
            key={key}
          >
            {children ? this.renderTreeNode(children) : null}
          </TreeNode>
        );
      })
    );
  }

  render() {
    const { form } = this.props;
    const { data } = this.state;
    const { getFieldDecorator } = form;

    return (
      <div style={{ marginLeft: 130 }}>
        <Form>
          <FormItem label="完工仓位">
            {getFieldDecorator('code')(
              <TreeSelect
                style={{ width: 300 }}
                allowClear
                showSearch
                treeDefaultExpandAll
                filterTreeNode
                placeholder="请选择完工仓位"
                onSearch={value => {
                  this.getStorageList(value);
                }}
              >
                {this.renderTreeNode(data && this.getTreeData(data, 1) || [])}
              </TreeSelect>,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default withForm({ showFooter: true }, AddFinishWorkStorage);
