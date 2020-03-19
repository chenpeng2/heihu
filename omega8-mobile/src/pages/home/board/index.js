import React, { PureComponent } from 'react';
import { Page, Navbar} from 'framework7-react';
import './index.less' 
import PageContent from './components/section/page-content'  // 页面内容

import { connect } from 'react-redux'
import { pageAfterInCallback } from '../../../redux/action'

class Board extends PureComponent {
    constructor(props) {
      super(props);
    }

    // pageAfterIn = (e) => {  // 页面动画结束后加载echarts， 防止阻塞
    //     this.props.pageAfterIn()
    // }


    render() {  // 实时看板页面
        const depart = this.props.depart; // 部门
        return (
            <Page onPageAfterIn={ () => this.props.pageAfterIn() } className="board-page">
                <Navbar backLink="主页" title={ depart.name + '实时看板' }></Navbar>
                <PageContent
                    depart={ depart }
                    router={ this.$f7router }  // 路由api
                /> 
            </Page>
        )
    }
  };

  const mapDispatch = (dispatch) => {
      return {
          pageAfterIn() {
              return dispatch(pageAfterInCallback(true))
          }
      }
  }

  const mapState = (state) => {
      return { }
  }

  export default connect(mapState, mapDispatch)(Board)