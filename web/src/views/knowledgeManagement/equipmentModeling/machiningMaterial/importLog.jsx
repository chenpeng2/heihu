import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, formatDateTime, daysAgo } from 'utils/time';
import { RestPagingTable, Link, Button, Badge } from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { getMachiningMaterialImportHistory } from 'src/services/knowledgeBase/equipment';
import { getCustomLanguage } from 'src/utils/customLanguage';
import styles from './styles.scss';

const customLanguage = getCustomLanguage();
const { RangePicker } = DatePicker;

type Props = {
  form: any,
  intl: any,
  match: any,
};

class ImportLog extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: null,
    dateRange: [],
    total: 0,
  };

  componentDidMount() {
    this.setState(
      {
        pagination: {
          current: 1,
        },
        dateRange: [formatToUnix(formatDateTime(daysAgo(30))), formatToUnix(formatDateTime(daysAgo(0)))],
      },
      () => {
        const { match } = this.props;
        const query = getQuery(match);
        const variables = { ...query };
        this.fetchData({ ...variables });
      },
    );
  }

  getColumns = () => {
    const { changeChineseTemplateToLocale } = this.context;
    const columns = [
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        width: 180,
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'operatorName',
        width: 180,
      },
      {
        title: '导入结果',
        dataIndex: 'status',
        width: 120,
        render: status => {
          if (status === 0) {
            return <Badge status="error" text={'导入失败'} />;
          } else if (status === 1) {
            return <Badge status="success" text={'导入成功'} />;
          }
          return <Badge status="warning" text={'部分导入成功'} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => (
          <div>
            {changeChineseTemplateToLocale('{name}导入完成！成功数：{amountSuccess}，失败数：{amountFailed}', {
              name: customLanguage.equipment_machining_material,
              amountSuccess: record.amountSuccess,
              amountFailed: record.amountFailed,
            })}
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: 120,
        render: (text, record) => (
          <div key={`code-${record.id}`}>
            <Link
              style={{ marginRight: 20 }}
              onClick={() => {
                this.context.router.history.push(
                  `/knowledgeManagement/machiningMaterial/importLog/${record.importId}/detail`,
                );
              }}
            >
              查看
            </Link>
          </div>
        ),
      },
    ];
    return columns;
  };

  fetchData = async (params, query) => {
    this.setState({ loading: true });
    const { dateRange } = this.state;
    params = { createdAtFrom: dateRange[0], createdAtTill: dateRange[1], ...params };
    const res = await getMachiningMaterialImportHistory(params);
    const { data, total } = res.data;
    this.setState({
      dataSource: data,
      loading: false,
      total,
    });
  };

  render() {
    const { intl } = this.props;
    const { dataSource, loading, total } = this.state;
    const columns = this.getColumns();

    return (
      <div id="spareParts_importhistory">
        <div className={styles.searchHeader}>
          <span>{changeChineseToLocale('导入时间', intl)}</span>
          <RangePicker
            defaultValue={[moment(formatDateTime(daysAgo(30))), moment(formatDateTime(daysAgo(0)))]}
            onChange={date => {
              this.setState({
                dateRange: date.length ? [formatToUnix(dayStart(date[0])), formatToUnix(dayEnd(date[1]))] : [],
              });
            }}
          />
          <Button
            icon="search"
            style={{ width: 86 }}
            onClick={() => {
              const { dateRange } = this.state;
              const params = { page: 1, size: 10, fromAt: dateRange[0], toAt: dateRange[1] };
              this.fetchData(params);
            }}
          >
            查询
          </Button>
        </div>
        <RestPagingTable
          dataSource={dataSource}
          refetch={this.fetchData}
          rowKey={record => record.id}
          columns={columns}
          loading={loading}
          total={total}
          bordered
        />
      </div>
    );
  }
}

ImportLog.contextTypes = {
  router: PropTypes.object,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default injectIntl(ImportLog);
