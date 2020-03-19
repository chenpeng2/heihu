import React, { PureComponent } from 'react';
import { Page, Navbar, Searchbar, List, ListItem, Progressbar } from 'framework7-react';

import Filter from './components/filter'
import { connect } from 'react-redux'
import Span from '../../../components/span'

class ShopStatusPage extends PureComponent {
    constructor(props) {
      super(props);
      let defaultChecked = [{name: '全部', id: ''}, {name: '全部', id: ''}, {name: '板数', id: 'plt'}];
      if(props.status) {
        defaultChecked[1] = props.status
      }
      if(props.wh) {
        defaultChecked[0] = props.wh
      }
      this.state = {
        list: null,
        load: false,
        pageNum: 1,
        pageSize: 20,
        total: null,
        checked: null,
        allowInfinite: true,
        defaultChecked: defaultChecked,
        filterList: [{
          name: '选择仓库',
          items: this.props.whList.concat([{name: '全部', id: ''}])
        }, {
          name: '装柜状态',
          items: [{name: '即将满柜', id: 1}, {name: '超时', id: 2}, {name: '装柜中', id: 3}, {name: '已摆柜', id: 4},{name: '等待摆柜', id: 5}, {name: '全部', id: ''}]
        }, {
          name: '选择单位',
          items: [{name: '箱数', id: 'unit'}, {name: '板数', id: 'plt'}]
        }]
      };
    }

    popFilter() {
      this.refs.filter.popFilter();
    }

    navigatePage(item) {
      this.$f7router.navigate('/shop-detail/', {
        props: {
          detail: item
        }
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
      this.getDoorsDetail(this.state.checked, this.state.pageNum, (res) => {
        this.setState({ allowInfinite: true })
          const list = this.state.list;
          this.setState({
            total: res.total,
            list: list.concat(res.result)
          })
          if(this.state.list.length >= this.state.total) {
             this.clearInfinite()
          }
      })
    }

    getFirstPage(checked, callback) {
      this.getDoorsDetail(checked, 1, (res) => {
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
      this.getFirstPage(this.state.defaultChecked)
      this.eventAdd();
    }

    getDoorsDetail(checked, pageNum, callback) {
      const { pageSize } = this.state;
      const whsidParam = checked && checked[0].id ? `&whsid=${checked[0].id}` : ''
      const filterParam = checked && checked[1].id ? `&&filter=${checked[1].id}` : ''
      const unitParam = checked && checked[2].id ? `unit=${checked[2].id}` : 'unit=unit'
      window.axios({
        url: `/chart/doors/detail/?${unitParam}${filterParam}${whsidParam}&pageNum=${pageNum}&pageSize=${pageSize}`,
        success: (res => {
          const data = JSON.parse(res.data);
           callback && callback(data);
        })
      })
    }

    getTagName(tags) {
      const tagMap = [{en: 'isAlmostFull', zh: '即将满柜'}, {en: 'isTimeOut', zh: '超时'}, {en: 'isLoading', zh: '装柜中'}, {en: 'isTrailed', zh: '已摆柜'}, {en: 'isToTrail', zh: '等待摆柜'}];
      for(let i = 0, len = tagMap.length; i < len; i++) {
        if( tags[tagMap[i].en] ) {
          return tagMap[i].zh
        }
      }
    }

    render() {
      const { list, defaultChecked, filterList, load, total } = this.state
      return (
        <Page infinite onPageAfterIn={ () => this.setState({ load: true }) } className="shop-list-page">
            <Navbar backLink="实时看板" title="门店状态">
              <a href="#" slot="nav-right" onClick={ (e) => this.popFilter() }>过滤</a>
            </Navbar>

            <Searchbar
                disableButtonText="取消"
                placeholder="搜索"
                clearButton={false}
            ></Searchbar>

            <Filter defaultChecked={ defaultChecked } submit={ (checked) => this.filterSubmit(checked) } filterList={ filterList } ref="filter" />
            <List className="list-view">
              {
                list  ? 
                list.map( (item, key) => 
                  <ListItem key={key} onClick={ (e) => this.navigatePage(item, e) } header={ item.door + ' ' + item.store }>
                    <div slot="title" className="item-meta">
                        <div className="meta">已装柜</div>
                        <div className="meta">装柜进度</div>
                    </div>
                    <span slot="media">{ key + 1 }</span>
                    <div slot="after">
                        <div className="meta">
                          { item.tagList.isAlmostFull ? <i className="sap-icon icon-message-warning yellow"></i> : '' }
                          { item.tagList.isTimeOut ? <i className="sap-icon icon-pending red"></i> : '' }
                          { item.tagList.isLoading ? <i className="sap-icon icon-message-success green"></i> : '' }
                          { item.tagList.isToTrail ? <i className="sap-icon icon-fridge gray"></i> : '' }
                          { item.tagList.isTrailed ? <i className="sap-icon icon-lateness gray"></i> : '' }
                          { this.getTagName(item.tagList) }
                        </div>
                        <div className="meta strong">{ typeof item.loaded === 'undefined' ? '--' : item.loaded }</div>
                        {
                          typeof item.wgt !== 'undefined' ? 
                          <div className="meta progress-box">
                            <Progressbar 
                              color={ item.wgt >= 0.8 ? 'red' : item.wgt >= 0.5 ? "orange": "green" }
                              progress={ item.wgt >= 1 ? 100 : item.wgt*100 }
                              ></Progressbar>
                              { Math.round(item.wgt*100) }% 
                          </div> :
                          <div className="meta progress-box">--</div>
                        }
                    </div>
                </ListItem>
                ) : ''
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
  const mapDispatch = (dispatch) => {
    return {
        
    }
  }
  
  const mapState = (state) => {
    return {
      whList: state.department.warehouse
    }
  }
  
  export default connect(mapState, mapDispatch)(ShopStatusPage)