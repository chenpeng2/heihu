import { Modal } from 'antd';
import styles from './expiredModal.scss';

const backgroundImage = 'https://files.blacklake.cn/web/190120/expire.png';

const ShowExpiredModal = props =>
  Modal.warning({
    title: '登录过期',
    content: '您的账户登录时长已超过3天，请重新登录。',
    centered: true,
    width: 509,
    icon: null,
    maskClosable: false,
    getContainer: () => document.body,
    className: styles.expiredModal,
    okText: '返回登录',
    keyboard: false,
    onOk: () => (window.location.href = '/login'),
    ...props,
  });

export default ShowExpiredModal;
