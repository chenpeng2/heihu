import React, { Component } from 'react';
import { FilterSortSearchBar, Input, Select, DatePicker, Button } from 'components';
import moment, { formatToUnix } from 'utils/time';
import SearchSelect from 'components/select/searchSelect';

const { ItemList, Item } = FilterSortSearchBar;
const { RangePicker } = DatePicker;
const { Option } = Select;

type propTypes = {
  form: any,
  onFilter: () => {},
};

class DocumentFilter extends Component<propTypes> {
  state = {};

  render() {
    const {
      form: { getFieldDecorator },
      onFilter,
    } = this.props;
    return (
      <FilterSortSearchBar searchDisabled>
        <ItemList>
          <Item label="文档编码">{getFieldDecorator('codeLike')(<Input />)}</Item>
          <Item label="文档版本">{getFieldDecorator('versionLike')(<Input />)}</Item>
          <Item label="文档名称">{getFieldDecorator('nameLike')(<Input />)}</Item>
          <Item label="文档状态">
            {getFieldDecorator('status', {
              initialValue: 'all',
            })(
              <Select>
                <Option value="all">全部</Option>
                <Option value={1}>已发布</Option>
                <Option value={0}>已归档</Option>
              </Select>,
            )}
          </Item>
          <Item label="文档格式">
            {getFieldDecorator('type', {
              initialValue: 'all',
            })(
              <Select>
                <Option value="all">全部</Option>
                <Option value="PDF">PDF</Option>
                <Option value="JPG">JPG</Option>
                <Option value="JPEG">JPEG</Option>
                <Option value="PNG">PNG</Option>
              </Select>,
            )}
          </Item>
          <Item label="创建人">{getFieldDecorator('creatorId')(<SearchSelect type="user" />)}</Item>
          <Item label="创建时间">
            {getFieldDecorator('createdAt', {})(
              <RangePicker
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                format="YYYY-MM-DD HH:mm:ss"
                allowClear
              />,
            )}
          </Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            onFilter({ page: 1 });
          }}
        >
          查询
        </Button>
      </FilterSortSearchBar>
    );
  }
}

export default DocumentFilter;
