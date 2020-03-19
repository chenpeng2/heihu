import React, { PureComponent } from 'react';
import { Page, Navbar } from 'framework7-react';
import './index.less';

import { connect } from 'react-redux'

import Filter from '../detail/components/filter';
import Part1 from '../detail/components/part-1';
import Part2 from '../detail/components/part-2';

import Bar from './components/bar'

class GmPage extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        load: false,
        utd: '',
        chartData: null,

        filterList: [],
        defaultChecked: [{name: '全仓', id: ''}],

        total: { '货量': '' },
        selectItem: null,
      };
    }

    setSelectItem = (item) => {
      this.setState({
        selectItem: item
      })
    }

    filterSubmit(checked) {
      this.getWarehouseDetail(checked[0].id)
    }

    getWarehouseDetail(whsid) {
      const url = typeof whsid === 'undefined' ? '' : '?whsid=' + whsid
      window.axios({
        url: '/sstk/chart/sstk/picking/checking/detail' + url,
        success: (res => {
            if(!res || res.code !== 0) {
                return
            }
            const data = JSON.parse(res.data);
            console.log(data)
            this.setState({
              utd: data.utd,
              chartData: this.formatChartData(data)
            })
        })
      })
    }

    formatChartData(data) {
      const detail = data.detail;
      if(!detail || !detail.length) {
        return null
      }
      let chartData = {
        Ylist: [],
        serie: []
      }
      let sum = 0;
      detail.map( (item) => {
        chartData.Ylist.push(item.tripId);
        chartData.serie.push(item.count);
        sum += (+item.count)
      })
      this.setState({ total : { '货量': sum + data.utd } })
      return chartData
    }

    getWarehouseList() {
      window.axios({
        url: '/statistic/sstk/warehouselist',
        success: (res => {
            if(!res || res.code !== 0) {
                return
            }
            const data = JSON.parse(res.data);
            const whs = data.whs;
            if(!whs || !whs.length) {
                return
            }
            const filterItems = {
              name: '选择仓库',
              items: [{name: '全仓', id: ''}]
            };
            filterItems.items = filterItems.items.concat( whs.map((item) => {
              return { name: '仓库' + item, id: item }
            }) )
            this.setState({
              filterList: [filterItems]
            })
        })
      })
    }

    componentDidMount() {
      this.getWarehouseList()
      this.getWarehouseDetail();
    }

    render() {
      const { utd, chartData, filterList, defaultChecked, total, selectItem, load } = this.state;
      return (
        <Page className="work-page" onPageAfterIn={ () => this.setState({ load: true }) }>
            <Navbar backLink="实时看板" title="拣货路径">
              <a href="#" slot="nav-right" onClick={ (e) => this.refs.filter.popFilter() }>过滤</a>
            </Navbar>
            <div className="bottom-border">
              {
                filterList ? <Filter defaultChecked={ defaultChecked } submit={ (checked) => this.filterSubmit(checked) } filterList={ filterList } ref="filter" /> : ''
              }
            </div>

            <Part1 />

            <Part2 total={total} selectItem={ selectItem } />
            {
                load && chartData ? 
                <Bar utd={ utd } chartData={ chartData } handleClick={ this.setSelectItem } /> : ''
            }
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
  }
}

export default connect(mapState, mapDispatch)(GmPage)