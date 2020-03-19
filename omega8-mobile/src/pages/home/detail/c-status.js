import React, { PureComponent } from 'react';
import { Page, Navbar } from 'framework7-react';
import './index.less';

import Filter from './components/filter';
import Part1 from './components/part-1';
import Part2 from './components/part-2';
import Bar from './components/barLine';
import { connect } from 'react-redux'

class CStatusPage extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        load: false,
        chartData: null,
        total: {},
        defaultChecked: [props.warehouse].concat([{name: '板数', id: 'plt'}]),
        filterList: [{
          name: '选择仓库',
          items: this.props.whList.concat([{name: '全部仓库', id: ''}])
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
      item.data[item.data.length - 1].count = this.formatTime( item.data[item.data.length - 1].count*3600 )
      this.setState({
        selectItem: item
      })
    }

    filterSubmit(param) {
      this.initData(param)
    }

    initData(param) {
      const warehouseParam = param && param[0] ? `whsId=${param[0].id}` : ''
      const unitParam = param && param[1] ? `&unit=${param[1].id}` : '&unit=unit'
      window.axios({
          url: `/chart/warehouse/estimatedwork?${warehouseParam}${unitParam}`,
          success: (res => {
            if (res && res.code === 0) {
              const data = JSON.parse(res.data);
              this.setState({
                chartData: this.formatChartData(data)
              })
            }
          })
        })
    }

    isUndefined(val) {
      return typeof val === 'undefined'
    }

    formatTime(time) {
      var min= Math.floor(time%3600);
      const hh = Math.floor(time/3600);
      const mm = Math.floor(min/60);
      return ( hh ? hh + "小时" : '' ) + ( mm ? mm + "分" : '' );
    }

    formatChartData(data) {
      if(!data || !data.length) {
        return null
      }
      const chartData = {
        axis: [],
        legend: ['当前C区货量', '到来量', '预计工作时间'],
        series: [[], [], []]
      }
      let total = {'当前C区货量': 0, '到来量': 0, '预计工作时间': 0};
      data.map( (item) => {
        chartData.axis.unshift('门店' + item.storeId);
        let storeValid = this.isUndefined(item.storeValid) ? 0 : item.storeValid,
            expectedArral = this.isUndefined(item.expectedArral) ? 0 : item.expectedArral,
            util = this.isUndefined(item.expectedTime) ? 0 : item.expectedTime;
        chartData.series[0].unshift(storeValid);
        chartData.series[1].unshift(expectedArral);
        chartData.series[2].unshift(util/3600);
        total['当前C区货量'] += storeValid;
        total['到来量'] += expectedArral;
        total['预计工作时间'] += util;
      })
      total['预计工作时间'] = this.formatTime(total['预计工作时间'])
      this.setState({ total })
      return chartData
    }

    componentDidMount() {
      this.initData(this.state.defaultChecked)
    }

    render() {
      const {total, selectItem, load, chartData, defaultChecked, filterList } = this.state;
      return (
        <Page onPageAfterIn={ () => this.setState({ load: true }) } className="work-page">
            <Navbar backLink="实时看板" title="C区状态">
              <a href="#" slot="nav-right" onClick={ (e) => this.popFilter() }>过滤</a>
            </Navbar>

            <div className="bottom-border">
              {
                filterList ? 
                <Filter ref="filter" defaultChecked={ defaultChecked } submit={ (checked) => this.filterSubmit(checked) } filterList={ filterList }  /> : ''
              }
            </div>

            <Part1 />

            <Part2 total={ total } selectItem={ selectItem } />

            <div style={{ padding: '8px', height: 'calc(100% - 34px - 43px - 98px - 16px)' }}>
              <label>门店编号</label>
              <div style={{ overflowY: 'auto', height: 'calc(100% - 17px)' }}>
                { 
                  load && chartData ?
                  <Bar chartData={ chartData } handleClick={ this.setSelectItem } /> : ''
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
      whList: state.department.warehouse
    }
  }
  
  export default connect(mapState, mapDispatch)(CStatusPage)