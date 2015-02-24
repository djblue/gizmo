var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Notify () {
  this.id = 0;
  this.notifications = [];
}

util.inherits(Notify, EventEmitter);

Notify.prototype.log = function (msg) {
  var n = {
    level: 'log',
    message: msg
  };
  this.notifications.push(n);
  this.emit('notifications', this.notifications);
};
 
Notify.prototype.err = function (msg) {
  var n = {
    level: 'err',
    message: msg
  };
  this.notifications.push(n);
  this.emit('notifications', this.notifications);
  /*
  setTimeout(function () {
    var i = this.notifications.indexOf(n);
    this.notifications.splice(i, 1);
    this.emit('notifications', this.notifications);
  }.bind(this), 5000);
  */
};

Notify.prototype.getAll = function () {
  return this.notifications;
};

Notify.prototype.remove = function (n) {
  var i = this.notifications.indexOf(n);
  this.notifications.splice(i, 1);
  this.emit('notifications', this.notifications);
};

module.exports = new Notify();
