var React = require('react');
var Navigation = require('react-router').Navigation;

var local = require('../stores/local');
var blobs = require('../stores/blobs');
var client = require('../stores/client');

var AudioPlayer = require('./audio-player');
var VideoPlayer = require('./video-player');

var Blobs = React.createClass({
  stop: function (e) {
    e.preventDefault();
    e.stopPropagation();
  },
  mixins: [Navigation],
  getInitialState: function () {
    return {
      minimized: local.get('minimized') || false
    };
  },
  toggle: function () {
    local.set('minimized', !this.state.minimized);
    this.setState({
      minimized: !this.state.minimized
    });
  },
  timeout: function () {
    var next = blobs.next(this.props.params.id)
    this.transitionTo('blobs', {id: next});
  },
  render: function () {
    var meta = this.props.meta.filter(blobs.byId(this.props.params.id))[0];
    if (meta !== undefined) {
      var url = client.createUrl('/blobs/' + meta._id);
      if (typeof meta.mime === 'string') {
        if (meta.mime.match(/^image\//)) {
          var control = (
            <img className="img" src={url} />
          );
        } else if (meta.mime.match(/^video\/mp4/)) {
          var control = (
            <VideoPlayer src={url} />
          );
        } else if (meta.mime.match(/^audio\//)) {
          var control = (
            <AudioPlayer timeout={this.timeout} src={url}/>
          );
        }
      }
      if (control === undefined) {
          var control = (
            <div className="center">No Preview</div>
          );
      }
      if (this.state.minimized) {
        var padding = (
          <div className="padding"></div>
        );
        var toggle = <i className="fa fa-plus"></i>
      } else {
        var toggle = <i className="fa fa-minus"></i>
      }
      return (
        <div onWheel={this.stop} onScroll={this.stop} onTouchMove={this.stop}>
          {padding}
          <div className={(this.state.minimized? 'side-panel-min' : 'side-panel')}>
            <div className="control">
              <span className="btn-left" onClick={this.toggle}>
                {toggle}
              </span>
            </div>
            {control}
            <div className="control">
              <a className="btn-right" href="#/">
                <i className="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }
});

module.exports = Blobs;
