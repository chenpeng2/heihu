import React from 'react';
import { Modal, Upload, Progress } from 'antd';
import propTypes from 'prop-types';
import { Button, Icon, FormattedMessage } from 'components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import uuid from 'uuid';
import { importEbom } from 'src/services/bom/ebom';
import classNames from 'classnames';
import { arrayIsEmpty, splitRequestDataByFifty } from 'src/utils/array';
import { parseXlsxfile } from 'utils/parseFile';
import { getWeighingConfig } from 'utils/organizationConfig';

import styles from 'src/views/bom/eBom/index.scss';

// 多条数据组成一个ebom。utils中的50太小了。暂时在这边设置为1000解决问题。需要group数据
// 方案可以是前端做也可以是后端做
// const splitRequestDataByFifty = (arr: Array<any>): Array<any> => {
//   // split data to [ data ]
//   const result = [];
//   if (arr.length < 10) {
//     result.push(arr);
//   } else {
//     const times = Math.ceil(arr.length / 1000); // 分为几次发送
//     // const partAmount = Math.floor(arr.length / 10); // 每次发送多少条
//     const partAmount = times === 1 ? arr.length : 1000; // 每次发送多少条
//     for (let i = 0; i < times; i += 1) {
//       const start = i * partAmount;
//       const end = i === times - 1 ? arr.length : (i + 1) * partAmount;
//       result.push(arr.slice(start, end));
//     }
//   }
//   return result;
// };

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
  updateSuccessTotal: 0,
  updateFailedTotal: 0,
  precent: 0,
};

class ImportModal extends React.Component<propsType> {
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
    const uploadData = [];
    fileData.forEach((node, index) => {
      if (arrayIsEmpty(node)) {
        // empty row
        return;
      }
      const [
        productMaterialCode,
        ebomVersion,
        productMaterialAmount,
        productMaterialUnit,
        processRoutingCode,
        materialCode,
        materialAmount,
        materialUnit,
        lossRate,
        regulatoryControl,
        weight,
      ] = node;
      if (!index) {
        // first column is title
        return;
      }

      uploadData.push({
        productMaterialCode,
        ebomVersion,
        productMaterialAmount,
        productMaterialUnit,
        materialCode,
        materialAmount,
        materialUnit,
        lossRate,
        regulatoryControl,
        weight,
        processRoutingCode,
      });
    });
    return uploadData;
  };

  startImport = () => {
    const file = this.state.fileList[0];
    this.setState({ step: 2 });
    parseXlsxfile({
      file,
      callback: async data => {
        const records = this.parseData(data);
        const importId = uuid().slice(1, 20);
        this.setState({ records, importId });
        let times = 0; // 发送的次数
        const requestArr = splitRequestDataByFifty(records, ['productMaterialCode', 'ebomVersion']);
        for (const node of requestArr) {
          const { data } = await importEbom({ importId, eboms: node });
          times += 1;
          this.setState({
            successTotal: data.data.successAmount + this.state.successTotal,
            failTotal: data.data.failureAmount + this.state.failTotal,
            updateSuccessTotal: data.data.updateSuccessAmount + this.state.updateSuccessTotal,
            updateFailedTotal: data.data.updateFailedAmount + this.state.updateFailedTotal,
            precent: parseInt((times / requestArr.length) * 100, 10),
          });
        }
        if (sensors) {
          sensors.track('web_bom_ebom_create', {
            CreateMode: 'Excel导入',
            amount: this.state.successTotal,
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

  renderStep1 = () => {
    const weighingConfig = getWeighingConfig();
    const templateUrl = weighingConfig
      ? 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/v20190828/%E7%89%A9%E6%96%99%E6%B8%85%E5%8D%95%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88+(%E5%90%AF%E7%94%A8%E7%A7%B0%E9%87%8F)+.xlsx'
      : 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/v20190828/%E7%89%A9%E6%96%99%E6%B8%85%E5%8D%95%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88+(%E6%9C%AA%E5%90%AF%E7%94%A8%E7%A7%B0%E9%87%8F).xlsx';
    return (
      <div style={{ height: 240 }}>
        <div className={styles.stepOneWrapper}>
          <div className="import-steps">
            <FormattedMessage defaultMessage={'操作步骤'} />
            <p>
              1.
              <FormattedMessage defaultMessage={'下载'} />
              <a href={templateUrl}>《导入物料清单模板》</a>
            </p>
            <p>
              2.
              <FormattedMessage
                defaultMessage={'打开下载表，将对应信息填入或粘贴进本表。为保证导入成功，请使用纯文本或数字。'}
              />
            </p>
            <p>
              3.
              <FormattedMessage id={'key-6-159'} />
            </p>
            <p>
              4. <FormattedMessage id={'key-6-160'} />
            </p>
          </div>
          <div className={styles.upload}>
            <Upload
              onRemove={() => this.setState({ fileList: [] })}
              className="upload-box"
              accept=".xlsx"
              beforeUpload={this.beforeUpload}
              fileList={this.state.fileList}
              disabled={this.state.fileList.length > 0}
            >
              <FormattedMessage style={{ fontSize: 14, marginRight: 10 }} defaultMessage={'物料清单'} />
              <Button icon="upload" type="primary" ghost disabled={this.state.fileList.length > 0}>
                上传文件
              </Button>
              <p className="upload-tip">
                <FormattedMessage
                  defaultMessage={'附件支持类型：{type}，{amount}最大不能超过{maxSize}M'}
                  values={{
                    type: '.xlsx',
                    amount: '',
                    maxSize: 10,
                  }}
                />
              </p>
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
  };

  renderStep2 = () => {
    const { failTotal, successTotal, precent } = this.state;
    return (
      <div className={styles.step2} style={{ height: 240 }}>
        <Progress type="circle" percent={precent} width={80} />
        <p style={{ marginTop: 20 }}>{changeChineseToLocaleWithoutIntl('{type}导入中...', { type: '物料清单' })}</p>
        <p>
          <FormattedMessage
            defaultMessage={'成功数:{amount1},失败数{amount2}'}
            values={{
              amount1: successTotal,
              amount2: failTotal,
            }}
          />
        </p>
      </div>
    );
  };

  renderStep3 = () => {
    const { successTotal, failTotal, updateSuccessTotal, updateFailedTotal, records, importId } = this.state;
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
            <p>{changeChineseToLocaleWithoutIntl('导入{type}', { type: isFail ? '失败' : '成功' })}</p>
            <div>
              <FormattedMessage
                defaultMessage={'创建成功数：{createSuccessAmount}，创建失败数：{createFailAmount}'}
                values={{ createSuccessAmount: successTotal, createFailAmount: failTotal }}
              />
            </div>
            <div>
              <FormattedMessage
                defaultMessage={'更新成功数：{updateSuccessAmount}，更新失败数：{updateFailAmount}'}
                values={{ updateSuccessAmount: updateSuccessTotal, updateFailAmount: updateFailedTotal }}
              />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <Button
            type="default"
            onClick={() => {
              this.context.router.history.push(`/bom/eBom/loglist/logdetail/${importId}`);
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
            title={changeChineseToLocaleWithoutIntl('导入{type}', { type: '物料清单' })}
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

ImportModal.contextTypes = {
  router: propTypes.object,
};

export default ImportModal;
