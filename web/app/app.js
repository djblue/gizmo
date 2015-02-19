var React = require('react');
var moment = require('moment');
var prettyBytes = require('pretty-bytes');

var Router = require('react-router');
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var blobStore = require('./blobStore');

var SearchBar = React.createClass({
  getInitialState: function () {
    return {
      searchText: ''
    };
  },
  handleSearch: function (e) {
    this.setState({
      searchText: e.target.value
    });
    this.props.onSearch(e.target.value);
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
            <span>{meta.filename}</span>
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

var Blobs = React.createClass({
  getInitialState: function () {
    return {
      _id: this.props.params.id
    };
  },
  componentWillReceiveProps: function (nextProps) {
    blobStore.getBlobById(nextProps.params.id, this.updateBlob);
  },
  componentWillMount: function () {
    blobStore.getBlobById(this.state._id, this.updateBlob);
  },
  updateBlob: function (blob) {
    this.setState(blob);
  },
  render: function () {
    var meta = this.state;
    var url = 'http://192.168.1.66:3000/blobs/' + this.state._id;
    if (meta.mime !== undefined) {
      if (meta.mime.match(/^image\//)) {
        var control = (
          <img className="img" src={url} />
        );
      } else if (meta.mime.match(/^video\/mp4/)) {
        var control = (
          <video className="video-player" autoplay controls src={url}>
          </video>
        );
      } else if (meta.mime.match(/^audio\//)) {
        var control = (
          <audio className="audio-player" controls autoplay src={url}>
          </audio>
        );
      } else {
        var control = (
          <div></div>
        );
      }
    }
    return (
      <div className="side-panel">
        <a className="exit" href="#/">×</a>
        {control}
      </div>
    );
  }
});

var SideMenu = React.createClass({
  render: function () {
    return (
      <div className="side-menu">
      </div>
    );
  }
});

var App = React.createClass({
  componentWillMount: function () {
    blobStore.getBlobs(this.updateItems);
  },
  updateItems: function (items) {
    this.setState({
      items: items
    });
  },
  getInitialState: function () {
    return {
      searchText: '',
      items: []
    };
  },
  handleSearch: function (text) {
    this.setState({
      searchText: text
    });
  },
  render: function () {
    //<ItemView {...this.props} filter={this.state.searchText} meta={this.state.items} />
    return (
      <div>
        <SearchBar onSearch={this.handleSearch} />
        <RouteHandler {...this.props} filter={this.state.searchText} meta={this.state.items} />
      </div>
    );
  }
});


var routes = (
  <Route ignoreScrollBehavior={true} name="app" path="/" handler={App}>
    <Route name="blobs" path="/blobs/:id" handler={Blobs}/>
    <DefaultRoute name="index" handler={ItemView} />
  </Route>
);

Router.run(routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params}/>, document.body);
});
