import React, { Component } from 'react';
import _ from 'lodash';
import Proptypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import moment from 'utils/time';
import { Timeline, Spin, DatePicker, Modal } from 'antd';
import {
  getRepairTaskOverview,
  getRepairLogList,
  deleteRepairTask,
} from 'src/services/equipmentMaintenance/repairTask';
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
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { white, error, fontSub, primary, sliverGrey, black, warning, border, grey } from 'src/styles/color/index';
import { EQUIPMENT_PROD, EQUIPMENT_MODULE, taskStatus } from 'src/views/equipmentMaintenance/constants';
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
const tagStyle = {
  width: 126,
  height: 32,
  lineHeight: '32px',
  textAlign: 'center',
  borderRadius: 15,
  border: `1px solid ${error}`,
  color: error,
  marginRight: 10,
};
const colStyle = { width: 360 };
const { RangePicker } = DatePicker;

type Props = {
  match: {},
  form: any,
  intl: any,
  history: any,
};

class RepairTaskDetail extends Component {
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
    const { match } = this.props;
    const {
      params: { taskCode },
    } = match;
    this.setState({ loading: true });
    getRepairTaskOverview(taskCode)
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  fetchLogList = variables => {
    const { match } = this.props;
    const {
      params: { taskCode },
    } = match;
    this.setState({ logListLoading: true });
    getRepairLogList(taskCode, variables)
      .then(res => {
        this.setState({ logList: res.data });
      })
      .finally(() => {
        this.setState({ logListLoading: false });
      });
  };

  onDeleteTask = () => {
    const { match, history } = this.props;
    const {
      params: { taskCode },
    } = match;
    deleteRepairTask(taskCode).then(() => {
      message.success('删除维修任务成功');
      history.push('/equipmentMaintenance/repairTask');
    });
  };

  // 显示维修目标
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
    const itemHeaderTitle = '维修目标';

    return (
      <div style={{ ...itemContainerStyle }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'目标类别'}</Col>
            <Col type={'content'} style={colStyle}>
              {type === EQUIPMENT_PROD || type === EQUIPMENT_MODULE ? '设备' : '模具'}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'目标名称'}</Col>
            <Col type={'content'} style={colStyle}>
              {name || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'目标类型'}</Col>
            <Col type={'content'} style={colStyle}>
              {categoryName || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'目标编码'}</Col>
            <Col type={'content'} style={colStyle}>
              {code || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'电子标签'}</Col>
            <Col type={'content'} style={colStyle}>
              {qrcode || replaceSign}
            </Col>
          </Row>
          {type !== 'mould' ? (
            <Row style={{ marginRight: 40 }}>
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

  // 显示任务详情
  showTaskDetail = data => {
    if (!data) {
      return null;
    }
    const { intl } = this.props;
    const {
      attachments,
      createdAt,
      creator,
      deadline,
      detail,
      faultReason,
      executors,
      operatorStartTime,
      operatorEndTime,
      operatorGroup,
      statusDisplay,
      taskCode,
      title,
      status,
      currentOperators,
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
    const haveCreateRepairTaskAuthority = haveAuthority(auth.WEB_REMOVE_REPAIR_TASK);

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
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
                <h3>{changeChineseToLocale('删除维修任务', intl)}</h3>
                <div style={{ color: fontSub }}>
                  {changeChineseToLocale('该任务将被删除且无法恢复，请确认！', intl)}
                </div>
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
        <DetailPageItemContainer
          itemHeaderTitle={itemHeaderTitle}
          contentStyle={{ width: '100%' }}
          action={
            <Link
              style={actionStyle}
              icon="delete"
              onClick={() => {
                this.setState({ visible: true });
              }}
              disabled={status !== taskStatus[1].key || !haveCreateRepairTaskAuthority}
            >
              删除
            </Link>
          }
        >
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'任务号'}</Col>
            <Col type={'content'} style={colStyle}>
              {taskCode || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'任务类型'}</Col>
            <Col type={'content'} style={colStyle}>
              {'维修'}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'状态'}</Col>
            <Col type={'content'} style={colStyle}>
              {statusDisplay || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'计划执行人'}</Col>
            <Col type={'content'}>
              {executors && executors.length ? executors.map(n => n.executorName).join('，') : replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'实际执行人'}</Col>
            <Col type={'content'} style={colStyle}>
              {currentOperators ? currentOperators.map(n => n.name).join(',') : replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'执行开始时间'}</Col>
            <Col type={'content'}>
              {(operatorStartTime && moment(Number(operatorStartTime)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'执行结束时间'}</Col>
            <Col type={'content'} style={colStyle}>
              {(operatorEndTime && moment(Number(operatorEndTime)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'截止时间'}</Col>
            <Col type={'content'}>
              {(deadline && moment(Number(deadline)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'创建人'}</Col>
            <Col type={'content'} style={colStyle}>
              {(creator && creator.name) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'创建时间'}</Col>
            <Col type={'content'}>
              {(createdAt && moment(Number(createdAt)).format('YYYY/MM/DD HH:mm')) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'任务标题'}</Col>
            <Col type={'content'} style={colStyle}>
              {title || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'任务详情'}</Col>
            <Col type={'content'} style={{ ...colStyle, wordBreak: 'break-word' }}>
              {detail || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'故障原因'}</Col>
            <Col type={'content'} style={{ marginBottom: -3, width: 800 }}>
              {
                <div style={{ display: 'flex', transform: 'translateY(-7px)' }}>
                  {faultReason.map(n => (
                    <div style={tagStyle}>
                      <Tooltip text={n.name} length={8} />
                    </div>
                  ))}
                </div>
              }
            </Col>
          </Row>
          <Row style={{ marginRight: 40, width: '100%' }}>
            <Col type={'title'}>{'相关图片'}</Col>
            <Col type={'content'} style={{ width: '80%' }}>
              {attachments.length > 0 ? (
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
    const itemHeaderTitle = '任务设置';
    const { reportTemplate, scan, warnConfigDisplay } = data.taskConfig;
    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'扫码确认'}</Col>
            <Col type={'content'} style={colStyle}>
              {scan ? '是' : '否'}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'任务提醒'}</Col>
            <Col type={'content'}>{warnConfigDisplay}</Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'报告模板'}</Col>
            <Col type={'content'} style={colStyle}>
              {(reportTemplate && reportTemplate.name) || replaceSign}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示审批详情
  showApprovalDetail = data => {
    if (!(data && data.audits)) {
      return null;
    }
    const itemHeaderTitle = '审批详情';
    const { audits } = data;
    const taskRemind = auditResult => {
      switch (auditResult) {
        case 1:
          return {
            text: '待审核',
            color: sliverGrey,
            iconType: 'check-circle',
          };
        case 2:
          return {
            text: '审核通过',
            color: primary,
            iconType: 'check-circle',
          };
        case 3:
          return {
            text: '驳回',
            color: error,
            iconType: 'close-circle',
          };
        default:
          return '未知状态';
      }
    };

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          {audits ? (
            <Timeline>
              {audits.map((n, index) => (
                <Timeline.Item
                  dot={
                    <Icon
                      style={{ color: taskRemind(n.auditResult).color }}
                      type={taskRemind(n.auditResult).iconType}
                    />
                  }
                >
                  <div style={{ marginTop: 15, marginBottom: index === audits.length - 1 ? -20 : 0, display: 'flex' }}>
                    <Icon.Avatar name={n.auditor.name} color={n.auditor.bgColor} />
                    <div>
                      <div>
                        <span style={{ marginRight: 5 }}>{n.auditor.name}</span>
                        <span style={{ marginRight: 5, color: primary }}>{taskRemind(n.auditResult).text}</span>
                        <span>
                          {n.auditTime ? moment(Number(n.auditTime)).format('YYYY/MM/DD HH:mm') : replaceSign}
                        </span>
                      </div>
                      <div style={{ color: fontSub, marginTop: 3 }}>{n.auditDesc || replaceSign}</div>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : null}
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示任务日志
  showTaskLog = () => {
    const itemHeaderTitle = '任务日志';
    const { form, history } = this.props;
    const { changeChineseToLocale } = this.context;
    const { logListLoading, logList, loading } = this.state;
    if (!logList || loading) {
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
        render: description => <Tooltip text={description || replaceSign} length={50} />,
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
                    `/equipmentMaintenance/repairTask/detail/${record.taskCode}/report/${record.subTaskCode || '-'}`,
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
        <div className={styles.repairTaskDetail} style={{ marginBottom: 30 }}>
          {this.showTarget(data)}
          {this.showTaskDetail(data)}
          {this.showTaskConfig(data)}
          {this.showApprovalDetail(data)}
          {this.showTaskLog()}
        </div>
      </Spin>
    );
  }
}

RepairTaskDetail.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withRouter(withForm({}, injectIntl(RepairTaskDetail)));
