import React from 'react';
import { Modal, Upload, Progress } from 'antd';
import { Button, Icon, Link } from 'components';
import uuid from 'uuid';
import parseFile from 'utils/parseFile';
import classNames from 'classnames';
import styles from 'src/views/bom/eBom/index.scss';
import { importSendTasks } from 'services/shipment/sendTask';

type propsType = {
  visible: boolean,
  toggleVisible: () => {},
  router: any,
};

const initState = {
  sapExcel: [],
  saqData: [],
  zhuiyingExcel: [],
  zhuiyingData: [],
  step: 1,
  successTotal: 0,
  failTotal: 0,
  percent: 0,
  importStatus: 0,
};

class ImportSendTask extends React.Component<propsType> {
  state = {
    ...initState,
  };

  handleClose = () => {
    this.props.toggleVisible(false);
    this.setState({
      ...initState,
    });
  };

  beforeUpload = (key, file) => {
    this.setState({ [key]: [file] });
    return false;
  };

  transformColNumber = col => {
    let number = -1;
    col
      .split('')
      .reverse()
      .forEach((char, index) => {
        if (index === 0) {
          number += char.charCodeAt() - 64;
        } else if (index === 1) {
          number += (char.charCodeAt() - 64) * 26;
        }
      });
    return number;
  };

  parseData = (fileData, headers) => {
    const uploadData = [];
    fileData.forEach((node, index) => {
      const data = {};
      Object.keys(headers).forEach(key => {
        data[headers[key]] = node[this.transformColNumber(key)];
      });
      if (!index) {
        // first column is title
        return;
      }
      uploadData.push(data);
    });
    return uploadData;
  };

  startImport = async () => {
    const { zhuiyingData, saqData, percent } = this.state;
    this.setState({
      step: 2,
    });
    const time = setInterval(() => {
      this.setState({ percent: this.state.percent + (96 - this.state.percent) * 0.15 });
    }, 1000);
    const importId = uuid().slice(1, 20);
    try {
      const { data: { data: { failureAmount, successAmount, status } } } = await importSendTasks({
        importId,
        sapExcel: saqData,
        zhuiyingExcel: zhuiyingData,
      });
      this.setState({
        percent: 100,
        failTotal: failureAmount,
        successTotal: successAmount,
        importStatus: status,
        importId,
      });
    } catch (e) {
      this.handleClose();
    }
    clearInterval(time);
  };
  renderStep = step => {
    if (step === 1) {
      return this.renderStep1();
    } else if (step === 2) {
      return this.renderStep2();
    }
    return this.renderStep3();
  };

  renderStep1 = () => {
    const { sapExcel, zhuiyingExcel, saqData, zhuiyingData } = this.state;
    return (
      <div style={{ height: 240 }}>
        <div className={styles.stepOneWrapper}>
          <div className="import-steps">
            <p>操作步骤:</p>
            <p>1.准备CSV格式的车辆调度信息文件，点击上传</p>
            <p>2.准备CSV格式的交货单文件，点击上传。</p>
            <p>3.点击&lt;开始导入&gt;。</p>
          </div>
          <div className={styles.upload}>
            <Upload
              onRemove={() => this.setState({ zhuiyingExcel: [] })}
              className="upload-box"
              accept=".csv"
              beforeUpload={file => {
                this.setState({ zhuiyingExcel: [file] });
                const zhuiyingHeaders = {
                  A: 'schedulingNumber',
                  U: 'commodity',
                  D: 'loadOddNumber',
                  E: 'deliveryOddNumber',
                  J: 'plateNo',
                  G: 'carrierName',
                  H: 'driverName',
                  I: 'driverPhone',
                  AB: 'appoimentTime',
                  C: 'orderStatus',
                  M: 'origin',
                };
                parseFile({
                  file,
                  callback: async data => {
                    this.setState({ zhuiyingData: this.parseData(data, zhuiyingHeaders) });
                  },
                });
                return false;
              }}
              fileList={zhuiyingExcel}
              disabled={zhuiyingExcel.length > 0}
            >
              <Button icon="upload" type="primary" ghost disabled={zhuiyingExcel.length > 0}>
                上传车辆调度信息
              </Button>
              <p className="upload-tip">附件支持类型：CSV，最大不能超过10M</p>
            </Upload>
          </div>
          <div className={styles.upload}>
            <Upload
              onRemove={() => this.setState({ sapExcel: [] })}
              className="upload-box"
              accept=".csv"
              beforeUpload={file => {
                this.setState({ sapExcel: [file] });
                const saqHeaders = {
                  Z: 'salesOrderNumber',
                  D: 'deliveryOddNumber',
                  AI: 'materialCode',
                  AJ: 'materialType',
                  BB: 'deliveryAmount',
                  CP: 'saleToCode',
                  CQ: 'saleToName',
                  CM: 'shipToCode',
                  CN: 'shipToName',
                };
                parseFile({
                  file,
                  callback: async data => {
                    this.setState({ saqData: this.parseData(data, saqHeaders) });
                  },
                });
                return false;
              }}
              fileList={sapExcel}
              disabled={sapExcel.length > 0}
            >
              <Button icon="upload" type="primary" ghost disabled={sapExcel.length > 0}>
                上传交货单信息
              </Button>
              <p className="upload-tip">附件支持类型：CSV，最大不能超过10M</p>
            </Upload>
          </div>
        </div>
        <div style={{ justifyContent: 'center', display: 'flex' }}>
          <Button
            onClick={this.startImport}
            icon="upload"
            disabled={!(saqData && saqData.length > 0 && zhuiyingData && zhuiyingData.length > 0)}
          >
            开始导入
          </Button>
        </div>
      </div>
    );
  };

  renderStep2 = () => {
    const { percent } = this.state;
    return (
      <div className={styles.step2} style={{ height: 240 }}>
        <Progress type="circle" percent={parseInt(percent, 10)} width={80} />
        <p style={{ marginTop: 20 }}>发运任务导入中...</p>
      </div>
    );
  };

  renderStep3 = status => {
    const { successTotal, failTotal, records, importId } = this.state;
    return (
      <div className={styles.importTip}>
        <div className={styles.tip}>
          {status === 0 ? (
            <Icon type="close-circle" className={classNames(styles.icon, styles.iconRrror)} />
          ) : (
            <Icon type="check-circle" className={classNames(styles.icon, styles.iconOk)} />
          )}
          <div className={styles.right}>
            <p>导入完成！</p>
            <span>
              成功数：{successTotal}，失败数：{failTotal}
            </span>
          </div>
        </div>
        <div className={styles.bottom}>
          <Button type="default">
            <Link to={`/logistics/send-task/import-list/detail/${importId}`}>导入日志</Link>
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { visible } = this.props;
    const { step, percent } = this.state;
    return (
      <div>
        {percent === 100 ? (
          <Modal
            visible={visible}
            width={420}
            onCancel={this.handleClose}
            destroyOnClose
            wrapClassName={styles.importModal}
            footer={null}
          >
            {this.renderStep3()}
          </Modal>
        ) : (
          <Modal
            title="导入发运任务"
            visible={visible}
            wrapClassName={styles.importModal}
            onCancel={this.handleClose}
            destroyOnClose
            footer={null}
          >
            {this.renderStep(step)}
          </Modal>
        )}
      </div>
    );
  }
}

export default ImportSendTask;
