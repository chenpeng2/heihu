import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { formatTodayUnderline } from 'utils/time';
import MyStore from 'store';
import { queryProductionCapacity } from 'src/services/datagram/productionCapacityRecords';
import { RestPagingTable, Button, Icon, Tooltip } from 'components';
import { replaceSign } from 'src/constants';
import { exportXlsxFile } from 'utils/exportFile';
import { getQuery } from 'src/routes/getRouteParams';
import ProductionCapacitySubList from './productionCapacitySubList';
import styles from './styles.scss';

type Props = {
  showDataCategory: [],
  type: string,
  fetechData: () => {},
  data: [],
  match: any,
};

class ProductionCapacityList extends Component {
  props: Props;
  state = {
    querys: {},
    downloading: false,
    workstationSort: 'ascend',
  };

  componentDidUpdate() {
    const { data, type } = this.props;
    if (data && data.data) {
      const { header } = data.data;
      const fixedLeftLength = Object.keys(header).filter(n => n.indexOf('/') === -1).length;
      const tabActive = document.getElementsByClassName('ant-tabs-tabpane-active')[0];
      const antTable = Array.from(tabActive.getElementsByClassName('ant-table-content'));
      if (antTable.length) {
        const _antTable = antTable[0];
        const antTableFixed = _antTable.getElementsByClassName('ant-table-fixed')[0];
        const trs = antTableFixed.getElementsByClassName('ant-table-thead')[0].getElementsByTagName('tr');
        const ths1 = Array.from(trs[0].getElementsByTagName('th')).slice(fixedLeftLength - type === '工位OEE' ? 1 : 2);
        const ths2 = Array.from(trs[1].getElementsByTagName('th'));
        const trsBody = antTableFixed.getElementsByClassName('ant-table-tbody')[0].getElementsByTagName('tr');
        ths1.concat(ths2).forEach(th => {
          th.style.borderLeft = '1px solid #e8e8e8';
          th.style.borderBottom = '1px solid #e8e8e8';
        });
        Array.from(trsBody).forEach(tr => {
          const tds = Array.from(tr.getElementsByTagName('td')).slice(fixedLeftLength - type === '工位OEE' ? 1 : 2);
          Array.from(tds).forEach(td => {
            td.style.borderLeft = '1px solid #e8e8e8';
          });
        });
      }
    }
  }

  formatExportData = data => {
    const title = [];
    this.getColumns()
      .filter(n => n)
      .forEach(n => {
        if (n.title.indexOf('/') !== -1) {
          n.children.forEach(m => {
            title.push(m.title.props.children);
          });
        } else {
          title.push(n.title);
        }
      });
    const _data = data.list.map(x => {
      const _header = Object.keys(x).filter(n => n.indexOf('/') !== -1);
      const obj = {
        workstationCode: x.workstationCode || replaceSign,
        workstationName: x.workstationName || replaceSign,
        processName: x.processName || replaceSign,
      };
      _header.forEach(o => {
        Object.keys(x[o]).forEach((n, index) => {
          obj[`${o}-${index}`] = x[o][n];
        });
      });
      return obj;
    });
    _data.unshift(title);
    return _data.map(x => Object.values(x));
  };

  getColumnsTitle = () => {
    const header = [];
    this.getColumns()
      .filter(n => n)
      .forEach(n => {
        if (n.title.indexOf('/') !== -1) {
          header.push(n.title);
          n.children.splice(1).forEach(() => {
            header.push('');
          });
        } else {
          header.push('');
        }
      });
    return header;
  };

  dataExport = () => {
    const { type } = this.props;
    const querys = MyStore.getState().productionTabReducer;
    const params = querys[type];
    const headers = this.getColumnsTitle();
    this.setState({ downloading: true });
    queryProductionCapacity({ ...params, size: 300 })
      .then(res => {
        const exportData = res.data;
        const values = this.formatExportData((exportData && exportData.data) || []);
        exportXlsxFile([headers, ...values], `产能报表-${type}数据_${formatTodayUnderline()}`);
      })
      .finally(() => {
        this.setState({ downloading: false });
      });
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({ workstationSort: sorter.order });
    const { fetechData, type } = this.props;
    const querys = MyStore.getState().productionTabReducer;
    const params = { ...querys[type], page: pagination.current };
    const { columnKey, order } = sorter;
    if (sorter.order) {
      params.orderBy = `${columnKey}OrderBy${order === 'ascend' ? 'Asc' : 'Desc'}`;
    }
    fetechData(params);
  };

  getColumns = () => {
    const { data, type, showDataCategory } = this.props;
    const { changeChineseToLocale } = this.context;
    const { header } = data.data;
    const tabActive = document.getElementsByClassName('ant-tabs-tabpane-active')[0];
    const antTableContent = Array.from(tabActive.getElementsByClassName('ant-table-content'));
    const _header = Object.keys(header).filter(n => n.indexOf('/') !== -1);
    const _columns = _header.map(prop => ({
      title: prop,
      children: Object.values(header[prop]).map(value => {
        return {
          title: <div style={{ paddingRight: 20, textAlign: 'right' }}>{changeChineseToLocale(value)}</div>,
          key: _.uniqueId(type),
          width:
            antTableContent.length && antTableContent[0]
              ? antTableContent[0].clientWidth - 540 < _header.length * Object.values(header[prop]).length * 115
                ? 115
                : null
              : 115,
          render: (_, record) => {
            let text = '';
            showDataCategory.forEach(n => {
              if (n.label === value) {
                text = record[prop][n.dataIndex];
              }
            });
            return (
              <div style={{ paddingRight: 20, textAlign: 'right' }}>
                {String(text).replace(/\B(?=(?:\d{3})+\b)/g, ',')}
              </div>
            );
          },
        };
      }),
    }));
    return [
      {
        title: '工位编码',
        width: 220,
        fixed: 'left',
        sorter: true,
        sortOrder: this.state.workstationSort,
        key: 'workstationCode',
        render: (_, record) => record.workstationCode || replaceSign,
      },
      {
        title: '工位名称',
        width: 220,
        fixed: 'left',
        key: 'workstationName',
        render: (_, record) => record.workstationName || replaceSign,
      },
      {
        title: '工序名称',
        width: 220,
        fixed: 'left',
        key: 'processName',
        render: (_, record) => record.processName || replaceSign,
      },
      header.unitName
        ? {
            title: header.unitName,
            width: 100,
            fixed: 'left',
            key: 'unit',
            render: (_, record) => {
              return <Tooltip text={record.unitName || replaceSign} length={10} />;
            },
          }
        : null,
      ..._columns,
    ];
  };

  render() {
    const { type, data, fetechData } = this.props;
    const { changeChineseToLocale } = this.context;
    if (!data || !data.data) {
      return <div style={{ width: '1000px', height: '500px', backgroundColor: 'transparent' }} />;
    }
    const _data = data.data;
    const columns = this.getColumns().filter(n => n);

    return (
      <div className={styles.productionCapacityList}>
        <div style={{ marginTop: 10, marginBottom: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginBottom: 10 }}>
            <div style={{ lineHeight: '28px' }}>
              <Icon type="bars" />
              <span style={{ marginLeft: 3 }}>
                {changeChineseToLocale(type === '工位产能损失' ? '损失类型统计' : type)}
              </span>
            </div>
            <Button
              icon="upload"
              onClick={() => {
                this.dataExport();
              }}
              disabled={(data && data.total === 0) || this.state.downloading}
            >
              数据导出
            </Button>
          </div>
          <RestPagingTable
            bordered
            dataSource={(_data && _data.list) || []}
            total={data.total}
            rowKey={record => record.id}
            columns={columns}
            scroll={{ x: true }}
            refetch={fetechData}
            onChange={this.handleTableChange}
          />
        </div>
        {/* {type === '工位产能损失' ? <ProductionCapacitySubList /> : null} */}
      </div>
    );
  }
}

ProductionCapacityList.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};
export default ProductionCapacityList;
