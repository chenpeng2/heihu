import React, { Component } from 'react';
import _ from 'lodash';
import { Popconfirm } from 'antd';

import { Icon, Row, Col, Text } from 'src/components';
import { stringEllipsis } from 'utils/string';
import { middleGrey, white, greyWhite } from 'src/styles/color';
import { getAttachments } from 'src/services/attachment';
import { wrapUrl, download } from 'utils/attachment';
import styles from './styles.scss';

/**
 * @api {AttachmentView} 附件.
 * @APIGroup AttachmentView.
 * @apiParam {Array} files 必填,从后端graphql拿到的files字段 [{ id, url, originalFileName }].
 * @apiParam {Function} onDeleteAttachment 选填,如果传入该字段会渲染删除 并调用该函数 如果不传则不显示删除.
 * @apiExample {js} Example usage:
 * <AttachmentView
 files={files}
 onDeleteAttachment={(file) => this.deleteMaterialAttachment(file)}
 />
 */

const attachmentContainerStyle = {
  flexWrap: 'wrap',
  backgrondColor: white,
};
const textStyle = {
  marginLeft: 20,
  minWidth: 28,
};

const getFileType = f => {
  const originalExtension = f.originalExtension || f.original_extension;
  if (!originalExtension) {
    return null;
  }
  const imageType = ['.jpeg', '.jpg', '.png', '.JPG', '.PNG', '.JPEG', 'jpeg', 'jpg', 'png', 'JPG', 'PNG', 'JPEG'];

  if (originalExtension === 'pdf') {
    return 'pdf';
  }

  if (imageType.indexOf(originalExtension) !== -1) {
    return 'image';
  }

  return null;
};
const renderPdf = fileUrl => {
  return <embed src={fileUrl} style={{ width: 450, height: 300 }} type="application/pdf" />;
};

const renderImg = fileUrl => {
  return <img src={fileUrl} alt="" style={{ width: 450, height: 300 }} />;
};

const renderFile = file => {
  const { id } = file;
  const fileType = getFileType(file);
  const url = wrapUrl(id);

  return (
    <div style={{ background: greyWhite, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
      {fileType === 'pdf' ? renderPdf(url) : null}
      {fileType === 'image' ? renderImg(url) : null}
    </div>
  );
};

export const AttachmentFile = (files, onDeleteAttachment, options) => {
  const { style, filesStyle, iconContainerStyle } = options || {};
  return (
    <div style={Object.assign({}, attachmentContainerStyle, style || {})}>
      {files.map((file, index) => {
        const originalFileName = file.originalFileName || file.original_filename || file.originalFilename || file.name;
        const fileType = getFileType(file);
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }} key={`file-${index}`}>
            <div style={{ display: 'flex', alignItems: 'center', ...iconContainerStyle }}>
              <Icon style={{ color: middleGrey }} type="paper-clip" />
            </div>
            <div classnName={styles.filesStyle} style={filesStyle}>
              {stringEllipsis(originalFileName, 40)}
            </div>
            <div style={{ marginLeft: 10, display: 'flex' }}>
              {fileType === 'pdf' || fileType === 'image' ? (
                <div style={textStyle}>
                  <a
                    onClick={() => {
                      window.open(wrapUrl(file.id));
                    }}
                  >
                    <Text>预览</Text>
                  </a>
                </div>
              ) : null}
              <div style={textStyle}>
                <a onClick={() => download(wrapUrl(file.id), originalFileName)} download target="_blank">
                  <Text>下载</Text>
                </a>
              </div>
              {onDeleteAttachment ? (
                <div style={textStyle}>
                  <div>
                    <Popconfirm
                      title="确认要删除该附件吗？"
                      onConfirm={() => {
                        onDeleteAttachment(file);
                      }}
                      okText="确认"
                      cancelText="取消"
                    >
                      <a>
                        <Text>删除</Text>
                      </a>
                    </Popconfirm>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type Props = {
  files: [{}],
  onDeleteAttachment: () => {},
  style: {},
  fileStyle: {},
  hideTitle: boolean,
  titleStyle: {},
  contentStyle: {},
};

class AttachmentView extends Component {
  props: Props;

  state = {};

  async componentDidMount() {
    const { files } = this.props;
    if (files && Array.isArray(files) && Object.prototype.toString.call(files[0]) !== '[object Object]') {
      const res = await getAttachments(files);
      const filesData = _.get(res, 'data.data');
      this.setState({ filesData });
    }
  }

  render() {
    const { files, onDeleteAttachment, style, hideTitle, titleStyle, contentStyle } = this.props;
    const { filesData } = this.state;
    const _filesData = filesData || files;

    return _filesData && _filesData.length ? (
      <div style={{ width: '100%', paddingBottom: 14, ...style }}>
        <Row style={{ marginRight: 40 }}>
          {!hideTitle ? (
            <Col type={'title'} style={{ alignSelf: 'flex-start', ...titleStyle }}>
              {'附件'}
            </Col>
          ) : null}
          <Col style={contentStyle} type={'content'}>
            {AttachmentFile(_filesData, onDeleteAttachment)}
          </Col>
        </Row>
      </div>
    ) : null;
  }
}

export default AttachmentView;
