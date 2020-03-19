import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class MainPage extends React.Component { 
    componentWillMount() {
        this.props.history.listen(route => {
          this.props.changeRoute(route.pathname)
        })
    }
    
    render() { 
        return (<div>
            主页
        </div>)
    }
}

const mapStateToProps = (state) => {
    return {
      list: state,
    }
}
  
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(RouteActionCreators, dispatch);
}
  
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainPage)