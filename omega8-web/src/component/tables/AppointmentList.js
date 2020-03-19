import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';

export default class AppointMentList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            department: 'All',
            outTime: 4,
            list: [{
                label: '预约箱数',
                iconName: 'add-product',
                value: 0,
                unitName: 'unit_utd',
                utd: '',
            }, {
                label: '预约数量',
                iconName: 'activity-item',
                value: 0,
                unitName: 'count_utd',
                utd: '',
            }, {
                label: 'PO数量',
                iconName: 'sales-order',
                value: 0,
                unitName: 'po_utd',
                utd: '',
            }],
            textToValue: {
                '预约箱数': 'unit',
                '预约数量': 'count',
                'PO数量': 'po',
            }
        }
    }

    componentDidMount() {
        const { listData } = this.props
        const { list, textToValue } = this.state
        for (let key in listData) {
            let index = list.findIndex(item => textToValue[item.label] === key)
            if (index !== -1) {
                list[index].value = listData[key]
                list[index].utd = listData[list[index].unitName]
            }
        }
        this.setState({
            list,
        })
    }


    changeSelect = (event) => {
        const { getData } = this.props
        getData(event.target.value)
        this.setState({
            outTime: event.target.value
        })
    }

    render() {
        const { list } = this.state
        return (
            <List component="nav" aria-label="mailbox folders">
                {list && list.length ?
                    list.map((list, index) => {
                        return (<div key={index}>
                            {index !== 0 && <Divider />}
                            <ListItem button key={index}>
                                <div className="list-item">
                                    <div className="list-content" >
                                        <div className="list-avatar">
                                            <i className={`sap-icon icon-${list.iconName}`}></i>
                                        </div>
                                        <div className="list-title">{list.label}</div>
                                    </div>
                                    <div className="value">{list.value}{list.utd}</div>
                                </div>
                            </ListItem>
                        </div>)
                    })
                    :
                    <div className="empty-content">
                        没有数据
                    </div>
                }
            </List>
        )
    }
}