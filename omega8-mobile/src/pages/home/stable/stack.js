import React, { PureComponent } from 'react';
import { Page, Navbar, ListItem, List } from 'framework7-react';
import './index.less';

import { connect } from 'react-redux'

class GmPage extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        load: false,
        pageNum: 1,
        total: null,
        utd: '',
        allowInfinite: true,
        list: []
      };
    }

    getFirstPage(callback) {
      this.getStacking(1, (res) => {
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

    getStacking(pageNum, callback) {
        window.axios({
            url: `/sstk/chart/sstk/picking/slot/stacking/detail?pageNum=${pageNum}&pageSize=20`,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data);
                const list = this.state.list;
                this.setState({
                    utd: data.utd,
                    total: data.total,
                    list: list.concat(data.result)
                })
                callback && callback()
            })
        })
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
      this.setState({ pageNum: pageNum + 1 })
      this.getStacking(this.state.pageNum, () => {
        this.setState({ allowInfinite: true })
        if(this.state.list.length >= this.state.total) {
           this.clearInfinite();
        }
      })
    }

    componentDidMount() {
      this.getStacking(1)
      this.eventAdd();
    }

    render() {
      const { list, utd } = this.state;
      return (
        <Page infinite className="stable-timeout-page">
            <Navbar backLink="实时看板" title="主货槽拣货拥堵"></Navbar>
            <List className="list-view">
              {
                list ? 
                list.map( (item, key) => 
                  <ListItem key={key} header={ item.id }>
                    <div slot="title" className="item-meta">
                        <div className="meta">剩余货量</div>
                        <div className="meta">拣货人数</div>
                    </div>
                    <span slot="media">{ key+1 }</span>
                    <div slot="after" style={{ marginTop: '22px' }}>
                        <div className="meta">{ item.stackedUnit + utd }</div>
                        <div className="meta">{ item.userCount }</div>
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