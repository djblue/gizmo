var React = require('react');
var $ = require('jquery');
var moment = require('moment');
var prettyBytes = require('pretty-bytes');

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
  render: function () {
    return (
      <div className="search">
        <input value={this.state.searchText}
               className="input"
               onChange={this.handleSearch}
               type="text"/>
      </div>
    );
  }
});

var ItemView = React.createClass({
  render: function () {
    var items = this.props.meta.map(function (meta) {
      var link = "http://localhost:3000/blobs/" + meta._id;
      return (
        <div>
          <div>filename: {meta.filename}</div>
          <div>uploaded: {moment(meta.uploaded).fromNow()}</div>
          <div>size: {prettyBytes(meta.size)}</div>
          <a href={link}>link</a>
        </div>
      );
    });
    return (
      <div> 
        {items}
      </div>
    );
  }
});

var handleSearch = function (text) {
  console.log(text)
};

var Page = React.createClass({
  render: function () {
    return (
      <div>
        <SearchBar onSearch={handleSearch} />
        <ItemView meta={this.props.meta} />
      </div>
    );
  }
});

$.getJSON('http://localhost:3000/search', function (meta) {
  React.render(
    <Page meta={meta} />,
    document.getElementById('content')
  );
});
