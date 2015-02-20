var React = require('react');
var moment = require('moment');
var prettyBytes = require('pretty-bytes');

var $ = require('jquery');
var hljs = require('highlight.js');

var Router = require('react-router');
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;
var Navigation = Router.Navigation;

var blobStore = require('./blobStore');
var local = require('./localStore');

var SearchBar = React.createClass({
  getInitialState: function () {
    return {
      searchText: ''
    };
  },
  componentDidMount: function () {
    blobStore.on('update', this.handleUpdate);
  },
  handleUpdate: function () {
  },
  handleSearch: function (e) {
    blobStore.filter(e.target.value);
    this.setState({
      searchText: e.target.value
    });
    this.props.onSearch(e.target.value);
  },
  handleSubmit: function () {
  },
  handleUpload: function () {
    console.log('upload')
  },
  render: function () {
    return (
      <div className="search-bar">
        <div className="search-input">
        <input placeholder="search..."
               value={this.state.searchText}
               className="input"
               onKeyUp={this.handleSubmit}
               onChange={this.handleSearch}
               type="text"/>
        </div>
        <div className="search-bar-right">
          <button onClick={this.handleUpload} className="btn search-btn">upload</button>
        </div>
      </div>
    );
  }
});


var ItemView = React.createClass({
  render: function () {
    var items = this.props.meta
      .sort(function (a, b) {
        return moment(b.uploaded).valueOf()-
               moment(a.uploaded).valueOf(); 
      })
      .filter(function (meta) {
        return (meta.filename || '').toLowerCase().match(this.props.filter);
      }.bind(this)) 
      .map(function (meta) {

      if (this.props.params !== undefined) {
        if (this.props.params.id === meta._id) {
          var active = true;
        }
      }

      if (typeof meta.mime === 'string') {
        if (meta.mime.match('video')) {
          var icon = <i className="fa fa-play-circle"></i>
        } else if (meta.mime.match('mpeg')) {
          var icon = <i className="fa fa-music"></i>
        } else if (meta.mime.match('image')) {
          var icon = <i className="fa fa-picture-o"></i>
        } else if (meta.mime.match('application/pdf')) {
          var icon = <i className="fa fa-file-pdf-o"></i>
        }
      }

      if (icon === undefined) {
        var icon = <i className="fa fa-question-circle"></i>
      }

      var link = "http://localhost:3000/blobs/" + meta._id;

      return (
        <div className={active? 'search-item-active' : 'search-item'}>
          <Link to="blobs" params={{id: meta._id}}>
            <div className="preview">
              {icon}
            </div>
          </Link>
          <div className="meta">
            <table className="table">
              <tbody>
                <tr>
                  <td className="filename">{meta.filename}</td>
                  <td className="uploaded">{moment(meta.uploaded).fromNow()}</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="size">{prettyBytes(meta.size)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    }.bind(this));
    return (
      <div>
      {items}
      </div>
    );
  }
});

var Audio = React.createClass({
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

var Video = React.createClass({
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
    local.set(this.props.src, this.refs.player.getDOMNode().currentTime)
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

var Highlighter = React.createClass({
  getInitialState: function () {
    $.get(this.props.src, this.handleCode, 'text');
    return { code: '' };
  },
  handleCode: function (code) {
    console.log(code);
    this.setState({ code: code });
  },
  render: function () {
    return (
      <pre>
        <code dangerouslySetInnerHTML={{__html: hljs.highlightAuto(this.state.code).value}} />
      </pre>
    );
  }
});

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
    var next = blobStore.next(this.props.params.id)
    this.transitionTo('blobs', {id: next});
  },
  render: function () {
    var meta = this.props.meta.filter(blobStore.byId(this.props.params.id))[0];
    if (meta !== undefined) {
      var url = 'http://192.168.1.66:3000/blobs/' + meta._id;
      if (typeof meta.mime === 'string') {
        if (meta.mime.match(/^image\//)) {
          var control = (
            <img className="img" src={url} />
          );
        } else if (meta.mime.match(/^video\/mp4/)) {
          var control = (
            <Video src={url} />
          );
        } else if (meta.mime.match(/^audio\//)) {
          var control = (
            <Audio timeout={this.timeout} src={url}/>
          );
        } else if (meta.mime.match(/application\/javascript/)) {
          var control = (
            <Highlighter src={url} />
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

var App = React.createClass({
  componentWillMount: function () {
    blobStore.fetch();
    blobStore.on('update', this.updateItems);
    blobStore.on('filtered', this.updateItems);
  },
  updateItems: function (items) {
    this.setState({
      items: items
    });
  },
  getInitialState: function () {
    return {
      items: []
    };
  },
  handleSearch: function (text) {
    blobStore.filter(text);
  },
  render: function () {
    return (
      <div>
        <SearchBar onSearch={this.handleSearch} />
        <RouteHandler {...this.props} meta={this.state.items} />
        <ItemView {...this.props} meta={this.state.items} />
      </div>
    );
  }
});


var routes = (
  <Route ignoreScrollBehavior={true} name="app" path="/" handler={App}>
    <Route name="blobs" path="/blobs/:id" handler={Blobs}/>
  </Route>
);

React.initializeTouchEvents(true);
Router.run(routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params}/>, document.body);
});
