// 列表中的附件展示组件
import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { primary } from 'src/styles/color';
import { getAttachments } from 'src/services/attachment';

import Icon from '../../icon';
import openModal from '../../modal';
import AttachmentImageView from './imageView';

class IconView extends Component {
  state = {
    files: [],
  };

  componentDidMount() {
    const { fileIds } = this.props;
    this.fetchAttachmentsData(fileIds);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.fileIds, this.props.fileIds)) {
      this.fetchAttachmentsData(nextProps.fileIds);
    }
  }

  fetchAttachmentsData = async ids => {
    if (!Array.isArray(ids) || !ids.length) return;

    const res = await getAttachments(ids);
    const data = _.get(res, 'data.data');

    const files = Array.isArray(data)
      ? data.map(x => {
          x.originalFileName = x.original_filename;
          x.originalExtension = x.original_extension;
          return x;
        })
      : [];

    this.setState({
      files,
    });
  };

  render() {
    const { title, fileIds, style } = this.props;
    const { files } = this.state;

    const fileLength = Array.isArray(fileIds) ? fileIds.length : 0;
    const baseStyle = fileLength > 0 ? { cursor: 'pointer' } : { cursor: 'not-allowed', opacity: 0.3 };

    return (
      <div
        style={{ ...baseStyle, color: primary, minWidth: 30, display: 'inline-block', ...style }}
        onClick={() => {
          if (fileLength > 0) {
            openModal({
              title: title || '附件',
              footer: null,
              children: <AttachmentImageView attachment={{ files }} />,
            });
          }
        }}
      >
        <Icon type="paper-clip" />
        <span style={{ marginLeft: 5 }}>{fileLength}</span>
      </div>
    );
  }
}

IconView.propTypes = {
  style: PropTypes.object,
  title: PropTypes.string,
  fileIds: PropTypes.array, // 附件Id组成的数组
};

export default IconView;
