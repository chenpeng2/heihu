import React, { PureComponent } from 'react';
import { Page, Navbar, ListItem, List } from 'framework7-react';
import './index.less';

import { connect } from 'react-redux'

import Filter from '../detail/components/filter'

class GmPage extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        load: false,
        pageNum: 1,
        pageSize: 20,
        total: null,
        checked: null,
        allowInfinite: true,
        list: null,
        filterList: [],
        defaultChecked: [{name: '全仓', id: ''}]
      };
    }

    getFirstPage(checked, callback) {
      this.getStacking(checked, 1, (res) => {
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

    getStacking(checked, pageNum, callback) {
      const whidParam = checked && checked[0].id ? `&whsid=${checked[0].id}` : ''
      const { pageSize } = this.state;
      window.axios({
          url: `/sstk/chart/sstk/picking/user/timeout/detail?pageNum=${pageNum}&pageSize=${pageSize}${whidParam}`,
          success: (res => {
              if(!res || res.code !== 0) {
                  return
              }
              const data = JSON.parse(res.data);
              console.log(data)
              callback && callback(data);
          })
      })
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
      this.getStacking(this.state.checked, this.state.pageNum, (res) => {
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

    popFilter() {
      this.refs.filter.popFilter();
    }

    componentDidMount() {
      this.getWarehouseList();
      this.getFirstPage(this.state.defaultChecked)
      this.eventAdd();
    }

    render() {
      const { list, defaultChecked, filterList } = this.state;
      return (
        <Page infinite className="stable-timeout-page">
            <Navbar backLink="实时看板" title="超时统计">
              <a href="#" slot="nav-right" onClick={ (e) => this.popFilter() }>过滤</a>
            </Navbar>
            <Filter defaultChecked={ defaultChecked } submit={ (checked) => this.filterSubmit(checked) } filterList={ filterList } ref="filter" />
            <List className="list-view">
              {
                list ? 
                list.map( (item, key) => 
                  <ListItem key={key} header={ item.userId }>
                    <div slot="title" className="item-meta">
                        <div className="meta">超时5分钟次数</div>
                        <div className="meta">超时10分钟次数</div>
                    </div>
                    <span slot="media">{ key+1 }</span>
                    <div slot="after" style={{ marginTop: '22px' }}>
                        <div className="meta">{ item.timeOut5 }</div>
                        <div className="meta">{ item.timeOut10 }</div>
                    </div>
                </ListItem>
                ): ''
              }
            </List>
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