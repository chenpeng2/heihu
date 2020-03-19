import React from 'react';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import {
  FilterSortSearchBar,
  withForm,
  Select,
  DatePicker,
  Button,
  Icon,
  SimpleTable,
  Link,
  Spin,
  FormattedMessage,
} from 'components';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import moment, { dayStart, dayEnd } from 'utils/time';
import SearchSelect from 'components/select/searchSelect';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { getProduceQcRecord } from 'services/qualityManagement/projectPercentOfPassForm';
import { exportXlsxFile } from 'utils/exportFile';
import Color from 'styles/color';
import { setLocation } from 'utils/url';
import log from 'src/utils/log';
import { getQuery } from 'src/routes/getRouteParams';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { produceQcIntervals, QCTASK_STATUS_FINISHED, PRODUCE_QC } from '../../constants';
import { toQcTaskList } from '../../navigation';
import styles from './index.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const DayRangePicker = DatePicker.DayRangePicker;
const WeekRangePicker = DatePicker.WeekRangePicker;
const MonthRangePicker = DatePicker.MonthRangePicker;
const QuarterRangePicker = DatePicker.QuarterRangePicker;

class ProduceQcList extends React.PureComponent<any> {
  state = {
    dataSource: null,
    total: 0,
    query: null,
    loading: false,
  };

  componentDidMount() {
    const {
      match,
      form: { setFieldsValue },
    } = this.props;
    const query = getQuery(match) || {};
    if (query.times) {
      query.times = [moment(query.times[0]), moment(query.times[1])];
      setFieldsValue({ interval: query.interval });
      this.setDataSource(query);
    }
  }

  formatParams = value => {
    const { interval, times, workstation, operator, processCode, materialCode } = value;
    return {
      interval,
      workstationIds: workstation && workstation.value && [Number(workstation.value.split('-')[1])],
      operatorIds: operator && [operator.key],
      processCodes: processCode && [processCode.key],
      materialCodes: materialCode && [materialCode.key],
      timeFrom: times && Date.parse(dayStart(times[0])),
      timeTill: times && Date.parse(dayEnd(times[1])),
    };
  };

  setDataSource = async value => {
    setLocation(this.props, () => value);
    this.setState({ loading: true });
    const query = this.formatParams(value);
    try {
      const res = await getProduceQcRecord(query);
      const list = _.get(res, 'data.data');
      const total = _.get(res, 'data.total');
      this.setState({
        dataSource: list,
        total,
        query,
      });
    } catch (e) {
      log.error(e);
    }
    this.setState({ loading: false });
  };

  exportData = async () => {
    this.setState({ loading: true });
    const { dataSource } = this.state;
    const header = this.getColumns().map(({ title }) => title);
    const body = dataSource.map(record => {
      return this.getColumns().map(({ dataIndex }) => record[dataIndex]);
    });
    exportXlsxFile([header, ...body], `生产质检报表_${moment().format('YYYY_MM_DD')}`);
    this.setState({ loading: false });
  };

  getColumns = () => {
    const { history } = this.props;
    return [
      {
        title: '时间',
        dataIndex: 'date',
        render: date => (
          <Link
            onClick={() => {
              const {
                form: { getFieldsValue },
              } = this.props;
              const value = getFieldsValue();
              const { interval, workstation, operator, processCode, materialCode } = value || {};
              let taskEndTime;
              if (interval === 6) {
                taskEndTime = [date, date];
              } else if (interval === 7) {
                const dateArr = date.split('~');
                taskEndTime = [dateArr[0], dateArr[1]];
              } else if (interval === 8) {
                const dateArr = date.split('/');
                const year = moment().year(dateArr[0]);
                const monthDisplay = dateArr[1];
                const config = [
                  { display: '一月', value: 1 },
                  { display: '二月', value: 2 },
                  { display: '三月', value: 3 },
                  { display: '四月', value: 4 },
                  { display: '五月', value: 5 },
                  { display: '六月', value: 6 },
                  { display: '七月', value: 7 },
                  { display: '八月', value: 8 },
                  { display: '九月', value: 9 },
                  { display: '十月', value: 10 },
                  { display: '十一月', value: 11 },
                  { display: '十二月', value: 12 },
                ];
                const month = config.filter(n => n.display === monthDisplay)[0].value;
                taskEndTime = [
                  _.cloneDeep(year.month(month - 1)).startOf('month'),
                  _.cloneDeep(year.month(month - 1)).endOf('month'),
                ];
              } else {
                const dateArr = date.split('/');
                const year = moment().year(dateArr[0]);
                const quarterDisplay = dateArr[1];
                const config = [
                  { display: '第一季度', value: 1 },
                  { display: '第二季度', value: 2 },
                  { display: '第三季度', value: 3 },
                  { display: '第四季度', value: 4 },
                ];
                const quarter = config.filter(n => n.display === quarterDisplay)[0].value;
                taskEndTime = [
                  _.cloneDeep(year.quarter(quarter)).startOf('quarter'),
                  _.cloneDeep(year.quarter(quarter)).endOf('quarter'),
                ];
              }
              const linkParams = {
                taskEndTime,
                workstation,
                operator,
                process: processCode,
                material: materialCode,
                status: `${QCTASK_STATUS_FINISHED}`,
                checkType: `${PRODUCE_QC}`,
              };
              const baseUrl = toQcTaskList(linkParams);
              history.push(baseUrl);
            }}
          >
            {date}
          </Link>
        ),
      },
      {
        title: '检验数',
        dataIndex: 'checkAmount',
      },
      { title: '合格率', dataIndex: 'qualifiedAmount' },
      { title: '待检率', dataIndex: 'waitingForCheckAmount' },
      { title: '让步合格率', dataIndex: 'concessionQualifiedAmount' },
      { title: '不合格率', dataIndex: 'faultyAmount' },
      { title: '暂控率', dataIndex: 'temporaryAmount' },
    ].map(node => ({
      key: node.title,
      width: 100,
      ...node,
    }));
  };

  renderFilter = () => {
    const {
      form: { getFieldDecorator, getFieldValue, resetFields },
    } = this.props;
    return (
      <FilterSortSearchBar searchDisabled style={{ borderBottom: `1px solid ${Color.border}`, marginBottom: 20 }}>
        <ItemList>
          <Item label="统计时间维度" required>
            {getFieldDecorator('interval', {
              initialValue: 6,
              rules: [{ required: true }],
            })(
              <Select
                onChange={() => {
                  resetFields();
                }}
              >
                {produceQcIntervals.map(({ key, display, value }) => (
                  <Option key={key} value={value}>
                    <FormattedMessage defaultMessage={display} />
                  </Option>
                ))}
              </Select>,
            )}
          </Item>
          <Item label="任务结束时间" required>
            {getFieldDecorator('times', {
              rules: [{ required: true }],
            })(
              {
                6: <DayRangePicker historic />,
                7: <WeekRangePicker />,
                8: <MonthRangePicker />,
                9: <QuarterRangePicker />,
              }[getFieldValue('interval') || 6],
            )}
          </Item>
          <Item label="工位">
            {getFieldDecorator('workstation')(
              <WorkstationAndAreaSelect
                onlyWorkstations
                params={{ enabled: null }}
                style={{ width: '100%' }}
                placeholder={changeChineseToLocaleWithoutIntl('请选择区域')}
              />,
            )}
          </Item>
          <Item label="执行人">{getFieldDecorator('operator')(<SearchSelect type="account" />)}</Item>
          <Item label="工序">
            {getFieldDecorator('processCode')(<SearchSelect type="processName" params={{ status: undefined }} />)}
          </Item>
          <Item label="物料">{getFieldDecorator('materialCode')(<SearchSelect type="materialBySearch" />)}</Item>
        </ItemList>
        {this.renderSearch()}
      </FilterSortSearchBar>
    );
  };

  renderSearch = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    return (
      <Button
        icon="search"
        onClick={() => {
          const {
            form: { validateFieldsAndScroll },
          } = this.props;
          validateFieldsAndScroll((err, value) => {
            if (err) return null;
            if (sensors) {
              sensors.track('web_quanlity_produceReportList_search', {
                FilterCondition: value,
              });
            }
            this.setDataSource(value);
          });
        }}
        disabled={
          !(
            getFieldValue('interval') &&
            getFieldValue('times') &&
            getFieldValue('times')[0] &&
            getFieldValue('times')[1]
          )
        }
      >
        查询
      </Button>
    );
  };

  renderExport = () => {
    const { intl } = this.props;
    const { query } = this.state;
    return (
      <div style={{ marginBottom: 5 }}>
        <Button icon="upload" onClick={() => this.exportData()} disabled={!query}>
          数据导出
        </Button>
        <span className={styles.exportTip}>
          <Icon type="exclamation-circle-o" style={{ marginRight: 5 }} />
          {changeChineseToLocale('每天凌晨0点更新数据，查询结果不包含当天数据。', intl)}
        </span>
      </div>
    );
  };

  renderTable = () => {
    const { dataSource } = this.state;
    return (
      <React.Fragment>
        {dataSource && (
          <SimpleTable
            style={{ margin: 0, marginTop: 10 }}
            columns={this.getColumns()}
            dataSource={dataSource}
            scroll={{ y: 500 }}
            pagination={false}
            rowKey="time"
          />
        )}
      </React.Fragment>
    );
  };

  renderConfrim = () => {
    const { intl } = this.props;
    return (
      <div className={styles.bottom}>
        <p>{changeChineseToLocale('计算方式', intl)}：</p>
        <p>{`${changeChineseToLocale('检验数', intl)}：${changeChineseToLocale(
          '所有质检任务判定的物料数量总和',
          intl,
        )}`}</p>
        <p>{`${changeChineseToLocale('合格数', intl)}：${changeChineseToLocale(
          '所有质检任务判定的物料中结果为合格的数量总和',
          intl,
        )}`}</p>
        <p>{`${changeChineseToLocale('待检数', intl)}：${changeChineseToLocale(
          '所有质检任务判定的物料中结果为待检的数量总和',
          intl,
        )}`}</p>
        <p>{`${changeChineseToLocale('让步合格数', intl)}：${changeChineseToLocale(
          '所有质检任务判定的物料中结果为让步合格的数量总和',
          intl,
        )}`}</p>
        <p>{`${changeChineseToLocale('不合格数', intl)}：${changeChineseToLocale(
          '所有质检任务判定的物料中结果为不合格的数量总和',
          intl,
        )}`}</p>
      </div>
    );
  };

  render() {
    const { loading } = this.state;
    return (
      <Spin spinning={loading}>
        <div className={styles.list}>
          {this.renderFilter()}
          {this.renderExport()}
          {this.renderTable()}
          {this.renderConfrim()}
        </div>
      </Spin>
    );
  }
}

export default withForm({}, injectIntl(ProduceQcList));
