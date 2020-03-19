import { Table } from 'antd';
import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { DefaultButton } from 'office-ui-fabric-react';
import { connect } from "react-redux";
import ReactDOM from 'react-dom';

class TableComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        dataList: [],
    }
}

// componentWillMount() {
//   this.props.history.listen(route => {
//     this.props.changeRoute(route.pathname)
//   })
// }
//在钩子函数中处理
componentDidMount(){
  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      tel: '0571-22098909',
      phone: 18889898989,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      tel: '0571-22098333',
      phone: 18889898888,
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Sidney No. 1 Lake Park',
    },
    {
      key: '4',
      name: 'Jim Red',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'London No. 2 Lake Park',
    },
    {
      key: '5',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
    {
      key: '5',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
    {
      key: '6',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
    {
      key: '7',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
    {
      key: '8',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
    {
      key: '9',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
    {
      key: '10',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
    {
      key: '11',
      name: 'Jake White',
      age: 18,
      tel: '0575-22098909',
      phone: 18900010002,
      address: 'Dublin No. 2 Lake Park',
    },
  ]
  this.setState({
    dataList: data,
  })
  //注: 为Table设置ID 通过document.getElementById 也可以获取table元素
  const table = ReactDOM.findDOMNode(this.tableEl);
  const tableBody = table.querySelector('.ant-table-body');
  console.log(tableBody)
  let _scrollTop = 0;//保存上次滚动距离
  let isRun = false;//是否执行查询
  tableBody.addEventListener('scroll', () => {
    console.log(tableBody.scrollTo)
    if(tableBody.scrollTop === 0 ){
      _scrollTop = 0;
    }
    // 上一次滚动高度与当前滚动高度不同则是纵向滚动
    if (_scrollTop != tableBody.scrollTop) {
      //是否滑动到距离底部40px的位置
      const scorll = _scrollTop >= tableBody.scrollHeight-tableBody.clientHeight-40;
      //isRun为true时 代表已经执行查询
      if(isRun && scorll){
        return;
      }
      //_scrollTop < tableBody.scrollTop 判断是否向下滑动
      isRun = _scrollTop < tableBody.scrollTop && scorll;
      //保存当前滚动位置
      _scrollTop = tableBody.scrollTop;
      if (isRun) {
        const { dataList } = this.state
        console.log('load more')
        this.setState({
          dataList: dataList.concat(dataList)
        })
        // this.props.onQueryData("scroll");
      }
    }
  })
}
render() { 
    const renderContent = (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (index === 4) {
          obj.props.colSpan = 0;
        }
        return obj;
      };
      
      const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          render: (text, row, index) => {
            if (index < 4) {
              return <a href="javascript:;">{text}</a>;
            }
            return {
              children: <a href="javascript:;">{text}</a>,
              props: {
                colSpan: 5,
              },
            };
          },
        },
        {
          title: 'Age',
          dataIndex: 'age',
          render: renderContent,
        },
        {
          title: 'Home phone',
          colSpan: 2,
          dataIndex: 'tel',
          render: (value, row, index) => {
            const obj = {
              children: value,
              props: {},
            };
            if (index === 2) {
              obj.props.rowSpan = 2;
            }
            // These two are merged into above cell
            if (index === 3) {
              obj.props.rowSpan = 0;
            }
            if (index === 4) {
              obj.props.colSpan = 0;
            }
            return obj;
          },
        },
        {
          title: 'Phone',
          colSpan: 0,
          dataIndex: 'phone',
          render: renderContent,
        },
        {
          title: 'Address',
          dataIndex: 'address',
          render: renderContent,
        },
      ];
      
      // const data = ;
      const alertClicked = () => {
        alert('Clicked');
      };
      const { dataList } = this.state
 return (
    <div>
        <DefaultButton
            primary
            data-automation-id="test"
            disabled={false}
            checked={false}
            text="Create account"
            // onClick={alertClicked}
            split={true}
            aria-roledescription={'split button'}
            style={{ height: '35px' }}
            menuProps={{
            items: [
                {
                key: 'emailMessage',
                text: 'Email message',
                iconProps: { iconName: 'Mail' }
                },
                {
                key: 'calendarEvent',
                text: 'Calendar event',
                iconProps: { iconName: 'Calendar' }
                }
            ]
            }}
            />
        <Table 
        columns={columns} 
        dataSource={dataList} 
        pagination={false}
        // loading={tableLoading}
        scroll={{y: 500}}
      ref={(ref)=>this.tableEl=ref}bordered />
    </div> ) 
}

}

function mapStateToProps(state) {
  return {
    list: state,
  };
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators({ RouteActionCreators }, dispatch);
// }

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(RouteActionCreators, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TableComponent);