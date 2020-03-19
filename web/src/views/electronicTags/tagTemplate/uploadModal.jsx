import React, { Component } from 'react';
import _ from 'lodash';
import { Upload, Modal } from 'antd';

import { getHeaders } from 'utils/request';
import network from 'configs/Network';
import { primary } from 'src/styles/color';
import { Button, message, Spin } from 'components';
import { uploadAttachment } from 'src/services/attachment';
import { createPrintTagTemplate, updatePrintTagTemplate } from 'src/services/electronicTag/template';

import styles from './uploadModal.scss';

// 上传的类型，是更新还是增加
export const UPLOAD_TYPE = {
  add: { value: 'add' },
  update: { value: 'update' },
};

type Props = {
  uploadType: string, // 是更新还是上传
  type: String,
  maxSize: Number,
  data: {},
  refetch: () => {},
  closeModal: () => {},
};

export default class UploadModal extends Component {
  props: Props;
  state = {
    fileList: [],
    uploading: false,
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

  beforeUpload = file => {
    const judgeResult = this.canFileUpload(file) || {};
    if (judgeResult.res) {
      this.setState(state => ({
        fileList: [...state.fileList, file],
      }));
      return true;
    }
    if (judgeResult.message) {
      message.error(judgeResult.message);
    }
    return false;
  };

  handleRemove = file => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      return {
        fileList: newFileList,
      };
    });
  };

  getUploadProps = () => {
    const reg = /\/$/;
    const apiUrl = network.API.replace(reg, '');
    const action = `${apiUrl}/filebase/v1/files/_upload`;

    return {
      action,
      name: 'file',
      headers: getHeaders(),
      beforeUpload: this.beforeUpload,
      onChange: this.handleChange,
      multiple: false,
      accept: '.prn',
      onRemove: this.handleRemove,
    };
  };

  handleUploadResult = ({ statusCode, successMsg, errorMsg }) => {
    const { refetch, closeModal } = this.props;
    if (typeof closeModal === 'function') closeModal();
    if (statusCode === 200) {
      message.success(successMsg);
      if (typeof refetch === 'function') refetch();
      return;
    }
    message.error(errorMsg);
  };

  uploadPrintTagTemplate = async attachmentId => {
    const { data, uploadType, type: typeId } = this.props;
    const { id, type } = data || {};

    if (uploadType === UPLOAD_TYPE.add.value) {
      await createPrintTagTemplate({ attachmentId, type: typeId }).then(({ data: { statusCode } }) => {
        this.handleUploadResult({ statusCode, successMsg: '上传成功！', errorMsg: '上传失败！' });
      });
      return;
    }

    if (uploadType === UPLOAD_TYPE.update.value) {
      await updatePrintTagTemplate({ id, attachmentId, type }).then(({ data: { statusCode } }) => {
        this.handleUploadResult({ statusCode, successMsg: '更新成功！', errorMsg: '更新失败！' });
      });
    }
  };

  handleChange = ({ file, fileList }) => {
    const statusCode = _.get(file, 'response.statusCode');

    if (statusCode === 200) {
      const attachmentId = _.get(file, 'response.data.id');
      this.uploadPrintTagTemplate(attachmentId);
    }
  };

  renderButton = () => {
    return (
      <Spin spinning={this.state.uploading}>
        <Button
          disabled={_.get(this.state, 'fileList.length') <= 0}
          onClick={async () => {
            this.setState({ uploading: true });
            await uploadAttachment(_.get(this.state, 'fileList[0]')).then(({ data: { statusCode, data } }) => {
              if (statusCode === 200) {
                const { id } = data || {};
                this.uploadPrintTagTemplate(id);
              } else {
                message.error('上传失败！');
              }
            });
          }}
        >
          开始上传
        </Button>
      </Spin>
    );
  };

  render() {
    const props = this.getUploadProps();

    return (
      <div>
        <Modal
          title="上传标签模板"
          destroyOnClose
          afterClose={() => this.setState({ fileList: [] })}
          onCancel={this.props.closeModal}
          footer={null}
          className={styles.uploadModal}
          width="580px"
          height="462px"
          {...this.props}
        >
          <div>
            <p>
              请上传
              <i style={{ color: primary, fontStyle: 'normal' }}>「{this.props.typeName}」</i>
              的标签模板
            </p>
            <Upload className="uploadBox" {...props}>
              <Button icon="upload" ghost disabled={_.get(this.state, 'fileList.length') > 0}>
                上传文件
              </Button>
              <p className="upload-tip">
                附件支持类型：.prn，最大不能超过
                {this.props.maxSize || 10}M
              </p>
            </Upload>
          </div>
        </Modal>
      </div>
    );
  }
}
