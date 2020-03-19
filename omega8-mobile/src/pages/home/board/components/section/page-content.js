import React, { PureComponent } from 'react';
import { Card } from 'framework7-react';

import SwiperContainer from '../swiperContainer';

// 出货部
import Card1 from '../card/chuhuo/card1';
import Card2 from '../card/chuhuo/card2';
import Card3 from '../card/chuhuo/card3';
import Card4 from '../card/chuhuo/card4';
import Card5 from '../card/chuhuo/card5';
import Card6 from '../card/chuhuo/card6';

// 分货部
import CardFenhuo1 from '../card/fenhuo/card1';
import CardFenhuo2 from '../card/fenhuo/card2';
import CardFenhuo3 from '../card/fenhuo/card3';
import CardFenhuo4 from '../card/fenhuo/card4';
import CardFenhuo5 from '../card/fenhuo/card5';
import CardFenhuo6 from '../card/fenhuo/card6';

import { connect } from 'react-redux';

class PageContent extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          doors: {total: '', full: ''}  // 满柜信息
      }
    }

    linkToReserve = (param) => { // 图表组件内部链接到其他页面
        this.linkTo('/reserve/', param)
    }

    linkToTimeout = (param) => { // 图表组件内部链接到其他页面
        this.linkTo('/timeout/', param)
    }

    linkToWork = (param) => { // 图表组件内部链接到其他页面
        this.linkTo('/work-amount/', param)
    }
    linkToCStatus = (param) => { // 图表组件内部链接到其他页面
        this.linkTo('/c-status/', param)
    }

    linkToAllStatus = (param) => {
        this.linkTo('/shop-status-all/', param)
    }

    linkTo(url, param) {  // 链接
        this.props.router.navigate(url, {
            props: param
        })
    }

    componentDidMount() {
        this.getStatisticDoors()
    }

    render() {  // 按部门加载
        return (
            <div>
                {/* <SwiperContainer door={ this.state.doors.full } /> */}
                { this.initRender(this.props.depart.id) }
            </div>
        )
    }

    initRender(type) {
        if(type === 1) {
            return this.renderChuhuo();
        }else if(type === 0) {
            return this.renderFenhuo();
        }
        return type
    }

    renderFenhuo() {
        const { sorting } = this.props;
        return (
            <div>
                { this.renderTop({name: '当日累计分拣货量', value: sorting}) }

                <CardFenhuo1 linkTo={ this.linkToReserve } />

                <CardFenhuo2 />

                <CardFenhuo3 />

                <CardFenhuo4 linkTo={ this.linkToTimeout } />

                { this.renderCard(this.state.doors) }

                <CardFenhuo5 />
                <CardFenhuo6 linkTo={ this.linkToReserve } />
            </div>
        )
    }

    renderChuhuo() {
        const { donejob } = this.props;
        return (
            <div>
                { this.renderTop({name: '已完成工作量/板', value: donejob}) }

                <Card1 depart={ this.props.depart } linkTo={ this.linkToWork } />

                <Card2 depart={ this.props.depart } linkTo={ this.linkToCStatus } />

                { this.renderCard(this.state.doors) }

                <Card3 />

                <Card4 linkTo={ this.linkToAllStatus } />

                <Card5 linkTo={ this.linkToAllStatus } doors={ this.state.doors } />

                <Card6 linkTo={ this.linkToAllStatus } />
            </div>
        )
    }

    renderTop(data) {
        const { full } = this.state.doors
        return (
            <div className="swiper-container">
                <div className="cnt">
                <div>
                    <div className="strong">{ data.value }</div>
                        <span>{ data.name }</span>
                    </div>
                    <div>
                        <div className="strong">{ full === '' ? '--' : full }</div>
                        <span>即将满柜/柜</span>
                    </div>
                </div>
            </div>
        )
    }

    renderCard(door) {
        return (
            <Card className="card-cnt-1">
                <div className="lf">
                    <div className="title">即将满柜</div>
                    <div className="desc">货柜容量即将达到80%</div>
                    <a href="#" onClick={ (e) => { this.linkTo('/shop-status-all/', { status: {name: '即将满柜', id: 1} }, e) } }>查看全部</a>
                </div>
                <div className="rt" onClick={ (e) => this.linkTo('/shop-status/', e) }>
                    <div className="strong">{ door.full }</div>
                    {/* <div className="normal">of</div> */}
                    {/* <div className="normal">{ door.all }</div> */}
                    <i className="sap-icon icon-dimension"></i>
                </div>
            </Card>
        )
    }

    getStatisticDoors() {
        window.axios({
            url: '/statistic/doors/fullcontainer',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data)
                this.setState({
                    doors: data
                })
            })
        })
    }
  };

  const mapDispatch = (dispatch) => {
    return {}
  }
  
  const mapState = (state) => {
    return { 
      donejob: state.board.donejob,
      sorting: state.board.sorting
    }
  }

  export default connect(mapState, mapDispatch)(PageContent)