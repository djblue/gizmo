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
        <Link to="blobs" params={{id: meta._id}} activeStyle={{border: '1px solid green'}}>
        <div className="search-item">
          <div className="search-item-inner">
            <div className="search-name">
              <span className="pull-left">{meta.filename.slice(0,20)}</span>
              <span className="pull-right">{prettyBytes(meta.size)}</span>
            </div>
          </div>
        </div>
        </Link>
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
    var url = 'http://localhost:3000/blobs/' + this.state._id;
    if (meta.mime !== undefined) {
      if (meta.mime.match(/^image\//)) {
        var control = (
          <img className="img" src={url} />
        );
      } else if (meta.mime.match(/^video\/mp4/)) {
        var control = (
          <video className="img" autoplay controls src={url}>
          </video>
        );
      } else {
        var control = (
          <div></div>
        );
      }
    }
    return (
      <div className="side-panel">
        <div>id: {this.state._id}</div>
        <div>id: {this.state.mime}</div>
        {control}
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
    return (
      <div>
        <SearchBar onSearch={this.handleSearch} />
        <ItemView filter={this.state.searchText} meta={this.state.items} />
        <RouteHandler {...this.props}/>
      </div>
    );
  }
});


var routes = (
  <Route name="app" path="/" handler={App}>
    <Route ignoreScrollBehavior={true} name="blobs" path="/blobs/:id" handler={Blobs}/>
  </Route>
);

Router.run(routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params}/>, document.body);
});
