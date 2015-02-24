var React = require('react');
var moment = require('moment');
var prettyBytes = require('pretty-bytes');

var Link = require('react-router').Link;

var Items = React.createClass({
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

      var link = "/blobs/" + meta._id;

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

module.exports = Items;
