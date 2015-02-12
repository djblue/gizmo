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

var Slider = React.createClass({
  getInitialState: function () {
    return {
      percentage: 50
    }
  },
  slide: function (e) {
    console.log(e);
  },
  render: function () {
    return (
      <div className="slider">
        <div className="slider-control" onDrag={this.slide}
             style={{width : this.state.percentage + '%'}}>
              <button className="slider-control-drag">o</button>
        </div>
      </div>
    );
  }
});

var Video = React.createClass({
  render: function () {
    return (
      <div>
        <video className="video-player" controls preload="none">
          <source src={this.props.src} type="video/mp4" />
        </video>
      </div>
    );
  }
});

var ItemView = React.createClass({
  render: function () {
    var items = this.props.meta
      /*.slice(0,100)*/
      .filter(function (meta) {
        return meta.filename.toLowerCase().match(this.props.filter);
      }.bind(this)) 
      .map(function (meta) {
      var link = "http://localhost:3000/blobs/" + meta._id;
      if (meta.mime && meta.mime.match(/^image/)) {
        var control = (
          <img className="img" src={link} />
        );
      } else if (meta.mime === 'video/mp4' || meta.mime === 'video/x-m4v') {
        var control = (
          <div>
            <Video src={link} />
          </div>
        );
      } else if (meta.mime === 'audio/mpeg') {
        var control = (
          <div>
            <audio controls preload="none">
              <source src={link} type="audio/mpeg" />
            </audio>
          </div>
        );
      } else {
        var control = (
          <div>
            <div>mime: {meta.mime}</div>
            <div>uploaded: {moment(meta.uploaded).fromNow()}</div>
            <a href={link}>link</a>
          </div>
        )
      }
      return (
        <div className="search-item">
          <div className="search-item-inner">
            {control}
            <div className="search-name">
              <span className="pull-left">{meta.filename}</span>
              <span className="pull-right">{prettyBytes(meta.size)}</span>
            </div>
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

var Page = React.createClass({
  getInitialState: function () {
    return {
      searchText: ''
    }
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
        <ItemView filter={this.state.searchText} meta={this.props.meta} />
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
