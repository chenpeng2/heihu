import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, message } from 'antd';
import 'whatwg-fetch';

import _ from 'lodash';
import Button from 'components/button';
import { getHeaders } from 'utils/request';
import network from 'configs/Network';
import { secondaryGrey } from 'src/styles/color';
import { getAttachments } from 'src/services/attachment';
import FormattedMessage from '../intl/MyFormattedMessage';
import AttachmentInlineView, { AttachmentFile } from './attachmentView/inlineView';
import AttachmentImageView from './attachmentView/imageView';
import ImgAttachments from './imgAttachment';
import IconViews from './attachmentView/iconView';
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
  extraText: String,
  max: number,
  // 限制上传类型，值为'image'和'pdf'
  limit: string,
  maxSize: number,
  style: {},
  tipStyle: {},
  extraText: string,
  rest: boolean,
  onPreview: () => {},
  disabled: boolean,
  valueIsId: boolean,
};

class Attachment extends Component {
  props: Props;

  state = {};

  componentWillMount() {
    const { value } = this.props;
    this.setAntdFileList(value);
  }

  componentDidMount() {
    const { valueIsId, value } = this.props;
    if (valueIsId && value) {
      getAttachments(value).then(({ data: { data } }) => {
        this.setAntdFileList(data);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((this.state.value || nextProps.value) && this.state.value !== nextProps.value) {
      if (!this.props.valueIsId) {
        const { value } = nextProps;
        this.setAntdFileList(value);
      }
    }
  }

  setAntdFileList = value => {
    this.setState({
      value,
      fileList: value && this.valueToAntdFileList(value),
    });
  };

  valueToAntdFileList = fileList => {
    const { onPreview } = this.props;
    const values =
      fileList &&
      fileList
        .filter(e => e)
        .map((file, index) => {
          const f = {
            uid: index,
            name: file.originalFileName || file.originalFilename,
            status: 'done',
            response: {
              data: {
                id: file.id,
              },
            },
          };
          if (typeof onPreview === 'function') {
            f.linkProps = '{"download": "image"}';
            f.url = file.url;
          }
          return f;
        });
    return values;
  };

  antdFileListTovalue = fileList => {
    // if (this.props.rest) {
    //   return fileList.map(file => ({
    //     id: file.response.restId || file.response.id,
    //     originalFileName: file.name,
    //     url: file.response.uri,
    //   }));
    // }
    return fileList.map(file => ({
      id: _.get(file, 'response.data.id'),
      restId: _.get(file, 'response.data.id'),
      originalFileName: file.name,
    }));
  };

  // 处理onChange事件，如果判断不通过直接返回
  handleChange = ({ file, fileList }) => {
    const { onChange, onUpload, disabled } = this.props;
    if (disabled) {
      return;
    }
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
    const { limit, maxSize } = this.props;
    const fileType = file.type || null;
    const isImage = fileType === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
    const isPDF = fileType === 'application/pdf';
    const isLessThanMaxSize = file.size / 1024 / 1024 < (maxSize || 10);
    if (!isLessThanMaxSize) {
      return {
        message: `附件大小不能超过${maxSize || 10}M`,
        res: false,
      };
    }
    if (limit === false) {
      // remove upload file type limit
      return {
        res: true,
      };
    }
    if (limit === 'image' && !isImage) {
      return {
        message: '附件只支持.jpg/.png/.jpeg类型',
        res: false,
      };
    } else if (limit === 'pdf' && !isPDF) {
      return {
        message: '附件只支持.pdf类型',
        res: false,
      };
    }
    if (!(isImage || isPDF)) {
      return {
        message: '附件只支持.jpg/.png/.jpeg/.pdf类型',
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
    const {
      children,
      prompt,
      buttonStyle,
      max,
      limit,
      maxSize,
      extraText,
      style,
      tipStyle,
      disabled,
      ...rest
    } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { fileList } = this.state;
    const defaultProps = getDefaultProps();
    return (
      <div
        className={this.state.fileList && this.state.fileList.length !== 0 ? 'uploadBox' : null}
        style={{ display: !prompt ? 'flex' : 'block', ...style }}
      >
        <Upload
          {...defaultProps}
          {...rest}
          onChange={this.handleChange}
          headers={getHeaders()}
          fileList={this.state.fileList}
          beforeUpload={this.beforeUpload}
          disabled={disabled || (max ? fileList && fileList.length >= max : false)}
        >
          {children || (
            <div>
              <Button
                disabled={disabled || (max ? fileList && fileList.length >= max : false)}
                style={{ ...buttonStyle }}
                ghost
                icon="upload"
              >
                上传文件
              </Button>
            </div>
          )}
        </Upload>
        {prompt || (
          <div style={{ color: secondaryGrey, marginLeft: 130, position: 'absolute', width: 600, top: 0, ...tipStyle }}>
            <FormattedMessage
              defaultMessage={'附件支持类型：{type}，{amount}最大不能超过{maxSize}M'}
              values={{
                type: limit ? (limit === 'image' ? 'JPG/PNG/JPEG' : 'PDF') : 'JPG/PNG/JPEG/PDF',
                amount: max ? changeChineseTemplateToLocale('最多{max}个文件，', { max }) : '',
                maxSize: maxSize || 10,
              }}
            />
            <span>{extraText || null}</span>
          </div>
        )}
      </div>
    );
  }
}

Attachment.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

Attachment.InlineView = AttachmentInlineView;
Attachment.ImageView = AttachmentImageView;
Attachment.AttachmentFile = AttachmentFile;
Attachment.ImgAttachments = ImgAttachments;
Attachment.IconViews = IconViews;

export default Attachment;
