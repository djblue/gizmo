var React = require('react');
var RouteHandler = require('react-router').RouteHandler;

var blobs = require('../stores/blobs');

var SearchBar = require('./search-bar');
var Items = require('./items');
var Notify = require('./notify');

var App = React.createClass({
  componentWillMount: function () {
    blobs.fetch();
    blobs.on('update', this.updateItems);
    blobs.on('filtered', this.updateItems);
  },
  updateItems: function (items) {
    this.setState({
      items: items || []
    });
  },
  getInitialState: function () {
    return {
      items: []
    };
  },
  handleSearch: function (text) {
    blobs.filter(text);
  },
  render: function () {
    return (
      <div>
        <SearchBar onSearch={this.handleSearch} />
        <RouteHandler {...this.props} meta={this.state.items} />
        <Items {...this.props} meta={this.state.items} />
        <Notify />
      </div>
    );
  }
});

module.exports = App;
