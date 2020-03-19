import React, { Component } from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { addLocaleData, IntlProvider } from 'react-intl';
import { LocaleProvider, Modal, Upload, Progress, Icon } from 'antd';

import { getLocale, getInitialLanguageType, changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import GcLocaleProvider from 'src/utils/locale/GcLocaleProvider';
import { Button, Table, Link, FormattedMessage } from 'src/components';
import { splitRequestDataByFifty, arrayIsEmpty } from 'src/utils/array';
import request from 'src/utils/request';
import { exportXlsxFile } from 'utils/exportFile';
import parseFile, { keysToObj, parseXlsxfile } from 'src/utils/parseFile';
import { replaceSign } from 'src/constants';

import message from '../message';

import styles from './importModal.scss';

type Props = {
  item: String, // 导入对象
  fileTypes: String, // 文件类型
  context: any,
  templateUrl: String, // 导入模板下载地址
  logUrl: String, // 日志地址
  titles: Array, // 导入数据列名
  method: () => {}, // 不同的导入接口
  updateMethod: () => {}, // 导入更新接口
  listName: String, // 接口其中的一个参数名称
  maxSize: number, // 文件大小上限
  splitData: () => {}, // 自定义拆分数据方法
  onSuccess: () => {}, // 导入完成后执行的方法
  refetch: {}, // 用于导入后自动刷新页面
  dataFormat: () => {}, // 如果keysToObj不满足要求。自定义数据的格式化
  fileDataStartLocation: any, // 如果导入文件的数据开始不是第一行。那么要指定是第几行开始的
  customContentForLastStep: () => {}, // lastStep的自定义内容显示。参数是state(这个组件的state), modalOperation(对modal的操作)
  multiImport: Boolean, // 是否有多个导入文件，此时item，titles，method，templateUrl为List<List<...>>结构，且不用item作为导入modal的标题，需另传title
  title: String, // 不用item作为modal的title时传入
  extraActionStepConfirm: () => {}, // 操作步骤处额外的提醒信息,
  splitKey: [String], // splitKey为以哪个字段作为切分标志，保证本次导入数据完整，适用于生产Bom、入库单等一对多的情况
};
class ImportModal extends Component {
  props: Props;
  state = {
    visible: false,
    fileList: [],
    uploaded: false,
    isUpdate: false,
    steps: 0,
    percent: 0,
    success: 0,
    abnormal: 0,
    fail: 0,
    imports: [],
    abnormalData: [],
    selectedRowKeys: [],
    updateItems: [],
    total: 0,
    allResponse: [], // sendData的每一次返回内容。用来做自定义的step render
  };

  componentWillMount() {
    const { item, titles, templateUrl, template, method } = this.props;
    let _templateUrl = [];
    if (templateUrl) {
      _templateUrl = !arrayIsEmpty(templateUrl) ? templateUrl : [templateUrl];
    }
    if (template) {
      _templateUrl.push(template);
    }
    this.setState({
      steps: 1,
      item,
      titles,
      templateUrl: _templateUrl,
      method,
    });
  }

  componentDidMount() {
    this.setState({
      visible: true,
      uploaded: false,
    });
  }

  sendData = async (json, type) => {
    const { listName, updateMethod, refetch } = this.props;
    const { imports, method } = this.state;
    const importMethod = type === 'update' ? updateMethod : method;
    let times = 0; // 当前发送次数
    for (const node of imports) {
      times += 1;
      json[`${listName}`] = node;
      try {
        const res = await importMethod(json);
        const { successAmount, failureAmount, updateItems } = _.get(res, 'data.data');
        this.setState(
          {
            success: successAmount + this.state.success,
            fail: failureAmount + this.state.fail,
            updateItems: updateItems && updateItems.length && updateItems.concat(this.state.updateItems),
            percent: parseInt((times / imports.length) * 100, 10),
            allResponse: this.state.allResponse.concat([res]),
          },
          () => {
            if (updateItems && updateItems.length) {
              this.setState({ steps: 3 });
              return;
            }
            if (this.state.percent >= 100) {
              this.setState({
                steps: 4,
                uploaded: false,
              });
            }
          },
        );
      } catch (error) {
        this.setState({
          visible: false,
        });
        message.error('导入失败！');
      }
    }
    const { onSuccess } = this.props;
    if (typeof onSuccess === 'function') {
      onSuccess(this.state);
    }
  };

  hideModal = () => {
    this.setState({
      visible: false,
      steps: 0,
    });
  };

  handleOk = e => {
    this.setState({
      visible: false,
    });
  };

  canFileUpload = file => {
    const { maxSize } = this.props;
    if (!file) {
      return {};
    }

    const isLessThanMaxSize = file.size / 1024 / 1024 < (maxSize || 10);
    if (!isLessThanMaxSize) {
      return {
        message: `附件大小不能超过${maxSize || 10}M`,
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
  };

  renderModal = () => {
    const { changeChineseToLocale } = this.context;
    const {
      customContentForLastStep,
      fileTypes,
      logUrl,
      splitData,
      dataFormat,
      withFileName,
      importIdName,
      template,
      fileDataStartLocation,
      multiImport,
      title,
      extraActionStepConfirm,
    } = this.props;
    const { item, titles, templateUrl, method } = this.state;
    const uploadProps = {
      onChange: this.handleChange,
      fileList: this.state.fileList,
      multiple: false,
      accept: fileTypes,
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        const fileName = _.get(file, 'name');
        let importIndex;
        if (multiImport) {
          importIndex = item.findIndex(file => fileName.indexOf(file) !== -1);
          if (importIndex !== -1) {
            this.setState({ titles: titles[importIndex], method: method[importIndex] });
          }
        }
        const callback = async res => {
          let _res = res;
          if (fileDataStartLocation) {
            _res = res.splice(fileDataStartLocation);
          }
          const data =
            typeof dataFormat === 'function'
              ? await dataFormat(_res, multiImport ? titles[importIndex] : titles)
              : keysToObj(_res, multiImport ? titles[importIndex] : titles);
          if (!Array.isArray(data)) {
            console.error('data需要是数组');
            return;
          }
          this.setState({
            total: res.length - 1,
            imports: typeof splitData === 'function' ? splitData(data) : splitRequestDataByFifty(data),
            fileName,
            // times: splitRequestData(data).length,
          });
        };
        if (fileTypes === '.xlsx' || (Array.isArray(fileTypes) && fileTypes.find(e => e === '.xlsx'))) {
          parseXlsxfile({ file, callback });
        } else {
          parseFile({
            file,
            callback,
          });
        }
        return false;
      },
    };
    const startImportBtn = (
      <Button
        icon="download"
        type="primary"
        disabled={this.state.fileList.length === 0}
        onClick={() => {
          this.setState(
            {
              steps: 2,
              uploaded: true,
            },
            () => {
              const json = {
                // 拼成 json 数据
                importId: Math.random()
                  .toString(36)
                  .substr(2),
              };
              if (withFileName) json.fileName = this.state.fileName || replaceSign;
              if (importIdName) json[importIdName] = json.importId;
              this.sendData(json);
            },
          );
        }}
      >
        开始导入
      </Button>
    );
    const importLogBtn = logUrl ? (
      <Link
        icon={'eye'}
        onClick={() => {
          this.setState({
            visible: false,
          });
          this.props.context.router.history.push(logUrl);
        }}
      >
        查看导入日志
      </Link>
    ) : (
      <div style={{ width: '100%', height: 40 }} />
    );

    const stepOne = () => {
      return (
        <Modal
          title={
            typeof title === 'string'
              ? changeChineseToLocale(title)
              : title || changeChineseToLocaleWithoutIntl('导入{type}', { type: item })
          }
          visible={this.state.visible}
          onCancel={this.hideModal}
          footer={startImportBtn}
          className={styles.importModal}
          width="580px"
          height="462px"
        >
          <div id="import-step-one" className={styles.stepOneWrapper}>
            <div className="import-steps">
              <FormattedMessage defaultMessage={'操作步骤'} />
              <span>:</span>
              <p>
                1.
                <FormattedMessage defaultMessage={'下载'} />
                {templateUrl.map((url, index) => (
                  <Link
                    onClick={() => {
                      if (typeof url === 'string') {
                        request
                          .get(url || 'http://www.baidu.com', {
                            responseType: 'blob',
                          })
                          .then(({ data }) => {
                            message.destroy();
                            const link = document.createElement('a');
                            let type;
                            if (Array.isArray(fileTypes) && fileTypes.length) {
                              type = fileTypes[0];
                            } else if (typeof fileTypes === 'string') {
                              type = fileTypes;
                            } else {
                              type = '.csv';
                            }
                            link.href = window.URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
                            link.download = `${multiImport ? item[index] : item}模板${type}`;
                            link.click();
                          });
                      } else {
                        const { remark, titles, name } = url;
                        exportXlsxFile([[remark], titles], name);
                      }
                    }}
                  >
                    《导入
                    {multiImport ? item[index] : item}
                    模板》
                  </Link>
                ))}
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
              {extraActionStepConfirm && extraActionStepConfirm()}
            </div>
            <Upload
              disabled={this.state.fileList.length === 1}
              className={this.state.fileList && this.state.fileList.length !== 0 ? 'uploadBox' : null}
              {...uploadProps}
            >
              <Button icon="upload" ghost disabled={this.state.fileList.length === 1}>
                上传文件
              </Button>
              <p className="upload-tip">
                <FormattedMessage
                  defaultMessage={'附件支持类型：{type}，{amount}最大不能超过{maxSize}M'}
                  values={{
                    type: Array.isArray(fileTypes) ? fileTypes.join(',') : fileTypes,
                    amount: '',
                    maxSize: 10,
                  }}
                />
              </p>
            </Upload>
          </div>
        </Modal>
      );
    };

    const stepTwo = (
      <Modal
        title={
          typeof title === 'string'
            ? changeChineseToLocale(title)
            : title || changeChineseToLocaleWithoutIntl('导入{type}', { type: item })
        }
        visible={this.state.visible}
        onCancel={this.hideModal}
        footer={null}
        className={styles.importModal}
        width="580px"
        height="462px"
      >
        <div id="import-step-two" className={styles.stepTwoWrapper}>
          <Progress type="circle" percent={this.state.percent} width={80} className={styles.progressContainer} />
          <p>{changeChineseToLocaleWithoutIntl('{type}导入中...', { type: title || item })}</p>
          <p>
            <FormattedMessage
              defaultMessage={'成功数:{amount1},失败数{amount2}'}
              values={{
                amount1: this.state.success,
                amount2: this.state.fail,
              }}
            />
          </p>
        </div>
      </Modal>
    );
    const stepThree = () => {
      const columns = [
        {
          title: '编号',
          dataIndex: 'db',
          key: 'db',
          width: 160,
          render: data => data.code || replaceSign,
        },
        {
          title: '更新的内容',
          dataIndex: 'diff',
          key: 'diff',
          render: (diff, record) => {
            const { db, import: _import } = record;
            const diffField = diff.map(n => n.field);
            const diffFieldName = diff.map(n => n.fieldName);
            const oldLog = diffField.map(n => db[n]);
            const newLog = diffField.map(n => _import[n]);
            const updateContent = diffFieldName.map((name, index) => {
              if (oldLog[index] || newLog[index]) {
                return `${name}从「${oldLog[index] || ''}」改为「${newLog[index] || ''}」`;
              }
              return null;
            });
            return _.compact(updateContent).join('，');
          },
        },
      ];
      const { selectedRowKeys, updateItems } = this.state;
      const onSelectChange = selectedRowKeys => {
        const selectData = updateItems.filter(val => {
          return selectedRowKeys.indexOf(val.db.code) !== -1;
        });
        const imports = selectData.map(n => n.import);
        this.setState({
          selectedRowKeys,
          imports: splitRequestDataByFifty(imports),
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
              <h3>
                <FormattedMessage defaultMessage={'导入完成'} /> !
              </h3>
              <p>
                <FormattedMessage
                  defaultMessage={'已成功数:{amount1},已失败数{amount2}'}
                  values={{
                    amount1: this.state.success,
                    amount2: this.state.fail,
                  }}
                />
              </p>
              <p>
                {changeChineseToLocale('请选择需要更新的{item}')}
                <span>:</span>
              </p>
            </div>
          </div>
          <div className="middle">
            <Table
              hideDefaultSelections
              rowSelection={rowSelection}
              columns={columns}
              dataSource={updateItems}
              pagination={false}
              scroll={{ y: 240 }}
              style={{ width: '100%', margin: '0 auto' }}
              rowKey={record => record.db.code}
            />
          </div>
          <div className="bottom">
            <Button
              type="ghost"
              onClick={() => {
                this.setState({
                  visible: false,
                });
              }}
            >
              暂不更新
            </Button>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              onClick={() => {
                this.setState({ percent: 0, steps: 2, isUpdate: true }, () => {
                  const json = {
                    // 拼成 json 数据
                    importId: Math.random()
                      .toString(36)
                      .substr(2),
                  };
                  this.sendData(json, 'update');
                });
              }}
            >
              更新
            </Button>
          </div>
        </div>
      );
    };

    const lastStep = (
      <Modal
        title=""
        visible={this.state.visible}
        onCancel={this.hideModal}
        footer={null}
        className={styles.importModal}
        width="420px"
        height="220px"
      >
        <div id="import-last-step" className={styles.lastStepWrapper}>
          {typeof customContentForLastStep === 'function' ? (
            customContentForLastStep(this.state, {
              closeModal: this.hideModal,
            })
          ) : (
            <React.Fragment>
              <Icon width={36} type={this.state.success === 0 ? 'close-circle' : 'check-circle'} />
              <div className="text">
                {this.state.success === 0 ? (
                  <h3>{changeChineseToLocale('导入失败!')}</h3>
                ) : (
                  <h3>{changeChineseToLocale('导入完成!')}</h3>
                )}
                {!this.state.isUpdate ? (
                  <p>
                    <FormattedMessage
                      defaultMessage={'成功数:{amount1},失败数{amount2}'}
                      values={{ amount1: this.state.success, amount2: this.state.fail }}
                    />
                  </p>
                ) : null}
                <div style={{ margin: !this.state.isUpdate ? '30px 0 60px' : '10px 0 30px' }}>{importLogBtn}</div>
              </div>
            </React.Fragment>
          )}
        </div>
      </Modal>
    );

    let modalBody;
    if (this.state.steps === 1 && !this.state.uploaded) {
      modalBody = stepOne();
    }
    if (this.state.steps === 2 && this.state.uploaded) {
      modalBody = stepTwo;
    }
    if (this.state.steps === 3 && this.state.uploaded) {
      modalBody = stepThree();
    }
    if (this.state.steps === 4 && !this.state.uploaded) {
      modalBody = lastStep;
    }
    return modalBody;
  };

  render() {
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
  changeChineseToLocale: PropTypes.any,
};

const GetImportModal = (props: {}) => {
  const div = document.createElement('div');
  const { item, logUrl, templateUrl, fileTypes, method, titles, listName, context, ...rest } = props;
  div.className = 'importModalContainer';

  // 国际化
  const languageType = getInitialLanguageType();
  const appLocale = getLocale(languageType);
  addLocaleData(...appLocale.data);

  ReactDOM.render(
    <LocaleProvider locale={appLocale.antd}>
      <IntlProvider locale={appLocale.locale} messages={appLocale.messages} formats={appLocale.formats}>
        <GcLocaleProvider locale={appLocale}>
          <ImportModal
            item={item}
            logUrl={logUrl}
            templateUrl={templateUrl}
            fileTypes={fileTypes}
            titles={titles}
            listName={listName}
            method={method}
            context={context}
            {...rest}
          />
        </GcLocaleProvider>
      </IntlProvider>
    </LocaleProvider>,
    div,
  );
};

export default GetImportModal;
