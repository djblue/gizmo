var React = require('react');
var blobStore = require('../stores/blobs');

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

module.exports = SearchBar;
