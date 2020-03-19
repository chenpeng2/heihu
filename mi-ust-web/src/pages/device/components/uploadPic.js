import React, { PureComponent } from 'react';
import { Upload, Modal, message, Icon } from 'antd';
import { getBase64 } from 'util/index'

class UploadPicture extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: [],
          };
    }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  isPic = (file) => {
      return file.type === 'image/jpeg' || file.type === 'image/png'
  }

  isLt2M = (file) => {
      return file.size / 1024 / 1024 < 2
  }

  handleBeforeUpload = (file) => {
    if ( !this.isPic(file) ) {
      message.error('文件格式必须为.jpg，.gif或者.png!');
    }
    if ( !this.isLt2M(file) ) {
      message.error('文件大小最多为2M！');
    }
    return false;
  }

  handleChange = ({ fileList, file }) => {
    if ( !this.isPic(file) ||  !this.isLt2M(file) ) {
        return
    }
    this.setState({ fileList });
  }

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <Upload
          action=""
          listType="picture-card"
          fileList={ fileList }
          onPreview={ this.handlePreview }
          beforeUpload={ this.handleBeforeUpload }
          onChange={ this.handleChange }
        >
          {fileList.length >= 1 ? null : <Icon type="plus" /> }
        </Upload>
        <div>.jpg，.gif或者.png。文件大小最多为2M。</div>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

export default UploadPicture