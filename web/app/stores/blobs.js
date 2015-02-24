var util = require('util');
var EventEmitter = require('events').EventEmitter;

var client = require('./client');

function BlobStore () {
  this.blobs = [];
  this.filterText = '';
  EventEmitter.call(this);
}

util.inherits(BlobStore, EventEmitter);

BlobStore.prototype.fetch = function () {
  client.getJSON('/search', function (err, blobs) {
    if (err) {
      console.error(err);
    } else {
      this.blobs = blobs;
      this.emit('update', this.blobs);
    }
  }.bind(this));
};

BlobStore.prototype.filter = function (text) {
  this.filterText = text;
  this.emit('filtered', this.getFiltered());
};

BlobStore.prototype.getFiltered = function () {
  return this.blobs.filter(function (meta) {
    return (meta.filename || '').toLowerCase().match(this.filterText);
  }.bind(this));
};

BlobStore.prototype.byId = function (id) {
  return function (blob) {
    return blob._id === id;
  };
};

BlobStore.prototype.next = function (id) {
  var items = this.getFiltered();
  for (var i = 0; i < items.length; i++) {
    if (items[i]._id === id) {
      return items[i+1]._id;
    }
  }
};

module.exports = new BlobStore();
