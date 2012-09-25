/*global EJS:true */
'use strict';

// The code below uses require.js, a module system for javscript:
// http://requirejs.org/docs/api.html#define

require.config({
    baseUrl: 'js',
    paths: {
        'ejs': ['lib/ejs'],
        'jquery': ['lib/jquery'],
        'install': ['lib/install']
    },
});

var getCurrencies
var getPluralName
var valueFormatted

// When you write javascript in separate files, list them as
// dependencies along with jquery
define("app", function(require) {

    // if (window.location.pathname !== '/app') {
    //    return
    // }

    var $ = require('jquery')
    require('ejs')
    var EJS = window.EJS
    var ls = window.localStorage

    // START HERE: Put your js code here
    function init() {
        if (ls.ranInit !== '1') {
            firstRun()
        }

        setupListeners()

        getCurrencies()
        updateCurrencies()
        updateCurrencyInfo()
        renderCurrencies()
        renderHeader()
        renderLists()
    }

    function firstRun() {
        ls.currentCurrencies = '[]'
        ls.currencies = '{}'
        ls.ranInit = '1'
    }

    function bodyScrolling(state) {
        if (state === false) {
            $('body').on('touchstart', function(event) {
                disablePopover()
            })
        } else {
            $('body').off('touchstart')
        }
    }

    function disablePopover() {
        bodyScrolling(true)
        $('#first-select,#second-select').addClass('hide')
    }

    getCurrencies = function() {
        if (window.location.hash === '#' ||
            window.location.hash === '' ||
            !window.location.hash) {
            window.location.hash = '#USD,EUR'
        }
        return window.location.hash.replace('#', '').split(',')
    }

    getPluralName = function(code, pluralPrefix, singularPrefix) {
        var currency = JSON.parse(ls.currencies)[code]
        pluralPrefix = pluralPrefix ? pluralPrefix : ''
        singularPrefix = singularPrefix ? singularPrefix : ''

        return currency.pluralName ? pluralPrefix + currency.pluralName :
                                     singularPrefix + currency.name
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

    function renderHeader() {
        $('#header').html(new EJS({url: '/views/header.ejs'}).render({}))
    }

    function renderLists() {
        $('#currency-list-first').html(new EJS({url: '/views/currency-list.ejs'}).render({
            currencies: JSON.parse(ls.currencies),
            firstCurrency: true
        }))

        $('#currency-list-second').html(new EJS({url: '/views/currency-list.ejs'}).render({
            currencies: JSON.parse(ls.currencies),
            firstCurrency: false
        }))
    }

    function setupListeners() {
        $(function() {
            $(window).on('hashchange', function(event) {
                updateCurrencies()
                renderCurrencies()
                renderHeader()
                renderLists()
                // renderSwitcher()
            })

            $('#first-currency').live('click', function(event) {
                bodyScrolling(false)
                $('#first-select').removeClass('hide')
                event.preventDefault()

                return false
            })

            $('#second-currency').live('click', function(event) {
                bodyScrolling(false)
                $('#second-select').removeClass('hide')
                event.preventDefault()

                return false
            })

            $('#first-select,#second-select').on('blur', function(event) {
                disablePopover()
            })

            $('body').on('click', function(event) {
                disablePopover()
            })

            // $('#first-select,#second-select').on('change', function(event) {
            //     $('#first-select,#second-select').removeClass('show')
            //     $('#first-currency,#second-currency').trigger('blur')
            //     window.location.hash = event.target.value
            // })
        })

        // $('#select-first-currency').on('click', function(event) {
        //     $('#select-first-currency').popover({
        //         content: $('#currency-list-first').html(),
        //         placement: 'bottom',
        //         trigger: 'manual'
        //     })
        //     $('#select-first-currency').popover('toggle')
        //     event.preventDefault()
        //     return false
        // })
        // $('#select-first-currency').popover({
        //     content: $('#currency-list-first').html()
        // })
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

    valueFormatted = function(amount) {
        if (amount >= 1 && parseFloat(amount) === parseFloat(Math.round(Number(amount)))) {
            amount = parseInt(amount, 10)
        }

        amount = amount.toString().replace(/(0{2,})/g, '<span class="zeros">$1</span>')

        return amount
    }

    init()

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
