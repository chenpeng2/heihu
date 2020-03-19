import React, { Component } from 'react';
import _ from 'lodash';

import { Button, message } from 'src/components';
import { editSubject, getSubjectDetail } from 'src/services/knowledgeBase/exceptionalEvent';
import BaseForm from './baseForm';

type Props = {
  style: {},
  onClose: () => {},
  form: {},
  fetchData: () => {},
  id: string,
};

class CreateType extends Component {
  props: Props;
  state = {
    subjectDetail: null,
    id: null,
  };

  componentDidMount() {
    const { id } = this.props;
    if (!id) return null;

    this.setState({ loading: true, id });
    getSubjectDetail(id)
      .then(res => {
        const data = _.get(res, 'data.data');

        const { overdueTimeout, priority, name, eventCategory, internal } = data || {};
        this.setState({
          subjectDetail: {
            overdueDate: overdueTimeout,
            priority: typeof priority === 'number' ? priority.toString() : priority,
            name,
            type: eventCategory ? eventCategory.id : null,
            internal,
          },
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  renderForm = () => {
    const { subjectDetail } = this.state;

    return <BaseForm ref={inst => (this.formInst = inst)} initialValue={subjectDetail} />;
  };

  renderFooterButtons = () => {
    const { id } = this.state;
    const { onClose, fetchData } = this.props;
    const buttonStyle = { width: 114 };

    return (
      <div style={{ paddingBottom: 35 }}>
        <div style={{ width: 280, margin: 'auto' }}>
          <Button
            type={'default'}
            style={{ ...buttonStyle, marginRight: 40 }}
            onClick={() => {
              if (onClose && typeof onClose === 'function') onClose();
            }}
          >
            取消
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => {
              this.formInst.validateFieldsAndScroll((err, values) => {
                if (err) return;

                const { name, priority, overdueDate, type } = values || {};
                editSubject(id, {
                  name,
                  priority,
                  overdueTimeout: overdueDate,
                  eventCategoryId: type,
                }).then(() => {
                  message.success('编辑异常主题成功');
                  if (typeof onClose === 'function') onClose();
                  if (typeof fetchData === 'function') fetchData();
                });
              });
            }}
          >
            完成
          </Button>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderForm()}
        {this.renderFooterButtons()}
      </div>
    );
  }
}

export default CreateType;
