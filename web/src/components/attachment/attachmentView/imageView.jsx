import React, { Component } from 'react';
import _, { chunk } from 'lodash';
import { openModal } from 'components';
import { wrapUrl, download } from 'src/utils/attachment';
import { getAttachments } from 'src/services/attachment';
import { greyWhite } from 'src/styles/color';

/**
 * @api {AttachmentImageView} 图片附件.
 * @APIGroup AttachmentImageView.
 * @apiParam {Obj} attachment 不填return null;后端拿到的attachment字段.
 * @apiExample {js} Example usage:
 * <AttachmentImageView attachment={attachment} />
 */

const bodyStyle = {
  padding: '20px 55px 68px 55px',
};

const titleStyle = {
  fontSize: 14,
  paddingLeft: 20,
};

type Props = {
  attachment: {},
  showTitle: boolean,
  wrapperStyle: {},
  actionStyle: {},
};

class AttachmentImageView extends Component {
  props: Props;

  state = {
    attachment: null,
  };

  componentWillMount() {
    const { attachment } = this.props;
    if (
      !_.get(attachment, 'files[0].originalFileName') &&
      (_.get(attachment, 'files[0].id') || _.get(attachment, 'files[0].id') === 0)
    ) {
      this.fetchAttachments(attachment.files.map(n => n.id));
    }
  }

  fetchAttachments = params => {
    getAttachments(params).then(res => {
      const data = res.data.data || [];
      this.setState({
        attachment: {
          files: data.length
            ? data.map(file => {
                return {
                  ...file,
                  originalFileName: file.originalFileName || file.original_filename || file.originalFilename,
                  originalExtension: file.original_extension || file.originalExtension,
                };
              })
            : null,
        },
      });
    });
  };

  getFileType = f => {
    const { originalExtension } = f;
    if (!originalExtension) {
      return null;
    }
    const imageType = ['.jpeg', '.jpg', '.png', '.JPG', '.PNG', '.JPEG', 'jpeg', 'jpg', 'png', 'JPG', 'PNG', 'JPEG'];

    if (originalExtension === 'pdf' || originalExtension === '.pdf') {
      return 'pdf';
    }

    if (imageType.indexOf(originalExtension) !== -1) {
      return 'image';
    }

    return null;
  };

  renderPdf = fileUrl => {
    return <embed src={fileUrl} style={{ width: 150, height: 100 }} />;
  };

  renderImg = fileUrl => {
    return <img src={fileUrl} alt="" style={{ width: 150, height: 100 }} />;
  };

  renderFile = file => {
    const { id } = file;
    const fileType = this.getFileType(file);
    const url = wrapUrl(id);

    return (
      <div style={{ background: greyWhite, width: 150, height: 100 }}>
        {fileType === 'pdf' ? this.renderPdf(url) : null}
        {fileType === 'image' ? this.renderImg(url) : null}
      </div>
    );
  };

  render() {
    const { showTitle, wrapperStyle, actionStyle } = this.props;
    const attachment = this.state.attachment || this.props.attachment;
    if (!attachment) {
      return null;
    }
    return (
      <div>
        {showTitle ? <div style={titleStyle}>附件</div> : null}
        <div style={{ ...bodyStyle, ...wrapperStyle }}>
          {attachment.files
            ? chunk(attachment.files, 4).map(fourFiles => {
                return fourFiles.map(file => {
                  const { id } = file;
                  const originalFileName =
                    file.originalFileName || file.original_filename || file.originalFilename || file.name;
                  return (
                    <div
                      key={id}
                      style={{
                        margin: '0px 30px 10px 0px',
                        textAlign: 'center',
                        display: 'inline-block',
                        width: 150,
                        height: 160,
                        verticalAlign: 'top',
                        position: 'relative',
                      }}
                    >
                      {this.renderFile(file)}
                      <div
                        style={{
                          margin: '5px 0px',
                          wordBreak: 'break-all',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                        }}
                      >
                        {originalFileName}
                      </div>
                      <div
                        style={{
                          background: greyWhite,
                          width: 150,
                          borderRadius: 2,
                          position: 'absolute',
                          bottom: 0,
                          padding: '0 25px',
                          display: 'flex',
                          justifyContent: 'space-around',
                          alignItems: 'center',
                          ...actionStyle,
                        }}
                      >
                        <a onClick={() => window.open(wrapUrl(id))} target="_blank">
                          预览
                        </a>
                        <a onClick={() => download(wrapUrl(id), originalFileName)} download target="_blank">
                          下载
                        </a>
                      </div>
                    </div>
                  );
                });
              })
            : '没有附件'}
        </div>
      </div>
    );
  }
}

export default AttachmentImageView;
