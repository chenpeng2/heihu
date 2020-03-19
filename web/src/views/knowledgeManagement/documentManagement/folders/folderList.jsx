import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { withForm, message, Link, Tooltip, DatePicker, Badge, FilterSortSearchBar, RestPagingTable, Button, Select, Input } from 'components';
import moment, { formatDateTime, formatToUnix } from 'utils/time';
import SearchSelect from 'components/select/searchSelect';
import { setLocation } from 'utils/url';
import { getLocation } from 'src/routes/getRouteParams';
import { replaceSign } from 'constants';
import { getFolderList, updateFolderStatus } from 'src/services/knowledgeBase/file';
import { formatFolders } from '../utils';

const { ItemList, Item } = FilterSortSearchBar;
const { RangePicker } = DatePicker;
const { Option } = Select;
type propTypes = {
  form: any,
  match: {},
};

const formatParams = formValue => {
  const { createdAt, ..._params } = formValue;
  if (!_params.nameLike) {
    _params.nameLike = undefined;
  }
  if (!_params.codeLike) {
    _params.codeLike = undefined;
  }
  if (!_params.version) {
    _params.version = undefined;
  }
  if (_params.status === 'all') {
    _params.status = undefined;
  }
  if (_params.creatorId) {
    _params.creatorId = _params.creatorId.key;
  }
  if (Array.isArray(createdAt) && createdAt.length === 2) {
    const [startTime, endTime] = createdAt;
    _params.createdAtFrom = formatToUnix(
      startTime
        .hour(0)
        .minute(0)
        .second(0),
    );
    _params.createdAtTill = formatToUnix(
      endTime
        .hour(23)
        .minute(59)
        .second(59),
    );
  }
  return _params;
};

class FolderList extends Component<propTypes> {
  state = {
    filtered: false,
  };

  componentDidMount() {
    this.setDataSource({ size: 10 });
    const { match, form } = this.props;
    const location = getLocation(match);
    const filter = _.get(location, 'query.filter');
    if (filter) {
      if (filter.createdAt && !_.isEmpty(filter.createdAt)) {
        filter.createdAt[0] = moment(filter.createdAt[0]);
        filter.createdAt[1] = moment(filter.createdAt[1]);
      }
      form.setFieldsValue(filter);
    }
  }

  setDataSource = async params => {
    const { match } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    const {
      form: { getFieldsValue },
    } = this.props;
    const _params = formatParams(getFieldsValue());
    setLocation(this.props, () => ({ ...location.query, filter: getFieldsValue() }));
    const {
      data: { data, count },
    } = await getFolderList({ ...location.query, ..._params });
    const dataSource = formatFolders(data);
    this.setState({ dataSource, total: count });
  };

  getColumns = () => {
    const columns = [
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        fixed: 'left',
        width: 300,
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '编码',
        key: 'code',
        dataIndex: 'code',
        width: 300,
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '状态',
        key: 'status',
        width: 150,
        dataIndex: 'status',
        render: (status, { type }) => {
          if (type === 'ORGANIZATION') {
            return replaceSign;
          }
          return status === 1 ? <Badge status="success" text="启用中" /> : <Badge status="error" text="停用中" />;
        },
      },
      {
        title: '描述',
        key: 'desc',
        dataIndex: 'desc',
        width: 300,
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '创建人',
        key: 'creatorName',
        dataIndex: 'creatorName',
        width: 180,
        render: text => text || replaceSign,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        render: text => (text ? formatDateTime(text) : replaceSign),
      },
      {
        title: '操作',
        key: 'id',
        width: 180,
        fixed: 'right',
        dataIndex: 'id',
        render: (id, { type, name, key, status }) => {
          return (
            <span className="child-gap" style={{ textAlign: 'right' }}>
              {
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/knowledgeManagement/folders/${id}/edit`);
                  }}
                >
                  编辑
                </Link>
              }
              {
                <Link
                  onClick={async () => {
                    await updateFolderStatus({ id, status: status === 1 ? 0 : 1 });
                    message.success(`${status === 1 ? '停用' : '启用'}成功`);
                    this.setDataSource();
                  }}
                >
                  {status === 1 ? '停用' : '启用'}
                </Link>
              }
            </span>
          );
        },
      },
    ];
    return columns;
  };

  handleChildren = async ({ id, key }) => {
    const { enabled } = this.state;
    let expandData = [];
    const {
      data: { data: result },
    } = await getFolderList({ parentId: id, enabled, page: 1, size: 100 });
    expandData = result;
    const data = this.recureData(this.state.dataSource, key, expandData.map(node => ({ ...node, key: `${node.type}/${node.id}` })));
    this.setState({
      dataSource: data,
    });
  };

  recureData = (data, key, children) => {
    return data.map(node => {
      const uniqueKey = node.id;
      if (node.id === key) {
        return { ...node, children, key: uniqueKey };
      } else if (node.children) {
        return { ...node, children: this.recureData(node.children, key, children) };
      }
      return node;
    });
  };

  handleExpandStatus = (expand, key) => {
    const { expandedRowKeys } = this.state;
    if (expand) {
      this.setState({ expandedRowKeys: [...expandedRowKeys, key] });
    } else {
      this.setState({ expandedRowKeys: _.pull(expandedRowKeys, key) });
    }
  };

  renderActions = () => (
    <div style={{ padding: 20 }}>
      <Button
        icon="plus-circle-o"
        style={{ marginRight: '20px' }}
        onClick={() => {
          this.context.router.history.push('/knowledgeManagement/folders/create');
        }}
      >
        创建文件夹
      </Button>
    </div>
  );

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue, setFieldsValue },
    } = this.props;
    const { dataSource, total } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="名称">{getFieldDecorator('nameLike')(<Input />)}</Item>
            <Item label="编码">{getFieldDecorator('codeLike')(<Input />)}</Item>
            <Item label="状态">
              {getFieldDecorator('status', {
                initialValue: 'all',
              })(
                <Select>
                  <Option value="all">全部</Option>
                  <Option value={1}>启用中</Option>
                  <Option value={0}>停用中</Option>
                </Select>,
              )}
            </Item>
            <Item label="创建人">{getFieldDecorator('creatorId')(<SearchSelect type="user" />)}</Item>
            <Item label="创建时间">
              {getFieldDecorator('createdAt', {})(
                <RangePicker
                  showTime={{
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  }}
                  format="YYYY-MM-DD HH:mm:ss"
                  allowClear
                />,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              this.setDataSource({ page: 1 });
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        {this.renderActions()}
        <div>
          {/* {filtered ? ( */}
          <RestPagingTable
            key={JSON.stringify(dataSource)}
            // defaultExpandAllRows
            dataSource={dataSource}
            refetch={this.setDataSource}
            total={total}
            columns={this.getColumns()}
            rowKey={({ id, type }) => `${type}/${id}`}
          />
          {/*
           ) : (
            <SimpleTable
              expandIconAsCell
              key={JSON.stringify(dataSource)}
              scroll={{ x: 1400 }}
              rowKey={({ id, type }) => `${type}/${id}`}
              expandedRowKeys={expandedRowKeys}
              dataSource={dataSource}
              pagination={false}
              columns={this.getColumns()}
              onExpand={async (expanded, record) => {
                const { key } = record;
                this.handleExpandStatus(expanded, key);
                if (expanded && _.get(record, 'children.length', 0) === 0) {
                  this.handleChildren(record);
                }
              }}
            />
          )}
            */}
        </div>
      </div>
    );
  }
}

FolderList.contextTypes = {
  router: {},
};

export default withRouter(withForm({}, FolderList));
