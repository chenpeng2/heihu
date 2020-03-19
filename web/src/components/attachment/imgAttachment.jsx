import React, { Component } from 'react';
import { Upload, message, Icon } from 'antd';
import _ from 'lodash';
import 'whatwg-fetch';
import Button from 'components/button';
import { getHeaders } from 'utils/request';
import network from 'configs/Network';
import { fontSub } from 'styles/color';
import AttachmentInlineView, { AttachmentFile } from './attachmentView/inlineView';
import AttachmentImageView from './attachmentView/imageView';
import './styles.scss';

/**
 * 在form中使用时需要加上valuePropName这个option，不然是无法使用的
 *
 * @api {Attachment} 附件上传.
 * @APIGroup Attachment.
 * @apiParam {Function} onChange -在this.props里有rcForm封装的onChange事件，当值变得时候要调用这个
 * @apiParam {String} value -
 * @apiParam {React.node} children -
 * @apiExample {js} Example usage:
 * <FormItem label="附件" {...formItemLayout} style={defaultFormItemStyle} >
 {getFieldDecorator('files', {
   valuePropName: 'value',
 })(<Attachment />)}
 </FormItem>
 这个有待补充
 */

const getDefaultProps = () => {
  const reg = /\/$/;
  const apiUrl = network.API.replace(reg, '');
  const action = `${apiUrl}/filebase/v1/files/_upload`;
  return { action };
};

type Props = {
  onChange: () => {},
  onUpload: () => {},
  value: String,
  children: React.node,
  prompt: any,
  buttonStyle: {},
  buttonType: String,
  style: {},
  maxCount: number,
};

class Attachment extends Component {
  props: Props;

  state = {};

  componentWillMount() {
    this.setState({
      value: this.props.value && this.props.value,
      fileList: this.props.value && this.valueToAntdFileList(this.props.value),
    });
  }

  componentWillReceiveProps(nextProps) {
    if ((this.state.value || nextProps.value) && this.state.value !== nextProps.value) {
      this.setState({
        value: nextProps.value,
        fileList: this.valueToAntdFileList(nextProps.value),
      });
    }
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  lowerCaseExtension = url => {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    const filename = temp[temp.length - 1];
    const filenameWithoutSuffix = filename.split(/\#|\?/)[0];
    const extension = (/\.[^./\\]*$/.exec(filenameWithoutSuffix) || [''])[0];
    return url.replace(extension, extension.toLowerCase());
  };

  valueToAntdFileList = fileList => {
    const values =
      fileList &&
      fileList.filter(e => e).map((file, index) => {
        return {
          uid: index,
          name: file.originalFileName,
          status: 'done',
          response: {
            data: {
              id: file.id,
            },
          },
          url: this.lowerCaseExtension(file.url),
          thumbUrl: file.thumbUrl,
        };
      });
    return values;
  };

  antdFileListTovalue = fileList => {
    console.log(fileList);
    return fileList.map(file => ({
      id: _.get(file, 'response.data.id'),
      restId: _.get(file, 'response.data.id'),
      originalFileName: file.name,
      url: _.get(file, 'response.data.uri'),
      thumbUrl: file.thumbUrl,
    }));
  };

  // 处理onChange事件，如果判断不通过直接返回
  handleChange = ({ file, fileList }) => {
    const { onChange, onUpload } = this.props;
    if (file.status === 'removed') {
      this.setState(
        {
          fileList,
          value: this.antdFileListTovalue(fileList),
        },
        () => {
          if (onChange) {
            onChange(this.antdFileListTovalue(fileList));
          }
        },
      );
      return;
    }
    if (!this.canFileUpload(file).res) {
      return;
    }
    if (
      fileList.find(file => {
        return file.status !== 'done';
      })
    ) {
      this.setState(
        {
          fileList,
          value: 'uploading',
        },
        () => {
          if (onChange) {
            onChange('uploading');
          }
        },
      );
    } else {
      this.setState(
        {
          fileList,
          value: this.antdFileListTovalue(fileList),
        },
        () => {
          if (onChange) {
            onChange(this.antdFileListTovalue(fileList));
          }
          if (onUpload) {
            onUpload(this.antdFileListTovalue(fileList));
          }
        },
      );
    }
  };

  // 文件是否可以上传的判断
  canFileUpload = file => {
    if (!file) {
      return {};
    }
    const fileType = file.type || null;
    const isImage = fileType === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
    const isLessThan10M = file.size / 1024 / 1024 < 10;
    if (!isImage) {
      return {
        message: '附件只支持.jpg/.png/.jpeg类型',
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

  // 文件上传之前的hook
  beforeUpload = file => {
    const judgeResult = this.canFileUpload(file) || {};
    if (judgeResult.res) {
      return true;
    }
    if (judgeResult.message) {
      message.error(judgeResult.message);
    }
    return false;
  };

  render() {
    const { children, prompt, style, maxCount, ...rest } = this.props;
    const { fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" style={{ transform: 'scale(3)', color: fontSub }} />
      </div>
    );
    const defaultProps = getDefaultProps();
    return (
      <div style={{ width: 500, ...style }}>
        <Upload {...defaultProps} {...rest} onChange={this.handleChange} headers={getHeaders()} fileList={fileList} beforeUpload={this.beforeUpload}>
          {fileList && fileList.length >= maxCount ? null : uploadButton}
        </Upload>
      </div>
    );
  }
}

Attachment.InlineView = AttachmentInlineView;
Attachment.ImageView = AttachmentImageView;
Attachment.AttachmentFile = AttachmentFile;

export default Attachment;
