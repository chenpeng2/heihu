import React, { PureComponent } from 'react';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = { };
    }

    render() {
        const { selectItem, total} = this.props;
        return (
            <div className="bottom-border detail-2">
                <div className="tr">
                    <div className="td th"></div>
                    <div className="td">总计</div>
                    <div className="td label">{ selectItem ? selectItem.name : '未选择' }</div>
                </div>
                {
                    selectItem && selectItem.data.map( (item, key) =>
                        <div className="tr" key={key}>
                            <div className="td th">{item.name}</div>
                            <div className="td">{ total[item.name] }</div>
                            <div className="td strong">{ item.count ? item.count : '--' }</div>
                        </div>
                    )
                }
            </div>
        )
    }
  };  