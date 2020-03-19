import React, { PureComponent } from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';

import Filter from './components/filter';
import Span from '../../../components/span'

export default class extends PureComponent {
    constructor(props) {
      super(props);
      const type = props.isAll ? '全部': '京东 & 社区店'
      this.state = {
        load: false,
        list: null,
        pageNum: 1,
        allowInfinite: true,
        pageSize: 20,
        total: null,
        keyMap: {
          hyper: '大卖场',
          super: '社区店',
          jd: '京东'
        },
        checked: null,
        defaultChecked: [{name: '超时' + props.timerange + 'h', id: props.timerange }, {name: type, id: props.isAll}],
        filterList: [{
          name: '超时类型',
          items: [{name: '超时4h', id: '4'}, {name: '超时10h', id: '10'}, {name: '超时24h', id: '24'},{name: '超时48h', id: '48'}]
        }, {
          name: '门店类型',
          items: [{name: '京东 & 社区店', id: false}, {name: '全部', id: true}]
        }]
      };
    }

    popFilter() {
      this.refs.filter.popFilter();
    }

    formatTime(time) {
      var min= Math.floor(time%3600);
      return Math.floor(time/3600) + "小时" + Math.floor(min/60) + "分";
    }

    filterSubmit(checked) {
      this.clearInfinite()
      this.setState({
        checked,
        list: [],
        pageNum: 1
      }, () => {
        this.getFirstPage(this.state.checked, (res) => {
          if(res.result.length >= res.total) {
            return
          }
          this.createInfinite()
        })
      })
    }

    getTimeoutDetail(checked, pagNum, callback) {
      const { pageSize } = this.state
      window.axios({
          url: `/chart/receipt/receipting/timeout/detail?isAll=${checked[1].id}&timerange=${checked[0].id}&pageNum=${pagNum}&pageSize=${pageSize}`,
          success: (res => {
              const data = JSON.parse(res.data)
              callback && callback(data)
          })
      })
    }

    createInfinite() {
      this.$f7.infiniteScroll.create('.infinite-scroll-content');
      this.$f7.$('.infinite-scroll-preloader').removeClass('preloader-hide');
    }

    clearInfinite() {
      this.$f7.infiniteScroll.destroy('.infinite-scroll-content');
      this.$f7.$('.infinite-scroll-preloader').addClass('preloader-hide');
    }

    eventAdd() {
      this.$f7.$('.infinite-scroll-content').on('infinite', this.infiniteEvent.bind(this) )
    }

    infiniteEvent() {
      if (!this.state.allowInfinite ) return;
      this.setState({ allowInfinite: false })
      const pageNum = this.state.pageNum;
      this.setState({ pageNum: pageNum+1 })
      this.getTimeoutDetail(this.state.checked, this.state.pageNum, (res) => {
        this.setState({ allowInfinite: true })
        const list = this.state.list;
        this.setState({
          total: res.total,
          list: list.concat(res.result)
        })
        if(this.state.list.length >= this.state.total) {
           this.clearInfinite();
        }
      })
    }

    getFirstPage(checked, callback) {
      this.getTimeoutDetail(checked, 1, (res) => {
        this.setState({
          total: res.total,
          list: res.result
        })
        if(res.result.length >= res.total) {
          this.clearInfinite()
        }
        callback && callback(res)
      })
    }

    componentDidMount() {
      const { isAll, timerange } = this.props;
      this.setState({
        checked: [{id: timerange}, {id: isAll}]
      }, () => {
        this.getFirstPage(this.state.checked)
        this.eventAdd();
      })
    }

    render() {
      const { load, list, keyMap, filterList, defaultChecked, total } = this.state
      return (
        <Page infinite onPageAfterIn={ () => this.setState({ load: true }) } className="timeout-page">
            <Navbar backLink="实时看板" title="超时待分拣">
              <a href="#" slot="nav-right" onClick={ (e) => this.popFilter() }>过滤</a>
            </Navbar>

            <div className="bottom-border">
              {
                filterList ? <Filter defaultChecked={ defaultChecked } submit={ (checked) => this.filterSubmit(checked) } filterList={ filterList } ref="filter" /> : ''
              }
            </div>
            
            <List className="list-view">
              {
                list ? 
                list.map( (item, key) => 
                  <ListItem key={key} header={ item.productId }>
                    <div slot="title" className="item-meta">
                        <div className="meta">货物位置</div>
                        <div className="meta">门店类型</div>
                    </div>
                    <span slot="media">{ key+1 }</span>
                    <div slot="after">
                        <div className="meta strong">超时 { this.formatTime(item.wait) }</div>
                        <div className="meta">{ typeof item.whsId === 'undefined' ? '' : '仓库' + item.whsId + '，' }{ item.slotId }</div>
                        <div className="meta">{ keyMap[item.type] }</div>
                    </div>
                </ListItem>
                ): ''
              }
              {
                total === 0 ? 
                <div style={{ textAlign: 'center', fontSize: '14px', color: '#666', paddingTop: '40px' }}>暂无数据</div> : ''
              }
            </List>
        </Page>
      )
    }
  };  