import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Menu, Dropdown, Icon, Select, DatePicker, Affix } from 'antd'
import { PrimaryButton } from 'office-ui-fabric-react';
import BootstrapTableComponent from 'component/tables/bootstrapTable'
import TableComponent from 'component/tables/antdTable'
import EditableFormTable  from 'component/tables/EditableFormTable'

const { Option } = Select;
class InputDataPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentView: '标准视图',
            isShowFilter: true,
            isPingFilters: false,
        }
    }


  

    render() { 
        const { isPingFilters } = this.state
        return (
        <div>
            <div className="main-panel-light">       
                {/* <BootstrapTableComponent /> */}
                {/* <TableComponent /> */}
                <EditableFormTable />
            </div>
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
)(InputDataPage);