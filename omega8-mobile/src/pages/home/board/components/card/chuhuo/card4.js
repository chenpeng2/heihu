import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent } from 'framework7-react';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          len: 0,
          list: null
      }
    }

    getDoorsDetail(pageNum, pageSize) {
        window.axios({
          url: `/chart/doors/detail/?filter=4&unit=plt&pageNum=${pageNum}&pageSize=${pageSize}`,
          success: (res => {
            const data = JSON.parse(res.data);
            this.setState({
                len: data.total,
                list: data.result
            })
          })
        })
    }

    linkTo() {
        this.props.linkTo({
            status: { name: '已摆柜', id: 4 }
        })
    }

    formatTime(time) {
        var min= Math.floor(time%3600);
        const hh = Math.floor(time/3600);
        const mm = Math.floor(min/60);
        return ( hh ? hh + "小时" : '' ) + ( mm ? mm + "分" : '' );
    }

    componentDidMount() {
        this.getDoorsDetail(1, 6)
    }

    render() {
        const { list, len } = this.state;
        return (
            <div onClick={ () => this.linkTo() }>
                <Card>
                    <CardHeader style={{ alignItems: 'flex-start' }}>
                    <div className="top">
                        <div className="title">已摆柜柜门状态</div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6F7275' }}>
                        { list && list.length } of { len }
                        {/* <div>12:20 7月7日</div> */}
                    </div>
                    </CardHeader>
                    <CardContent style={{ padding: 0 }}>
                        <table className="default-table" cellPadding="0" cellSpacing="0" width="100%">
                            <thead>
                                <tr>
                                    <th width="30%">门</th>
                                    <th width="">等待装柜时间</th>
                                    <th>C区剩余货量(板)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    list && list.map( (item, key) =>
                                        <tr key={key}>
                                            <td className="strong">{ item.door }</td>
                                            <td>{ this.formatTime(item.waitTrail) }</td>
                                            <td>{ item.cStored }</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                            
                    </CardContent>
                </Card>
            </div>
        )
    }
  };  