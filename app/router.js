import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('currencies', function() { });
  this.resource('denominations', function() { });
});

export default Router;
