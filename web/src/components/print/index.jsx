import React, { Component } from 'react';
import ReactDOM from 'react-dom';

type Props = {
  children: any,
};

class PrintComponent extends Component {
  state = {};
  props: Props;

  render() {
    const { children } = this.props;
    const newChildren = React.cloneElement(children);

    return <div>{newChildren}</div>;
  }
}

// 找到所有的兄弟节点
const findAllSiblingsElement = eleNow => {
  const result = [];
  let node = eleNow.parentNode.firstChild;

  while (node && node !== eleNow) {
    result.push(node);
    node = node.nextElementSibling || node.nextSibling;
  }

  return result;
};

// 隐藏或显示某一个元素
const changeElementDisplay = (ele, display) => {
  if (!ele) return;

  const lastClassName = ele.className;
  if (!display) {
    ele.className = `${lastClassName} printHide`;
  } else {
    ele.className = lastClassName.replace('printHide', ' ');
  }
};

// 删除某一个元素
const deleteElement = ele => {
  if (!ele.parentNode) return;

  ele.parentNode.removeChild(ele);
};

// 打印某一个component
const printComponent = (props: { component: any, cbForPrint: () => {} }) => {
  const { component, cbForPrint } = props;
  // 创建打印的父级元素
  const div = document.createElement('div');
  div.className = 'printContainer';
  document.getElementsByTagName('body')[0].appendChild(div);

  // 将所有的兄弟节点隐藏
  const allSiblings = findAllSiblingsElement(div);
  allSiblings.forEach(i => {
    changeElementDisplay(i, false);
  });

  // 将需要打印的元素渲染
  const printProps = { children: component };
  ReactDOM.render(<PrintComponent {...printProps} />, div);

  // 打印完成的回调
  window.onafterprint = () => {
    if (typeof cbForPrint === 'function') cbForPrint();
  };

  // 打印
  window.print();

  // 将所有的兄弟元素显示，并删除打印元素
  allSiblings.forEach(i => {
    changeElementDisplay(i, true);
  });
  deleteElement(div);
};

export default printComponent;
