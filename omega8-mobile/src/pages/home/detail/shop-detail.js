import React, { PureComponent } from 'react';
import { Page, Navbar, Chip, Progressbar, List, ListItem } from 'framework7-react';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = { };
    }

    formatTime(time) {
      var min= Math.floor(time%3600);
      return Math.floor(time/3600) + "小时" + Math.floor(min/60) + "分";
    }

    popFilter() {
        this.refs.filter.popFilter();
      }

    render() {
      const { detail } = this.props;
      return (
        <Page className="shop-detail-page">
            <Navbar backLink="门店状态" title="详情"></Navbar>
            <div className="banner">
              <div className="title">
                <h3>{ detail.door + ' ' + detail.store }</h3>
                {/* <span>20 mins ago</span> */}
              </div>
              {/* <div className="name">仓库三</div> */}
              <div className="chip-box">
              { detail.tagList.isAlmostFull ? <Chip className="yellow-theme" text="即将满柜"></Chip> : '' }
              { detail.tagList.isTimeOut ? <Chip className="red-theme" text="超时"></Chip> : '' }
              { detail.tagList.isLoading ? <Chip className="green-theme" text="装柜中"></Chip> : '' }
              { detail.tagList.isToTrail ? <Chip className="gray-theme" text="已摆柜"></Chip> : '' }
              { detail.tagList.isTrailed ? <Chip className="gray-theme" text="未摆柜"></Chip> : '' }
              </div>
              <div className="meta">已装柜<span>{ detail.loaded }</span></div>
              <div className="progress-box">
                <span>装柜进度</span>
                <div className="inner">
                  <Progressbar 
                    color={ detail.wgt >= 0.8 ? 'red' : detail.wgt >= 0.5 ? "orange": "green" } 
                    progress={ typeof detail.wgt === 'undefined' ? 0 : (detail.wgt >= 1 ? 100 : detail.wgt*100) }
                    ></Progressbar>
                </div>
                { typeof detail.wgt === 'undefined' ? '--' : Math.round(detail.wgt*100) }% 
              </div>
            </div>

            <List simple-list className="list-simple">
              <ListItem className="top" title="当前状态"></ListItem>
              <ListItem header="当前柜已装载体积">
                <div slot="title">
                  <Progressbar 
                    color={ detail.cube >= 0.8 ? 'red' : detail.cube >= 0.5 ? "orange": "green" }
                    progress={ typeof detail.cube === 'undefined' ? 0 : ( detail.cube >= 1 ? 100 : detail.cube*100) }
                    ></Progressbar>
                    { typeof detail.cube === 'undefined' ? '--' : Math.round(detail.cube*100) }% 
                </div>
              </ListItem>
              <ListItem header="C区货量" title={ detail.cStored }></ListItem>
              <ListItem header="C区容量" title={ detail.cTotal }></ListItem>
            </List>

            <List simple-list className="list-with-meida">
              <ListItem className="top" title="其他部门货量"></ListItem>
              <ListItem header="收货整板" title={ detail.rCount }>
                <i slot="media" className="sap-icon icon-add-product"></i>
              </ListItem>
              <ListItem header="分货缓存区" title={ detail.sCount }>
                <i slot="media" className="sap-icon icon-customer-and-supplier"></i>
              </ListItem>
              <ListItem header="分货已组板" title={ detail.scCount }>
                <i slot="media" className="sap-icon icon-customer-and-supplier"></i>
              </ListItem>
              <ListItem header="稳定库存" title={detail.ssCount}>
                <i slot="media" className="sap-icon icon-customer-and-supplier"></i>
              </ListItem>
            </List>

            <List simple-list className="list-simple">
              <ListItem header="装柜超时" title={ typeof detail.timeOut === 'undefined' ? '未超时' : '超时' + detail.timeOut + '小时' }></ListItem>
              <ListItem header="装柜时间" title={ this.formatTime(detail.loadTime) }></ListItem>
              <ListItem header="等待装柜时间" title={ this.formatTime(detail.waitTrail) }></ListItem>
            </List>
        </Page>
      )
    }
  };  