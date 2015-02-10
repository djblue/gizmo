(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var isNull = function (str) {
  return str === undefined || str === "";
};

var objToArray = function (obj) {
  return Object.keys(obj).map(function (key) {
    return {
      key: key,
      value: obj[key]
    };
  });
};

var arrayToObj = function (array) {
  var obj = {};
  array.forEach(function (o) {
    obj[o.key] = o.value;
  });
  return obj;
};

var ConfigItem = React.createClass({displayName: "ConfigItem",
  isNull: function () {
    return isNull(this.state.key) || isNull(this.state.value);
  },
  getInitialState: function () {
    return {
      key: this.props.k,
      value: this.props.v,
      isNew: this.props.isNew || false,
      isModified: false,
      toRemove: false
    };
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      key: nextProps.k,
      value: nextProps.v,
      isNew: nextProps.isNew || false,
      isModified: nextProps.isModified,
      toRemove: false
    });
  },
  toJSON: function () {
    if (!this.state.toRemove) {
      return {
        key: this.state.key,
        value: this.state.value
      };
    }
  },
  addItem: function () {
    if (!this.isNull()) {
      if (typeof this.props.onAddItem === 'function') {
        this.props.onAddItem(this.toJSON());
      }
    } else {
      this.setState({
        isRequired: true
      });
    }
  },
  removeItem: function (e) {
    this.setState({
      toRemove: true,
      isModified: true
    });
  },
  getConfig: function () {
    if (this.state.toRemove) {
      return;
    } else {
      return {
        key: this.refs.key.getText(),
        value: this.refs.value.getText()
      };
    }
  },
  updateKey: function (e) {
    this.setState({
      key: e.target.value,
      isModified: true
    });
  },
  updateValue: function (e) {
    if (!this.state.toRemove) {
      this.setState({
        value: e.target.value,
        isModified: true
      });
    }
  },
  undoItem: function () {
    this.setState({
      key: this.props.k,
      value: this.props.v,
      isModified: false,
        toRemove: false
    });
  },
  render: function () {
    var control;
    if (this.props.edit === true) {
      if (this.props.isNew && !this.props.isModified) {
        control = React.createElement("button", {className: "rounded-green", onClick: this.addItem}, "+");
      } else if (this.state.isModified) {
        control = React.createElement("button", {className: "rounded-gray", onClick: this.undoItem}, "~");
      } else {
        control = React.createElement("button", {className: "rounded-red", onClick: this.removeItem}, "-");
      }
    }
    return (
      React.createElement("tr", {className: "config-item"}, 
        React.createElement("td", {className: "config-key"}, 
          React.createElement("input", {ref: "key", 
                 className: this.state.isRequired? 'input-required' : '', 
                 value: this.state.key, 
                 onChange: this.updateKey, 
                 placeholder: "KEY", 
                 className: this.state.toRemove? 'input-to-remove' : '', 
                 disabled: this.props.isNew? false : true})
        ), 
        React.createElement("td", {className: "config-value"}, 
          React.createElement("input", {ref: "value", 
                 value: this.state.value, 
                 onChange: this.updateValue, 
                 placeholder: "VALUE", 
                 className: this.state.toRemove? 'input-to-remove' : '', 
                 disabled: this.props.edit? false : true})
        ), 
        React.createElement("td", null, 
          control
        )
      )
    );
  }
});

var ConfigButtons = React.createClass({displayName: "ConfigButtons",
  render: function () {
    if (this.props.edit === false) {
      return (
        React.createElement("div", {className: "btn-group"}, 
          React.createElement("button", {onClick: this.props.handleEdit, 
                  className: "btn-out"}, "Edit")
        )
      );
    } else {
      return (
        React.createElement("div", {className: "btn-group"}, 
          React.createElement("button", {onClick: this.props.handleCancel, 
                  className: "btn-inv"}, "Cancel"), 
          React.createElement("button", {onClick: this.props.handleSave, 
                  className: "btn"}, "Save")
        )
      );
    }
  }
});

var ConfigEditor = React.createClass({displayName: "ConfigEditor",
  getInitialState: function () {
    return {
      edit: false,
      items: objToArray(this.props.items),
      newItems: []
    };
  },
  handleEdit: function () {
    this.setState({ edit: true });
  },
  handleSave: function () {
    var refs = this.refs;
    var items = this.state.items.concat(this.state.newItems).map(function (item) {
      return refs[item.key].toJSON();
    }).filter(function (item) { return item !== undefined; });
    this.setState({
      items: items,
      newItems: [],
      edit: false
    });
    if (typeof this.props.onAddItem === 'function') {
      this.props.onAddItem(arrayToObj(items));
    }
  },
  handleCancel: function () {
    this.setState({
      edit: false,
      newItems: []
    });
  },
  addItem: function (item) {
    this.setState({
      newItems: this.state.newItems.concat(item)
    });
  },
  render: function () {

    var items = this.state.items.map(function (item) {
      return (
        React.createElement(ConfigItem, {ref: item.key, 
                    edit: this.state.edit, 
                    k: item.key, 
                    v: item.value})
      );
    }.bind(this)).concat(this.state.newItems.map(function (item) {
      return (
        React.createElement(ConfigItem, {isNew: true, 
                    ref: item.key, 
                    isModified: true, 
                    edit: this.state.edit, 
                    k: item.key, 
                    v: item.value})
      );
    }.bind(this)));

    if (this.state.edit === true) {
      items.push(
        React.createElement(ConfigItem, {onAddItem: this.addItem, edit: true, isNew: true})
      );
    }

    return (
      React.createElement("div", null, 
        React.createElement("div", {style: {marginBottom: '20px'}}, 
          React.createElement("span", {className: "text-main"}, "Config Vars"), 
          React.createElement(ConfigButtons, {edit: this.state.edit, 
                         handleEdit: this.handleEdit, 
                         handleCancel: this.handleCancel, 
                         handleSave: this.handleSave})
        ), 
        React.createElement("table", {className: "config"}, 
          React.createElement("tbody", null, items)
        )
      )
    );
  }
});

var data = {
  "DOMAIN": "https://pnpm.herokuapp.com/",
  "MONGO_DB": "mongo://mydb.mongolab.com/testdb:43156",
  "NODE_ENV": "production",
  "API_KEY": "6a204bd89f3c8348afd5c77c717a097a"
};

var logger = function (data) {
  console.log(data);
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NocmlzL3JlcG9zL2dpem1vL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2NocmlzL3JlcG9zL2dpem1vL3dlYi9hcHAvZmFrZV82YWY3ZWVlMC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBpc051bGwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHIgPT09IHVuZGVmaW5lZCB8fCBzdHIgPT09IFwiXCI7XG59O1xuXG52YXIgb2JqVG9BcnJheSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4ge1xuICAgICAga2V5OiBrZXksXG4gICAgICB2YWx1ZTogb2JqW2tleV1cbiAgICB9O1xuICB9KTtcbn07XG5cbnZhciBhcnJheVRvT2JqID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gIHZhciBvYmogPSB7fTtcbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAobykge1xuICAgIG9ialtvLmtleV0gPSBvLnZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBDb25maWdJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNvbmZpZ0l0ZW1cIixcbiAgaXNOdWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGlzTnVsbCh0aGlzLnN0YXRlLmtleSkgfHwgaXNOdWxsKHRoaXMuc3RhdGUudmFsdWUpO1xuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAga2V5OiB0aGlzLnByb3BzLmssXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy52LFxuICAgICAgaXNOZXc6IHRoaXMucHJvcHMuaXNOZXcgfHwgZmFsc2UsXG4gICAgICBpc01vZGlmaWVkOiBmYWxzZSxcbiAgICAgIHRvUmVtb3ZlOiBmYWxzZVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleTogbmV4dFByb3BzLmssXG4gICAgICB2YWx1ZTogbmV4dFByb3BzLnYsXG4gICAgICBpc05ldzogbmV4dFByb3BzLmlzTmV3IHx8IGZhbHNlLFxuICAgICAgaXNNb2RpZmllZDogbmV4dFByb3BzLmlzTW9kaWZpZWQsXG4gICAgICB0b1JlbW92ZTogZmFsc2VcbiAgICB9KTtcbiAgfSxcbiAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnRvUmVtb3ZlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IHRoaXMuc3RhdGUua2V5LFxuICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZVxuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIGFkZEl0ZW06IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaXNOdWxsKCkpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5vbkFkZEl0ZW0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkFkZEl0ZW0odGhpcy50b0pTT04oKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1JlcXVpcmVkOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUl0ZW06IGZ1bmN0aW9uIChlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0b1JlbW92ZTogdHJ1ZSxcbiAgICAgIGlzTW9kaWZpZWQ6IHRydWVcbiAgICB9KTtcbiAgfSxcbiAgZ2V0Q29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUudG9SZW1vdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiB0aGlzLnJlZnMua2V5LmdldFRleHQoKSxcbiAgICAgICAgdmFsdWU6IHRoaXMucmVmcy52YWx1ZS5nZXRUZXh0KClcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICB1cGRhdGVLZXk6IGZ1bmN0aW9uIChlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBrZXk6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgaXNNb2RpZmllZDogdHJ1ZVxuICAgIH0pO1xuICB9LFxuICB1cGRhdGVWYWx1ZTogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUudG9SZW1vdmUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIGlzTW9kaWZpZWQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgdW5kb0l0ZW06IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleTogdGhpcy5wcm9wcy5rLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMudixcbiAgICAgIGlzTW9kaWZpZWQ6IGZhbHNlLFxuICAgICAgICB0b1JlbW92ZTogZmFsc2VcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnRyb2w7XG4gICAgaWYgKHRoaXMucHJvcHMuZWRpdCA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuaXNOZXcgJiYgIXRoaXMucHJvcHMuaXNNb2RpZmllZCkge1xuICAgICAgICBjb250cm9sID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7Y2xhc3NOYW1lOiBcInJvdW5kZWQtZ3JlZW5cIiwgb25DbGljazogdGhpcy5hZGRJdGVtfSwgXCIrXCIpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmlzTW9kaWZpZWQpIHtcbiAgICAgICAgY29udHJvbCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge2NsYXNzTmFtZTogXCJyb3VuZGVkLWdyYXlcIiwgb25DbGljazogdGhpcy51bmRvSXRlbX0sIFwiflwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRyb2wgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtjbGFzc05hbWU6IFwicm91bmRlZC1yZWRcIiwgb25DbGljazogdGhpcy5yZW1vdmVJdGVtfSwgXCItXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRyXCIsIHtjbGFzc05hbWU6IFwiY29uZmlnLWl0ZW1cIn0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGRcIiwge2NsYXNzTmFtZTogXCJjb25maWcta2V5XCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge3JlZjogXCJrZXlcIiwgXG4gICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5zdGF0ZS5pc1JlcXVpcmVkPyAnaW5wdXQtcmVxdWlyZWQnIDogJycsIFxuICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5rZXksIFxuICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy51cGRhdGVLZXksIFxuICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogXCJLRVlcIiwgXG4gICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5zdGF0ZS50b1JlbW92ZT8gJ2lucHV0LXRvLXJlbW92ZScgOiAnJywgXG4gICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzTmV3PyBmYWxzZSA6IHRydWV9KVxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRkXCIsIHtjbGFzc05hbWU6IFwiY29uZmlnLXZhbHVlXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge3JlZjogXCJ2YWx1ZVwiLCBcbiAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsIFxuICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy51cGRhdGVWYWx1ZSwgXG4gICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBcIlZBTFVFXCIsIFxuICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHRoaXMuc3RhdGUudG9SZW1vdmU/ICdpbnB1dC10by1yZW1vdmUnIDogJycsIFxuICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5lZGl0PyBmYWxzZSA6IHRydWV9KVxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRkXCIsIG51bGwsIFxuICAgICAgICAgIGNvbnRyb2xcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG52YXIgQ29uZmlnQnV0dG9ucyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJDb25maWdCdXR0b25zXCIsXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmVkaXQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLnByb3BzLmhhbmRsZUVkaXQsIFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0bi1vdXRcIn0sIFwiRWRpdFwiKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiYnRuLWdyb3VwXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLnByb3BzLmhhbmRsZUNhbmNlbCwgXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuLWludlwifSwgXCJDYW5jZWxcIiksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMucHJvcHMuaGFuZGxlU2F2ZSwgXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYnRuXCJ9LCBcIlNhdmVcIilcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn0pO1xuXG52YXIgQ29uZmlnRWRpdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNvbmZpZ0VkaXRvclwiLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZWRpdDogZmFsc2UsXG4gICAgICBpdGVtczogb2JqVG9BcnJheSh0aGlzLnByb3BzLml0ZW1zKSxcbiAgICAgIG5ld0l0ZW1zOiBbXVxuICAgIH07XG4gIH0sXG4gIGhhbmRsZUVkaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgZWRpdDogdHJ1ZSB9KTtcbiAgfSxcbiAgaGFuZGxlU2F2ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciByZWZzID0gdGhpcy5yZWZzO1xuICAgIHZhciBpdGVtcyA9IHRoaXMuc3RhdGUuaXRlbXMuY29uY2F0KHRoaXMuc3RhdGUubmV3SXRlbXMpLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHJlZnNbaXRlbS5rZXldLnRvSlNPTigpO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbSAhPT0gdW5kZWZpbmVkOyB9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgIG5ld0l0ZW1zOiBbXSxcbiAgICAgIGVkaXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLm9uQWRkSXRlbSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkFkZEl0ZW0oYXJyYXlUb09iaihpdGVtcykpO1xuICAgIH1cbiAgfSxcbiAgaGFuZGxlQ2FuY2VsOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBlZGl0OiBmYWxzZSxcbiAgICAgIG5ld0l0ZW1zOiBbXVxuICAgIH0pO1xuICB9LFxuICBhZGRJdGVtOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbmV3SXRlbXM6IHRoaXMuc3RhdGUubmV3SXRlbXMuY29uY2F0KGl0ZW0pXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGl0ZW1zID0gdGhpcy5zdGF0ZS5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29uZmlnSXRlbSwge3JlZjogaXRlbS5rZXksIFxuICAgICAgICAgICAgICAgICAgICBlZGl0OiB0aGlzLnN0YXRlLmVkaXQsIFxuICAgICAgICAgICAgICAgICAgICBrOiBpdGVtLmtleSwgXG4gICAgICAgICAgICAgICAgICAgIHY6IGl0ZW0udmFsdWV9KVxuICAgICAgKTtcbiAgICB9LmJpbmQodGhpcykpLmNvbmNhdCh0aGlzLnN0YXRlLm5ld0l0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDb25maWdJdGVtLCB7aXNOZXc6IHRydWUsIFxuICAgICAgICAgICAgICAgICAgICByZWY6IGl0ZW0ua2V5LCBcbiAgICAgICAgICAgICAgICAgICAgaXNNb2RpZmllZDogdHJ1ZSwgXG4gICAgICAgICAgICAgICAgICAgIGVkaXQ6IHRoaXMuc3RhdGUuZWRpdCwgXG4gICAgICAgICAgICAgICAgICAgIGs6IGl0ZW0ua2V5LCBcbiAgICAgICAgICAgICAgICAgICAgdjogaXRlbS52YWx1ZX0pXG4gICAgICApO1xuICAgIH0uYmluZCh0aGlzKSkpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuZWRpdCA9PT0gdHJ1ZSkge1xuICAgICAgaXRlbXMucHVzaChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDb25maWdJdGVtLCB7b25BZGRJdGVtOiB0aGlzLmFkZEl0ZW0sIGVkaXQ6IHRydWUsIGlzTmV3OiB0cnVlfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge3N0eWxlOiB7bWFyZ2luQm90dG9tOiAnMjBweCd9fSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJ0ZXh0LW1haW5cIn0sIFwiQ29uZmlnIFZhcnNcIiksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29uZmlnQnV0dG9ucywge2VkaXQ6IHRoaXMuc3RhdGUuZWRpdCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRWRpdDogdGhpcy5oYW5kbGVFZGl0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVDYW5jZWw6IHRoaXMuaGFuZGxlQ2FuY2VsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVTYXZlOiB0aGlzLmhhbmRsZVNhdmV9KVxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRhYmxlXCIsIHtjbGFzc05hbWU6IFwiY29uZmlnXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGJvZHlcIiwgbnVsbCwgaXRlbXMpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxudmFyIGRhdGEgPSB7XG4gIFwiRE9NQUlOXCI6IFwiaHR0cHM6Ly9wbnBtLmhlcm9rdWFwcC5jb20vXCIsXG4gIFwiTU9OR09fREJcIjogXCJtb25nbzovL215ZGIubW9uZ29sYWIuY29tL3Rlc3RkYjo0MzE1NlwiLFxuICBcIk5PREVfRU5WXCI6IFwicHJvZHVjdGlvblwiLFxuICBcIkFQSV9LRVlcIjogXCI2YTIwNGJkODlmM2M4MzQ4YWZkNWM3N2M3MTdhMDk3YVwiXG59O1xuXG52YXIgbG9nZ2VyID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc29sZS5sb2coZGF0YSk7XG59O1xuIl19
