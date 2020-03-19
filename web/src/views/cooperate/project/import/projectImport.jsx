import React from 'react';
import { Modal, Upload, Progress } from 'antd';
import _ from 'lodash';
import propTypes from 'prop-types';
import { Button, Icon } from 'components';
import uuid from 'uuid';
import { importProjects } from 'src/services/cooperate/project';
import parseFile from 'utils/parseFile';
import classNames from 'classnames';
import { splitRequestData } from 'utils/array';
import styles from '../index.scss';

type propsType = {
  visible: boolean,
  toggleVisible: () => {},
  router: any,
};

const initState = {
  fileList: [],
  records: [],
  step: 1,
  successTotal: 0,
  failTotal: 0,
  precent: 0,
};

class ProjectImport extends React.Component<propsType> {
  state = {
    ...initState,
  };

  handleClose = () => {
    this.props.toggleVisible(false);
    this.setState({
      ...initState,
    });
  };

  beforeUpload = file => {
    this.setState({ fileList: [file] });
    return false;
  };

  parseData = fileData => {
    // const { fileData } = this.state;
    const uploadData = [];
    fileData.forEach((node, index) => {
      // node : ['productMaterialCode', 'version', 'materialCode', 'amount']

      // 导入文件中首行加了「填写说明」，故从第三行开始才是数据行。
      if (index > 1 && node.length !== 0) {
        const project = {};
        const headers = [
          'parentCode',
          'type',
          'projectCode',
          'purchaseOrderCode',
          'productCode',
          'amountProductPlanned',
          'productBatchType',
          'productBatch',
          'parentSeq',
          'managerIds',
          'startTimePlanned',
          'endTimePlanned',
          'description',
          'processRoutingCode',
          'ebomVersion',
          'mbomVersion',
        ];
        headers.forEach((key, index) => {
          const { productBatchType } = project || {};
          if (key === 'productBatch' && productBatchType && productBatchType.toString() === '2') {
            key = 'productBatchNumberRuleName';
          }
          project[key] = node[index];
        });
        uploadData.push({
          ...project,
          managerIds: project.managerIds ? project.managerIds.split('、') : [],
        });
      }
    });
    // uploadData.push(node);
    return uploadData;
  };

  startImport = () => {
    const file = this.state.fileList[0];
    this.setState({ step: 2 });
    parseFile({
      file,
      callback: async data => {
        const records = this.parseData(data);
        console.log(records);
        const importId = uuid().slice(1, 20);
        this.setState({ records, importId });
        let times = 0; // 发送的次数
        const requestArr = splitRequestData(records);
        for (const node of requestArr) {
          const { data } = await importProjects({ importId, projects: node });
          times += 1;
          this.setState({
            successTotal: data.data.amountSuccess + this.state.successTotal,
            failTotal: data.data.amountFailed + this.state.failTotal,
            precent: parseInt(times / requestArr.length * 100, 10),
          });
        }
      },
    });
  };
  renderStep = step => {
    if (step === 1) {
      return this.renderStep1();
    } else if (step === 2) {
      return this.renderStep2();
    }
    return this.renderStep3();
  };

  renderStep1 = () => (
    <div style={{ height: 240 }}>
      <div className={styles.stepOneWrapper}>
        <div className="import-steps">
          <p>操作步骤:</p>
          <p>
            1.下载<a href="https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190320/%E5%AF%BC%E5%85%A5%E9%A1%B9%E7%9B%AE%E6%A8%A1%E6%9D%BF.csv">
              《导入项目模板》
            </a>
          </p>
          <p>2.打开下载表，将对应信息填入或粘贴进本表。为保证导入成功，请使用纯文本或数字。</p>
          <p>3.信息输入完毕并保存后，点击下方&lt;上传文件&gt;按钮选择已保存的csv文档。</p>
          <p>4.点击&lt;开始导入&gt;。</p>
        </div>
        <div className={styles.upload}>
          <Upload
            onRemove={() => this.setState({ fileList: [] })}
            className="upload-box"
            accept=".csv"
            beforeUpload={this.beforeUpload}
            fileList={this.state.fileList}
            disabled={this.state.fileList.length > 0}
          >
            <span style={{ fontSize: 14, marginRight: 10 }}>附件：</span>
            <Button icon="upload" type="primary" ghost disabled={this.state.fileList.length > 0}>
              上传文件
            </Button>
            <p className="upload-tip">附件支持类型：CSV，最大不能超过10M</p>
          </Upload>
        </div>
      </div>
      <div style={{ justifyContent: 'center', display: 'flex' }}>
        <Button onClick={this.startImport} disabled={this.state.fileList.length <= 0} icon="upload">
          开始导入
        </Button>
      </div>
    </div>
  );

  renderStep2 = () => {
    const { failTotal, successTotal, precent } = this.state;
    return (
      <div className={styles.step2} style={{ height: 240 }}>
        <Progress type="circle" percent={precent} width={80} />
        <p style={{ marginTop: 20 }}>项目导入中...</p>
        <p>
          已成功数: {successTotal}, 已失败数: {failTotal}
        </p>
      </div>
    );
  };

  renderStep3 = () => {
    const { successTotal, failTotal, records, importId } = this.state;
    const isFail = failTotal === records.length;
    return (
      <div className={styles.importTip}>
        <div className={styles.tip}>
          {isFail ? (
            <Icon type="close-circle" className={classNames(styles.icon, styles.iconRrror)} />
          ) : (
              <Icon type="check-circle" className={classNames(styles.icon, styles.iconOk)} />
            )}
          <div className={styles.right}>
            <p>导入{isFail ? '失败' : '成功'}！</p>
            <span>
              成功数：{successTotal}，失败数：{failTotal}
            </span>
          </div>
        </div>
        <div className={styles.bottom}>
          <Button
            type="default"
            onClick={() => {
              this.context.router.history.push(`/cooperate/projects/loglist/logdetail/${importId}`);
            }}
          >
            导入日志
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { visible } = this.props;
    const { step, precent } = this.state;
    return (
      <div>
        {precent === 100 ? (
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
              title="导入项目"
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

ProjectImport.contextTypes = {
  router: propTypes.object,
};

export default ProjectImport;
