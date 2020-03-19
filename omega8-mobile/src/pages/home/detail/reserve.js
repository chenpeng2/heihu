import React, { PureComponent } from 'react';
import { Page, Navbar } from 'framework7-react';

import Filter from './components/filter';
import Part1 from './components/part-1';
import Part2 from './components/part-2';
import Bar from './components/overviewChart';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        load: false,
        chartData: null,
        selectItem: null,
        isnextday: props.isnextday,
        total: {},
        defaultChecked: [{name: props.isnextday ? '明天' : '今天', id: props.isnextday }],
        filterList: [{
          name: '选择日期',
          items: [{name: '今天', id: false}, {name: '明天', id: true}]
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

    filterSubmit(checked) {
      const isnextday = checked[0].id;
      this.setState({ isnextday})
      this.getOverview(isnextday)
    }

    getOverview(isnextday) {
      window.axios({
          url: '/chart/receipt/appointment/time/detail?isnextday=' + isnextday,
          success: (res => {
              if(!res || res.code !== 0) {
                  return
              }
              this.setState({
                  chartData: this.formatChartData(JSON.parse(res.data))
              })
          })
      })
    }
    
    componentDidMount() {
      this.getOverview(this.props.isnextday)
    }

    formatChartData(data) {
      if(!data || !data.length) {
          return null
      }
      const total = {'重货': 0, '抛货': 0};
      let chartData = {
          Ylist: [],
          series: [[], []]
      }
      data.map( (item, key) => {
          chartData.Ylist.push(item.time);
          chartData.series[0].push(typeof item.heavy === 'undefined' ? 0 : item.heavy);
          chartData.series[1].push(typeof item.light === 'undefined' ? 0 : item.light);
          total['重货'] += item.heavy;
          total['抛货'] += item.light;
      })
      this.setState({ total })
      return chartData
    }

    render() {
      const { isnextday, chartData, load, defaultChecked, filterList, selectItem,  total} = this.state;
      return (
        <Page onPageAfterIn={ () => this.setState({ load: true }) } className="work-page">
            <Navbar backLink="实时看板" title="预约未到货">
              <a href="#" slot="nav-right" onClick={ (e) => this.popFilter() }>过滤</a>
            </Navbar>

            <div className="bottom-border">
              {
                filterList ? <Filter defaultChecked={ defaultChecked } submit={ (checked) => this.filterSubmit(checked) } filterList={ filterList } ref="filter" /> : ''
              }
            </div>

            <Part1 />

            <Part2 total={ total } selectItem={ selectItem } />

            <div style={{ padding: '16px' }}>
              { load && chartData ? <Bar chartData={chartData} isnextday={isnextday} handleClick={ this.setSelectItem } linkTo={ this.handleClick } ref="listBar" /> : '' }
            </div>
        </Page>
      )
    }
  };  