import React from 'react';
import {
  FilterSortSearchBar,
  Input,
  Select,
  Searchselect,
  withForm,
  Button,
  Link,
  SimpleTable,
  Tooltip,
} from 'components';
import { border, error, fontSub, processing, warning } from 'styles/color';
import WorkstationAndAreaSelect from 'components/select/workstationAndAreaSelect';
import { getSOPTaskList } from 'services/knowledgeBase/sop';
import { setLocation, getParams } from 'utils/url';
import moment from 'moment';
import { replaceSign } from 'constants';
import SOP_TASK_CONSTANT from '../../common/SOPTaskConstant';

const { ItemList, Item } = FilterSortSearchBar;
const Option = Select.Option;

const circleStyle = {
  borderWidth: 4,
  borderStyle: 'solid',
  borderRadius: '50%',
  marginRight: 5,
};

class SOPTaskList extends React.PureComponent {
  state = {
    dataSource: [],
    total: 0,
    loading: false,
  };

  componentDidMount() {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { queryObj } = getParams();
    const query = { ...queryObj, statuses: [2] };
    setFieldsValue(query);
    this.setDataSource({ ...query });
  }

  setDataSource = async (params = {}) => {
    this.setState({ loading: true });
    const query = setLocation(this.props, p => ({ page: 1, size: 10, ...p, ...params }));
    const { workstationIds, operatorId, processCode, statuses } = query;
    const {
      data: { data, total },
    } = await getSOPTaskList({
      ...query,
      workstationIds: workstationIds && workstationIds.map(({ value }) => value.split('-')[1]).join(','),
      operatorId: operatorId && operatorId.key,
      processCode: processCode && processCode.key,
      statuses: statuses && statuses.join(','),
    });
    this.setState({ dataSource: data, total, loading: false });
  };

  getColumns = () => {
    return [
      {
        title: '任务编号',
        dataIndex: 'sopTaskCode',
        width: 150,
        fixed: 'left',
        render: taskCode => {
          return taskCode || replaceSign;
        },
      },
      {
        title: '成品物料编号/名称',
        dataIndex: 'outputMaterial',
        width: 160,
        fixed: 'left',
        render: outputMaterial => {
          const { name, code } = outputMaterial || {};
          return <Tooltip text={`${code || replaceSign}/${name || replaceSign}`} length={20} />;
        },
      },
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 150,
        fixed: 'left',
        render: projectCode => {
          return projectCode || replaceSign;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: status => {
          let circleColor = '';
          switch (status) {
            case SOP_TASK_CONSTANT.SOP_TASK_STATUS_UNSTART:
              circleColor = border;
              break;
            case SOP_TASK_CONSTANT.SOP_TASK_STATUS_EXECUTING:
              circleColor = processing;
              break;
            case SOP_TASK_CONSTANT.SOP_TASK_STATUS_PAUSE:
              circleColor = warning;
              break;
            case SOP_TASK_CONSTANT.SOP_TASK_STATUS_FINISH:
              circleColor = error;
              break;
            case SOP_TASK_CONSTANT.SOP_TASK_STATUS_CANCEL:
              circleColor = fontSub;
              break;
            default:
              circleColor = border;
          }
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ borderColor: circleColor, ...circleStyle }} />
              <span>{SOP_TASK_CONSTANT.SOPTaskStatus.get(status)}</span>
            </div>
          );
        },
      },
      {
        title: '进度',
        dataIndex: 'startTimePlanned',
        width: 100,
        render: (startTimePlanned, record) => {
          return (
            <span>
              {record.amountProductQualified}
              {record.amountProductPlanned ? `/${record.amountProductPlanned}` : null}
            </span>
          );
        },
      },
      {
        title: '工序编号/名称',
        dataIndex: 'processCode',
        render: (processCode, record) => {
          return `${processCode || replaceSign}/${record.processName || replaceSign}`;
        },
      },
      {
        title: '工位',
        dataIndex: 'workstation',
        width: 100,
        render: workstation => {
          return (workstation && workstation.name) || replaceSign;
        },
      },
      {
        title: '执行人',
        dataIndex: 'operators',
        width: 120,
        render: operators =>
          operators && operators.length > 0 ? operators.map(operator => operator.name).join('，') : replaceSign,
      },
      {
        title: '计划开始时间',
        dataIndex: 'startTimePlanned',
        width: 140,
        render: startTimePlanned => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <span>{getFormatDate(startTimePlanned)}</span>;
        },
      },
      {
        title: '计划结束时间',
        dataIndex: 'endTimePlanned',
        width: 140,
        render: endTimePlanned => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <span>{getFormatDate(endTimePlanned)}</span>;
        },
      },
      {
        title: '操作',
        dataIndex: 'sopTaskId',
        fixed: 'right',
        width: 140,
        render: id => {
          return (
            <div>
              <Link style={{ marginRight: 20 }} to={`${location.pathname}/detail/${id}`}>
                查看
              </Link>
            </div>
          );
        },
      },
    ].map(node => ({ ...node, key: node.title }));
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
    } = this.props;
    const { dataSource, total, loading } = this.state;
    return (
      <div>
        <FilterSortSearchBar>
          <ItemList>
            <Item label="任务编号">{getFieldDecorator('sopTaskCode')(<Input />)}</Item>
            <Item label="工序">{getFieldDecorator('processCode')(<Searchselect type={'processName'} />)}</Item>
            <Item label="状态">
              {getFieldDecorator('statuses', { initialValue: [2] })(
                <Select mode="multiple" size="default" style={{ marginLeft: 13, marginRight: 20, minWidth: 120 }}>
                  {Array.from(SOP_TASK_CONSTANT.SOPTaskStatus, ([key, value]) => (
                    <Option value={key}>{value}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="项目编号">{getFieldDecorator('projectCode')(<Input />)}</Item>
            <Item label="工位">
              {getFieldDecorator('workstationIds')(
                <WorkstationAndAreaSelect
                  multiple
                  labelInValue
                  onlyWorkstations
                  style={{ width: 250 }}
                  disableSearch
                />,
              )}
            </Item>
            <Item label="执行人">{getFieldDecorator('operatorId')(<Searchselect type={'account'} />)}</Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const value = getFieldsValue();
              this.setDataSource({ page: 1, ...value });
            }}
          >
            搜索
          </Button>
        </FilterSortSearchBar>
        <SimpleTable
          columns={this.getColumns()}
          bordered
          dragable
          rowKey="sopTaskId"
          scroll={{ x: 1500 }}
          dataSource={dataSource}
          pagination={{ total, onChange: page => this.setDataSource({ page }) }}
          loading={loading}
        />
      </div>
    );
  }
}

export default withForm({}, SOPTaskList);
