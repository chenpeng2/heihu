import React, { Component } from 'react';
import { Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import _ from 'lodash';
import {
  FormattedMessage,
  RestPagingTable,
  Link,
  Spin,
  Popconfirm,
  Icon,
  DatePicker,
  FilterSortSearchBar,
  withForm,
  Button,
  Checkbox,
  message,
} from 'src/components';
import { exportByDay, getExportByDayList } from 'src/services/stock/stockCheckedRecord';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { wrapUrl } from 'utils/attachment';
import { error, primary, warning, borderGrey } from 'src/styles/color';
import { getFormatDay } from '../../utils';

const Popiknow = Popconfirm.Popiknow;
const { RangePicker } = DatePicker;
const { ItemList, Item } = FilterSortSearchBar;

type Props = {
  form: any,
  match: any,
};

class ExportByDay extends Component {
  props: Props;
  state = {
    data: [],
    loading: false,
    nextPage: 1,
  };

  componentDidMount() {
    const day = this.getInitialValue();
    const params = { day, page: 1, size: 10 };
    setLocation(this.props, p => ({ ...p, day }));
    this.fetchData(params);
  }

  fetchData = params => {
    let nextPage = 1;
    if (params && params.page) {
      nextPage = params.page;
    }
    const { checked } = this.state;
    const { day, page } = params;
    const _params = {
      day: moment(day[1]).format('YYYYMMDD'),
      dayFrom: moment(day[0]).format('YYYYMMDD'),
      page: page || 1,
      size: 10,
    };
    this.setState({ loading: true, nextPage });
    getExportByDayList(_params)
      .then(res => {
        const { data } = res;
        if (checked) {
          const filterData = {
            data: data.data.filter(n => !(n.generateTime && n.recordCount === 0)),
          };
          this.setState({ data: filterData, initialData: _.cloneDeep(data) });
        } else {
          this.setState({ data, initialData: _.cloneDeep(data) });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getInitialValue = () => {
    const { match } = this.props;
    const { query } = match.location || {};
    const { date } = getQuery(match);
    let day = date ? [moment(date[0]), moment(date[1])] : [moment().subtract(10, 'days'), moment()];
    if (query && query.day) {
      const _day = JSON.parse(query.day);
      day = [moment(_day[0]), moment(_day[1])];
    }
    return day;
  };

  download = fileId => {
    const link = document.createElement('a');
    link.href = wrapUrl(fileId);
    link.click();
  };

  getColumns = () => {
    return [
      {
        title: '记录时间',
        dataIndex: 'day',
      },
      {
        title: '生成状态',
        dataIndex: 'generateTime',
        key: 'generateStatus',
        render: generateTime => <FormattedMessage defaultMessage={generateTime ? '已生成' : '未生成'} />,
      },
      {
        title: '记录数量',
        dataIndex: 'recordCount',
        render: recordCount => (recordCount || recordCount === 0 ? `${recordCount}条` : replaceSign),
      },
      {
        title: '生成时间',
        dataIndex: 'generateTime',
        render: generateTime => (generateTime ? moment(generateTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign),
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => {
          const { fileId, generateTime, reGenerate, day } = record;
          const canExport = generateTime ? (Date.parse(moment()) - generateTime) / 600000 > 15 : true;
          return (
            <div>
              <Popiknow
                title={
                  canExport
                    ? '生成完成！请稍等一段时间后可进行导出'
                    : '生成失败！每次文件生成需间隔15分钟，请稍后再尝试'
                }
                icon={
                  <Icon
                    style={{ color: canExport ? primary : error }}
                    type={canExport ? 'check-circle' : 'close-circle'}
                  />
                }
                iconType={canExport ? 'check-circle' : 'close-circle'}
                iconStyle={{ color: canExport ? primary : error }}
                disabled={!reGenerate}
              >
                <Link
                  onClick={() => {
                    if (reGenerate) {
                      const formatDay = getFormatDay(day);
                      exportByDay([formatDay]);
                    }
                  }}
                >
                  <FormattedMessage defaultMessage={'生成'} />
                </Link>
              </Popiknow>
              <Link
                style={{ marginLeft: 20 }}
                disabled={!fileId}
                onClick={() => {
                  if (fileId) {
                    this.download(fileId);
                  }
                }}
              >
                导出
              </Link>
            </div>
          );
        },
      },
    ];
  };

  handleSearch = () => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    const { day } = value;
    if (day && day.length) {
      setLocation(this.props, p => ({ ...p, day }));
      this.fetchData(value);
    }
  };

  disabledDate = x => {
    return x > moment().endOf('day');
  };

  renderFilter = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const time = this.getInitialValue();
    return (
      <FilterSortSearchBar style={{ width: '100%', borderBottom: `1px solid ${borderGrey}` }}>
        <ItemList>
          <Item label="导出日期选择">
            {getFieldDecorator('day', {
              initialValue: time,
            })(<RangePicker disabledDate={this.disabledDate} />)}
          </Item>
        </ItemList>
        <Button icon="search" onClick={this.handleSearch}>
          查询
        </Button>
      </FilterSortSearchBar>
    );
  };

  renderActionBar = (data, initialData, _selectedRows) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', margin: '12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            disabled={!_selectedRows.length}
            onClick={() => {
              const dates = _selectedRows.map(n => getFormatDay(n.day));
              exportByDay(dates).then(res => {
                const { data, statusCode } = res.data;
                if (statusCode === 400) {
                  Modal.warning({
                    title: '批量生成成功',
                    content: data,
                  });
                } else {
                  message.success('批量生成成功');
                }
              });
            }}
          >
            <Icon iconType={'gc'} type={'piliangcaozuo'} />
            <FormattedMessage defaultMessage={'批量生成'} />
          </Button>
          <Button
            disabled={!_selectedRows.length || _selectedRows.filter(n => !n.fileId).length > 0}
            style={{ marginLeft: 20 }}
            onClick={() => {
              const fileIds = _selectedRows.map(n => n.fileId);
              fileIds.forEach(fileId => {
                this.download(fileId);
              });
            }}
          >
            <Icon iconType={'gc'} type={'piliangcaozuo'} />
            <FormattedMessage defaultMessage={'批量导出'} />
          </Button>
          <div style={{ marginLeft: 10 }}>
            <FormattedMessage
              defaultMessage={'已选{amount}条'}
              values={{
                amount: <span style={{ color: primary }}>{` ${_selectedRows.length} `}</span>,
              }}
            />
          </div>
          <div>
            <FormattedMessage
              style={{ color: warning, marginLeft: 10 }}
              defaultMessage={'每次数据文件生成需间隔15分钟，建议单次操作便选择批量生成再批量下载'}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            onChange={e => {
              const { checked } = e.target;
              if (checked) {
                const filterData = {
                  data: data.data.filter(n => !(n.generateTime && n.recordCount === 0)),
                };
                this.setState({ data: filterData, checked });
              } else {
                this.setState({ data: initialData, checked });
              }
            }}
          >
            隐藏无记录日期
          </Checkbox>
        </div>
      </div>
    );
  };

  render() {
    const { data, initialData, loading, nextPage } = this.state;
    const columns = this.getColumns();
    const _selectedRows = this.state.selectedRows || [];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const multiSelectedRows = _selectedRows.concat(selectedRows);
        this.setState({ selectedRows: _.uniq(multiSelectedRows) });
      },
      onSelect: (record, selected) => {
        if (!selected) {
          const selectedRows = _selectedRows.filter(n => n.day !== record.day);
          this.setState({ selectedRows });
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (!selected) {
          const diffSelectedRows = _selectedRows.filter(n => {
            return changeRows.map(m => m.day).indexOf(n.day) === -1;
          });
          this.setState({ selectedRows: diffSelectedRows });
        }
      },
      selectedRowKeys: (_selectedRows && _selectedRows.map(n => n.day)) || [],
    };
    return (
      <div>
        {this.renderFilter()}
        {this.renderActionBar(data, initialData, _selectedRows)}
        <Spin spinning={loading}>
          <RestPagingTable
            columns={columns}
            dataSource={Array.isArray(data.data) ? data.data : []}
            pagination={{
              current: nextPage || 1,
              total: data ? data.total : 0,
            }}
            refetch={this.fetchData}
            rowSelection={rowSelection}
            rowKey={record => record.day}
          />
        </Spin>
      </div>
    );
  }
}

export default withForm({}, withRouter(ExportByDay));
