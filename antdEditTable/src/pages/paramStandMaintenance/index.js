import React, { PureComponent } from 'react';
import { Form, Input, Select, Button, Table, Icon, Affix } from 'antd';
import './index.less';
import request from 'util/http'
import { formatterYMD } from 'util/index'
const { Search } = Input;
const { Option } = Select;
class ParamStandMaintenance extends PureComponent {
  constructor(props) {
    super(props)
      this.state = {
        pager: {defaultPageSize: 15},
        loading: true,
        columns: [
            {
                title: '#',
                dataIndex: 'index',
                render: (text, record) => { return record.key }
            },
            {
                title: '标准名称',
                dataIndex: 'standardName',
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.name - b.name,
            },
            {
                title: '设备名称',
                dataIndex: 'equipmentName',
            },
            {
              title: '设备编号',
              dataIndex: 'equipmentCode',
            },
            {
                title: '产品名称',
                dataIndex: 'productName',
            },
            {
              title: '产品编号',
              dataIndex: 'productCode',
            },
            {
                title: '创建时间',
                dataIndex: 'createDate',
                render: text => <span>{ formatterYMD(text) }</span>
            },
            {
                title: '',
                dataIndex: 'nextGo',
                render: (text,row) => <Icon type="right" onClick={(e) => this.props.history.push({pathname:'/paramStandMaintenance/viewPage',state:row})}/>,
                width: 80,
            }
        ],
        data: [],
        isShowFilter: true,
        isPingFilters: false,

      }
  }
    handleSubmit = (e) => {
      e && e.preventDefault();
      this.getStandardGroupList(1, this.props.form.getFieldsValue().standardName)
    }
    changeFilter(e) {
        e.stopPropagation()
        const { isShowFilter, isPingFilters } = this.state
        if(isPingFilters){return}
        this.setState({
            isShowFilter: !isShowFilter
        })
    }

    pingFilters() {
        const { isPingFilters } = this.state
        this.setState({
            isPingFilters: !isPingFilters,
        })
    }
    renderFilters() {
        const { isShowFilter, isPingFilters } = this.state;
        const { getFieldDecorator } = this.props.form;
        const children = [<Option key='1'>车间1</Option>, <Option key='2'>车间2</Option>];
        return (
            <div className="filter-panel">
              <div className="flex-container"  style={{display: isShowFilter ? "flex" : "none"}}>
                <Form layout="inline" onSubmit={this.handleSubmit}>
                  <Form.Item label="标准名称:">
                      {getFieldDecorator('standardName')(
                          <Input
                              placeholder="标准名称"
                              style={{ width: 200 }}
                          />
                      )}
                  </Form.Item>
                  <Form.Item label={<div></div>} colon={false}>
                    <Button className="filter-submit" type="primary" htmlType="submit">更新</Button>
                  </Form.Item>
                </Form>
              </div>
              {/* <div className="subtitle-panel data-report">
                <div className="bottom-botton-panel">
                  <div className="button-panel">
                    <div className="button" onClick={(e)=>this.changeFilter(e)}>
                        {isShowFilter ? <i className="sap-icon icon-arrow-up"></i> : <i className="sap-icon icon-arrow-down"></i>}

                    </div>
                    <div className="button" onClick={this.pingFilters.bind(this)}>
                        {isPingFilters?<i className="sap-icon icon-push-pin-on"></i>:<i className="sap-icon icon-push-pin"></i>}
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

        )
    }
    clickRow(record) {
        this.props.history.push(`standard/${record.standardName}/${ record.equipmentCode }/${ record.productCode }`)
    }

    getStandardGroupList(pageNum, standardName) {
      this.setState({ loading: true })
      const pageSize = this.state.pager.defaultPageSize;
      request({
        url: `/standard/getStandardGroupList?pageNum=${pageNum}&pageSize=${ pageSize }${ standardName ? ('&standardName=' + standardName) : '' }`,
        method: 'GET',
      }).then( res => {
        if(!res || res.code !== 0) {
          return
        }
        const data = res.data;
        const pager = { ...this.state.pager };
        pager.total = data.total;
        this.setState({ data: data.standardGroupList.map( (item, key) =>{
          item.key = (pageNum - 1)*pageSize + key;
          return item
        }), loading: false, total: data.total, pager  })
      })
    }

    handleTableChange = (page) => {
      const pager = { ...this.state.pager };
      pager.current = page.current;
      this.setState({
        pager,
      });
      this.getStandardGroupList(pager.current);
    };

    componentDidMount() {
        this.getStandardGroupList(1)
    }

    render() {
      const {columns, data, isPingFilters, pager, loading} = this.state;
      return (
        <div className="param-stand-maintenance">
            { isPingFilters ?
                <Affix offsetTop={0}>
                    {this.renderFilters()}
                </Affix> :
                <div> { this.renderFilters()} </div>
            }
          <div className="main-panel">
            <div className="operate">
              <span>参数标准 ({ data.length })</span>
              <div>
                <Button onClick={ () => this.props.history.push('/standard/add/a') }>创建标准</Button>
              </div>
            </div>
            <Table
                columns={columns} 
                loading={loading}
                dataSource={data}
                onRow={(record) => {
                    return {
                      onClick: this.clickRow.bind(this, record)
                    }
                }} 
                onChange={this.handleTableChange}
                pagination={pager}/>
          </div>
        </div>
    );
  }
}
const WrappedParamStandMaintenance = Form.create({ name: 'params_search' })(ParamStandMaintenance);
export default WrappedParamStandMaintenance;
