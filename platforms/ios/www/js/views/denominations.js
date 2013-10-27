'use strict';

define([
  'app',
  'zepto',
  'underscore',
  'backbone',
  'collections/currencies',
  'models/denomination',
  'tpl!templates/denominations/show.ejs'
], function(App, $, _, Backbone, Currencies, Denomination, showTemplate) {
  var ShowView = Backbone.View.extend({
    model: Denomination,
    template: showTemplate,

    // The DOM events specific to an item.
    events: {
    },

    initialize: function() {
      this.model.on('change', this.render, this)

      this.render()
    },

    render: function() {
      var html = this.template({
        currency: this.model.currency(),
        denomination: this.model,
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      })

      if ($('#denomination-{id}'.format({id: this.model.get('id')})).length) {
        $('#denomination-{id}'.format({id: this.model.get('id')})).replaceWith(html)
      } else {
        $('#{type}s .denomination-list'.format({type: this.model.get('type')})).append(html)
      }

      // This is some CSS magic snagged from @potch and the Gaia.
      var valueText = $('#denomination-{id}'.format({id: this.model.get('id')})).find('.inner')[0]
      var valWidth = valueText.offsetWidth;
      var maxWidth = valueText.parentNode.offsetWidth;
      var scaleFactor = Math.min(1, (maxWidth - 25) / valWidth);
      valueText.style.transform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
      valueText.style.MozTransform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
      valueText.style.WebkitTransform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';


      return this
    }
  })

  return ShowView
})
