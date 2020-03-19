import React, { Component } from 'react';
import _ from 'lodash';
import { Link, SimpleTable, Tooltip, message, Spin, Gantt, DatePicker, Select, DetailPageHeader, Button, openModal } from 'components';
import SearchSelect from 'src/components/select/searchSelect';
import moment, { formatToUnix, formatUnixMoment, diff, dayStart, minDate, formatUnix } from 'utils/time';
import styles from './styles.scss';

const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

type props = {
  initialValue: {},
  onFilter: () => {},
};

const contentStyle = {
  flexGrow: 1,
  paddingLeft: 10,
};

class GanttFilter extends Component<props> {
  state = {};

  componentDidMount() {
    const { initialValue } = this.props;
    if (initialValue) {
      this.setState({
        ...initialValue,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.initialValue, nextProps.initialValue)) {
      this.setState({
        ...nextProps.initialValue,
      });
    }
  }

  render() {
    const { onFilter } = this.props;
    const { workOrderCode, purchaseOrderCode, finished, materialCode } = this.state;
    return (
      <div className={styles.ganttFilterContainer}>
        <div className={styles.filterItemContainer}>
          <div className={styles.flexFilterItems}>
            <div className={styles.filterItem}>
              <div className={styles.label}>订单编号</div>
              <SearchSelect
                style={contentStyle}
                value={purchaseOrderCode}
                type="purchaseOrder"
                onChange={purchaseOrderCode => {
                  this.setState({ purchaseOrderCode });
                }}
              />
            </div>
            <div className={styles.filterItem}>
              <div className={styles.label}>计划工单编号</div>
              <SearchSelect
                style={contentStyle}
                value={workOrderCode}
                type="plannedTicketList"
                onChange={workOrderCode => {
                  this.setState({ workOrderCode });
                }}
              />
            </div>
            <div className={styles.filterItem}>
              <div className={styles.label}>工单产出物料</div>
              <SearchSelect
                style={contentStyle}
                type="materialBySearch"
                value={materialCode}
                params={{ status: 1 }}
                onChange={value => {
                  this.setState({ materialCode: value });
                }}
              />
            </div>
            <div className={styles.filterItem}>
              <div className={styles.label}>已结束任务</div>
              <Select
                style={contentStyle}
                value={finished}
                onChange={finished => {
                  this.setState({ finished });
                }}
              >
                <Option value={0}>不显示</Option>
                <Option value={1}>显示</Option>
              </Select>
            </div>
            <div className={styles.filterItem}>
              <div className={styles.label}>时间范围</div>
              <RangePicker
                style={contentStyle}
                value={[this.state.startTime, this.state.endTime]}
                format="YYYY-MM-DD"
                onChange={dates => {
                  const [startTime, endTime] = dates;
                  this.setState({ startTime, endTime });
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <Button
            style={{ width: 54 }}
            // icon={'search'}
            onClick={() => {
              const { finished, startTime, endTime, purchaseOrderCode, workOrderCode, materialCode } = this.state;
              this.setState({
                startTime: startTime || moment().startOf('week'),
                endTime: endTime || moment().endOf('week'),
              });
              onFilter({
                finished,
                startTime: startTime || moment().startOf('week'),
                endTime: endTime || moment().endOf('week'),
                purchaseOrderCode,
                workOrderCode,
                materialCode,
              });
            }}
          >
            查询
          </Button>
        </div>
      </div>
    );
  }
}

export default GanttFilter;
