import React, { PureComponent } from 'react';
import { Page, Navbar } from 'framework7-react';
import './index.less';

import Filter from './components/filter';
import Part1 from './components/part-1';
import Part2 from './components/part-2';
import Bar from './components/bar'
import { connect } from 'react-redux'

class WorkPage extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        selectItem: null,
        total: {},
        load: false,
        chartData: null,

        defaultChecked: [props.warehouse].concat([props.depart]).concat([{name: '板数', id: 'plt'}]),
        filterList: [{
          name: '选择仓库',
          items: this.props.whList.concat([{name: '全部', id: ''}])
        }, {
          name: '装柜状态',
          items: this.props.dpList.concat([{name: '全部', id: ''}])
        }, {
          name: '选择单位',
          items: [{name: '箱数', id: 'unit'}, {name: '板数', id: 'plt'}]
        }]
      };
    }

    popFilter() {
      this.refs.filter.popFilter();
    }

    setSelectItem = (item) => {
      this.setState({
        selectItem: item
      })
    }

    componentDidMount() {
      this.initData(this.state.defaultChecked)
    }

    filterSubmit(checked) {
      this.initData(checked)
    }

    getChartData(data) {
      if(!data || !data.length ) {
          return null
      }
      const chartData = {
        Ylist: [],
        legend: [],
        series: {}
      }
      const total = {};
      const { dpList } = this.props;
      console.log(dpList)
      data.forEach(item => {
        chartData.Ylist.unshift('门店' + item.storeId);
        dpList.forEach( (dp) => {
          let departName = dp.name;
          if(!chartData.series[departName]) {
            chartData.legend.push(departName)
            chartData.series[departName] = {
                key: dp.id,
                data: []
            }
            total[departName] = 0
          }
          let value = item.departmentInfo[dp.id];
          typeof value === 'undefined' ? value = 0 : '';
          chartData.series[departName].data.unshift(value)
          total[departName] += value
        })
      })
      this.setState({
        total
      })
      return chartData
    }
  
    initData(param) {
      const warehouseParam = param && param[0] ? `warehouse=${param[0].id}` : ''
      const departmentParam = param && param[1] ? `&department=${param[1].id}` : ''
      const unitParam = param && param[2] ? `&unit=${param[2].id}` : ''
      window.axios({
          url: `/chart/store/expectedarrival?${warehouseParam}${departmentParam}${unitParam}`,
          success: (res => {
            if (res && res.code === 0) {
              const data = JSON.parse(res.data)
              this.setState({
                chartData: this.getChartData(data.detail)
              })
            }
          })
        })
    }

    render() {
      const {filterList, total, selectItem, load, chartData, defaultChecked } = this.state
      return (
        <Page onPageAfterIn={ () => this.setState({ load: true }) } className="work-page">
            <Navbar backLink="实时看板" title="预计工作量">
              <a href="#" slot="nav-right" onClick={ (e) => this.popFilter() }>过滤</a>
            </Navbar>

            <div className="bottom-border">
              {
                filterList ? <Filter defaultChecked={ defaultChecked } submit={ (checked) => this.filterSubmit(checked) } filterList={ filterList } ref="filter" /> : ''
              }
            </div>

            <Part1 />

            <Part2 total={total} selectItem={ selectItem } />

            <div style={{ padding: '8px', height: 'calc(100% - 34px - 43px - 98px - 16px)' }}>
              <label>门店编号</label>
              <div style={{ overflowY: 'auto', height: 'calc(100% - 17px)' }}>
                { 
                  load && chartData ? 
                  <Bar chartData={ chartData } handleClick={ this.setSelectItem } ref="listBar" /> : ''
                }
              </div>
            </div>
        </Page>
      )
    }
};
const mapDispatch = (dispatch) => {
  return {
      
  }
}

const mapState = (state) => {
  return {
    dpList: state.department.list,
    whList: state.department.warehouse
  }
}

export default connect(mapState, mapDispatch)(WorkPage)