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
} from 'components';
import {
  getProjectFinishReasonList,
  updateProjectFinishReasonStatus,
} from 'services/knowledgeBase/projectFinishReason';
import { setLocation } from 'utils/url';
import FinishCauseForm from './FinishCauseForm';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

class FinishCauseList extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    this._isMounted = true;
    this.setDataSource({}, true);
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  setDataSource = async (params, isFirst = false) => {
    const _params = setLocation(this.props, p => ({ page: 1, size: 10, ...p, ...params }));
    if (isFirst) {
      const { form: { setFieldsValue } } = this.props;
      setFieldsValue(_params);
    }
    const { data: { data, total } } = await getProjectFinishReasonList({
      ..._params,
      status: _params.status !== '0' ? _params.status : undefined,
    });
    if (!this._isMounted) {
      return;
    }
    this.setState({ dataSource: data, total });
  };

  openCreateModal = () => {
    OpenModal({
      children: (
        <FinishCauseForm wrappedComponentRef={inst => (this.form = inst)} type="create" refetch={this.setDataSource} />
      ),
      title: '创建项目结束原因',
      okText: '完成',
      onOk: async () => {
        await this.form.submit();
      },
    });
  };
  openEditModal = (id, formData) => {
    OpenModal({
      children: (
        <FinishCauseForm
          wrappedComponentRef={inst => (this.form = inst)}
          type="edit"
          id={id}
          formData={formData}
          refetch={this.setDataSource}
        />
      ),
      title: '编辑项目结束原因',
      okText: '完成',
      onOk: async () => {
        await this.form.submit();
      },
    });
  };

  handleToggleStatus = async data => {
    await updateProjectFinishReasonStatus(data);
    message.success('操作成功！');
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
          <Badge text={status === 1 ? '启用中' : '停用中'} status={status === 1 ? 'success' : 'error'} />
        ),
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (id, { status, name }) => (
          <div className="child-gap">
            <Link onClick={() => this.openEditModal(id, { name })}>编辑</Link>
            <Link onClick={() => this.handleToggleStatus({ id, status: status === 1 ? 2 : 1 })}>
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
                initialValue: '0',
              })(
                <Select>
                  <Option key={0}>全部</Option>
                  <Option key={1}>启用中</Option>
                  <Option key={2}>停用中</Option>
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
        </FilterSortSearchBar>
        <div style={{ marginLeft: 20, marginBottom: 20 }}>
          <Button icon="plus-circle-o" onClick={() => this.openCreateModal()}>
            创建项目结束原因
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

export default withForm({}, FinishCauseList);
