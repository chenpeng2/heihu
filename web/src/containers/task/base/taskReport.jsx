import React, { Component } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import moment from 'src/utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { getPathname } from 'src/routes/getRouteParams';
import { DetailPageHeader, Icon, Attachment, Tooltip, Table, Row, Col } from 'components';
import {
  getHistoryTaskReport as getRepairHistoryTaskReport,
  getRepairTaskDetail,
} from 'src/services/equipmentMaintenance/repairTask';
import {
  getHistoryTaskReport as getMaintainHistoryTaskReport,
  getMaintenanceTaskDetail,
} from 'src/services/equipmentMaintenance/maintenanceTask';
import {
  getHistoryTaskReport as getCheckHistoryTaskReport,
  getCheckTaskDetail,
} from 'src/services/equipmentMaintenance/checkTask';
import { white, fontSub, primary, error, greenBrown, alertYellow, deepGrey, border } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

const AttachmentImageView = Attachment.ImageView;

type Props = {
  match: {
    params: {
      taskCode: string,
      subTaskCode: string,
    },
  },
  intl: any,
  location: {
    pathname: string,
  },
};

class TaskReport extends Component {
  props: Props;
  state = {
    loading: false,
    data: [],
    taskData: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const {
      match: {
        params: { taskCode, subTaskCode },
      },
      match,
    } = this.props;
    const variables = {
      taskCode,
      subTaskCode: subTaskCode === '-' ? '' : subTaskCode,
    };
    const pathname = getPathname(match);
    let getTaskDetail = () => {};
    let getHistoryTaskReport = () => {};
    this.setState({ loading: true });
    if (pathname.indexOf('repair') !== -1) {
      getTaskDetail = getRepairTaskDetail;
      getHistoryTaskReport = getRepairHistoryTaskReport;
    } else if (pathname.indexOf('maintenance') !== -1) {
      getTaskDetail = getMaintenanceTaskDetail;
      getHistoryTaskReport = getMaintainHistoryTaskReport;
    } else {
      getTaskDetail = getCheckTaskDetail;
      getHistoryTaskReport = getCheckHistoryTaskReport;
    }
    getTaskDetail(taskCode).then(res => {
      this.setState({ taskData: res.data.data });
    });
    getHistoryTaskReport(variables)
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  // getSubTitle = data => {
  //   const { operatorStartTime, operatorEndTime, currentOperators } = data;
  //   const startTime = operatorStartTime && moment(Number(operatorStartTime)).format('YYYY/MM/DD HH:mm') || replaceSign;
  //   const endTime = operatorEndTime && moment(Number(operatorEndTime)).format('YYYY/MM/DD HH:mm') || replaceSign;
  //   return (
  //     <div style={{ marginTop: 10 }}>
  //       <span style={{ marginRight: 20, color: fontSub }}>
  //         执行人：{currentOperators ? currentOperators.map(n => n.name).join('，') : replaceSign}
  //       </span>
  //       <span style={{ color: fontSub }}>执行时间：{`${startTime} ~ ${endTime}`}</span>
  //     </div>
  //   );
  // }

  showCheckOption = data => {
    const { intl } = this.props;
    const { tipType, tips } = data;
    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: greenBrown }} />
        <div className={styles.reportContainer} style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>{data.description}</div>
            <div style={{ color: data.value === '异常' ? error : primary }}>
              {changeChineseToLocale(data.value === '异常' ? '异常' : '正常', intl)}
            </div>
          </div>
          {tips ? this.renderTips(tipType, tips) : null}
        </div>
      </div>
    );
  };

  showTaskOption = data => {
    const { tipType, tips } = data;
    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: alertYellow }} />
        <div className={styles.reportContainer} style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>{data.description}</div>
            {data.value ? (
              <Icon
                style={{ color: data.value === 'true' ? primary : error }}
                type={data.value === 'true' ? 'check' : 'close'}
              />
            ) : null}
          </div>
          {tips ? this.renderTips(tipType, tips) : null}
        </div>
      </div>
    );
  };

  showSingleOption = data => {
    const { tipType, tips } = data;
    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: primary }} />
        <div className={styles.reportContainer} style={{ display: 'block' }}>
          <div style={{ marginBottom: 10 }}>{data.name}</div>
          {tips ? this.renderTips(tipType, tips) : null}
          <div style={{ color: fontSub }}>{data.value}</div>
        </div>
      </div>
    );
  };

  showTextBox = data => {
    const { tipType, tips } = data;
    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: alertYellow }} />
        <div className={styles.reportContainer} style={{ display: 'block' }}>
          <div style={{ marginBottom: 10 }}>{data.name}</div>
          {tips ? this.renderTips(tipType, tips) : null}
          <div style={{ color: fontSub }}>{data.value}</div>
        </div>
      </div>
    );
  };

  showDeviceMetric = data => {
    const { intl } = this.props;
    const { tipType, tips, value } = data;
    const deviceMetrics = JSON.parse(value);
    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: alertYellow }} />
        <div className={styles.reportContainer} style={{ display: 'block' }}>
          <div style={{ marginBottom: 10 }}>{data.name || changeChineseToLocale('设备读数', intl)}</div>
          {tips ? this.renderTips(tipType, tips) : null}
          {deviceMetrics && deviceMetrics.length
            ? deviceMetrics.map(n => (
                <Row style={{ marginRight: 20 }}>
                  <Col type={'title'}>{n.metricName}</Col>
                  <Col style={{ width: 800 }} type={'content'}>{`${n.value || replaceSign}${n.metricUnitName ||
                    replaceSign}`}</Col>
                </Row>
              ))
            : replaceSign}
        </div>
      </div>
    );
  };

  showPicture = data => {
    const { files, tipType, tips } = data;
    const attachment = {};
    if (files) {
      attachment.files = files.map(attachment => {
        const _attachment = {
          originalExtension: attachment.original_extension,
          originalFileName: attachment.original_filename,
          url: attachment.url,
          id: attachment.id,
        };
        return _attachment;
      });
    }

    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: error }} />
        <div className={styles.reportContainer} style={{ display: 'block' }}>
          <div style={{ marginBottom: 10 }}>{data.name}</div>
          {tips ? this.renderTips(tipType, tips) : null}
          {files ? (
            <Attachment.ImageView
              wrapperStyle={{ padding: '10px 0 0px' }}
              actionStyle={{ backgroundColor: white }}
              attachment={attachment}
            />
          ) : (
            replaceSign
          )}
        </div>
      </div>
    );
  };

  showPartition = data => {
    const { name, tips, subControls, tipType, attachment } = data;
    const _attachments =
      Array.isArray(attachment) && attachment.length > 0
        ? attachment.map(n => {
            const file = n.file || {};
            const { id, original_extension, original_filename, uri } = file;
            return { id, originalExtension: original_extension, originalFileName: original_filename, url: uri };
          })
        : null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div className={styles.reportContainer} style={{ display: 'block', padding: '10px 20px 0 20px' }}>
          <h4 style={{ marginTop: 10 }}>{name}</h4>
          {tips ? this.renderTips(tipType, tips) : null}
          {this.showDifType(subControls || [])}
          {Array.isArray(_attachments) && _attachments.length > 0 ? (
            <div
              style={{ width: '100%', backgroundColor: `${border}33`, border: `1px solid ${border}`, marginBottom: 20 }}
            >
              <AttachmentImageView attachment={{ files: _attachments }} wrapperStyle={{ padding: '24px 10px 14px' }} />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  showMaterialReplace = data => {
    const { intl } = this.props;
    const { value, tips, tipType } = data;
    const _value = JSON.parse(value);
    const getColumns = () => {
      const columns = [
        {
          title: '备件',
          width: 300,
          dataIndex: 'materialName',
          render: (materialName, record) => (
            <Tooltip text={`${materialName || replaceSign}(${record.materialCode || replaceSign})`} length={15} />
          ),
        },
        {
          title: '更换数量',
          width: 300,
          dataIndex: 'amount',
          render: (amount, record) => (
            <div>
              {amount}
              {record.unit || replaceSign}
            </div>
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: remark => <Tooltip text={remark || replaceSign} length={15} />,
        },
      ];
      return columns;
    };

    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: greenBrown }} />
        <div className={styles.reportContainer} style={{ display: 'block', padding: '10px 0 20px' }}>
          <div style={{ paddingLeft: 20 }}>
            <h3 style={{ marginTop: 10 }}>{changeChineseToLocale('备件更换', intl)}</h3>
            {tips ? this.renderTips(tipType, tips) : null}
          </div>
          {value ? (
            <div style={{ marginBottom: 42 }}>
              <Table
                dataSource={_value}
                bordered
                pagination={{
                  pageSize: 5,
                  total: _value.length,
                }}
                columns={getColumns()}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  showDowntimeRecord = data => {
    const { intl } = this.props;
    const { value, tips, tipType } = data;
    const _value = JSON.parse(value);
    const getColumns = () => {
      const columns = [
        {
          title: '实际开始时间至结束时间',
          dataIndex: 'startTime',
          render: (startTime, record) => (
            <div style={{ color: fontSub }}>{`${moment(startTime).format('YYYY/MM/DD HH:mm')} ~ ${moment(
              record.endTime,
            ).format('YYYY/MM/DD HH:mm')}`}</div>
          ),
        },
      ];
      return columns;
    };

    return (
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ width: 4, position: 'relative', left: 1, backgroundColor: greenBrown }} />
        <div className={styles.reportContainer} style={{ display: 'block', padding: '10px 0 20px' }}>
          <div style={{ paddingLeft: 20 }}>
            <div style={{ marginBottom: 10 }}>{data.name || changeChineseToLocale('实际停机时间', intl)}</div>
            {tips ? this.renderTips(tipType, tips) : null}
          </div>
          {value ? (
            <div style={{ marginBottom: _value.length > 5 ? 42 : 10 }}>
              <Table
                dataSource={_value}
                bordered
                pagination={
                  _value.length > 5
                    ? {
                        pageSize: 5,
                        total: _value.length,
                      }
                    : false
                }
                columns={getColumns()}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  showDifType = data =>
    data.map(n => {
      switch (n.type) {
        case 'taskOption':
          return this.showTaskOption(n || {});
        case 'picture':
          return this.showPicture(n || {});
        case 'singleOption':
          return this.showSingleOption(n || {});
        case 'partition':
          return this.showPartition(n || {});
        case 'textBox':
          return this.showTextBox(n || {});
        case 'checkOption':
          return this.showCheckOption(n || {});
        // case 'materialReplace':
        //   return this.showMaterialReplace(n || {});
        case 'deviceMetric':
          return this.showDeviceMetric(n || {});
        case 'downtimeRecord':
          return this.showDowntimeRecord(n || {});
        default:
          return null;
      }
    });

  renderTips = (tipType, tips) => {
    return (
      <div style={{ display: 'flex' }}>
        <Icon
          type="exclamation-circle"
          style={{ color: tipType === 'regular' ? deepGrey : error, marginRight: 5, fontSize: 13, lineHeight: '10px' }}
        />
        <div style={{ color: fontSub, margin: '-5px 0 10px 0' }}>{tips}</div>
      </div>
    );
  };

  render() {
    const {
      location: { pathname },
      intl,
    } = this.props;
    const type = pathname.indexOf('repair') !== -1 ? '维修' : pathname.indexOf('check') !== -1 ? '点检' : '保养';
    const { taskData, loading, data: report } = this.state;
    const data = (report && report.controls) || [];

    return (
      <Spin spinning={loading}>
        <div style={{ backgroundColor: white }}>
          <DetailPageHeader
            title={`${changeChineseToLocale(`${type}目标`, intl)}：${(taskData && taskData.target.name) ||
              replaceSign}`}
            // subtitle={this.getSubTitle(taskData && taskData.entity || {})}
          />
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>{this.showDifType(data)}</div>
      </Spin>
    );
  }
}

export default injectIntl(TaskReport);
