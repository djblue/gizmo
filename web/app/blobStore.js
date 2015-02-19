var util = require('util');
var $ = require('jquery');
var EventEmitter = require('events').EventEmitter;

function BlobStore () {
  this.blobs = [];
  this.filterText = '';
  EventEmitter.call(this);
}

util.inherits(BlobStore, EventEmitter);

BlobStore.prototype.fetch = function () {
  $.getJSON('http://192.168.1.66:3000/search', function (b) {
    this.blobs = b;
    this.emit('update', this.blobs);
  }.bind(this));
};

BlobStore.prototype.filter = function (t) {
  this.filterText = t;
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
