import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RowLayout from 'src/layouts/rowLayout';
import AccountInfo from '../accountInfo';
import { NotificationDropdown } from '../notification';
import LanguageSelect from '../languageSelect/index';
import './index.scss';

/**
 * @api {PageHeader} PageHeader.
 * @APIGroup PageHeader.
 * @apiParam {React.node} header 顶部的左面的组件.
 * @apiParam {React.node} messageContent 消息里面详细信息的组件,不传有个默认的defaultMessageContent.
 * @apiParam {Number} count 显示有几条信息.
 * @apiParam {Obj} viewer 从后端查过来的viewer.
 * @apiExample {js} Example usage:
 * const viewer = ${PageHeader.getFragment('viewer')}
 * <PageHeader viewer={viewer} header={breadcrumb} />
 */

const inlineStyle = {
  display: 'inline-block',
  margin: '0 10px 0 25px',
};

class PageHeader extends Component {
  props: {
    user: any,
  };

  state = {};

  render() {
    const { user, header } = this.props;

    const wrappedHeader =
      header &&
      React.cloneElement(header, {
        style: {
          ...header.props.style,
          display: 'flex',
          alignItems: 'center',
          fontSize: 14,
        },
      });

    return (
      <RowLayout style={{ marginTop: 13, marginBottom: 13, lineHeight: '21px' }} className="page-header">
        {wrappedHeader || <div />}
        <div style={{ paddingRight: '20px' }}>
          <div style={inlineStyle} className="tip-item">
            <NotificationDropdown />
          </div>
          <div style={inlineStyle} className="tip-item">
            <AccountInfo user={user} />
          </div>
          <div style={inlineStyle} className="tip-item">
            <LanguageSelect />
          </div>
        </div>
      </RowLayout>
    );
  }
}

PageHeader.propTypes = {
  header: PropTypes.node,
  messageContent: PropTypes.node,
  count: PropTypes.number,
};

export default PageHeader;
