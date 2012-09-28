'use strict';

// The code below uses require.js, a module system for javscript:
// http://requirejs.org/docs/api.html#define

require.config({
    baseUrl: 'js',
    paths: {
        'ejs': ['lib/ejs'],
        'jquery': ['lib/jquery']
    },
})

// We make these globals so EJS can use them like helpers.
// TODO: Make this better.
var getCurrencies
var getPluralName
var valueFormatted

// When you write javascript in separate files, list them as
// dependencies along with jquery
define('app', function(require) {
    // America, fuck yeah!
    var DEFAULT_CURRENCIES = '#USD,EUR'

    // TODO: Don't use jQuery? Maybe something more lightweight, or just
    // straight-up JS?
    var $ = require('jquery')
    require('ejs')
    var EJS = window.EJS
    var ls = window.localStorage

    // Run this code as soon as the document is ready.
    function init() {
        // TODO: Replace this with a version number and some way to do JS
        // "upgrades".
        if (ls.ranInit !== '1') {
            firstRun()
        } else {
            resume()
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
        // Initialize localStorage variables so we don't get undefined/type
        // errors.
        ls.currentCurrencies = '[]'
        ls.currencies = '{}'
        ls.ranInit = '1'
    }

    function bodyScrolling(state) {
        if (state === false) {
            $('body').on('touchstart', 'scrollOff', function(event) {
                disablePopover()
            })
        } else {
            $('body').off('touchstart', 'scrollOff')
        }
    }

    function disablePopover() {
        bodyScrolling(true)
        $('#first-select,#second-select').addClass('hide')
    }

    getCurrencies = function() {
        if (window.location.hash === '#' ||
            window.location.hash === '' ||
            !window.location.hash.match(/#[A-Z]{3},[A-Z]{3}/g) ||
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
        $('#coins,#notes').addClass('hidden')
        setTimeout(function() {
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

            if ($('#coins .denomination').length % 2) {
                $('#coins .denomination:last').removeClass('span_1')
                                              .addClass('span_2')
            }
            if ($('#notes .denomination').length % 2) {
                $('#notes .denomination:last').removeClass('span_1')
                                              .addClass('span_2')
            }

            $('#coins,#notes').removeClass('hidden')
        }, 200)
    }

    function renderHeader() {
        $('#header').attr('class', getCurrencies()[0] + '-flag')
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

    function resume() {
        var currentCurrencies = JSON.parse(ls.currentCurrencies)
        window.location.hash = '#' + currentCurrencies[0] + ',' + currentCurrencies[1]
    }

    function setupListeners() {
        $(window).on('hashchange', function(event) {
            updateCurrencies()
            renderCurrencies()
            renderHeader()
            renderLists()
        })

        $('.first-currency').live('click', function(event) {
            bodyScrolling(false)
            $('#first-select').removeClass('hide')

            return false
        })

        $('.second-currency').live('click', function(event) {
            bodyScrolling(false)
            $('#second-select').removeClass('hide')

            return false
        })

        $('.first-select,.second-select').on('blur', function(event) {
            disablePopover()
        })

        $('body').on('click', function(event) {
            disablePopover()
        })

        $('body').on('touchmove', function(event) {
            $('a').removeClass('active')
        })

        $('a').live('touchstart', function(event) {
            $(this).addClass('active')
        })

        $('a').live('touchcancel,touchend,touchmove', function(event) {
            $(this).removeClass('active')
        })
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
        if (amount < 1) {
            amount = '<span class="fraction">' + amount + '</span>'
        }

        if (amount >= 1 && parseFloat(amount) === parseFloat(Math.round(Number(amount)))) {
            amount = parseInt(amount, 10)
        }

        amount = amount.toString().replace(/(0{2,})/g, '<span class="zeros">$1</span>')

        return amount
    }

    // Let's do it!
    $(function() {
        init()
    })
})
