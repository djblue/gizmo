var React = require('react');
var local = require('../stores/local');

var VideoPlayer = React.createClass({
  getInitialState: function () {
    return {
      time: local.get(this.props.src) || 0
    };
  },
  componentDidMount: function () {
    this.refs.player.getDOMNode().currentTime = this.state.time;
    this.interval = setInterval(this.updateCurrentTime, 5000);
  },
  componentWillUnmount: function () {
    clearInterval(this.interval);
  },
  updateCurrentTime: function () {
    local.set(this.props.src, this.refs.player.getDOMNode().currentTime);
  },
  render: function () {
    return (
      <video ref="player"
             className="video-player"
             autoplay controls
             src={this.props.src}>
      </video>
    );
  }
});

module.exports = VideoPlayer;
