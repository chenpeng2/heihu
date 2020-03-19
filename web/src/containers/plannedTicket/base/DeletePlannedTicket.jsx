import React from 'react';
import { Link, message, Popconfirm } from 'components';
import { deletePlannedTicket, canIDeletePlannedTicket } from 'services/cooperate/plannedTicket';
import { history } from 'routes';
import { PLAN_TICKET_STATUS_CANCELED, PLAN_TICKET_NORMAL } from 'constants';
import PropTypes from 'prop-types';

const Popiknow = Popconfirm.Popiknow;

class DeletePlannedTicket extends React.PureComponent {
  state = {
    showNotDelete: false,
    msg: '',
    canDelete: false,
  };

  checkCanDelete = async () => {
    const {
      data: {
        data: { first, second },
      },
    } = await canIDeletePlannedTicket(this.props.code);
    this.setState({ showNotDelete: !first, msg: second, canDelete: first });
  };

  render() {
    const { code, deleteCallback, status, icon = 'delete', category, ...rest } = this.props;
    const { showNotDelete, msg, canDelete } = this.state;
    const handleDelete = async () => {
      await deletePlannedTicket(code);
      if (typeof deleteCallback === 'function') {
        deleteCallback();
      } else {
        history.push('/cooperate/plannedTicket');
      }
      message.success('删除成功!');
    };
    if (status !== PLAN_TICKET_STATUS_CANCELED || category !== PLAN_TICKET_NORMAL) {
      return null;
    }

    if (canDelete) {
      return (
        <Popconfirm
          visible
          title="删除后，数据无法恢复。确定删除吗？"
          onCancel={() => {
            this.setState({ canDelete: false });
          }}
          onVisibleChange={() => {
            this.setState({ canDelete: false });
          }}
          onConfirm={handleDelete}
        >
          <Link type="error" icon={icon} {...rest}>
            删除
          </Link>
        </Popconfirm>
      );
    }
    if (showNotDelete) {
      return (
        <Popiknow
          title={msg}
          visible
          onConfirm={() => this.setState({ showNotDelete: false })}
          onVisibleChange={() => this.setState({ showNotDelete: false })}
        >
          <Link type="error" icon={icon} {...rest}>
            删除
          </Link>
        </Popiknow>
      );
    }
    return (
      <Link type="error" icon={icon} onClick={this.checkCanDelete} {...rest}>
        删除
      </Link>
    );
  }
}

DeletePlannedTicket.propTypes = {
  code: PropTypes.string,
  deleteCallback: PropTypes.func,
  status: PropTypes.number,
};

DeletePlannedTicket.contextTypes = {
  changeChineseToLocale: () => {},
};

export default DeletePlannedTicket;
