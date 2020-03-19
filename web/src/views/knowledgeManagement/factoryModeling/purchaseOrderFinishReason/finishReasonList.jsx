import React from 'react';
import {
  FilterSortSearchBar,
  withForm,
  Input,
  Select,
  Button,
  SimpleTable,
  OpenModal,
  Link,
  Badge,
  message,
  haveAuthority,
} from 'components';
import auth from 'utils/auth';
import {
  getPurchaseOrderFinishReasons,
  updatePurchaseOrderFinishReasonStatus,
} from 'services/cooperate/purchaseOrder';
import { setLocation } from 'utils/url';
import FinishReasonForm from './finishReasonForm';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

class FinishReasonList extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    this.setDataSource({}, true);
  }

  setDataSource = async (params, isFirst = false) => {
    const _params = setLocation(this.props, p => ({ page: 1, size: 10, ...p, ...params }));
    if (isFirst) {
      const { form: { setFieldsValue } } = this.props;
      setFieldsValue(_params);
    }
    const { data: { data, total } } = await getPurchaseOrderFinishReasons({
      ..._params,
      status: _params.status !== 'ALL' ? _params.status : undefined,
    });
    this.setState({ dataSource: data, total });
  };

  openCreateModal = () => {
    OpenModal({
      width: 815,
      children: <FinishReasonForm wrappedComponentRef={inst => (this.form = inst)} type="create" refetch={this.setDataSource} />,
      title: '创建销售订单结束原因',
      okText: '完成',
      onOk: async () => {
        await this.form.submit();
      },
    });
  };
  openEditModal = (id, formData) => {
    OpenModal({
      width: 815,
      children: (
        <FinishReasonForm wrappedComponentRef={inst => (this.form = inst)} type="edit" id={id} formData={formData} refetch={this.setDataSource} />
      ),
      title: '编辑销售订单结束原因',
      okText: '完成',
      onOk: async () => {
        await this.form.submit();
      },
    });
  };

  handleToggleStatus = async data => {
    const { status } = data;
    await updatePurchaseOrderFinishReasonStatus(data);
    message.success(status === 0 ? '停用成功！' : '启用成功！');
    this.setDataSource({});
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator, getFieldsValue } = form;
    const { dataSource, total } = this.state;
    const columns = [
      { title: '名称', dataIndex: 'name' },
      {
        title: '执行状态',
        dataIndex: 'status',
        render: status => (
          <Badge
            text={status === 1 ? '启用中' : '停用中'}
            status={status === 1 ? 'success' : 'error'}
          />
        ),
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (id, { status, name }) => (
          <div className="child-gap">
            <Link disabled={!haveAuthority(auth.WEB_PURCHASE_ORDER_FINISH_REASON)} onClick={() => this.openEditModal(id, { name })}>编辑</Link>
            <Link disabled={!haveAuthority(auth.WEB_PURCHASE_ORDER_FINISH_REASON)} onClick={() => this.handleToggleStatus({ id, status: status === 1 ? 0 : 1 })}>
              {status === 1 ? '停用' : '启用'}
            </Link>
          </div>
        ),
      },
    ];
    return (
      <div>
        <FilterSortSearchBar>
          <ItemList>
            <Item label="名称">{getFieldDecorator('name')(<Input />)}</Item>
            <Item label="执行状态">
              {getFieldDecorator('status', {
                initialValue: 'ALL',
              })(
                <Select>
                  <Option key={'ALL'}>全部</Option>
                  <Option key={1}>启用中</Option>
                  <Option key={0}>停用中</Option>
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              this.setDataSource({ page: 1, ...getFieldsValue() });
            }}
          >
            查询
          </Button>
          <Link
            style={{
              lineHeight: '30px',
              height: '28px',
              color: '#8C8C8C',
              paddingLeft: '10px',
            }}
            onClick={() => {
              this.props.form.resetFields();
              this.setDataSource({ page: 1, ...getFieldsValue() });
            }}
          >重置</Link>
        </FilterSortSearchBar>
        <div style={{ marginLeft: 20, marginBottom: 20 }}>
          <Button disabled={!haveAuthority(auth.WEB_PURCHASE_ORDER_FINISH_REASON)} icon="plus-circle-o" onClick={() => this.openCreateModal()}>
            创建销售订单结束原因
          </Button>
        </div>
        <SimpleTable
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{ total, onChange: current => this.setDataSource({ page: current }) }}
        />
      </div>
    );
  }
}

export default withForm({}, FinishReasonList);
