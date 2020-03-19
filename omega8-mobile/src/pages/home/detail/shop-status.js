import React, { PureComponent } from 'react';
import { Page, Navbar, Card, List, ListItem, Actions, Progressbar, Swiper, SwiperSlide } from 'framework7-react';
import ActionInner from '../board/components/action-inner';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          list: null,
          pageLoaded: false,
          isUnit: false,
          unit: '板数',
          units: ['板数', '箱数']
       };
    }
    getFulledDoor() {
        window.axios({
            url: `/chart/store/fulleddoor`,
            success: (res => {
                this.setState({
                    list: JSON.parse(res.data).slice(0, 20)
                })
            })
        })
    }
    actionClick = (item, key) => {
        this.setState({
            isUnit: key === 1,
            unit: item
        });
        this.refs.actionsPop.close()
    }

    formatValue(val) {
        return (typeof val === 'undefined' ? '--' : val)
    }

    componentDidMount() {
        this.getFulledDoor()
    }

    render() {
        const { list, pageLoaded, unit, isUnit } = this.state
        const utd = isUnit ? '箱' : '板';
      return (
        <Page className="shop-page" onPageAfterIn={ () => this.setState({ pageLoaded: true }) }>
            <Navbar backLink="关闭" title="即将满柜门店">
              <a href="#" slot="nav-right" onClick={ (e) => { this.$f7router.navigate('/shop-status-all/') } }>全部</a>
            </Navbar>
            {
                list && pageLoaded ?
                <Swiper pagination>
                {
                    list.map( (item, key) =>
                        <SwiperSlide key={ key }>
                            <Card className="inner">
                                    <div className="head bottom-border">
                                        <i className="sap-icon icon-shipping-status pic"></i>
                                        <div>
                                            <div className="name">门店{ item.store }（门柜{ item.door }）</div>
                                            <div className="meta">装柜开始时间 { item.loadStart }</div>
                                        </div>
                                    </div>
                                    <div className="bottom-border" style={{ color: '#0854A0', padding: '16px' }}>
                                        <span 
                                        className="select-link"
                                        onClick={ () => this.refs.actionsPop.open() }
                                        >{ unit }<i style={{ marginLeft: '14px' }} className="sap-icon icon-slim-arrow-down"></i></span>
                                    </div>
                                    <div className="bottom-border part">
                                        <div className="title">门店目前状态</div>
                                        <ul>
                                            <li className="item">
                                                <div className="lable">当前柜已装载重量</div>
                                                <div style={{ minWidth: '120px', position: 'relative' }}>
                                                    <Progressbar color={ item.wgt >= 0.8 ? 'red' : item.wgt >= 0.5 ? "orange": "green" } progress={ item.wgt >= 1 ? 100 : item.wgt*100 }></Progressbar>
                                                    <span className="progress-text">{ parseInt(item.wgt*100) }%</span>
                                                </div>
                                            </li>
                                            <li className="item">
                                                <div className="lable">当前柜已装载体积</div>
                                                <div style={{ minWidth: '120px', position: 'relative' }}>
                                                    <Progressbar color={ item.cube >= 0.8 ? 'red' : item.cube >= 0.5 ? "orange": "green" } progress={  item.cube >= 1 ? 100 : item.cube*100  }></Progressbar>
                                                    <span className="progress-text">{ parseInt(item.cube*100) }%</span>
                                                </div>
                                            </li>
                                            <li className="item">
                                                <div className="lable">C区剩余数量</div>
                                                <div className="cnt">{ isUnit ? this.formatValue(item.unit.valid) : this.formatValue(item.plt.valid) }{ utd }</div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bottom-border part">
                                        <div className="title">其他部门相关货物状态</div>
                                        <List className="list-view">
                                            <ListItem header="收货整板" title="可用货物" after={ (isUnit ? this.formatValue(item.unit.rCount) : this.formatValue(item.plt.rCount) ) + utd }>
                                                <i slot="media" className="sap-icon icon-add-product media"></i>
                                            </ListItem>
                                            <ListItem header="分货缓存区" title="可用货物" after={ ( isUnit ? this.formatValue(item.unit.sCount) : this.formatValue(item.plt.sCount) ) + utd }>
                                                <i slot="media" className="sap-icon icon-customer-and-supplier media"></i>
                                            </ListItem>
                                            <ListItem header="分货已组板" title="可用货物" after={ (isUnit ? this.formatValue(item.unit.scCount) : this.formatValue(item.plt.scCount) ) + utd }>
                                                <i slot="media" className="sap-icon icon-customer-and-supplier media"></i>
                                            </ListItem>
                                            <ListItem header="稳定库存" title="可用货物" after={ (isUnit ? this.formatValue(item.unit.ssCount) : this.formatValue(item.plt.ssCount) ) + utd }>
                                                <i slot="media" className="sap-icon icon-customer-and-supplier media"></i>
                                            </ListItem>
                                        </List>
                                    </div>
                            </Card>
                        </SwiperSlide>
                    )
                }
            </Swiper> : ''
            }

            <Actions ref="actionsPop">
                <ActionInner handleClick={ this.actionClick } list={ this.state.units } />
            </Actions>
        </Page>
      )
    }
  };  