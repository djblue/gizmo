var React = require('react');
var Navigation = require('react-router').Navigation;

var auth = require('../stores/auth');

var Login = React.createClass({
  getInitialState: function () {
    return {
      url: window.location.origin,
      name: '',
      pass: ''
    }
  },
  handleUpdate: function (key) {
    return function (e) {
      var obj = {};
      obj[key] = e.target.value;
      this.setState(obj);
    }.bind(this);
  },
  login: function () {
    auth.login(this.state);
    auth.on('login', this.goHome);
  },
  mixins: [Navigation],
  goHome: function () {
    this.transitionTo('/');
  },
  render: function () {
    return (
      <div className="login">
        <div className="center">
          <input className="input"
                 type="text"
                 placeholder="url..."
                 onChange={this.handleUpdate('url')}
                 value={this.state.url} />
          <input className="input"
                 type="text"
                 placeholder="name..."
                 onChange={this.handleUpdate('name')}
                 value={this.state.name} />
          <input className="input"
                 type="password"
                 placeholder="pass..."
                 onChange={this.handleUpdate('pass')}
                 value={this.state.pass} />
          <button onClick={this.login}>Login</button>
        </div>
      </div>
    );
  }
});

module.exports = Login;
