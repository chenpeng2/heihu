import React, { Component, Fragment } from 'react';
import { Input, Button, withForm, SimpleTable, Row, Col, openModal } from 'components';
import { getQcConfigList } from 'src/services/qcConfig';
import CreateQcConfig from 'src/views/qualityManagement/qcConfigs/create/createQcConfig';
import PropTypes from 'prop-types';

import './styles.scss';

const AntRow = Row.AntRow;
const AntCol = Col.AntCol;
const PAGE_SIZE = 10;
const ROW_SELECTION_TYPE = {
  checkbox: {
    type: 'checkbox',
    desc: '多选',
  },
  radio: {
    type: 'radio',
    desc: '单选',
  },
};

/** 选择质检方案 */
class AddQcCheckItemConfigModal extends Component {
  props: {
    form: any,
    onOk: () => {},
    type: string,
    submit: () => {},
    onCancel: () => {},
    unitsForSelect: [],
    qcConfigDetails: [],
    checkTypes: [],
    hideCreateButton: Boolean,
    rowSelectionType: String, // checkbox | radio
  };
  state = {
    qcConfigs: [],
    selectedRows: [],
    pagination: {
      pageSize: PAGE_SIZE,
      current: 1,
    },
  };

  componentDidMount() {
    this.fetchData();
  }

  onOk = () => {
    const { onOk } = this.props;
    const { selectedRows } = this.state;
    onOk(selectedRows);
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { type, checkTypes: propsCheckTypes } = this.props;
    const { filter } = this.state;
    // 物料为出厂检和入厂检，mbom和工艺路线为生产检和首检
    const checkTypes = type === 'material' ? '0,1' : '2,3';
    const {
      data: { data, total },
    } = await getQcConfigList({
      ...filter,
      ...params,
      checkTypes: propsCheckTypes || checkTypes,
      size: PAGE_SIZE,
      state: 1,
    });
    const pagination = { ...this.state.pagination };
    pagination.total = total;
    if (params && params.page) {
      pagination.current = params.page;
    }
    this.setState({ loading: false, qcConfigs: data, pagination });
  };

  handleTableChange = pagination => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.fetchData({
      page: pagination.current,
    });
  };

  handleExtraSubmit = value => {
    const { submit } = this.props;
    submit(value);
  };

  showQcConfigModal = () => {
    const { type, onCancel, unitsForSelect } = this.props;
    openModal(
      {
        title: '创建质检方案',
        children: (
          <CreateQcConfig
            type={type}
            handleExtraSubmit={this.handleExtraSubmit}
            handlePrarentCancel={onCancel}
            unitsForSelect={unitsForSelect}
          />
        ),
        footer: null,
        style: { maxHeight: '80%', overflow: 'scroll' },
        width: '70%',
      },
      this.context,
    );
  };

  handleSearch = () => {
    const {
      form: { getFieldsValue },
    } = this.props;
    const params = getFieldsValue();
    if (!params.search) {
      params.search = undefined;
    }
    this.setState({ filter: params });
    this.fetchData({ ...params, page: 1 });
  };

  render() {
    const {
      form: { getFieldDecorator },
      hideCreateButton,
      onCancel,
      qcConfigDetails,
      rowSelectionType = ROW_SELECTION_TYPE.checkbox.type,
    } = this.props;
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: '编号',
        key: 'code',
        width: 200,
        dataIndex: 'code',
      },
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
      },
    ];
    const rowSelection = {
      type: rowSelectionType,
      onChange: (selectedRowKeys, rows) => {
        if (rowSelectionType === ROW_SELECTION_TYPE.radio.type) {
          this.setState({ selectedRows: rows });
        }
      },
      onSelect: (record, selected, rows, nativeEvent) => {
        if (rowSelectionType === ROW_SELECTION_TYPE.radio.type) return;
        if (!Array.isArray(selectedRows)) return;

        let newSelectedRows = selectedRows;
        if (selected) {
          newSelectedRows.push(record);
        } else {
          newSelectedRows = selectedRows.filter(selectedRow => selectedRow.id !== record.id);
        }
        this.setState({ selectedRows: newSelectedRows });
      },
      onSelectAll: (selected, rows, changeRows) => {
        if (rowSelectionType === ROW_SELECTION_TYPE.radio.type) return;
        if (!Array.isArray(changeRows) || !Array.isArray(selectedRows)) return;

        let newSelectedRows = [];
        if (selected) {
          newSelectedRows = selectedRows.concat(changeRows);
        } else {
          for (const selectedRow of selectedRows) {
            let hasChange = false;
            for (const changeRow of changeRows) {
              if (selectedRow.id === changeRow.id) {
                hasChange = true;
              }
            }
            if (!hasChange) {
              newSelectedRows.push(selectedRow);
            }
          }
        }
        this.setState({ selectedRows: newSelectedRows });
      },
      getCheckboxProps: record => {
        // 选过的质检方案不允许重复选
        const { id } = record || {};
        const selected = Array.isArray(qcConfigDetails) && qcConfigDetails.filter(n => n.id === id).length > 0;

        return {
          disabled: selected,
          defaultChecked: selected,
        };
      },
    };
    const { qcConfigs, loading, pagination } = this.state;

    return (
      <Fragment>
        <AntRow gutter={24} style={{ marginBottom: 20 }}>
          <AntCol span={4} style={{ paddingTop: 4 }}>
            <span style={{ paddingLeft: 44 }}>{changeChineseToLocale('编号/名称')}</span>
          </AntCol>
          <AntCol span={8}>
            {getFieldDecorator('search')(
              <Input
                onKeyPress={e => {
                  if (e.which === 13) {
                    this.handleSearch();
                    e.preventDefault();
                  }
                }}
                style={{ width: '100%' }}
                placeholder="请输入名称"
              />,
            )}
          </AntCol>
          <AntCol span={2}>
            <Button onClick={this.handleSearch}>查询</Button>
          </AntCol>
        </AntRow>
        <SimpleTable
          style={{ margin: 0 }}
          loading={loading}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          scroll={{ y: 250 }}
          columns={columns}
          dataSource={qcConfigs}
          pagination={pagination}
          onChange={this.handleTableChange}
        />
        <div style={{ margin: '5px 20px 40px' }}>
          {changeChineseTemplateToLocale('共{length}条', { length: qcConfigs.length })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {!hideCreateButton ? (
            <Button style={{ width: 114, marginRight: 60 }} type="ghost" onClick={this.showQcConfigModal}>
              {changeChineseToLocale('创建新方案')}
            </Button>
          ) : (
            <Button style={{ width: 114, marginRight: 60 }} type="ghost" onClick={onCancel}>
              {changeChineseToLocale('取消')}
            </Button>
          )}
          <Button type="primary" style={{ width: 114 }} onClick={this.onOk}>
            {changeChineseToLocale('确认选择')}
          </Button>
        </div>
      </Fragment>
    );
  }
}

AddQcCheckItemConfigModal.contextTypes = {
  changeChineseToLocale: PropTypes.func,
  changeChineseTemplateToLocale: PropTypes.func,
};

export default withForm({}, AddQcCheckItemConfigModal);
