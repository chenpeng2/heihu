import React, { PureComponent } from 'react';
import { Page, Navbar, Searchbar, Link } from 'framework7-react';

import { connect } from 'react-redux';
import './style.less';

import { setCurrentDepartment } from '../../redux/action'

// 主页
class ViewContainer extends PureComponent {
    constructor(props) {
      super(props);
    }

    navigatePage(id, name) { 
      // const depart = { id: id, name: name };
      // this.props.setCurrentDepart(depart); // 设置当前部门
      this.$f7router.navigate('/actual-board/', {
        props: {
          depart: { id: id, name: name }
        }
      })  // 部门链接到实时看板
    }

    render() {
      return (
        <Page className="menu-page">
          <Navbar title="Walmart"></Navbar> 

          <Searchbar
            disableButtonText="取消"
            placeholder="搜索"
            clearButton={false}
          ></Searchbar>

          <div className="tab-box bottom-border">
            <Link tabLink="#tab-1" tabLinkActive>实时看板</Link>
          </div>

          <div className="department-menu">
            {/* <div className="item">
              <h3 className="name">收货部</h3>
              <div className="remark"><span>今日累计收货</span><i></i></div>
              <div className="info" style={{ justifyContent: 'flex-end' }}>
                <i className="sap-icon icon-add-product"></i>
                <div className="green">
                  <i className="icon-arrow-up"></i>  11.5%
                  <div className="strong">262K</div>
                </div>
              </div>
            </div> */}
             <div className="item" onClick={ (e) => this.$f7router.navigate('/gm-page/') }>
              <h3 className="name">GM</h3>
              <div className="info" style={{ justifyContent: 'flex-end' }}><i className="sap-icon icon-org-chart"></i></div>
            </div>
            <div className="item" onClick={ (e) => this.navigatePage(0, '分货部', e) }>
              <h3 className="name">分货部</h3>
              <div className="info" style={{ justifyContent: 'flex-end' }}>
                <i className="sap-icon icon-customer-and-supplier"></i>
              </div>
            </div>
            <div className="item" onClick={ (e) => this.navigatePage(1, '出货部', e) }>
              <h3 className="name">出货部</h3>
              <div className="info" style={{ justifyContent: 'flex-end' }}><i className="sap-icon icon-offsite-work"></i></div>
            </div>
            <div className="item" onClick={ (e) => this.$f7router.navigate('/stable/') }>
              <h3 className="name">稳定库存</h3>
              <div className="info" style={{ justifyContent: 'flex-end' }}><i className="sap-icon icon-fridge"></i></div>
            </div>
            {/* <div className="item" onClick={ (e) => this.navigatePage(4, e) }>
              <h3 className="name">运输部</h3>
              <div className="remark"><span>等待装柜车辆</span><i></i></div>
              <div className="info">
                <i className="sap-icon icon-shipping-status"></i>
                <span className="strong">30</span>
              </div>
            </div> */}
          </div>        
        </Page>
      )
    }
};

const mapDispatch = (dispatch) => {
  return {
    setCurrentDepart(depart) {
      return dispatch(setCurrentDepartment(depart))
    }
  }
}

const mapState = (state) => {
  return { 
    list: state.department.list
  }
}

export default connect(mapState, mapDispatch)(ViewContainer)



