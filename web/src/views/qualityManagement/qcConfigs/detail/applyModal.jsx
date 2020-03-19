import React, { Component, Fragment } from 'react';
import { message, Input, Button, withForm, Table, Row, Col, Select } from 'components';
import { queryMaterialList } from 'src/services/bom/material';
import { applyQcConfig } from 'src/services/qcConfig';
import { replaceSign } from 'src/constants';

const AntRow = Row.AntRow;
const AntCol = Col.AntCol;

class AddQcCheckItemConfigModal extends Component {
  props: { qcConfig: {}, form: any, onCancel: () => {}, onOk: () => {} };
  state = {
    data: [],
    loading: false,
    selectedRows: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    this.setState({ loading: true });
    const {
      data: { data },
    } = await queryMaterialList({ ...params, size: 5000 });
    this.setState({ data, loading: false });
  };

  render() {
    const {
      qcConfig,
      form: { getFieldDecorator, getFieldsValue },
      onCancel,
    } = this.props;
    const { data, loading, selectedRows } = this.state;
    const { checkType } = qcConfig || {};
    const columns = [
      {
        title: '编码',
        width: 200,
        key: 'code',
        dataIndex: 'code',
      },
      {
        title: '名称',
        width: 200,
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: '入厂检名称',
        width: 200,
        key: 'inputFactoryQcConfigDetails',
        dataIndex: 'inputFactoryQcConfigDetails',
        render: qcConfigDetails =>
          Array.isArray(qcConfigDetails) && qcConfigDetails.length
            ? qcConfigDetails.map(e => e.name).join(',')
            : replaceSign,
      },
      {
        title: '出厂检名称',
        width: 200,
        key: 'outputFactoryQcConfigDetails',
        dataIndex: 'outputFactoryQcConfigDetails',
        render: qcConfigDetails =>
          Array.isArray(qcConfigDetails) && qcConfigDetails.length
            ? qcConfigDetails.map(e => e.name).join(',')
            : replaceSign,
      },
    ];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows });
      },
      selectedRowKeys: selectedRows.map(e => e.code),
      getCheckboxProps: record => {
        const { inputFactoryQcConfigDetails, outputFactoryQcConfigDetails } = record;
        let disabled;
        if (checkType === 0) {
          disabled =
            Array.isArray(inputFactoryQcConfigDetails) &&
            inputFactoryQcConfigDetails.map(e => e.name).includes(qcConfig && qcConfig.name);
        } else {
          disabled =
            Array.isArray(outputFactoryQcConfigDetails) &&
            outputFactoryQcConfigDetails.map(e => e.name).includes(qcConfig && qcConfig.name);
        }
        return {
          disabled,
        };
      },
    };
    return (
      <Fragment>
        <div>
          <AntRow gutter={24} style={{ margin: 10 }}>
            <AntCol span={4} style={{ paddingTop: 4 }}>
              物料编号/名称
            </AntCol>
            <AntCol span={12}>
              {getFieldDecorator('search')(<Input style={{ width: '100%' }} placeholder="请输入编号/名称" />)}
            </AntCol>
            <AntCol span={2}>
              <Button
                onClick={() => {
                  const params = getFieldsValue();
                  if (!params.search) {
                    params.search = undefined;
                  }
                  this.fetchData(params);
                }}
              >
                查询
              </Button>
            </AntCol>
          </AntRow>

          <Table
            loading={loading}
            rowKey={record => record.code}
            rowSelection={rowSelection}
            pagination={false}
            columns={columns}
            dataSource={data}
            scroll={{ y: 240 }}
          />
          <div style={{ margin: '5px 20px 20px' }}>
            已选{selectedRows.length}条，共{data.length}条
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button style={{ width: 114, marginRight: 60 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button
            type="primary"
            style={{ width: 114 }}
            onClick={async () => {
              if (checkType === undefined || checkType === null) {
                message.error('请选择质检类型');
                return;
              } else if (!selectedRows.length) {
                message.error('请选择物料');
              }
              await applyQcConfig({
                id: qcConfig && qcConfig.id,
                checkType,
                materialCodes: selectedRows.map(e => e.code),
              });
              message.success('应用成功！');
              onCancel();
            }}
          >
            完成
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default withForm({}, AddQcCheckItemConfigModal);
