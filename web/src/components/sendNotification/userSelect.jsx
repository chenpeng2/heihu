import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  FilterSortSearchBar,
  withForm,
  SearchSelect,
  Input,
  Button,
  Table,
  Tooltip,
  Spin,
  FormItem,
  Link,
} from 'src/components';
import { getUsers } from 'src/services/auth/user';
import log from 'src/utils/log';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';

const Item = FilterSortSearchBar.Item;

type Props = {
  form: any,
  setSelectedUser: () => {},
};

const UserSelect = (props: Props) => {
  const { form, setSelectedUser } = props;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { getFieldDecorator, getFieldsValue, resetFields } = form;

  const getUserList = async query => {
    setLoading(true);
    try {
      const { data } = await getUsers({ ...query, embed: 'roles' });
      setData(data);
    } catch (e) {
      log.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    return [
      {
        title: '姓名',
        dataIndex: 'name',
        width: 140,
        render: text => <Tooltip width={140} text={text || replaceSign} />,
      },
      {
        title: '账号',
        dataIndex: 'username',
        width: 140,
        render: text => <Tooltip width={140} text={text || replaceSign} />,
      },
      {
        title: '角色',
        dataIndex: 'roles',
        render: roles =>
          (!arrayIsEmpty(roles) && (
            <Tooltip text={roles.map(({ name }) => name).reduce((prev, next) => `${prev},${next}`)} length={20} />
          )) ||
          replaceSign,
      },
    ];
  };

  const handleTableChange = pagination => {
    getUserList({
      ...getFieldsValue(),
      page: pagination && pagination.current,
      size: (pagination && pagination.pageSize) || 10,
    });
  };

  const onReset = () => {
    resetFields();
    getUserList({ ...getFieldsValue(), page: 1 });
  };

  useEffect(() => {
    getUserList();
  }, []);

  const dataSource = _.get(data, 'data', []);
  const total = _.get(data, 'total', 0);
  const _selectedRows = selectedRows || [];
  const columns = getColumns();
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedRows = _.pullAllBy(_selectedRows, dataSource, 'id').concat(selectedRows);
      setSelectedRows(newSelectedRows);
      setSelectedUser(newSelectedRows);
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          <FormItem label="用户角色">
            {getFieldDecorator('roleId', {
              initialValue: null,
            })(
              <SearchSelect
                style={{ width: 130, marginLeft: 10 }}
                type="role"
                placeholder="全部"
                labelInValue={false}
                handleData={data => {
                  return [{ label: '全部', key: null }, ...data];
                }}
              />,
            )}
          </FormItem>
          <FormItem label="用户账号">
            {getFieldDecorator('username')(<Input style={{ width: 130, marginLeft: 10 }} />)}
          </FormItem>
        </div>
        <div style={{ marginTop: 5 }}>
          <Button
            onClick={() => {
              getUserList({ ...getFieldsValue(), page: 1 });
            }}
            icon={'search'}
          >
            查询
          </Button>
          <Link
            style={{
              lineHeight: '30px',
              height: '28px',
              color: '#8C8C8C',
              paddingLeft: 16,
            }}
            onClick={onReset}
          >
            重置
          </Link>
        </div>
      </div>
      <div style={{ marginBottom: 50 }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          total={total}
          scroll={{ y: 200 }}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          rowKey={record => record.id}
        />
      </div>
    </Spin>
  );
};

export default withForm({}, UserSelect);
