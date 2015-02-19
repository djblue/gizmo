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
      var link = "http://localhost:3000/blobs/" + meta._id;
      return (
        <div className="search-item">
          <Link to="blobs" params={{id: meta._id}}>
            <div className="preview">
            </div>
          </Link>
          <div className="meta">
            <table className="table">
              <tbody>
                <tr>
                  <td>{meta.filename}</td>
                  <td>{moment(meta.uploaded).fromNow()}</td>
                </tr>
                <tr>
                  <td></td>
                  <td>{prettyBytes(meta.size)}</td>
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
  getInitialState: function () {
    return {
      minimized: false
    };
  },
  toggle: function () {
    this.setState({
      minimized: !this.state.minimized
    });
  },
  render: function () {
    var meta = this.props.meta.filter(blobStore.byId(this.props.params.id))[0];
    if (meta !== undefined) {
      var url = 'http://192.168.1.66:3000/blobs/' + meta._id;
      if (meta.mime !== undefined) {
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
            <audio className="audio-player" controls autoplay src={url}>
            </audio>
          );
        } else if (meta.mime.match(/application\/javascript/)) {
          var control = (
            <Highlighter src={url} />
          );
        } else {
          var control = (
            <div className="center">No Preview</div>
          );
        }
      }
      return (
        <div className={(this.state.minimized? 'side-panel-min' : 'side-panel')}>
          <div className="control">
            <span className="btn" onClick={this.toggle}>~</span>
          </div>
          {control}
          <div className="control">
            <a className="btn" href="#/">×</a>
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
        <ItemView meta={this.state.items} />
        <RouteHandler {...this.props} meta={this.state.items} />
      </div>
    );
  }
});


var routes = (
  <Route ignoreScrollBehavior={true} name="app" path="/" handler={App}>
    <Route name="blobs" path="/blobs/:id" handler={Blobs}/>
  </Route>
);

Router.run(routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params}/>, document.body);
});
