import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getQuery } from 'src/routes/getRouteParams';
import {
  RestPagingTable,
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
  Tooltip,
  Badge,
} from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { setLocation } from 'utils/url';
import { getFaultCausesList, disableFaultCause, enableFaultCause } from 'src/services/knowledgeBase/equipment';
import { white, error, primary } from 'src/styles/color/index';
import CreateFaultCause from '../create';
import EditFaultCause from '../edit';
import styles from '../styles.scss';

type Props = {
  match: any,
  intl: any,
  form: any,
};
const MyBadge = Badge.MyBadge;
const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

class FaultCausesList extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
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

    getFaultCausesList(variables)
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

  addSubFaultCause = (id, initialValue) => {
    const { match } = this.props;
    openModal(
      {
        children: (
          <CreateFaultCause match={match} parentId={id} initialValue={initialValue} refetch={this.fetchAndSetData} />
        ),
        title: '创建故障原因',
        footer: null,
      },
      this.context,
    );
  };

  editSubFaultCause = (id, initialValue) => {
    const { match } = this.props;
    openModal(
      {
        children: (
          <EditFaultCause match={match} parentId={id} initialValue={initialValue} refetch={this.fetchAndSetData} />
        ),
        title: '编辑故障原因',
        footer: null,
      },
      this.context,
    );
  };

  getDataSource = data => {
    const _data = _.cloneDeep(data);
    _data.forEach((n, index) => {
      if (n.subFaultReasons) {
        n.subFaultReasons.map(m => (m.subSuitableCategory = n.suitableCategory));
        _data[index].children = n.subFaultReasons;
      }
    });
    return _data;
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

  getColumns = () => {
    const columns = [
      {
        title: '故障名称',
        dataIndex: 'name',
        type: 'mfgBatchNo',
        key: 'name',
        render: name => <Tooltip text={name} length={15} />,
      },
      {
        title: '故障代码',
        dataIndex: 'code',
        type: 'desc',
        key: 'code',
      },
      {
        title: '适合类型',
        dataIndex: 'suitableCategory',
        width: 550,
        key: 'suitableCategory',
        render: suitableCategory => {
          return suitableCategory
            ? suitableCategory.map((n, index) => (
                <span key={index} className={styles.tag}>
                  <Tooltip text={n.name} length={5} />
                </span>
              ))
            : null;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: status => <MyBadge text={status === 1 ? '启用中' : '停用中'} color={status === 1 ? primary : error} />,
      },
      {
        title: '操作',
        key: 'action',
        width: 130,
        render: (_, record) => {
          const { status, code, name, id } = record;
          const suitableCategory = record.subSuitableCategory || record.suitableCategory;
          const initialValue = {
            id,
            code,
            name,
            category: suitableCategory.map(n => ({
              key: n.id,
              label: n.name,
              type: n.type,
            })),
          };
          const _initialValue = {
            category: suitableCategory.map(n => ({
              key: n.id,
              label: n.name,
              type: n.type,
            })),
          };

          return (
            <div>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.updateStatus(
                    status === 1 ? disableFaultCause : enableFaultCause,
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
                  this.editSubFaultCause(record.parentId, initialValue);
                }}
              >
                编辑
              </Link>
              {record.parentId === 0 ? (
                <Link
                  onClick={() => {
                    this.addSubFaultCause(record.id, _initialValue);
                  }}
                >
                  添加
                </Link>
              ) : null}
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { data, loading } = this.state;
    const { form, match, intl } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.faultCausesList}>
        <Spin spinning={loading}>
          <FilterSortSearchBar style={{ backgroundColor: white, width: '100%', marginBottom: -30 }} searchDisabled>
            <ItemList>
              <Item label="启用状态">
                {getFieldDecorator('status')(
                  <Select
                    placeholder={changeChineseToLocale('请选择', intl)}
                    labelInValue
                    style={{ margin: '0 100px 0 5px', width: 200, height: 32 }}
                  >
                    <Option key={1} value={'0'}>
                      {changeChineseToLocale('全部', intl)}
                    </Option>
                    <Option key={1} value={'1'}>
                      {changeChineseToLocale('启用', intl)}
                    </Option>
                    <Option key={2} value={'2'}>
                      {changeChineseToLocale('停用', intl)}
                    </Option>
                  </Select>,
                )}
              </Item>
              <Item label="搜索">
                {getFieldDecorator('searchContent')(
                  <Input style={{ marginRight: 5, width: 200, height: 32 }} placeholder={'请输入故障名称或故障代码'} />,
                )}
              </Item>
            </ItemList>
            {this.getButton()}
          </FilterSortSearchBar>
          <Button
            style={{ height: 32, display: 'block', margin: '43px 0 20px 20px' }}
            icon={'plus-circle-o'}
            onClick={() =>
              openModal(
                {
                  children: <CreateFaultCause match={match} parentId={0} refetch={this.fetchAndSetData} />,
                  title: '创建故障原因',
                  footer: null,
                },
                this.context,
              )
            }
          >
            创建故障原因
          </Button>
          <RestPagingTable
            bordered
            dataSource={this.getDataSource((data && data.data) || [])}
            total={data && data.total}
            rowKey={record => record.id}
            columns={this.getColumns()}
            refetch={this.fetchAndSetData}
            indentSize={0}
          />
        </Spin>
      </div>
    );
  }
}

FaultCausesList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withForm({}, injectIntl(FaultCausesList));
