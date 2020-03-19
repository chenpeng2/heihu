import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';
import { getQuery } from 'src/routes/getRouteParams';
import {
  Table,
  Spin,
  openModal,
  Button,
  Icon,
  Link,
  message,
  FilterSortSearchBar,
  Select,
  Input,
  withForm,
  Badge,
  FormattedMessage,
} from 'components';
import { setLocation } from 'utils/url';
import {
  getDownTimeCausesList,
  disableDownTimeCause,
  enableDownTimeCause,
} from 'src/services/knowledgeBase/downtimeCause';
import { fontSub, white, primary, error } from 'src/styles/color/index';
import CreateFaultCause from '../create';
import EditFaultCause from '../edit';

type Props = {
  match: any,
  form: any,
};
const MyBadge = Badge.MyBadge;
const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

class DownTimeCausesList extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
    parent: {},
  };

  componentDidMount() {
    const { form, match } = this.props;
    const { setFieldsValue } = form;
    const queryMatch = getQuery(match);
    this.fetchAndSetData(queryMatch);
    setFieldsValue({
      searchContent: queryMatch.searchContent || '',
      status: queryMatch.searchStatus
        ? {
            key: queryMatch.searchStatus,
            label: queryMatch.searchStatusLabel,
          }
        : null,
    });
  }

  fetchAndSetData = params => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    const searchStatus = value.status || {};
    const variables = {
      searchStatusLabel: searchStatus.label || '',
      searchStatus: searchStatus.key || '',
      searchContent: value.searchContent || '',
      ...params,
    };

    this.setState({ loading: true });
    setLocation(this.props, p => {
      return { ...p, ...variables };
    });

    getDownTimeCausesList(variables)
      .then(res => {
        this.setState({
          data: res.data,
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };

  addSubFaultCause = id => {
    const { match } = this.props;
    openModal(
      {
        children: <CreateFaultCause match={match} parentId={id} refetch={this.fetchAndSetData} />,
        title: '创建停机原因',
        footer: null,
      },
      this.context,
    );
  };

  editSubFaultCause = initialValue => {
    const { match } = this.props;
    openModal(
      {
        children: <EditFaultCause match={match} initialValue={initialValue} refetch={this.fetchAndSetData} />,
        title: '编辑停机原因',
        footer: null,
      },
      this.context,
    );
  };

  updateStatus = (func, id, type) => {
    const { match } = this.props;
    const queryMatch = getQuery(match);
    func(id).then(() => {
      message.success(`${type}成功`);
      this.fetchAndSetData(queryMatch);
    });
  };

  getButton = () => (
    <Button
      style={{ width: 86 }}
      onClick={() => {
        this.fetchAndSetData({ page: 1 });
      }}
      icon={'search'}
    >
      查询
    </Button>
  );

  getPlanDowntimeDisplay = planDowntime => {
    switch (planDowntime) {
      case 1:
        return '计划性停机';
      case 2:
        return '设备故障';
      case 3:
        return '换装调机';
      case 4:
        return '暂时性停机';
      default:
        return '未知类型';
    }
  };

  getColumns = () => {
    const columns = [
      {
        title: '原因名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '原因代码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FormattedMessage defaultMessage={'停机类型'} />
            <Popover
              content={
                <div style={{ width: 204, padding: '0 0 20px 5px' }}>
                  <h3>
                    <FormattedMessage defaultMessage={'计划停机：'} />
                  </h3>
                  <FormattedMessage defaultMessage={'该标记用于数据分析。'} />
                </div>
              }
              trigger="hover"
            >
              <Icon style={{ marginLeft: 5, color: fontSub }} type={'exclamation-circle-o'} />
            </Popover>
          </div>
        ),
        dataIndex: 'typeName',
        key: 'typeName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: status => <MyBadge text={status === 1 ? '启用中' : '停用中'} color={status === 1 ? primary : error} />,
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => {
          const { status, code, name, id, typeId, typeName } = record;
          const initialValue = {
            id,
            code,
            name,
            status,
            typeId: {
              key: typeId,
              label: typeName,
            },
          };
          return (
            <div>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.updateStatus(
                    status === 1 ? disableDownTimeCause : enableDownTimeCause,
                    id,
                    status === 1 ? '停用' : '启用',
                  );
                }}
              >
                {status === 1 ? '停用' : '启用'}
              </Link>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.editSubFaultCause(initialValue);
                }}
              >
                编辑
              </Link>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { data, loading } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div>
        <Spin spinning={loading}>
          <FilterSortSearchBar
            style={{ backgroundColor: white, width: '100%', marginBottom: -30 }}
            searchDisabled
            searchFn={this.fetchAndSetData}
          >
            <ItemList>
              <Item label="启用状态">
                {getFieldDecorator('status')(
                  <Select
                    placeholder={'请选择'}
                    onChange={this.changeStatus}
                    labelInValue
                    style={{ margin: '0 100px 0 5px', width: 200, height: 32 }}
                    options={[{ label: '全部', value: 0 }, { label: '启用', value: 1 }, { label: '停用', value: 2 }]}
                  />,
                )}
              </Item>
              <Item label="搜索">
                {getFieldDecorator('searchContent')(
                  <Input style={{ marginRight: 5, width: 200, height: 32 }} placeholder={'请输入原因名称或原因代码'} />,
                )}
              </Item>
            </ItemList>
            {this.getButton()}
          </FilterSortSearchBar>
          <Button
            style={{ height: 32, display: 'block', margin: '43px 0 20px 20px' }}
            onClick={this.addSubFaultCause}
            icon={'plus-circle-o'}
          >
            创建停机原因
          </Button>
          <Table
            dataSource={(data && data.data) || []}
            total={data && data.total}
            rowKey={record => record.id}
            columns={this.getColumns()}
            refetch={this.fetchAndSetData}
          />
        </Spin>
      </div>
    );
  }
}

DownTimeCausesList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withForm({}, DownTimeCausesList);
