import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import moment from 'utils/time';
import { Spin, DatePicker, Modal } from 'antd';
import { getMaintenanceTaskDetail, getMaintainLogList } from 'src/services/equipmentMaintenance/maintenanceTask';
import { DeleteTaskByStrategy } from 'src/services/equipmentMaintenance/base';
import {
  Icon,
  DetailPageItemContainer,
  Row,
  Col,
  Link,
  Attachment,
  RestPagingTable,
  Form,
  FormItem,
  withForm,
  Button,
  Tooltip,
  message,
  haveAuthority,
} from 'components';
import { taskStatus } from 'src/views/equipmentMaintenance/constants';
import { white, error, primary, fontSub, warning, black, border, grey } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';
import auth from 'utils/auth';
import { logTypeObj } from '../base/config';
import styles from './styles.scss';

const itemContainerStyle = {
  padding: '0 20px',
  marginTop: 10,
};
const actionStyle = {
  color: error,
  width: 60,
  height: 32,
  lineHeight: '32px',
  backgroundColor: grey,
};
const colStyle = { width: 400 };
const { RangePicker } = DatePicker;

type Props = {
  match: {},
  form: any,
  history: any,
  match: {
    params: {
      taskCode: string,
    },
  },
  intl: any,
};

class MaintenanceTaskDetail extends Component {
  props: Props;
  state = {
    loading: false,
    logListLoading: false,
    data: null,
    logList: null,
    visible: false,
  };

  componentDidMount() {
    this.fetchData();
    this.fetchLogList({});
  }

  fetchData = () => {
    const {
      match: {
        params: { taskCode },
      },
    } = this.props;
    this.setState({ loading: true });
    getMaintenanceTaskDetail(taskCode)
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  fetchLogList = variables => {
    const {
      match: {
        params: { taskCode },
      },
      history,
    } = this.props;
    this.setState({ logListLoading: true });
    getMaintainLogList(taskCode, variables)
      .then(res => {
        this.setState({ logList: res.data });
      })
      .finally(() => {
        this.setState({ logListLoading: false });
      });
  };

  onDeleteTask = () => {
    const {
      match: {
        params: { taskCode },
      },
      history,
    } = this.props;
    DeleteTaskByStrategy(taskCode).then(() => {
      message.success('删除保养任务成功');
      history.push('/equipmentMaintenance/maintenanceTask');
    });
  };

  // 显示保养目标
  showTarget = data => {
    if (!data) {
      return null;
    }
    const {
      category: { type, name: categoryName },
      name,
      code,
      qrcode,
      workshop,
    } = data.target;
    const itemHeaderTitle = '保养目标';

    return (
      <div style={{ ...itemContainerStyle }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'目标类别'}</Col>
            <Col style={colStyle} type={'content'}>
              {type === 'equipmentProd' || type === 'equipmentModule' ? '设备' : '模具'}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'目标名称'}</Col>
            <Col style={colStyle} type={'content'}>
              {name || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'目标类型'}</Col>
            <Col style={colStyle} type={'content'}>
              {categoryName || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'目标编码'}</Col>
            <Col style={colStyle} type={'content'}>
              {code || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'电子标签'}</Col>
            <Col style={colStyle} type={'content'}>
              {qrcode || replaceSign}
            </Col>
          </Row>
          {type !== 'mould' ? (
            <Row style={{ marginRight: 20 }}>
              <Col type={'title'}>{'车间'}</Col>
              <Col style={colStyle} type={'content'}>
                {(workshop && workshop.name) || replaceSign}
              </Col>
            </Row>
          ) : null}
        </DetailPageItemContainer>
      </div>
    );
  };

  getConfirmCard = content => {
    const { intl } = this.props;
    return (
      <Modal
        visible={this.state.visible}
        footer={null}
        width={410}
        onCancel={() => {
          this.setState({ visible: false });
        }}
      >
        <div>
          <div style={{ display: 'flex', margin: '25px 0 82px 0' }}>
            <Icon type={'exclamation-circle'} style={{ color: warning, fontSize: 36 }} />
            <div style={{ marginLeft: 10 }}>
              <h3>{changeChineseToLocale('删除保养任务', intl)}</h3>
              <div style={{ color: fontSub }}>{changeChineseToLocale(content, intl)}</div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Button
              onClick={() => {
                this.setState({ visible: false });
              }}
              style={{
                width: 114,
                height: 32,
                color: black,
                backgroundColor: white,
                borderColor: border,
                marginLeft: 45,
              }}
            >
              放弃
            </Button>
            <Button
              onClick={this.onDeleteTask}
              style={{
                width: 114,
                height: 32,
                color: white,
                backgroundColor: error,
                borderColor: error,
                marginLeft: 40,
              }}
            >
              删除
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // 显示任务详情
  showTaskDetail = data => {
    if (!data) {
      return null;
    }
    const { history } = this.props;
    const {
      attachments,
      startTime,
      createdAt,
      creator,
      deadline,
      detail,
      executors,
      operatorStartTime,
      operatorEndTime,
      statusDisplay,
      taskCode,
      title,
      currentOperators,
      status,
    } = data.entity;
    const itemHeaderTitle = '任务详情';
    const attachment = {};
    if (attachments) {
      attachment.files = attachments.map(attachment => {
        const _attachment = {
          originalExtension: attachment.original_extension,
          originalFileName: attachment.original_filename,
          url: attachment.url,
          id: attachment.id,
        };
        return _attachment;
      });
    }
    const content = '该任务将被删除且无法恢复，请确认！';
    const haveEditMaintainTaskAuthority = haveAuthority(auth.WEB_EDIT_MAINTAIN_TASK);
    const haveRemoveMaintainTaskAuthority = haveAuthority(auth.WEB_REMOVE_MAINTAIN_TASK);

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        {this.getConfirmCard(content)}
        <DetailPageItemContainer
          itemHeaderTitle={itemHeaderTitle}
          contentStyle={{ width: '100%' }}
          action={
            <div style={{ display: 'flex' }}>
              <Link
                style={{ ...actionStyle, color: primary }}
                icon="form"
                disabled={status !== taskStatus[1].key || !haveEditMaintainTaskAuthority}
                onClick={() => {
                  history.push(`/equipmentMaintenance/maintenanceTask/edit/${taskCode}`);
                }}
              >
                编辑
              </Link>
              <Link
                style={actionStyle}
                icon="delete"
                disabled={status !== taskStatus[1].key || !haveRemoveMaintainTaskAuthority}
                onClick={() => {
                  this.setState({ visible: true });
                }}
              >
                删除
              </Link>
            </div>
          }
        >
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'计划执行人'}</Col>
            <Col style={colStyle} type={'content'}>
              {executors && executors.length ? executors.map(n => n.executorName).join('，') : replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'状态'}</Col>
            <Col style={colStyle} type={'content'}>
              {statusDisplay || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'实际执行人'}</Col>
            <Col style={colStyle} type={'content'}>
              {currentOperators ? currentOperators.map(n => n.name).join(',') : replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'创建人'}</Col>
            <Col style={colStyle} type={'content'}>
              {(creator && creator.name) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'计划开始时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(startTime && moment(Number(startTime)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'创建时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(createdAt && moment(Number(createdAt)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'计划结束时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(deadline && moment(Number(deadline)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'任务号'}</Col>
            <Col style={colStyle} type={'content'}>
              {taskCode || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'执行开始时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(operatorStartTime && moment(Number(operatorStartTime)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'任务标题'}</Col>
            <Col style={colStyle} type={'content'}>
              {title || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'执行结束时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {(operatorEndTime && moment(Number(operatorEndTime)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'任务详情'}</Col>
            <Col type={'content'} style={{ wordBreak: 'break-word' }}>
              {detail || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20, width: '100%' }}>
            <Col type={'title'}>{'相关图片'}</Col>
            <Col type={'content'} style={{ width: '80%' }}>
              {attachments && attachments.length > 0 ? (
                <Attachment.ImageView
                  wrapperStyle={{ padding: '10px 0 10px' }}
                  actionStyle={{ backgroundColor: white }}
                  attachment={attachment}
                />
              ) : (
                replaceSign
              )}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示任务设置
  showTaskConfig = data => {
    if (!data) {
      return null;
    }
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const itemHeaderTitle = '策略设置';
    const {
      strategyGroup,
      strategyTitle,
      strategyTriggerType,
      strategyCode,
      strategyDescription,
      strategyStartTime,
      taskPlanLaborTimeAmount,
      taskPlanLaborTimeUnit,
      strategyEndTime,
      taskAcceptanceCheck,
      taskReportTemplate,
      strategyTriggerSchema,
      deviceMetric,
    } = data.strategy;
    let strategyTriggerTypeDispaly = '';
    switch (strategyTriggerType) {
      case 1:
        strategyTriggerTypeDispaly = '固定周期';
        break;
      case 2:
        strategyTriggerTypeDispaly = '浮动周期';
        break;
      case 3:
        strategyTriggerTypeDispaly = '累计用度';
        break;
      case 4:
        strategyTriggerTypeDispaly = '固定用度';
        break;
      case 5:
        strategyTriggerTypeDispaly = '手动创建';
        break;
      default:
        strategyTriggerTypeDispaly = '手动创建';
        break;
    }
    const { scan } = data.entity;
    const { metricBaseValue, metricCompareType, period, timeUnit } = strategyTriggerSchema || {};
    const { metricUnitName } = deviceMetric || {};
    let timeUnitDispaly = '';
    switch (timeUnit) {
      case 0:
        timeUnitDispaly = '小时';
        break;
      case 1:
        timeUnitDispaly = '日';
        break;
      case 2:
        timeUnitDispaly = '周';
        break;
      case 3:
        timeUnitDispaly = '月';
        break;
      default:
        timeUnitDispaly = '小时';
        break;
    }
    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略号'}</Col>
            <Col style={colStyle} type={'content'}>
              {strategyCode}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略方案'}</Col>
            <Col style={colStyle} type={'content'}>
              {changeChineseToLocale(strategyTriggerTypeDispaly, intl)}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略名称'}</Col>
            <Col style={colStyle} type={'content'}>
              {strategyTitle || replaceSign}
            </Col>
          </Row>
          {strategyTriggerType !== 5 ? (
            strategyTriggerType === 1 || strategyTriggerType === 2 ? (
              <Row style={{ marginRight: 20 }}>
                <Col type={'title'}>{'周期'}</Col>
                <Col style={colStyle} type={'content'}>
                  {changeChineseTemplateToLocale('每 {period} {timeUnitDispaly}', {
                    period,
                    timeUnitDispaly: changeChineseToLocale(timeUnitDispaly, intl),
                  })}
                </Col>
              </Row>
            ) : (
              <Row style={{ marginRight: 20 }}>
                <Col type={'title'}>{'阈值'}</Col>
                <Col style={colStyle} type={'content'}>{`${
                  metricCompareType === 1 ? '≤' : '≥'
                }${metricBaseValue}${metricUnitName}`}</Col>
              </Row>
            )
          ) : null}
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略描述'}</Col>
            <Col style={colStyle} type={'content'}>
              {strategyDescription || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'计划工时'}</Col>
            <Col style={colStyle} type={'content'}>{`${taskPlanLaborTimeAmount}${
              taskPlanLaborTimeUnit === 0 ? '小时' : '分钟'
            }`}</Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略组'}</Col>
            <Col style={colStyle} type={'content'}>
              {(strategyGroup && strategyGroup.title) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'报告模板'}</Col>
            <Col style={colStyle} type={'content'}>
              {(taskReportTemplate && taskReportTemplate.name) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略开始时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {strategyStartTime ? moment(Number(strategyStartTime)).format('YYYY/MM/DD HH:mm') : replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'扫码确认'}</Col>
            <Col style={colStyle} type={'content'}>
              {scan ? '是' : '否'}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略结束时间'}</Col>
            <Col style={colStyle} type={'content'}>
              {strategyEndTime ? moment(Number(strategyEndTime)).format('YYYY/MM/DD HH:mm') : replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'完成验收'}</Col>
            <Col style={colStyle} type={'content'}>
              {taskAcceptanceCheck ? '是' : '否'}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'策略类型'}</Col>
            <Col style={colStyle} type={'content'}>
              {'保养'}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示任务日志
  showTaskLog = () => {
    const itemHeaderTitle = '任务日志';
    const { form, history } = this.props;
    const { changeChineseToLocale } = this.context;
    const { logListLoading, logList } = this.state;
    if (!logList) {
      return null;
    }
    const { getFieldDecorator, getFieldsValue } = form;
    const columns = [
      {
        title: '时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        type: 'operationDate',
        render: createdAt => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <span>{getFormatDate(createdAt)}</span>;
        },
      },
      {
        title: '日志类型',
        dataIndex: 'logType',
        key: 'logType',
        width: 140,
        render: logType => {
          const _logType = Object.keys(logTypeObj).filter(n => n === logType);
          return <span>{changeChineseToLocale(logTypeObj[_logType[0]])}</span>;
        },
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        key: 'operator',
        width: 120,
        render: operator => <span>{operator.name || replaceSign}</span>,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        render: description => <Tooltip text={description || replaceSign} length={20} />,
      },
      {
        title: '任务报告',
        dataIndex: 'logType',
        key: 'taskLog',
        type: 'validDate',
        render: (logType, record) => (
          <span>
            {logType === 'finish' ? (
              <Link
                onClick={() => {
                  history.push(
                    `/equipmentMaintenance/maintenanceTask/detail/${record.taskCode}/report/${record.subTaskCode ||
                      '-'}`,
                  );
                }}
              >
                任务报告
              </Link>
            ) : (
              replaceSign
            )}
          </span>
        ),
      },
    ];
    const submit = () => {
      const value = getFieldsValue();
      if (value.operationTime.length > 0) {
        const createdAtFrom = Date.parse(value.operationTime[0]);
        const createdAtTill = Date.parse(value.operationTime[1]);
        this.fetchLogList({ createdAtFrom, createdAtTill });
      } else {
        this.fetchLogList({});
      }
    };

    return (
      <div style={itemContainerStyle} className={styles.taskLog}>
        <DetailPageItemContainer
          itemHeaderTitle={itemHeaderTitle}
          contentStyle={{ display: 'block', width: '100%', padding: '10px 0 10px 0' }}
        >
          <div style={{ display: 'flex', marginTop: 20 }}>
            <Form>
              <FormItem label="操作时间">
                {getFieldDecorator('operationTime')(
                  <RangePicker
                    showTime={{
                      format: 'HH:mm',
                      hideDisabledOptions: true,
                    }}
                    format="YYYY/MM/DD HH:mm"
                  />,
                )}
              </FormItem>
            </Form>
            <Button style={{ width: 86, margin: '5px 0 0 10px' }} onClick={submit} icon={'search'}>
              查询
            </Button>
          </div>
          <Spin spinning={logListLoading}>
            <RestPagingTable
              bordered
              dataSource={logList && logList.data}
              columns={columns}
              rowKey={record => record.id}
              total={logList && logList.total}
              refetch={this.fetchLogList}
            />
          </Spin>
        </DetailPageItemContainer>
      </div>
    );
  };

  render() {
    const { data, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ marginBottom: 30 }}>
          {this.showTarget(data)}
          {this.showTaskDetail(data)}
          {this.showTaskConfig(data)}
          {this.showTaskLog(history)}
        </div>
      </Spin>
    );
  }
}

MaintenanceTaskDetail.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, injectIntl(MaintenanceTaskDetail));
