var React = require('react');

var MetaEditor = React.createClass({
  getInitialState: function () {
    return {
      json: JSON.stringify(this.props.meta, null, 2)
    };
  },
  handleChange: function (e) {
    this.setState({
      json: e.target.value
    });
  },
  render: function () {
    return (
      <div className="meta-editor">
        <textarea rows={this.state.json.split('\n').length}
                  onChange={this.handleChange}
                  value={this.state.json}>
        </textarea>
      </div>
    );
  }
});

module.exports = MetaEditor;
