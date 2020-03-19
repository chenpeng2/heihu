import openModal from './index';
import styles from './index.scss';

const PopverModal = ({ event, width, ...rest }, context) => {
  const top = event.clientY;
  let marginLeft = event.clientX;
  if (marginLeft + width > window.outerWidth) {
    marginLeft -= width;
  }
  const modalStyle = {
    top,
    marginLeft,
    boxShadow: '0px 10px 30px #8E99B5',
  };
  openModal(
    {
      width,
      maskClosable: true,
      footer: null,
      mask: false,
      style: modalStyle,
      wrapClassName: styles.ganttModal,
      ...rest,
    },
    context,
  );
};

export default PopverModal;
