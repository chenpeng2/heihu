import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Modal, Upload, Progress, Icon, message } from 'antd';
import { Button, Table } from 'components';
import { splitRequestData } from 'utils/array';
import parseFile, { keysToObj } from 'utils/parseFile';
import { importMaterials, queryMaterialImportDetail } from 'src/services/bom/material';
import styles from './styles.scss';

type Props = {
  item: String,
  fileTypes: String,
  context: any,
};
class ImportModal extends Component {
  props: Props;
  state = {
    visible: false,
    fileList: [],
    uploaded: false,
    steps: 0,
    percent: 0,
    success: 0,
    abnormal: 0,
    fail: 0,
    materials: [],
    times: 0,
    importId: 1,
    abnormalData: [],
    selectedRowKeys: [],
    total: 0,
  }

  componentWillMount() {
    this.setState({
      steps: 1,
    });
  }
  componentDidMount() {
    this.setState({
      visible: true,
      uploaded: false,
    });
  }
  renderModal = () => {
    const { item, fileTypes } = this.props;
    const uploadProps = {
      action: '//jsonplaceholder.typicode.com/posts/',
      onChange: this.handleChange,
      fileList: this.state.fileList,
      multiple: false,
      accept: fileTypes,
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        parseFile({
          file,
          callback: (res) => {
            const columns = ['code', 'name', 'unitName', 'desc'];
            const data = keysToObj(res, columns);
            this.setState({
              total: res.length - 1,
              materials: splitRequestData(data),
              times: splitRequestData(data).length,
            });
          },
        });
        return true;
      },
    };
    const startImportBtn = (
      <Button
        icon="download"
        type="primary"
        disabled={this.state.fileList.length === 0}
        onClick={() => {
          this.setState({
            steps: 2,
            uploaded: true,
          }, () => {
            this.sendMaterials(this.state.materials);
          });
        }}
      >
        开始导入
      </Button>
    );
    const importLogBtn = (
      <Button
        type="ghost"
        onClick={() => {
          this.setState({
            visible: false,
          });
          this.props.context.router.history.push('/bom/materials/logs/import');
        }}
      >导入日志</Button>
    );
    const stepOne = () => {
      return (
        <Modal
          title={`导入${item}`}
          visible={this.state.visible}
          onCancel={this.hideModal}
          footer={startImportBtn}
          className={styles.importModal}
          width="580px"
          height="462px"
        >
          <div id="import-step-one" className={styles.stepOneWrapper}>
            <div className="import-steps">
              <p>操作步骤:</p>
              <p>1.下载<a href="https://s3.cn-north-1.amazonaws.com.cn/gc-attachment-prod/%E7%89%A9%E6%96%99%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.csv">《导入{item}模板》</a></p>
              <p>2.打开下载表，将对应信息填入或粘贴进本表。为保证导入成功，请使用纯文本或数字。</p>
              <p>3.信息输入完毕并保存后，点击下方&lt;上传文件&gt;按钮选择已保存的excel文档。</p>
              <p>4.点击&lt;开始导入&gt;。</p>
            </div>
            <Upload className={this.state.fileList && this.state.fileList.length !== 0 ? 'uploadBox' : null} {...uploadProps}>
              <Button
                icon="upload"
                ghost
                disabled={this.state.fileList.length === 1}
              >
                上传文件
              </Button>
              <p className="upload-tip">附件支持类型：CSV，最大不能超过10M</p>
            </Upload>
          </div>
        </Modal>);
    };
    const stepTwo = (
      <Modal
        title={`导入${item}`}
        visible={this.state.visible}
        onCancel={this.hideModal}
        footer={null}
        className={styles.importModal}
        width="580px"
        height="462px"
      >
        <div id="import-step-two" className={styles.stepTwoWrapper}>
          <Progress type="circle" percent={this.state.percent} width={80} className={styles.progressContainer} />
          <p>{item}导入中...</p>
          <p>已成功数：{this.state.success}，已失败数：{this.state.fail}</p>
        </div>
      </Modal>
    );
    const stepThree = () => {
      const columns = [{
        title: '物料编号',
        dataIndex: 'code',
        key: 'code',
        width: 160,
        render: (text, record) => <div>{text}</div>,
      }, {
        title: '更新的内容',
        dataIndex: 'reason',
        key: 'reason',
        render: (text, record) => <div>{text}</div>,
      }];
      const { selectedRowKeys } = this.state;
      const onSelectChange = (selectedRowKeys) => {
        const selectData = this.state.abnormalData.filter((val) => {
          return selectedRowKeys.indexOf(val.id) !== -1;
        });
        const materials = [];
        selectData.forEach((val) => {
          const { code, name, unitName, desc } = val;
          materials.push({ code, name, unitName, desc });
        });
        this.setState({
          selectedRowKeys,
          materials: splitRequestData(materials),
        });
      };
      const rowSelection = {
        selectedRowKeys,
        onChange: selectedRowKeys => onSelectChange(selectedRowKeys),
      };
      return (
        <div className={styles.stepThreeWrapper}>
          <div className="top">
            <Icon width={36} type="check-circle" />
            <div className="right">
              {/* <h3>导入完成!</h3> */}
              <p>成功数：{this.state.success}，失败数：{this.state.fail}</p>
              <p>以下{this.state.abnormal}个物料存在相同物料编号和单位，请选择需要更新的物料：</p>
            </div>
          </div>
          <div className="middle">
            <Table
              hideDefaultSelections
              rowSelection={rowSelection}
              columns={columns}
              dataSource={this.state.abnormalData}
              pagination={false}
              scroll={{ y: 240 }}
              style={{ width: '100%', margin: '0 auto' }}
              rowClassName={(record, index) => 'import-table-tr'}
              rowKey={record => record.id}
            />
          </div>
          <div className="bottom">
            {/* <Button type="ghost">导入日志</Button> */}
            <Button
              type="ghost"
              onClick={() => {
                this.setState({
                  visible: false,
                });
              }}
            >暂不更新</Button>
            <Button
              type="primary"
              disabled={this.state.selectedRowKeys.length === 0}
              onClick={() => {
                if (this.state.selectedRowKeys.length === 0) {
                  message.warning('请选择需要更新的物料记录');
                } else {
                  this.setState({
                    percent: 0,
                    // abnormalData: [],
                    steps: 2,
                  }, () => {
                    this.sendMaterials(this.state.materials);
                  });
                }
              }}
            >更新</Button>
          </div>
        </div>
      );
    };

    const lastStep = (
      <Modal
        title=""
        visible={this.state.visible}
        onCancel={this.hideModal}
        footer={importLogBtn}
        className={styles.importModal}
        width="420px"
        height="200px"
      >
        <div id="import-last-step" className={styles.lastStepWrapper}>
          <Icon width={36} type={this.state.success === 0 ? 'close-circle' : 'check-circle'} />
          <div className="text">
            {this.state.success === 0 ? <h3>导入失败!</h3> : <h3>导入完成!</h3>}
            <p>成功数：{this.state.success}，失败数：{this.state.fail}</p>
          </div>
        </div>
    </Modal>);
    let modalBody;
    if (this.state.steps === 1 && !this.state.uploaded) {
      modalBody = stepOne();
    }
    if (this.state.steps === 2 && this.state.uploaded) {
      modalBody = stepTwo;
    }
    // if (this.state.steps === 3 && this.state.uploaded) {
    //   modalBody = stepThree();
    // }
    if (this.state.steps === 4 && !this.state.uploaded) {
      modalBody = lastStep;
    }
    return modalBody;
  };

  async sendMaterials(imports) {
    const json = {  // 拼成 json 数据
      importId: Math.random().toString(36).substr(2),
      updateFlag: 0,
    };
    this.setState({
      importId: json.importId,
    });
    let times = 0; // 发送的次数
    for (const node of imports) {
      times += 1;
      json.materials = node;
      const { data } = await importMaterials(json);
      this.setState({
        success: data.data.successAmount + this.state.success,
        fail: data.data.failureAmount + this.state.fail,
        percent: parseInt((times / imports.length) * 100, 10),
      }, () => {
        if (this.state.percent >= 100) {
          this.setState({
            steps: 4,
            uploaded: false,
          });
        }
      });
    }
  }
  // async getAbnormalData() {
  //   const res = await queryMaterialImportDetail(this.state.importId);
  //   const { data } = res.data;
  //   this.setState({
  //     abnormal: res.data.data.length,
  //     abnormalData: res.data.data,
  //   }, () => {
  //     if (this.state.abnormal > 0) {
  //       this.setState({
  //         materials: [],
  //         steps: 3,
  //       });
  //     } else {
  //       this.setState({
  //         materials: [],
  //         steps: 4,
  //       });
  //     }
  //   });
  // }
  hideModal = () => {
    this.setState({
      visible: false,
      steps: 0,
    });
  }
  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  }
  canFileUpload = (file) => {
    if (!file) {
      return {};
    }
    const fileType = file.type || null;
    const isCSV = fileType === 'text/csv';
    const isLessThan10M = file.size / 1024 / 1024 < 10;
    if (!isCSV) {
      return {
        message: '附件只支持.csv类型',
        res: false,
      };
    }
    if (!isLessThan10M) {
      return {
        message: '附件大小不能超过10M',
        res: false,
      };
    }
    return {
      res: true,
    };
  };
  handleChange = ({ file, fileList }) => {
    const judgeResult = this.canFileUpload(file) || {};
    if (judgeResult.res) {
      this.setState({
        fileList,
        loading: true,
      });
      return true;
    }
    if (judgeResult.message) {
      message.error(judgeResult.message);
      return false;
    }
    return null;
  }

  render() {
    const props = this.props;
    const modalBody = this.renderModal();
    return (
      <Modal
        visible={this.state.visible}
        onCancel={this.hideModal}
        footer={null}
        className={styles.importModal}
        width="580px"
      >
        {modalBody}
      </Modal>
    );
  }
}


ImportModal.contextTypes = {
  router: PropTypes.object.isRequired,
};

const GetImportModal = (
  props: {},
) => {
  const div = document.createElement('div');
  const { item, ...rest } = props;
  div.className = 'importModalContainer';
  ReactDOM.render(
    <ImportModal
      item={item}
      {...rest}
    />,
    div,
  );
};

export default GetImportModal;
