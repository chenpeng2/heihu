import React from 'react';
import {
  FilterSortSearchBar,
  withForm,
  DatePicker,
  Button,
  Link,
  Icon,
  Popover,
  SimpleTable,
  message,
  Radio,
  Tooltip,
} from 'components';
import Color from 'styles/color';
import moment from 'moment';
import PropTypes from 'prop-types';
import SearchSelect from 'components/select/searchSelect';
import { format, formatRangeUnix } from 'utils/time';
import { replaceSign } from 'constants';
import { getProjectUseMaterialRecord, getProduceTaskUseMaterialRecord } from 'services/datagram/projectRecord';
import { exportXlsxFile } from 'utils/exportFile';
import listStyles from '../workTimeRecords/list.scss';

const RangerPicker = DatePicker.RangePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

const initState = {
  projectDataSource: null,
  childDataSource: null,
  selectProject: null,
  projectTotal: 0,
  childTotal: 0,
  projectCurrent: 1,
  childCurrent: 1,
  searchParams: {},
  exportMode: 'all',
};

class InputMaterialRecords extends React.PureComponent<any> {
  state = initState;

  setProjectDataSource = async params => {
    const { data, total } = await this.fetchProjectData(params);
    this.setState({ projectDataSource: data, projectTotal: total });
  };

  fetchProjectData = async params => {
    const { timeFrom, timeTill, orderDate, ...rest } = this.state.searchParams;
    const { data } = await getProjectUseMaterialRecord(
      {
        page: 1,
        size: 10,
        timeFrom,
        timeTill,
        orderDate,
        ...params,
      },
      rest,
    );
    return data;
  };

  fetchChildData = async params => {
    const { code } = this.state.selectProject;
    const { data } = await getProduceTaskUseMaterialRecord(code, params);
    return data;
  };

  setChildDataSource = async params => {
    const { data } = await this.fetchChildData(params);
    this.setState({ childDataSource: data });
  };

  exportProjectXlsx = async () => {
    const { data } = await this.fetchProjectData({ size: 10 ** 6 });
    const columns = this.getColumns();
    const headers = columns.map(({ title }) => title);
    const body = this.formatColumnsToXlsx(columns, data);
    exportXlsxFile([headers, ...body], `生产投产物料统计_按项目_${format(moment(), 'YYYY_MM_DD')}`);
  };

  formatColumnsToXlsx = (columns, data) => {
    return data.map(record => {
      const col = [];
      columns.forEach(({ dataIndex, getText, render }) => {
        if (getText === 'render') {
          col.push(render(record[dataIndex], record));
        } else if (typeof getText === 'function') {
          col.push(getText(record[dataIndex], record));
        } else {
          col.push(record[dataIndex]);
        }
      });
      return col;
    });
  };

  exportChildXlsx = async () => {
    const { data } = await this.fetchChildData({ size: 10 ** 6 });
    const columns = this.getChildColumns();
    const headers = columns.map(({ title }) => title);
    const body = this.formatColumnsToXlsx(columns, data);
    exportXlsxFile([headers, ...body], `生产投产物料统计_按任务_${format(moment(), 'YYYY_MM_DD')}`);
  };

  getColumns = () => {
    const columns = [
      {
        title: '项目实际结束时间',
        dataIndex: 'date',
        render: date => format(date, 'YYYY/MM/DD'),
        sorter: true,
        getText: 'render',
      },
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        render: code => (
          <Tooltip
            text={code}
            length={15}
            onLink={() => {
              this.setState({ selectProject: { code } }, () => {
                this.setChildDataSource({});
              });
            }}
          />
        ),
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
      },
      {
        title: '项目产出物料编号',
        dataIndex: 'productCode',
      },
      {
        title: '项目产出物料名称',
        dataIndex: 'productName',
      },
      {
        title: '投产工序序号/工序',
        dataIndex: 'processSeq',
        render: (processSeq, { processName, bindBom }) =>
          bindBom ? <Tooltip text={`${processSeq}/${processName}`} length={15} /> : replaceSign,
        getText: (processSeq, { processName, bindBom }) => (bindBom ? `${processSeq}/${processName}` : replaceSign),
      },
      {
        title: '投产物料编号',
        dataIndex: 'materialCode',
      },
      {
        title: '投产物料名称',
        dataIndex: 'materialName',
      },
      {
        title: '（项目/工序）计划产出数量',
        dataIndex: 'plannedAmount',
        align: 'right',
        width: 100,
      },
      {
        title: '（项目/工序）实际产出数量',
        dataIndex: 'realAmount',
        align: 'right',
        width: 100,
      },
      {
        title: '(项目/工序）计划投产数量',
        dataIndex: 'plannedUseAmount',
        align: 'right',
        width: 100,
      },
      {
        title: '（项目/工序）标准投产数量',
        dataIndex: 'standardUseAmount',
        align: 'right',
        width: 100,
      },
      {
        title: '（项目/工序）实际投产数量',
        dataIndex: 'realUseAmount',
        align: 'right',
        width: 100,
      },
      {
        title: '计划投入/产出比',
        dataIndex: 'standardRatio',
        align: 'right',
      },
      {
        title: '实际投入/产出比',
        dataIndex: 'realRatio',
        align: 'right',
      },
      {
        title: '实际/计划偏差',
        dataIndex: 'ratioDeviation',
        align: 'right',
      },
    ];
    return columns.map(({ title, precision, ...rest }) => ({
      render: text => (text ? <Tooltip text={text} length={18} /> : replaceSign),
      width: 170,
      ...rest,
      key: title,
      title,
    }));
  };

  getChildColumns = () => {
    const columns = [
      {
        title: '任务实际结束时间',
        dataIndex: 'date',
        render: date => format(date, 'YYYY/MM/DD'),
        getText: 'render',
      },
      {
        title: '生产任务编号',
        dataIndex: 'taskCode',
      },
      { title: '工位', dataIndex: 'workstationName' },
      { title: '执行人', dataIndex: 'executorName' },
      {
        title: '投产工序序号/工序',
        dataIndex: 'processSeq',
        render: (processSeq, { processName }) => <Tooltip text={`${processSeq}/${processName}`} length={15} />,
        getText: (processSeq, { processName }) => `${processSeq}/${processName}`,
      },
      {
        title: '投产物料编号',
        dataIndex: 'materialCode',
      },
      {
        title: '投产物料名称',
        dataIndex: 'materialName',
      },
      {
        title: '任务计划产出数量',
        dataIndex: 'taskPlannedAmount',
        align: 'right',
      },
      {
        title: '任务实际产出数量',
        dataIndex: 'taskRealAmount',
        align: 'right',
      },
      {
        title: '任务计划投产数量',
        dataIndex: 'plannedUseAmount',
        align: 'right',
      },
      {
        title: '任务标准投产数量',
        dataIndex: 'standardUseAmount',
        align: 'right',
      },
      {
        title: '任务实际投产数量',
        dataIndex: 'realUseAmount',
        align: 'right',
      },
      {
        title: '计划投入/产出比',
        dataIndex: 'standardRatio',
        align: 'right',
      },
      {
        title: '实际投入/产出比',
        dataIndex: 'realRatio',
        align: 'right',
      },
      {
        title: '实际/计划偏差',
        dataIndex: 'ratioDeviation',
        align: 'right',
      },
    ];
    return columns.map(({ title, precision, ...rest }) => ({
      render: text => (text ? <Tooltip text={text} length={18} /> : replaceSign),
      width: 150,
      ...rest,
      key: title,
      title,
    }));
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue, resetFields },
    } = this.props;
    const {
      projectDataSource,
      childDataSource,
      projectTotal,
      selectProject,
      childTotal,
      projectCurrent,
      childCurrent,
    } = this.state;
    const { changeChineseToLocale } = this.context;
    return (
      <div>
        <FilterSortSearchBar>
          <ItemList>
            <Item label="项目实际结束时间" required>
              {getFieldDecorator('time', {
                rules: [{ required: true }],
              })(<RangerPicker />)}
            </Item>
            <Item label="项目编号">
              {getFieldDecorator('projectCodes')(
                <SearchSelect type="project" mode="multiple" labelInValue={false} placeholder="请输入项目编号" />,
              )}
            </Item>
            <Item label="订单编号">
              {getFieldDecorator('purchaseOrderCodes')(
                <SearchSelect type="purchaseOrder" mode="multiple" labelInValue={false} placeholder="请输入订单编号" />,
              )}
            </Item>
            <Item label="项目产出物料编号／名称">
              {getFieldDecorator('productCodes')(
                <SearchSelect
                  type="materialBySearch"
                  mode="multiple"
                  labelInValue={false}
                  placeholder="请输入产出物料编号或名称"
                />,
              )}
            </Item>
            <Item label="投产工序名称">
              {getFieldDecorator('processCodes')(
                <SearchSelect type="processName" mode="multiple" labelInValue={false} placeholder="请输入工序名称" />,
              )}
            </Item>
            <Item label="投产物料编号/名称">
              {getFieldDecorator('materialCodes')(
                <SearchSelect
                  type="materialBySearch"
                  mode="multiple"
                  labelInValue={false}
                  placeholder="投产物料编号/名称"
                />,
              )}
            </Item>
          </ItemList>
          <div className="child-gap">
            <Button
              icon="search"
              onClick={() => {
                const searchParams = getFieldsValue();
                if (!searchParams.time) {
                  message.error(changeChineseToLocale('项目实际开始时间必填'));
                  return;
                }
                const timeFrom = formatRangeUnix(searchParams.time)[0];
                const timeTill = formatRangeUnix(searchParams.time)[1];
                this.setState(
                  {
                    searchParams: { timeFrom, timeTill, ...searchParams },
                    childDataSource: null,
                    selectProject: '',
                  },
                  () => {
                    this.setProjectDataSource({ page: 1 });
                  },
                );
              }}
            >
              查询
            </Button>
            <Link
              type="grey"
              onClick={() => {
                resetFields();
                this.setState(initState);
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
        <div className="child-gap">
          <span style={{ display: 'inline-block', width: 108, textAlign: 'right' }}>
            {changeChineseToLocale('查询结果说明')}
          </span>
          {[
            {
              title: '计划产出数量',
              header: '（项目/工序）计划产出数量',
              content: [
                '通过「工艺路线」创健的项目：项目最终产物计划产出数量。',
                '通过「工艺路线 + 物料清单」创建的项目：项目最终产物计划产出数量。',
                '通过「生产BOM」创建的项目 ：工序计划产出数量。',
              ],
            },
            {
              title: '实际产出数量',
              header: '（项目/工序）实际产出数量',
              content: [
                '通过「工艺路线」创建的项目 ：项目最终产物实际产出数量',
                '通过「工艺路线+物料清单」创建的项目：项目最终产物实际产出数量',
                '通过「生产BOM」创建的项目 ：工序实际产出数量',
              ],
            },
            {
              title: '计划投产数量',
              header: '（项目/工序）计划投产数量',
              content: [
                '通过「工艺路线」创健的项目：无物料投产比例 显示“-”。',
                '通过「工艺路线 + 物料清单」创建的项目：通过项目最终产物「计划产出数量」与「物料清单投产物料比例」计算。',
                '通过「生产BOM」创建的项目 ：通过「工序计划产出数量」与「生产BOM投产物料比例」计算。',
              ],
            },
            {
              title: '标准投产数量',
              header: '( 项目 / 工序 ) 标准投产数量',
              content: [
                '通过「工艺路线」创健的项目：无物料投产比例 显示“-”。',
                '通过「工艺路线 + 物料清单」创建的项目：通过项目最终产物「实际产出数量」与「物料清单投产物料比例」计算。',
                '通过「生产BOM」创建的项目 ：通过「工序实际产出数量」与「生产BOM投产物料比例」计算。',
              ],
            },
            {
              title: '实际产出数量',
              header: '( 项目 / 工序 ) 实际产出数量',
              content: [
                '通过「工艺路线」创建的项目 ：项目投产物料实际产出数量。',
                '通过「工艺路线+物料清单」创建的项目：项目投产物料实际投产数量。',
                '通过「生产BOM」创建的项目 ：工序投产物料实际投产数量。',
              ],
            },
            {
              title: '计划投入/产出比',
              header: '计划投入/产出比',
              content: [
                '通过「工艺路线」创健的项目：无物料投产比例 显示“-”。',
                '通过「工艺路线 + 物料清单」创建的项目：物料清单。',
                '通过「生产BOM」创建的项目 ：工序实际产出数量。',
              ],
            },
            {
              title: '实际投入/产出比',
              header: '实际投入/产出比',
              content: [
                '通过「工艺路线」创建的项目：项目最终产物实际产出数量',
                '通过「工艺路线+物料清单」创建的项目：物料清单「投产物料」与「项目最终产物」比例。',
                '通过「生产BOM」创建的项目 ：生产BOM「投产物料」与「工序产物」比例。',
              ],
            },
            {
              title: '实际/计划偏差',
              header: '实际/计划偏差',
              content: [
                '通过「工艺路线」创建的项目： 无物料投产比例 显示“-”。',
                '通过「工艺路线+物料清单」创建的项目：（实际投产数量 - 标准投产数量）/ 标准投产数量 * 100%',
                '通过「生产BOM」创建的项目：（实际投产数量 - 标准投产数量）/ 标准投产数量 * 100%',
              ],
            },
          ].map(({ title, header, content }) => (
            <span key={title}>
              <Popover
                content={
                  <div>
                    <p>{changeChineseToLocale(header)}</p>
                    {content.map(p => (
                      <p key={p}>{changeChineseToLocale(p)}</p>
                    ))}
                  </div>
                }
                title={changeChineseToLocale(header)}
              >
                <Icon type="exclamation-circle-o" color={Color.primary} />
              </Popover>{' '}
              {changeChineseToLocale(title)}
            </span>
          ))}
        </div>
        <div className={listStyles.header}>
          <span>
            <Icon type="bars" />
            {changeChineseToLocale('项目信息')}
          </span>
          <Button onClick={this.exportProjectXlsx} disabled={!projectTotal}>
            数据导出
          </Button>
        </div>
        {projectDataSource && (
          <React.Fragment>
            <SimpleTable
              columns={this.getColumns()}
              dataSource={projectDataSource}
              scroll={{ x: this.getColumns().length * 160 }}
              onChange={({ current }, filters, sorter) => {
                this.setState(
                  {
                    projectCurrent: current,
                    searchParams: {
                      ...this.state.searchParams,
                      orderDate: sorter.order === 'ascend' ? 1 : 0,
                    },
                  },
                  () => {
                    this.setProjectDataSource({
                      page: current,
                    });
                  },
                );
              }}
              pagination={{
                total: projectTotal,
                current: projectCurrent,
              }}
              rowClassName={({ date, projectCode, processSeq }) => {
                return date === selectProject.date &&
                  projectCode === selectProject.code &&
                  processSeq === selectProject.processSeq
                  ? 'selected-row'
                  : '';
              }}
              rowKey="id"
            />
            {childDataSource && (
              <div
                style={{
                  backgroundColor: Color.grey,
                  margin: '80px 20px 20px 20px',
                  border: `1px solid ${Color.border}`,
                  paddingBottom: childDataSource.length === 0 ? 10 : 60,
                }}
              >
                <div className={listStyles.header}>
                  <span>
                    <Icon type="bars" />
                    {changeChineseToLocale('生产任务信息')}
                    {'  '}
                    <Link>项目编号: {selectProject && selectProject.code}</Link>
                  </span>
                  <Button onClick={() => this.exportChildXlsx()}>数据导出</Button>
                </div>
                <SimpleTable
                  columns={this.getChildColumns()}
                  dataSource={childDataSource}
                  scroll={{ x: this.getChildColumns().length * 150 }}
                  pagination={{
                    total: childTotal,
                    current: childCurrent,
                    onChange: page =>
                      this.setState({
                        childCurrent: page,
                      }),
                  }}
                  rowKey="id"
                />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

InputMaterialRecords.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, InputMaterialRecords);
