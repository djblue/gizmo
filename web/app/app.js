var React = require('react');

var Router = require('react-router');
var Route = Router.Route;

var App = require('./components/app');
var Blobs = require('./components/blobs');
var Login = require('./components/login');

var routes = (
  <Route ignoreScrollBehavior={true} name="app" path="/" handler={App}>
    <Route name="blobs" path="/blobs/:id" handler={Blobs}/>
    <Route name="login" path="/login" handler={Login} />
  </Route>
);

React.initializeTouchEvents(true);
Router.run(routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params}/>, document.body);
});
