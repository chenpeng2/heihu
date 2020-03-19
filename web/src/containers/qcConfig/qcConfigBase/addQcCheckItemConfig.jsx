import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, withForm, Table, Row, Col, message, Text } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import _ from 'lodash';
import { queryQcItemsList } from 'src/services/knowledgeBase/qcItems';
import SearchSelect from 'components/select/searchSelect';

const AntRow = Row.AntRow;
const AntCol = Col.AntCol;

class AddQcCheckItemConfigModal extends Component {
  props: { form: any, onCancel: () => {}, onOk: () => {}, initialQcCheckItemConfigs: [] };
  state = {
    qcCheckItems: [],
    selectedRows: [],
    total: 0,
    params: {},
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    this.setState({ loading: true, params });
    const { data: { data, total } = {} } = await queryQcItemsList({ size: 10, ...params });
    this.setState({ qcCheckItems: data, total, loading: false });
  };

  getFormValueForFetch = () => {
    const { form: { getFieldsValue } = {} } = this.props;
    const params = getFieldsValue();
    const { groupId, nameSearch } = params;
    params.groupId = groupId && groupId.key;
    params.nameSearch = nameSearch || undefined;

    return params;
  };

  render() {
    const {
      form: { getFieldDecorator },
      onCancel,
      onOk,
      initialQcCheckItemConfigs,
    } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const columns = [
      {
        title: '分类',
        width: 200,
        key: 'groupName',
        dataIndex: 'group.name',
      },
      {
        title: '名称',
        width: 200,
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: '备注',
        key: 'desc',
        dataIndex: 'desc',
      },
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        const { selectedRows: _selectedRows, qcCheckItems } = this.state;
        const newSelectedRows = _.pullAllBy(_selectedRows, qcCheckItems, 'id').concat(selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows: newSelectedRows,
        });
      },
    };
    const { selectedRows, loading, total, params } = this.state;

    return (
      <Fragment>
        <AntRow gutter={24} style={{ margin: 10 }}>
          <AntCol span={2} style={{ paddingTop: 4 }}>
            <Text>分类</Text>
          </AntCol>
          <AntCol span={8}>
            {getFieldDecorator('groupId')(
              <SearchSelect style={{ width: '100%' }} type="qcItemsGroup" placeholder="请选择分类" />,
            )}
          </AntCol>
          <AntCol span={2} style={{ paddingTop: 4 }}>
            <Text>名称</Text>
          </AntCol>
          <AntCol span={8}>
            {getFieldDecorator('nameSearch')(<Input style={{ width: '100%' }} placeholder="请输入名称" />)}
          </AntCol>
          <AntCol span={2}>
            <Button
              onClick={() => {
                const params = this.getFormValueForFetch();
                this.fetchData(params);
              }}
            >
              查询
            </Button>
          </AntCol>
        </AntRow>
        <Table
          style={{ margin: 0, marginBottom: 20 }}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          loading={loading}
          refetch={value => {
            this.fetchData({ ...params, ...value });
          }}
          total={total || 0}
          columns={columns}
          dataSource={this.state.qcCheckItems}
          scroll={{ y: 300 }}
        />
        <div style={{ margin: '5px 20px 20px' }}>
          {changeChineseTemplateToLocale('已选{amount}条', {
            amount: selectedRows.length,
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <Button style={{ marginRight: 60 }} type="ghost" onClick={() => onCancel()}>
            暂不选择
          </Button>
          <Button
            type="primary"
            onClick={() => {
              let intersection = _.intersectionBy(initialQcCheckItemConfigs, selectedRows, 'id');
              if (!arrayIsEmpty(intersection)) {
                intersection = intersection.filter(n => !n.deleted);
              }
              if (!intersection.length) {
                onOk(selectedRows);
              } else {
                message.error(
                  changeChineseTemplateToLocale('质检项{checkItem}重复', {
                    checkItem: intersection.map(e => e.name).join(','),
                  }),
                );
              }
            }}
          >
            确认选择
          </Button>
        </div>
      </Fragment>
    );
  }
}

AddQcCheckItemConfigModal.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.func,
};

export default withForm({}, AddQcCheckItemConfigModal);
