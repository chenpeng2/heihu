import React, { useState } from 'react';
import _ from 'lodash';
import { Row, Col, Button, Spin, message } from 'src/components';
import { findNoticeType } from 'src/constants';
import { sendMessage } from 'src/services/account/message';
import log from 'src/utils/log';
import UserSelect from './userSelect';
import styles from './styles.scss';

type Props = {
  noticeInfo: {
    noticeCategory: Number,
    noticeTitle: String | React.node,
    noticeContent: String | React.node,
  },
  onCancel: () => {},
  onSend: () => {},
};

const colStyle = { width: '70%' };

const SendNotification = (props: Props) => {
  const { noticeInfo, onSend } = props;
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState([]);
  const { noticeCategory, noticeTitle, noticeContent, noticeMeta } = noticeInfo;
  const noticeCategoryDisplay = findNoticeType(noticeCategory).label;
  const onCancel = () => {
    const { onCancel } = props;
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
  };

  const onConfirm = () => {
    const messageInfo = {
      category: noticeCategory,
      userIds: selectedUser.map(n => n.id),
      body: {
        title: noticeTitle,
        content: noticeContent,
        meta: noticeMeta,
      },
    };
    setLoading(true);
    sendMessage(messageInfo)
      .then(() => {
        message.success('已发送给对应的接收人');
        if (onCancel && typeof onCancel === 'function') {
          onCancel();
        }
        if (onSend && typeof onSend === 'function') {
          onSend();
        }
      })
      .catch(e => {
        log.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.sendNotice}>
        <div className={styles.noticeDetailWrapper}>
          <h6>通知详情</h6>
          <div className={styles.noticeDetailContent}>
            <Row>
              <Col type="title">通知类型</Col>
              <Col type="content" style={colStyle}>
                {noticeCategoryDisplay}
              </Col>
            </Row>
            <Row>
              <Col type="title">通知标题</Col>
              <Col type="content" style={colStyle}>
                {noticeTitle}
              </Col>
            </Row>
            <Row>
              <Col type="title">通知内容</Col>
              <Col type="content" style={colStyle}>
                {noticeContent}
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.userSelectWrapper}>
          <h6>选择接收人</h6>
          <UserSelect setSelectedUser={setSelectedUser} />
        </div>
        <div className={styles.footer}>
          <Button type="ghost" onClick={onCancel} className={styles.footerButton}>
            取消
          </Button>
          <Button type="primary" disabled={!selectedUser.length} onClick={onConfirm} className={styles.footerButton}>
            完成
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default SendNotification;
