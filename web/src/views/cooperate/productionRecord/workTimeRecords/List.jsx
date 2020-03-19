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
  openModal,
  Tooltip,
} from 'components';
import Proptypes from 'prop-types';
import Color from 'styles/color';
import moment from 'moment';
import SearchSelect from 'components/select/searchSelect';
import { closeModal } from 'components/modal';
import { format, formatRangeUnix } from 'utils/time';
import { replaceSign } from 'constants';
import {
  getProductionWorkTimeRecords,
  getProjectWorkTime,
  getAllProjectWorkTime,
} from 'services/datagram/productionRecords';
import { exportXlsxFile } from 'utils/exportFile';
import listStyles from './list.scss';

const RangerPicker = DatePicker.RangePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RadioGroup = Radio.Group;

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

class WorkTimeRecords extends React.PureComponent<any> {
  state = initState;

  setProjectDataSource = async params => {
    const { data, total } = await this.fetchProjectData(params);
    this.setState({ projectDataSource: data, projectTotal: total });
  };

  exportProjectXlsx = async () => {
    const { data } = await this.fetchProjectData({ size: 1000 });
    const header = this.getColumns().map(({ title }) => title);
    const body = data.map(
      ({
        date,
        projectCode,
        purchaseOrderCode,
        materialCode,
        materialName,
        processSeq,
        processName,
        amount,
        standardWorkTime,
        realWorkTime,
        standardSpeed,
        realSpeed,
        speedDeviation,
      }) => {
        return [
          format(date),
          projectCode,
          purchaseOrderCode,
          materialCode,
          materialName,
          `${processSeq}/${processName}`,
          amount,
          standardWorkTime,
          realWorkTime,
          standardSpeed,
          realSpeed,
          speedDeviation,
        ];
      },
    );
    exportXlsxFile([header, ...body], `生产工时统计_按项目_${format(moment(), 'YYYY_MM_DD')}`);
  };

  fetchProjectData = async params => {
    const { timeFrom, timeTill, orderDate, ...rest } = this.state.searchParams;
    const { data } = await getProductionWorkTimeRecords(
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

  fetchAllProjectData = async params => {
    const { timeFrom, timeTill, ...rest } = this.state.searchParams;
    const { data } = await getAllProjectWorkTime(
      {
        page: 1,
        timeFrom,
        timeTill,
        ...params,
      },
      rest,
    );
    return data;
  };

  fetchChildData = async params => {
    const { date, code, processCode, processSeq } = this.state.selectProject;
    const { data } = await getProjectWorkTime(code, processCode, processSeq, {
      date,
      ...params,
    });
    return data;
  };

  setChildDataSource = async params => {
    const { data } = await this.fetchChildData(params);
    this.setState({ childDataSource: data });
  };

  exportChildXlsx = async ({ mode }) => {
    const { data } = mode === 'all' ? await this.fetchAllProjectData({ size: 1000 }) : await this.fetchChildData({});
    const header = this.getChildColumns().map(({ title }) => title);
    const body = data.map(
      ({
        taskCode,
        processSeq,
        processName,
        workstationName,
        executorName,
        amount,
        standardWorkTime,
        realWorkTime,
        standardSpeed,
        realSpeed,
        speedDeviation,
      }) => {
        return [
          taskCode,
          `${processSeq}/${processName}`,
          workstationName,
          executorName,
          amount,
          standardWorkTime,
          realWorkTime,
          standardSpeed,
          realSpeed,
          speedDeviation,
        ];
      },
    );
    const exportData = [header, ...body];
    exportXlsxFile(exportData, `生产工时统计_按任务_${format(moment(), 'YYYY_MM_DD')}`);
  };

  getColumns = () => {
    const columns = [
      {
        title: '实际开始时间',
        dataIndex: 'date',
        render: date => format(date),
        sorter: true,
      },
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        render: (code, { date, materialCode, processCode, processSeq }) => (
          <Tooltip
            text={code}
            length={15}
            onLink={() => {
              this.setState({ selectProject: { date, code, materialCode, processCode, processSeq } }, () => {
                this.setChildDataSource({});
              });
            }}
          />
        ),
      },
      {
        title: '订单号',
        dataIndex: 'purchaseOrderCode',
      },
      {
        title: '物料编号',
        dataIndex: 'materialCode',
      },
      {
        title: '物料名称',
        dataIndex: 'materialName',
      },
      {
        title: '工序序号/工序名称',
        dataIndex: 'processSeq',
        render: (processSeq, { processName }) => <Tooltip text={`${processSeq}/${processName}`} length={15} />,
      },
      {
        title: '产出数量',
        dataIndex: 'amount',
      },
      {
        title: '标准工时',
        dataIndex: 'standardWorkTime',
      },
      {
        title: '实际工时',
        dataIndex: 'realWorkTime',
      },
      {
        title: '标准节拍',
        dataIndex: 'standardSpeed',
      },
      {
        title: '实际节拍',
        dataIndex: 'realSpeed',
      },
      {
        title: '节拍相对应偏差',
        dataIndex: 'speedDeviation',
        render: speedDeviation =>
          speedDeviation ? (
            <Link type={speedDeviation.indexOf('-') === 0 ? 'primary' : 'error'}>{speedDeviation}</Link>
          ) : (
            replaceSign
          ),
      },
    ];
    return columns.map(record => ({
      render: text => (text ? <Tooltip text={text} length={18} /> : replaceSign),
      width: 150,
      ...record,
      key: record.title,
    }));
  };

  getChildColumns = () => {
    const columns = [
      { title: '生产任务编号', dataIndex: 'taskCode' },
      {
        title: '工序序号/工序名称',
        dataIndex: 'processSeq',
        render: (processSeq, { processName }) => <Tooltip text={`${processSeq}/${processName}`} length={15} />,
      },
      { title: '工位', dataIndex: 'workstationName' },
      { title: '执行人', dataIndex: 'executorName' },
      {
        title: '产出数量',
        dataIndex: 'amount',
      },
      {
        title: '标准工时',
        dataIndex: 'standardWorkTime',
      },
      {
        title: '实际工时',
        dataIndex: 'realWorkTime',
      },
      {
        title: '标准节拍',
        dataIndex: 'standardSpeed',
      },
      {
        title: '实际节拍',
        dataIndex: 'realSpeed',
      },
      {
        title: '节拍相对偏差',
        dataIndex: 'speedDeviation',
        render: speedDeviation => {
          return speedDeviation ? (
            <Link type={speedDeviation.indexOf('-') === 0 ? 'primary' : 'error'}>{speedDeviation}</Link>
          ) : (
            replaceSign
          );
        },
      },
    ];
    return columns.map(record => ({
      render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      width: 160,
      ...record,
      key: record.title,
    }));
  };

  showConfirm = () => {
    openModal({
      title: '选择你要导出的模式',
      onOk: () => {
        this.exportChildXlsx({ mode: this.state.exportMode });
        closeModal();
      },
      innerContainerStyle: {
        textAlign: 'center',
      },
      children: (
        <div className="modal-body-form">
          <RadioGroup
            defaultValue={this.state.exportMode}
            onChange={e => this.setState({ exportMode: e.target.value })}
          >
            <Radio value="single" style={{ display: 'block', marginBottom: 20 }}>
              导出选中项目下任务数据
            </Radio>
            <Radio value="all" style={{ display: 'block' }}>
              导出所有项目下任务数据
            </Radio>
          </RadioGroup>
        </div>
      ),
    });
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
            <Item label="项目实际开始时间" required>
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
            <Item label="产出物料编号／名称">
              {getFieldDecorator('materialCodes')(
                <SearchSelect
                  type="materialBySearch"
                  mode="multiple"
                  labelInValue={false}
                  placeholder="请输入产出物料编号或名称"
                />,
              )}
            </Item>
            <Item label="工序名称">
              {getFieldDecorator('processCodes')(
                <SearchSelect type="processName" mode="multiple" labelInValue={false} placeholder="请输入工序名称" />,
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
                    projectCurrent: 1,
                    childCurrent: 1,
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
            { title: changeChineseToLocale('标准工时'), unit: '小时', type: '以标准产能推算实际产能所需工时' },
            {
              title: changeChineseToLocale('实际工时'),
              unit: '小时',
              type: '汇总生产任务实际工作时间（除去暂停时间）',
            },
            { title: changeChineseToLocale('标准节拍'), unit: '秒/物料单位', type: '通过标准产能转化' },
            { title: changeChineseToLocale('实际节拍'), unit: '秒/物料单位', type: '实际工时和实际产量相除得出的商' },
          ].map(({ title, unit, type }) => (
            <span key={title}>
              <Popover
                content={
                  <div>
                    <p>
                      {changeChineseToLocale('计算单位')}：{changeChineseToLocale(unit)}
                    </p>
                    <p>
                      {changeChineseToLocale('计算方式')}：{changeChineseToLocale(type)}
                    </p>
                  </div>
                }
                title={title}
              >
                <Icon type="exclamation-circle-o" color={Color.primary} />
              </Popover>{' '}
              {title}
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
              scroll={{ x: this.getColumns().length * 150 }}
              onChange={({ current }, filters, sorter) => {
                this.setState(
                  {
                    projectCurrent: current,
                    searchParams: {
                      ...this.state.searchParams,
                      orderDate: sorter.order === 'ascend' ? 0 : 1,
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
              rowKey={record => JSON.stringify(record)}
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
                    <Link>
                      {changeChineseToLocale('项目编号')}: {selectProject && selectProject.code}
                    </Link>
                  </span>
                  <Button onClick={() => this.showConfirm()}>数据导出</Button>
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
                  rowKey={({ taskCode }) => taskCode}
                />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

WorkTimeRecords.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, WorkTimeRecords);
