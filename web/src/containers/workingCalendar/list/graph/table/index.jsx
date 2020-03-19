import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import TableHeader from './tableHeader';
import TableBody from './tableBody';
import styles from './styles.scss';

type Props = {
  columns: [
    {
      title: string,
      fixed: string,
      key: string,
      width: number,
      style: {},
      render: () => {},
      renderTitle: () => {},
    },
  ],
  dataSource: [{}],
  initialLeftScroll: number,
  style: {},
};

class Table extends Component {
  props: Props;
  state = {};

  // refs
  tableBodyRef = React.createRef();
  tableHeaderRef = React.createRef();
  fixedLeftBodyRef = React.createRef();

  shouldComponentUpdate(nextProps) {
    if (_.isEqual(nextProps.dataSource, this.props.dataSource) && _.isEqual(nextProps.columns, this.props.columns)) {
      return false;
    }
    return true;
  }

  componentDidMount() {
    this.syncHeaderAndBodyScrollLeft();
    this.initialScroll();
  }

  componentWillReceiveProps(nextProps) {
    this.initialScroll(nextProps.initialLeftScroll);
  }

  componentWillUnmount() {
    this.removeScrollEventListener();
  }

  // 将table开始的时候滚动一定位置
  initialScroll = value => {
    if (typeof value === 'number') {
      const bodyDomNode = ReactDOM.findDOMNode(this.tableBodyRef.current);
      const headerDomNode = ReactDOM.findDOMNode(this.tableHeaderRef.current);

      bodyDomNode.scrollLeft = value;
      headerDomNode.scrollLeft = value;
    }
  };

  // 同步scroll
  syncHeaderAndBodyScrollLeft = () => {
    const bodyDomNode = ReactDOM.findDOMNode(this.tableBodyRef.current);
    const headerDomNode = ReactDOM.findDOMNode(this.tableHeaderRef.current);
    const fixedLeftBodyDomNode = ReactDOM.findDOMNode(this.fixedLeftBodyRef.current);

    headerDomNode.addEventListener('scroll', this.handlerActiveHeaderScroll);
    bodyDomNode.addEventListener('scroll', this.handlerActiveBodyScroll);
    fixedLeftBodyDomNode.addEventListener('scroll', this.handlerActiveLeftBodyDomNode);
  };

  removeScrollEventListener = () => {
    const bodyDomNode = ReactDOM.findDOMNode(this.tableBodyRef.current);
    const headerDomNode = ReactDOM.findDOMNode(this.tableHeaderRef.current);
    const fixedLeftBodyDomNode = ReactDOM.findDOMNode(this.fixedLeftBodyRef.current);

    bodyDomNode.removeEventListener('scroll', this.handlerActiveBodyScroll);
    headerDomNode.removeEventListener('scroll', this.handlerActiveHeaderScroll);
    fixedLeftBodyDomNode.removeEventListener('scroll', this.handlerActiveLeftBodyDomNode);
  };

  handlerActiveHeaderScroll = _.debounce(() => {
    const bodyDomNode = ReactDOM.findDOMNode(this.tableBodyRef.current);
    const headerDomNode = ReactDOM.findDOMNode(this.tableHeaderRef.current);

    bodyDomNode.scrollLeft = headerDomNode.scrollLeft;
  }, 10);

  handlerActiveBodyScroll = _.debounce(() => {
    const bodyDomNode = ReactDOM.findDOMNode(this.tableBodyRef.current);
    const headerDomNode = ReactDOM.findDOMNode(this.tableHeaderRef.current);
    const fixedLeftBodyDomNode = ReactDOM.findDOMNode(this.fixedLeftBodyRef.current);

    // 同步header和body的x轴
    headerDomNode.scrollLeft = bodyDomNode.scrollLeft;

    // 同步fixed和body的y轴
    fixedLeftBodyDomNode.scrollTop = bodyDomNode.scrollTop;
  }, 10);

  handlerActiveLeftBodyDomNode = _.debounce(() => {
    const bodyDomNode = ReactDOM.findDOMNode(this.tableBodyRef.current);
    const fixedLeftBodyDomNode = ReactDOM.findDOMNode(this.fixedLeftBodyRef.current);

    // 同步fixed和body的y轴
    bodyDomNode.scrollTop = fixedLeftBodyDomNode.scrollTop;
  });

  renderTableHeader = (columns, withRef) => {
    if (!Array.isArray(columns)) return null;

    return (
      <div className={styles.hideScrollBar}>
        <TableHeader columns={columns} className={styles.tableHeader} ref={withRef || null} />
      </div>
    );
  };

  renderTableBody = (dataSource, columns, withRef, style, isFixed) => {
    return (
      <div className={styles.hideScrollBar} >
        <TableBody
          style={style}
          dataSource={dataSource}
          columns={columns}
          isFixed={isFixed}
          className={styles.tableBodyContainer}
          ref={withRef || null}
        />
      </div>
    );
  };

  // 渲染固定在左边的columns
  renderFixedLeftColumns = (dataSource, columns) => {
    const fixedLeftColumns = Array.isArray(columns) ? columns.filter(item => item && item.fixed === 'left') : [];
    const fixedLeftData = Array.isArray(dataSource)
      ? dataSource.map(item => {
          const res = {};

          fixedLeftColumns.forEach(column => {
            const key = _.get(column, 'key');
            res[key] = item[key];
          });

          return res;
        })
      : [];

    return (
      <div className={styles.fixedLeftContainer}>
        {this.renderTableHeader(fixedLeftColumns)}
        {this.renderTableBody(fixedLeftData, fixedLeftColumns, this.fixedLeftBodyRef, { marginRight: -10 }, true)}
      </div>
    );
  };

  render() {
    const { dataSource, columns, style } = this.props;

    return (
      <div className={styles.tableContainer} style={style}>
        {this.renderTableHeader(columns, this.tableHeaderRef)}
        {this.renderTableBody(dataSource, columns, this.tableBodyRef)}
        {this.renderFixedLeftColumns(dataSource, columns)}
      </div>
    );
  }
}

export default Table;
