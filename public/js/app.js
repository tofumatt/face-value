/*global EJS:true */
'use strict';

// The code below uses require.js, a module system for javscript:
// http://requirejs.org/docs/api.html#define

require.config({
    baseUrl: 'js/lib',
    paths: {'jquery':
            ['//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
             'jquery']},
});

// When you write javascript in separate files, list them as
// dependencies along with jquery
define("app", function(require) {

    // if (window.location.pathname !== '/app') {
    //    return
    // }

    var $ = require('jquery')
    // var EJS = require('ejs')
    // console.log(EJS)

    var ls = window.localStorage

    // If using Twitter Bootstrap, you need to require all the
    // components that you use, like so:
    // require('bootstrap/dropdown');
    // require('bootstrap/alert');

    // START HERE: Put your js code here
    function init() {
        ls.currentCurrencies = '[]'
        ls.currencies = '{}'
        ls.ranInit = '1'
    }

    function getCurrencies() {
        if (window.location.hash === '#' ||
            window.location.hash === '' ||
            !window.location.hash) {
            window.location.hash = '#USD,EUR'
        }
        return window.location.hash.replace('#', '').split(',')
    }

    function renderCurrencies(first, second) {
        $('#coins').html(new EJS({url: '/views/denomination-list.ejs'}).render({
            currencies: JSON.parse(ls.currencies),
            i: first || JSON.parse(ls.currentCurrencies)[0],
            j: second || JSON.parse(ls.currentCurrencies)[1],
            type: 'coins'
        }))
        $('#notes').html(new EJS({url: '/views/denomination-list.ejs'}).render({
            currencies: JSON.parse(ls.currencies),
            i: first || JSON.parse(ls.currentCurrencies)[0],
            j: second || JSON.parse(ls.currentCurrencies)[1],
            type: 'notes'
        }))
    }

    function renderLists() {
        $('#currency-list-first').html(new EJS({url: '/views/currency-list.ejs'}).render({
            currencies: JSON.parse(ls.currencies),
            firstCurrency: true,
            getCurrencies: getCurrencies
        }))

        $('#currency-list-second').html(new EJS({url: '/views/currency-list.ejs'}).render({
            currencies: JSON.parse(ls.currencies),
            firstCurrency: false,
            getCurrencies: getCurrencies
        }))
    }

    function renderSwitcher() {
        $('#currency-switcher').html(new EJS({url: '/views/currency-switcher.ejs'}).render({
            getCurrencies: getCurrencies
        }))
    }

    function updateCurrencies() {
        ls.currentCurrencies = JSON.stringify(getCurrencies())
    }

    function updateCurrencyInfo() {
        $.ajax({
            url: '/denominations.json',
            dataType: 'json',
            success: function(results) {
                ls.currencies = JSON.stringify(results)
            },
            error: function() {
                console.log('failed')
            }
        })

    }

    if (ls.ranInit !== '1') {
        init()
    }

    getCurrencies()
    updateCurrencies()
    updateCurrencyInfo()
    renderCurrencies()
    renderLists()
    renderSwitcher()

    $(window).on('hashchange', function(event) {
        updateCurrencies()
        renderCurrencies()
        renderLists()
        renderSwitcher()
    })

    // Hook up the installation button, feel free to customize how
    // this works
    
    var install = require('install');

    function updateInstallButton() {
        $(function() {
            var btn = $('.install-btn');
            if(install.state == 'uninstalled') {
                btn.show();
            }
            else if(install.state == 'installed' || install.state == 'unsupported') {
                btn.hide();
            }
        });
    }

    $(function() {
        $('.install-btn').click(install);        
    });

    install.on('change', updateInstallButton);

    install.on('error', function(e, err) {
        // Feel free to customize this
        $('.install-error').text(err.toString()).show();
    });

    install.on('showiOSInstall', function() {
        // Feel free to customize this
        var msg = $('.install-ios-msg');
        msg.show();
        
        setTimeout(function() {
            msg.hide();
        }, 8000);
    });

});

// Include the in-app payments API, and if it fails to load handle it
// gracefully.
// https://developer.mozilla.org/en/Apps/In-app_payments
// require(['https://marketplace-cdn.addons.mozilla.net/mozmarket.js'],
//         function() {},
//         function(err) {
//             window.mozmarket = window.mozmarket || {};
//             window.mozmarket.buy = function() {
//                 alert('The in-app purchasing is currently unavailable.');
//             };
//         });
