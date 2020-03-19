import React from 'react';
import { wrapUrl, download } from 'utils/attachment';

const ImagePreview = ({ url, filename }: any) => {
  const imageUrl = wrapUrl(url);
  return (
    <div className="ant-upload-list ant-upload-list-picture-card">
      <div className="ant-upload-list-item ant-upload-list-item-done">
        <div className="ant-upload-list-item-info">
          <span>
            <a className="ant-upload-list-item-thumbnail" href={imageUrl} target="_blank" rel="noopener noreferrer">
              <img src={imageUrl} alt={filename} />
            </a>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="ant-upload-list-item-name" title="">
              {filename}
            </a>
          </span>
        </div>
        <span className="ant-upload-list-item-actions">
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" title="预览文件">
            <i className="anticon anticon-eye-o" />
          </a>
          <a onClick={() => download(imageUrl, filename)} title="下载文件" download="file">
            <i className="anticon anticon-delete anticon-download" />
          </a>
        </span>
      </div>
    </div>
  );
};

export default ImagePreview;
