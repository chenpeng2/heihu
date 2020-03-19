import React from 'react';
import { injectIntl } from 'react-intl';
import { withForm, FilterSortSearchBar, Input, Button, Icon, SimpleTable, Link, Popover } from 'components';
import { getProjectPercentOfPassList } from 'services/qualityManagement/projectPercentOfPassForm';
import { setLocation } from 'utils/url';
import moment from 'moment';
import { round } from 'utils/number';
import { exportXlsxFile } from 'utils/exportFile';
import { changeChineseToLocale } from 'utils/locale/utils';
import Color from 'styles/color';
import styles from './index.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

const headers = [
  '订单编号',
  '项目编号',
  '产出物料编号',
  '产出物料名称',
  '质检任务数量',
  '检验数',
  '合格数',
  '合格率',
  '待检数',
  '待检率',
  '让步合格率',
  '让步合格率',
  '不合格数',
  '不合格率',
  '直通率',
];

const getPercent = (amount, total) => {
  if (amount === 0) {
    return '0%';
  }
  return `${round((amount * 100) / total, 2)} %`;
};

class List extends React.PureComponent<any> {
  state = {
    dataSource: null,
    total: 0,
    query: {},
  };

  componentDidMount() {
    this.setDataSource({});
  }

  setDataSource = async params => {
    const {
      form: { setFieldsValue },
    } = this.props;
    const _params = setLocation(this.props, p => ({ size: 10, page: 1, ...p, ...params }));
    setFieldsValue(_params);
    const {
      data: { data, total },
    } = await getProjectPercentOfPassList(_params);
    this.setState({ dataSource: data, total, query: _params });
  };

  getColumns = () => {
    return [
      { title: '订单编号', key: 'order', dataIndex: 'purchaseOrderCode', width: 100 },
      { title: '项目编号', key: 'project', dataIndex: 'projectCode', width: 110 },
      { title: '产出物料编号', key: 'productCode', dataIndex: 'productCode', width: 120 },
      { title: '产出物料名称', key: 'productName', dataIndex: 'productName' },
      {
        title: '质检任务数量',
        dataIndex: 'qcTaskCount',
        render: (count, { projectCode, productCode, productName, purchaseOrderCode }) => {
          const query = encodeURIComponent(
            JSON.stringify({
              projectCode: { key: projectCode, label: projectCode },
              material: {
                key: productCode,
                label: productName,
              },
              purchaseOrderCode: {
                key: purchaseOrderCode,
                label: purchaseOrderCode,
              },
              status: '2',
              checkType: '3',
            }),
          );
          return (
            <a href={`/qualityManagement/qcTask/list?query=${query}`} target="_blank" rel="noopener noreferrer">
              {count}
            </a>
          );
        },
      },
      { title: '检验数', key: 'checkAmount', dataIndex: 'checkAmount', width: 130 },
      {
        title: '合格率',
        key: 'qualifiedAmount',
        dataIndex: 'qualifiedAmount',
        width: 130,
        render: (amount, { checkAmount }) => `${amount}(${getPercent(amount, checkAmount)})`,
      },
      {
        title: '待验率',
        key: 'waitingForCheckAmount',
        dataIndex: 'waitingForCheckAmount',
        width: 130,
        render: (amount, { checkAmount }) => `${amount}(${getPercent(amount, checkAmount)})`,
      },
      {
        title: '让步合格率',
        key: 'concessionQualifiedAmount',
        dataIndex: 'concessionQualifiedAmount',
        width: 130,
        render: (amount, { checkAmount }) => `${amount}(${getPercent(amount, checkAmount)})`,
      },
      {
        title: '不合格率',
        key: 'faultyAmount',
        dataIndex: 'faultyAmount',
        width: 130,
        render: (amount, { checkAmount }) => `${amount}(${getPercent(amount, checkAmount)})`,
      },
      {
        title: '直通率',
        dataIndex: 'throughRate',
        render: (rate, record) => {
          return (
            <Popover
              overlayClassName={styles.popover}
              overlayStyle={{ paddingRight: 10 }}
              content={
                <SimpleTable
                  rowKey={({ processCode }) => processCode}
                  style={{ margin: 0 }}
                  pagination={false}
                  columns={[
                    {
                      title: '工序',
                      key: 'processName',
                      dataIndex: 'processName',
                      render: (name, { processCode }) => `${processCode}/${name}`,
                    },
                    {
                      title: '质检合格率',
                      key: 'rate',
                      dataIndex: 'rate',
                      width: 100,
                      render: rate => `${round(rate * 100, 2)}%`,
                    },
                    {
                      title: '质检任务',
                      key: 'processCode',
                      dataIndex: 'processCode',
                      width: 100,
                      render: (processCode, { processName }) => (
                        <Link
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`/qualityManagement/qcTask/list?query=${encodeURIComponent(
                            JSON.stringify({
                              projectCode: { key: record.projectCode, label: record.projectCode },
                              checkType: '3',
                              process: { key: processCode, label: processName },
                              status: '2',
                            }),
                          )}`}
                        >
                          查看
                        </Link>
                      ),
                    },
                  ]}
                  dataSource={record.processes}
                />
              }
            >
              <Link>{round(rate * 100, 2)}%</Link>
            </Popover>
          );
        },
      },
    ].map(node => ({ key: node.title, width: 130, ...node }));
  };

  handleExportFile = async () => {
    const {
      data: { data },
    } = await getProjectPercentOfPassList({
      ...this.state.query,
      size: 1000,
      page: 1,
    });

    const exportData = data.map(
      ({
        purchaseOrderCode,
        projectCode,
        productCode,
        productName,
        qcTaskCount,
        checkAmount,
        qualifiedAmount,
        waitingForCheckAmount,
        concessionQualifiedAmount,
        faultyAmount,
        throughRate,
      }) => {
        return [
          purchaseOrderCode,
          projectCode,
          productCode,
          productName,
          qcTaskCount,
          checkAmount,
          qualifiedAmount,
          getPercent(qualifiedAmount, checkAmount),
          waitingForCheckAmount,
          getPercent(waitingForCheckAmount, checkAmount),
          concessionQualifiedAmount,
          getPercent(concessionQualifiedAmount, checkAmount),
          faultyAmount,
          getPercent(faultyAmount, checkAmount),
          round(throughRate * 100, 2),
        ];
      },
    );
    exportXlsxFile([headers, ...exportData], `项目合格率报表_${moment().format('YYYY_MM_DD')}`);
  };

  render() {
    const {
      form: { getFieldDecorator, resetFields, getFieldsValue },
      intl,
    } = this.props;
    const { dataSource, total } = this.state;
    console.log('dataSource', dataSource);
    return (
      <div className={styles.list}>
        <div style={{ borderBottom: `1px solid ${Color.border}`, marginBottom: 20 }}>
          <FilterSortSearchBar searchDisabled>
            <ItemList>
              <Item label="订单编号">{getFieldDecorator('purchaseOrderCode')(<Input />)}</Item>
              <Item label="项目编号">{getFieldDecorator('projectCode')(<Input />)}</Item>
              <Item label="产出物料编号">{getFieldDecorator('productCode')(<Input />)}</Item>
              <Item label="产出物料名称">{getFieldDecorator('productName')(<Input />)}</Item>
            </ItemList>
            <div>
              <Button
                icon="search"
                onClick={() => {
                  const value = getFieldsValue();
                  if (sensors) {
                    sensors.track('web_quanlity_projectReportList_search', {
                      FilterCondition: value,
                    });
                  }
                  this.setDataSource({ page: 1, ...value });
                }}
              >
                查询
              </Button>
              <Link
                className={styles.reset}
                onClick={() => {
                  resetFields();
                  this.setDataSource({ page: 1, ...getFieldsValue() });
                }}
              >
                重置
              </Link>
            </div>
          </FilterSortSearchBar>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Button icon="upload" onClick={this.handleExportFile} disabled={!dataSource}>
            数据导出
          </Button>
          <span className={styles.exportTip}>
            <Icon type="exclamation-circle-o" style={{ marginRight: 5 }} />
            {changeChineseToLocale('每天凌晨0点更新数据，查询结果不包含当天数据。', intl)}
          </span>
        </div>
        {dataSource && (
          <SimpleTable
            rowKey={({ purchaseOrderCode, projectCode, productCode }) =>
              `${purchaseOrderCode}/${projectCode}/${productCode}`
            }
            columns={this.getColumns()}
            style={{ margin: 0 }}
            dataSource={dataSource}
            scroll={{ x: this.getColumns().length * 130 }}
            pagination={{
              total,
              onChange: page => this.setDataSource({ page }),
            }}
          />
        )}
        <div className={styles.bottom}>
          <p>{changeChineseToLocale('计算方式', intl)}：</p>
          <p>{`${changeChineseToLocale('检验数', intl)}：${changeChineseToLocale(
            '当前项目最后一道有自动创建质检任务的工序的所有生产检任务的判定 物料二维码/库存数量 的物料数量总和',
            intl,
          )}`}</p>
          <p>{`${changeChineseToLocale('合格数', intl)}：${changeChineseToLocale(
            '当前项目最后一道有自动创建质检任务的工序的所有生产检任务的判定 物料二维码/库存数量的结果中为合格的物料数量总和',
            intl,
          )}`}</p>
          <p>{`${changeChineseToLocale('待检数', intl)}：${changeChineseToLocale(
            '当前项目最后一道有自动创建质检任务的工序的所有生产检任务的判定 物料二维码/库存数量的结果中为待检的物料数量总和',
            intl,
          )}`}</p>
          <p>{`${changeChineseToLocale('让步合格数', intl)}：${changeChineseToLocale(
            '当前项目最后一道有自动创建质检任务的工序的所有生产检任务的判定 物料二维码/库存数量的结果中为让步合格的物料数量总和',
            intl,
          )}`}</p>
          <p>{`${changeChineseToLocale('不合格率', intl)}：${changeChineseToLocale(
            '当前项目最后一道有自动创建质检任务的工序的所有生产检任务的判定 物料二维码/库存数量的结果中为不合格的物料数量总和',
            intl,
          )}`}</p>
          <p>{`${changeChineseToLocale('直通率', intl)}：${changeChineseToLocale(
            '当前项目每道工序的质检合格率的乘积',
            intl,
          )}`}</p>
          <p>{`${changeChineseToLocale('每道工序的质检合格率', intl)}：${changeChineseToLocale(
            '（该工序所有自动创建的生产检任务判定的 物料二维码/库存数量中结果为合格的物料数量总和） / （该工序所有自动创建的生产检任务判定的 物料二维码/库存数量 的物料数量总和）',
            intl,
          )}`}</p>
        </div>
      </div>
    );
  }
}

export default withForm({}, injectIntl(List));
