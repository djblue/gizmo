var React = require('react');

var AudioPlayer = React.createClass({
  componentDidMount: function () {
    // audo play audio
    this.refs.player.getDOMNode().play();
    this.refs.player.getDOMNode().addEventListener('ended', this.props.timeout);
  },
  componentDidUpdate: function () {
    this.refs.player.getDOMNode().play();
  },
  componentWillUnmount: function () {
    this.refs.player.getDOMNode().removeEventListener('ended', this.props.timeout);
  },
  render: function () {
    return (
      <audio ref="player"
             className="audio-player"
             controls autoplay
             src={this.props.src}>
      </audio>
    );
  }
});

module.exports = AudioPlayer;
