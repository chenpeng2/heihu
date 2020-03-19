import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions, List, ListItem } from 'framework7-react';

import ActionInner from '../../action-inner';

export default class extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            actionOpend: false,
            list: null,
            len: 0,
            time: '超时4小时',
            $times: [4, 10, 24, 48],
            times: ['超时4小时', '超时10小时', '超时24小时', '超时48小时']
        };
    }

    getLoadTimeout(timelimit) {
        window.axios({
            url: `/chart/doors/loadtimeout?timelimit=${timelimit}`,
            success: (res => {
                const data = JSON.parse(res.data);
                this.setState({
                    len: data.length,
                    list: data.slice(0, 6)
                })
            })
        })
    }

    formatTime(time) {
        var min= Math.floor(time%3600);
        return Math.floor(time/3600) + "小时" + Math.floor(min/60) + "分";
    }

    actionClick = (item, key, e) => {  // 切换
        e && e.stopPropagation()
        this.getLoadTimeout( this.state.$times[key] )
        this.setState({
            time: item
        });
        this.refs.actionsPop.close()
    }

    linkTo() {
        this.props.linkTo({
            status: { name: '超时', id: 2 }
        })
    }

    actionsPopEvent(e){
        e && e.stopPropagation();
        this.refs.actionsPop.open()
    }

    componentDidMount() {
        this.getLoadTimeout(4)
    }

    render() {
        const {list, len, times, time, actionOpend} = this.state;
        return (
                <Card>
                    <CardHeader style={{ alignItems: 'flex-start' }}>
                        <div className="top" onClick={ () => this.linkTo() }>
                            <div className="title">装柜超时</div>
                            <span className="name">根据装柜时长查看</span>
                        </div>
                        <div className="meta" onClick={ () => this.linkTo() }>
                            <span className="label">{ list && list.length } of { len }</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <span 
                            className="select-link"
                            onClick={ (e) => this.actionsPopEvent(e) }
                            >{ time }<i className="sap-icon icon-slim-arrow-down"></i></span>
                            <div onClick={ () => this.linkTo() }>
                                <List className="list-view" style={{ marginTop: '20px' }}>
                                    {
                                        list && list.map((item, key) => 
                                        <ListItem key={key} header={ '门' + item.doorId } title={"装柜时间: " + this.formatTime(item.loadTime) } after={ item.timeOut + " 小时"}>
                                            <i slot="media" className="sap-icon icon-fridge media"></i>
                                        </ListItem>
                                        )
                                    }
                                    {
                                        list && list.length === 0 ?
                                        <div style={{ textAlign: "center", padding: "30px 0", fontSize: '14px', opacity: 0.5 }}>暂无数据</div> : ''
                                    }
                                </List>
                            </div>
                            <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                                {
                                    actionOpend ? 
                                    <ActionInner handleClick={ this.actionClick }  list={ times } /> : ''   
                                }
                            </Actions>
                    </CardContent>
                </Card>
        )
    }
  };  