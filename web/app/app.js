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
    var items = this.props.meta.map(function (meta) {
      var link = "http://localhost:3000/blobs/" + meta._id;
      if (meta.mime === 'image/jpeg') {
        var control = (
          <img className="img" src={link} />
        );
      }
      if (meta.mime === 'video/mp4' || meta.mime === 'video/x-m4v') {
        var control = (
          <div>
            <video controls preload="none">
              <source src={link} type="video/mp4" />
            </video>
          </div>
        );
      }
      if (meta.mime === 'audio/mpeg') {
        var control = (
          <div>
            <audio controls preload="none">
              <source src={link} type="audio/mpeg" />
            </audio>
          </div>
        );
      }
      return (
        <div className="search-item">
          <div>mime: {meta.mime}</div>
          <div>filename: {meta.filename}</div>
          <div>uploaded: {moment(meta.uploaded).fromNow()}</div>
          <div>size: {prettyBytes(meta.size)}</div>
          <a href={link}>link</a>
          {control}
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
