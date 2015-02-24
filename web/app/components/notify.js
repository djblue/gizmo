var React = require('react');

var notify = require('../stores/notify');

var Notify = React.createClass({
  getInitialState: function () {
    return {
      notifications: notify.getAll()
    };
  },
  handleRemove: function (n) {
    return function () { notify.remove(n); };
  },
  handleNotifications: function (notifications) {
    this.setState({
      notifications: notifications
    });
  },
  componentDidMount: function () {
    notify.on('notifications', this.handleNotifications);
  },
  render: function () {
    var items = this.state.notifications.map(function (n) {
      return (
        <div className={'notify-' + n.level}>
          {n.message}
          <div className="close" onClick={this.handleRemove(n)}>
            <i className="fa fa-close"></i>
          </div>
        </div>
      );
    }.bind(this));
    return (
      <div className="notifications">
        {items}
      </div>
    );
  }
});

module.exports = Notify;
