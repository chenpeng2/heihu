import React, { Component } from 'react';
import _ from 'lodash';
import { RestPagingTable, Link, Spin, Popconfirm, Icon, FilterSortSearchBar, withForm, Button, Searchselect } from 'src/components';
import { getExportByWarehouseList, exportByWarehouse } from 'src/services/stock/stockCheckedRecord';
import { setLocation } from 'utils/url';
import moment from 'src/utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import { wrapUrl } from 'utils/attachment';
import { error, primary, borderGrey } from 'src/styles/color';

const Popiknow = Popconfirm.Popiknow;
const { ItemList, Item } = FilterSortSearchBar;

class ExportByWarehouse extends Component {
  state = {
    data: [],
    loading: false,
  };

  componentDidMount() {
    const { match, form } = this.props;
    const { setFieldsValue } = form;
    const query = getQuery(match);
    const { warehouse } = query || {};
    setFieldsValue(query);
    this.fetchData(warehouse && warehouse.key);
  }

  fetchData = (params) => {
    this.setState({ loading: true });
    getExportByWarehouseList()
      .then(res => {
        const { data } = res;
        this.setState({ data, searchedData: data }, () => {
          if (params) {
            this.handleSearch(params);
          }
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  getColumns = () => {
    return [
      {
        title: '导出仓库',
        dataIndex: 'warehouseName',
      },
      {
        title: '上次文件生成时间',
        dataIndex: 'exportedAt',
        render: exportedAt => exportedAt ? moment(exportedAt).format('YYYY/MM/DD HH:mm:ss') : replaceSign,
      },
      {
        title: '记录数量',
        dataIndex: 'lines',
        render: (lines, record) => record.fileId && (lines || lines === 0) ? `${lines}条` : replaceSign,
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => {
          const { fileId, warehouseCode, exportedAt } = record;
          const canExport = exportedAt ? (Date.parse(moment()) - exportedAt) / 60000 > 10 : true;
          return (
            <div>
              <Popiknow
                title={canExport ? '生成完成！请稍等一段时间后可进行导出' : '生成失败！每次文件生成需间隔10分钟，请稍后再尝试'}
                icon={<Icon style={{ color: canExport ? primary : error }} type={canExport ? 'check-circle' : 'close-circle'} />}
                iconType={canExport ? 'check-circle' : 'close-circle'}
                iconStyle={{ color: canExport ? primary : error }}
              >
                <Link
                  onClick={() => {
                    if (canExport) {
                      exportByWarehouse({ warehouseCode });
                    }
                  }}
                >
                  生成
                </Link>
              </Popiknow>
              <Link
                style={{ marginLeft: 20 }}
                disabled={!fileId}
                onClick={() => {
                  if (fileId) {
                    const link = document.createElement('a');
                    link.href = wrapUrl(fileId);
                    link.click();
                  }
                }}
              >
                导出
              </Link>
            </div>
          );
        },
      },
    ];
  };

  handleSearch = async (params) => {
    this.setState({ loading: true });
    try {
      const res = await getExportByWarehouseList();
      const data = _.get(res, 'data');
      if (params) {
        const searchedData = data.filter(n => n.warehouseCode === params);
        this.setState({ searchedData, loading: false });
      } else {
        this.setState({ searchedData: data, loading: false });
      }
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
    }
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator, getFieldsValue } = form;
    const { searchedData, loading } = this.state;
    const columns = this.getColumns();

    return (
      <div>
        <FilterSortSearchBar style={{ width: '100%', borderBottom: `1px solid ${borderGrey}`, marginBottom: 20 }}>
          <ItemList>
            <Item label="导出仓库选择">
              {getFieldDecorator('warehouse')(<Searchselect type={'wareHouseWithCode'} />)}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const value = getFieldsValue();
              const { warehouse } = value || {};
              setLocation(this.props, p => ({ ...p, ...value }));
              this.handleSearch(warehouse && warehouse.key);
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        <Spin spinning={loading}>
          <RestPagingTable
            columns={columns}
            dataSource={Array.isArray(searchedData) ? searchedData : []}
            total={searchedData ? searchedData.length : 0}
            refetch={() => {}}
          />
        </Spin>
      </div>
    );
  }
}

export default withForm({}, ExportByWarehouse);
