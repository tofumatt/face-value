
//Wrapped in an outer function to preserve global this
(function (root) { var amdExports; define('zepto',[], function () { (function () {

/* Zepto v1.0rc1 - polyfill zepto event detect fx ajax form touch - zeptojs.com/license */
;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,

    // Used by `$.zepto.init` to wrap elements, text/comment nodes, document,
    // and document fragment node types.
    elementTypes = [1, 3, 8, 9, 11],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]+)$/,
    tagSelectorRE = /^[\w-]+$/,
    toString = ({}).toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function isFunction(value) { return toString.call(value) == "[object Function]" }
  function isObject(value) { return value instanceof Object }
  function isPlainObject(value) {
    var key, ctor
    if (toString.call(value) !== "[object Object]") return false
    ctor = (isFunction(value.constructor) && value.constructor.prototype)
    if (!ctor || !hasOwnProperty.call(ctor, 'isPrototypeOf')) return false
    for (key in value);
    return key === undefined || hasOwnProperty.call(value, key)
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return array.filter(function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name) {
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'
    var container = containers[name]
    container.innerHTML = '' + html
    return $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = arguments.callee.prototype
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // if a JavaScript object is given, return a copy of it
      // this is a somewhat peculiar option, but supported by
      // jQuery so we'll do it, too
      else if (isPlainObject(selector))
        dom = [$.extend({}, selector)], selector = null
      // wrap stuff like `document` or `window`
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, whichs makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source)
        if (source[key] !== undefined)
          target[key] = source[key]
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (element === document && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  function funcArg(context, arg, idx, payload) {
   return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  $.isFunction = isFunction
  $.isObject = isObject
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) })
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) })
      return this
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result
      if (this.length == 1) result = zepto.qsa(this[0], selector)
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return $(result)
    },
    closest: function(selector, context){
      var node = this[0]
      while (node && !zepto.matches(node, selector))
        node = node !== context && node !== document && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector)
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return this.map(function(){ return this[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(newContent){
      return this.each(function(){
        $(this).wrapAll($(newContent)[0].cloneNode(false))
      })
    },
    wrapAll: function(newContent){
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent))
        newContent.append(this)
      }
      return this
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return $(this.map(function(){ return this.cloneNode(true) }))
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide()
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ if (this.nodeType === 1) this.removeAttribute(name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] ? this[0][name] : undefined) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? data : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : undefined) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(){
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: obj.width,
        height: obj.height
      }
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return (
          this.length == 0
            ? undefined
            : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      for (key in property)
        if(typeof property[key] == 'string' && property[key] == '')
          this.each(function(){ this.style.removeProperty(dasherize(key)) })
        else
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'

      if (typeof property == 'string')
        if (value == '')
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (this.length < 1) return false
      else return classRE(name).test(this[0].className)
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = this.className, newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined)
          return this.className = ''
        classList = this.className
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        this.className = classList.trim()
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var newName = funcArg(this, name, idx, this.className)
        ;(when === undefined ? !$(this).hasClass(newName) : when) ?
          $(this).addClass(newName) : $(this).removeClass(newName)
      })
    }
  }

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
        this[0] == document ? document.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        var el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function insert(operator, target, node) {
    var parent = (operator % 2) ? target : target.parentNode
    parent ? parent.insertBefore(node,
      !operator ? target.nextSibling :      // after
      operator == 1 ? parent.firstChild :   // prepend
      operator == 2 ? target :              // before
      null) :                               // append
      $(node).remove()
  }

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var nodes = $.map(arguments, function(n){ return isObject(n) ? n : zepto.fragment(n) })
      if (nodes.length < 1) return this
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i]
          traverseNode(node, function(node){
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT' && (!node.type || node.type === 'text/javascript'))
              window['eval'].call(window, node.innerHTML)
          })
          if (copyByClone && index < size - 1) node = node.cloneNode(true)
          insert(operator, target, node)
        }
      })
    }

    $.fn[(operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After')] = function(html){
      $(html)[key](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.camelize = camelize
  zepto.uniq = uniq
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
'$' in window || (window.$ = Zepto)
;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={}

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.isObject(events)) $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function add(element, events, fn, selector, getDelegate, capture){
    capture = !!capture
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var delegate = getDelegate && getDelegate(fn, event),
        callback = delegate || fn
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data))
        if (result === false) event.preventDefault()
        return result
      }
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length})
      set.push(handler)
      element.addEventListener(handler.e, proxyfn, capture)
    })
  }
  function remove(element, events, fn, selector){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(handler.e, handler.proxy, false)
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event)
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    var capture = false
    if(event == 'blur' || event == 'focus'){
      if($.iswebkit)
        event = event == 'blur' ? 'focusout' : event == 'focus' ? 'focusin' : event
      else
        capture = true
    }

    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      }, capture)
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.bind(event, selector) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.unbind(event, selector) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else if (this.length) try { this.get(0)[name]() } catch(e){}
      return this
    }
  })

  $.Event = function(type, props) {
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    return event
  }

})(Zepto)
;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/)

    // todo clean this up with a better OS/browser
    // separation. we need to discern between multiple
    // browsers on android, and decide if kindle fire in
    // silk mode is android or not

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    clearProperties = {}

  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  clearProperties[prefix + 'transition-property'] =
  clearProperties[prefix + 'transition-duration'] =
  clearProperties[prefix + 'transition-timing-function'] =
  clearProperties[prefix + 'animation-name'] =
  clearProperties[prefix + 'animation-duration'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = duration / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssProperties[prefix + 'animation-name'] = properties
      cssProperties[prefix + 'animation-duration'] = duration + 's'
      endEvent = $.fx.animationEnd
    } else {
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) {
          transforms || (transforms = [])
          transforms.push(key + '(' + properties[key] + ')')
        }
        else cssProperties[key] = properties[key]

      if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
      if (!$.fx.off && typeof properties === 'object') {
        cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
        cssProperties[prefix + 'transition-duration'] = duration + 's'
        cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, arguments.callee)
      }
      $(this).css(clearProperties)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    setTimeout(function() {
      that.css(cssProperties)
      if (duration <= 0) setTimeout(function() {
        that.each(function(){ wrappedCallback.call(this) })
      }, 0)
    }, 0)

    return this
  }

  testEl = null
})(Zepto)
;(function($){
  var jsonpID = 0,
      isObject = $.isObject,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      abort = function(){
        $(script).remove()
        if (callbackName in window) window[callbackName] = empty
        ajaxComplete('abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (options.error) script.onerror = function() {
      xhr.abort()
      options.error()
    }

    window[callbackName] = function(data){
      clearTimeout(abortTimeout)
      $(script).remove()
      delete window[callbackName]
      ajaxSuccess(data, xhr, options)
    }

    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
      }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0
  }

  function mimeToDataType(mime) {
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (isObject(options.data)) options.data = $.param(options.data)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = $.ajaxSettings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, 'error', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  $.get = function(url, success){ return $.ajax({ url: url, success: success }) }

  $.post = function(url, data, success, dataType){
    if ($.isFunction(data)) dataType = dataType || success, success = data, data = null
    return $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
  }

  $.getJSON = function(url, success){
    return $.ajax({ url: url, success: success, dataType: 'json' })
  }

  $.fn.load = function(url, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector
    if (parts.length > 1) url = parts[0], selector = parts[1]
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response.replace(rscript, "")).find(selector).html()
        : response)
      success && success.call(self)
    })
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var array = $.isArray(obj)
    $.each(obj, function(key, value) {
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (traditional ? $.isArray(value) : isObject(value))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace('%20', '+')
  }
})(Zepto)
;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)
;(function($){
  var touch = {}, touchTimeout

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  var longTapDelay = 750, longTapTimeout

  function longTap(){
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap(){
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  $(document).ready(function(){
    var now, delta

    $(document.body).bind('touchstart', function(e){
      now = Date.now()
      delta = now - (touch.last || now)
      touch.el = $(parentIfText(e.touches[0].target))
      touchTimeout && clearTimeout(touchTimeout)
      touch.x1 = e.touches[0].pageX
      touch.y1 = e.touches[0].pageY
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true
      touch.last = now
      longTapTimeout = setTimeout(longTap, longTapDelay)
    }).bind('touchmove', function(e){
      cancelLongTap()
      touch.x2 = e.touches[0].pageX
      touch.y2 = e.touches[0].pageY
    }).bind('touchend', function(e){
       cancelLongTap()

      // double tap (tapped twice within 250ms)
      if (touch.isDoubleTap) {
        touch.el.trigger('doubleTap')
        touch = {}

      // swipe
      } else if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                 (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
        touch.el.trigger('swipe') &&
          touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
        touch = {}

      // normal tap
      } else if ('last' in touch) {
        touch.el.trigger('tap')

        touchTimeout = setTimeout(function(){
          touchTimeout = null
          touch.el.trigger('singleTap')
          touch = {}
        }, 250)
      }
    }).bind('touchcancel', function(){
      if (touchTimeout) clearTimeout(touchTimeout)
      if (longTapTimeout) clearTimeout(longTapTimeout)
      longTapTimeout = touchTimeout = null
      touch = {}
    })
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)


amdExports = Zepto;

}.call(root));
    return amdExports;
}); }(this));

/*jshint forin:false, plusplus:false, sub:true */


define('currency-data',[
  'zepto'
], function($) {
  var FINANCE_URL = 'http://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote?format=json&callback=?'
  var REFERENCE_CURRENCY = 'USD'
  var worth = {}
  worth[REFERENCE_CURRENCY] = 1

  function getCurrencyName(currency) {
    return currency.resource.fields.name.split('/')[1]
  }

  function getCurrencyWorth(currency) {
    return parseFloat(currency.resource.fields.price)
  }

  function update(callback) {
    $.ajax({
      dataType: 'jsonp',
      url: FINANCE_URL,
      success: function(currencies) {
        currencies.list.resources.forEach(function(c) {
          if (getCurrencyName(c)) {
            worth[getCurrencyName(c)] = getCurrencyWorth(c)
          }
        })

        callback(worth)
      }
    })
  }

  return {
    update: update
  }
})
;
/*!
 Lo-Dash 0.8.2 lodash.com/license
 Underscore.js 1.4.2 underscorejs.org/LICENSE
*/
;(function(e,t){function s(e){if(e&&e.__wrapped__)return e;if(!(this instanceof s))return new s(e);this.__wrapped__=e}function o(e,t,n){t||(t=0);var r=e.length,i=r-t>=(n||H),s=i?{}:e;if(i)for(n=t-1;++n<r;){var o=e[n]+"";(Z.call(s,o)?s[o]:s[o]=[]).push(e[n])}return function(e){if(i){var n=e+"";return Z.call(s,n)&&-1<T(s[n],e)}return-1<T(s,e,t)}}function u(e,n){var r=e.b,i=n.b,e=e.a,n=n.a;if(e!==n){if(e>n||e===t)return 1;if(e<n||n===t)return-1}return r<i?-1:1}function a(e,t,n){function r(){var u=arguments
,a=s?this:t;return i||(e=t[o]),n.length&&(u=u.length?n.concat(nt.call(u)):n),this instanceof r?(p.prototype=e.prototype,a=new p,(u=e.apply(a,u))&&Ht[typeof u]?u:a):e.apply(a,u)}var i=m(e),s=!n,o=e;return s&&(n=t),r}function f(e,n){return e?"function"!=typeof e?function(t){return t[e]}:n!==t?function(t,r,i){return e.call(n,t,r,i)}:e:A}function l(){for(var e={e:"",g:Et,i:"",j:Mt,m:Tt,n:kt,o:J,p:"",q:n,r:_t,c:{d:""},l:{d:""}},t,i=-1;t=arguments[++i];)for(var s in t){var o=t[s];/d|h/.test(s)?("string"==typeof 
o&&(o={b:o,k:o}),e.c[s]=o.b,e.l[s]=o.k):e[s]=o}t=e.a;if("d"!=(e.f=/^[^,]+/.exec(t)[0])||!e.c.h)e.c=r;i="",e.r&&(i+=""),i+="var i,A,j="+e.f+",t="+(e.i||e.f)+";if(!"+e.f+")return t;"+e.p+";",e.c&&(i+="var k=j.length;i=-1;",e.l&&(i+="if(k===+k){"),e.n&&(i+="if(y.call(j)==w){j=j.split('')}"),i+=e.c.d+";while(++i<k){A=j[i];"+e.c.h+"}",e.l&&(i+="}"));if(e.l){e.c?i+="else {":e.m&&(i+="var k=j.length;i=-1;if(k&&O(j)){while(++i<k){A=j[i+=''];"+e.l.h+"}}else {"),e.g||(i+="var u=typeof j=='function'&&q.call(j,'prototype');"
);if(e.j&&e.q)i+="var n=-1,o=Y[typeof j]?l(j):[],k=o.length;"+e.l.d+";while(++n<k){i=o[n];",e.g||(i+="if(!(u&&i=='prototype')){"),i+="A=j[i];"+e.l.h+"",e.g||(i+="}");else{i+=e.l.d+";for(i in j){";if(!e.g||e.q)i+="if(",e.g||(i+="!(u&&i=='prototype')"),!e.g&&e.q&&(i+="&&"),e.q&&(i+="h.call(j,i)"),i+="){";i+="A=j[i];"+e.l.h+";";if(!e.g||e.q)i+="}"}i+="}";if(e.g){i+="var g=j.constructor;";for(s=0;7>s;s++)i+="i='"+e.o[s]+"';if(","constructor"==e.o[s]&&(i+="!(g&&g.prototype===j)&&"),i+="h.call(j,i)){A=j[i];"+
e.l.h+"}"}if(e.c||e.m)i+="}"}return i+=e.e+";return t",Function("D,E,F,I,e,f,J,h,M,O,Q,S,T,X,Y,l,q,v,w,y,z","var G=function("+t+"){"+i+"};return G")(Dt,_,L,u,Q,f,en,Z,T,v,$t,m,Jt,mt,Ht,ut,tt,nt,yt,rt)}function c(e){return"\\"+Bt[e]}function h(e){return Qt[e]}function p(){}function d(e){return Gt[e]}function v(e){return rt.call(e)==ct}function m(e){return"function"==typeof e}function g(e){var t=i;if(!e||"object"!=typeof e||v(e))return t;var n=e.constructor;return(!Lt||"function"==typeof e.toString||"string"!=typeof 
(e+""))&&(!m(n)||n instanceof n)?xt?(en(e,function(e,n,r){return t=!Z.call(r,n),i}),t===i):(en(e,function(e,n){t=n}),t===i||Z.call(e,t)):t}function y(e,t,n,s,o){if(e==r)return e;n&&(t=i);if(n=Ht[typeof e]){var u=rt.call(e);if(!Pt[u]||Nt&&v(e))return e;var a=u==ht,n=a||(u==mt?Jt(e):n)}if(!n||!t)return n?a?nt.call(e):Zt({},e):e;n=e.constructor;switch(u){case pt:case dt:return new n(+e);case vt:case yt:return new n(e);case gt:return n(e.source,U.exec(e))}s||(s=[]),o||(o=[]);for(u=s.length;u--;)if(s[
u]==e)return o[u];var f=a?n(e.length):{};return s.push(e),o.push(f),(a?mn:tn)(e,function(e,n){f[n]=y(e,t,r,s,o)}),f}function b(e,t,s,o){if(e==r||t==r)return e===t;if(e===t)return 0!==e||1/e==1/t;if(Ht[typeof e]||Ht[typeof t])e=e.__wrapped__||e,t=t.__wrapped__||t;var u=rt.call(e);if(u!=rt.call(t))return i;switch(u){case pt:case dt:return+e==+t;case vt:return e!=+e?t!=+t:0==e?1/e==1/t:e==+t;case gt:case yt:return e==t+""}var a=Dt[u];if(Nt&&!a&&(a=v(e))&&!v(t)||!a&&(u!=mt||Lt&&("function"!=typeof e.
toString&&"string"==typeof (e+"")||"function"!=typeof t.toString&&"string"==typeof (t+""))))return i;s||(s=[]),o||(o=[]);for(u=s.length;u--;)if(s[u]==e)return o[u]==t;var u=-1,f=n,l=0;s.push(e),o.push(t);if(a){l=e.length;if(f=l==t.length)for(;l--&&(f=b(e[l],t[l],s,o)););return f}a=e.constructor,f=t.constructor;if(a!=f&&(!m(a)||!(a instanceof a&&m(f)&&f instanceof f)))return i;for(var c in e)if(Z.call(e,c)&&(l++,!Z.call(t,c)||!b(e[c],t[c],s,o)))return i;for(c in t)if(Z.call(t,c)&&!(l--))return i;if(
Et)for(;7>++u;)if(c=J[u],Z.call(e,c)&&(!Z.call(t,c)||!b(e[c],t[c],s,o)))return i;return n}function w(e,t,n){var r=-Infinity,i=-1,s=e?e.length:0,o=r;if(t||s!==+s)t=f(t,n),mn(e,function(e,n,i){n=t(e,n,i),n>r&&(r=n,o=e)});else for(;++i<s;)e[i]>o&&(o=e[i]);return o}function E(e,t,n,r){var s=e,o=e?e.length:0,u=3>arguments.length;if(o!==+o)var a=sn(e),o=a.length;else kt&&rt.call(e)==yt&&(s=e.split(""));return mn(e,function(e,f,l){f=a?a[--o]:--o,n=u?(u=i,s[f]):t.call(r,n,s[f],f,l)}),n}function S(e,t,n){
if(e)return t==r||n?e[0]:nt.call(e,0,t)}function x(e,t){for(var n=-1,r=e?e.length:0,i=[];++n<r;){var s=e[n];$t(s)?et.apply(i,t?s:x(s)):i.push(s)}return i}function T(e,t,n){var r=-1,i=e?e.length:0;if("number"==typeof n)r=(0>n?at(0,i+n):n||0)-1;else if(n)return r=C(e,t),e[r]===t?r:-1;for(;++r<i;)if(e[r]===t)return r;return-1}function N(e,t,n){return e?nt.call(e,t==r||n?1:t):[]}function C(e,t,n,r){var i=0,s=e?e.length:i;if(n){n=f(n,r);for(t=n(t);i<s;)r=i+s>>>1,n(e[r])<t?i=r+1:s=r}else for(;i<s;)r=i+
s>>>1,e[r]<t?i=r+1:s=r;return i}function k(e,t,n,r){var s=-1,o=e?e.length:0,u=[],a=[];"function"==typeof t&&(r=n,n=t,t=i);for(n=f(n,r);++s<o;)if(r=n(e[s],s,e),t?!s||a[a.length-1]!==r:0>T(a,r))a.push(r),u.push(e[s]);return u}function L(e,t){return Ot||it&&2<arguments.length?it.call.apply(it,arguments):a(e,t,nt.call(arguments,2))}function A(e){return e}function O(e){mn(nn(e),function(t){var r=s[t]=e[t];s.prototype[t]=function(){var e=[this.__wrapped__];return arguments.length&&et.apply(e,arguments)
,e=r.apply(s,e),this.__chain__&&(e=new s(e),e.__chain__=n),e}})}var n=!0,r=null,i=!1,M="object"==typeof exports&&exports&&("object"==typeof global&&global&&global==global.global&&(e=global),exports),_=Array.prototype,D=Object.prototype,P=0,H=30,B=e._,j=/[-?+=!~*%&^<>|{(\/]|\[\D|\b(?:delete|in|instanceof|new|typeof|void)\b/,F=/&(?:amp|lt|gt|quot|#x27);/g,I=/\b__p\+='';/g,q=/\b(__p\+=)''\+/g,R=/(__e\(.*?\)|\b__t\))\+'';/g,U=/\w*$/,z=/(?:__e|__t=)\(\s*(?![\d\s"']|this\.)/g,W=RegExp("^"+(D.valueOf+""
).replace(/[.*+?^=!:${}()|[\]\/\\]/g,"\\$&").replace(/valueOf|for [^\]]+/g,".+?")+"$"),X=/($^)/,V=/[&<>"']/g,$=/['\n\r\t\u2028\u2029\\]/g,J="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),K=Math.ceil,Q=_.concat,G=Math.floor,Y=W.test(Y=Object.getPrototypeOf)&&Y,Z=D.hasOwnProperty,et=_.push,tt=D.propertyIsEnumerable,nt=_.slice,rt=D.toString,it=W.test(it=nt.bind)&&it,st=W.test(st=Array.isArray)&&st,ot=e.isFinite,ut=W.test(ut=Object.keys)&&ut
,at=Math.max,ft=Math.min,lt=Math.random,ct="[object Arguments]",ht="[object Array]",pt="[object Boolean]",dt="[object Date]",vt="[object Number]",mt="[object Object]",gt="[object RegExp]",yt="[object String]",bt=e.clearTimeout,wt=e.setTimeout,Et,St,xt,Tt=n;(function(){function e(){this.x=1}var t={0:1,length:1},n=[];e.prototype={valueOf:1,y:1};for(var r in new e)n.push(r);for(r in arguments)Tt=!r;Et=4>(n+"").length,xt="x"!=n[0],St=(n.splice.call(t,0,1),t[0])})(1);var Nt=!v(arguments),Ct="x"!=nt.call("x"
)[0],kt="xx"!="x"[0]+Object("x")[0];try{var Lt=("[object Object]",rt.call(e.document||0)==mt)}catch(At){}var Ot=it&&/\n|Opera/.test(it+rt.call(e.opera)),Mt=ut&&/^.+$|true/.test(ut+!!e.attachEvent),_t=!Ot,Dt={};Dt[pt]=Dt[dt]=Dt["[object Function]"]=Dt[vt]=Dt[mt]=Dt[gt]=i,Dt[ct]=Dt[ht]=Dt[yt]=n;var Pt={};Pt[ct]=Pt["[object Function]"]=i,Pt[ht]=Pt[pt]=Pt[dt]=Pt[vt]=Pt[mt]=Pt[gt]=Pt[yt]=n;var Ht={"boolean":i,"function":n,object:n,number:i,string:i,"undefined":i,unknown:n},Bt={"\\":"\\","'":"'","\n":"n"
,"\r":"r"," ":"t","\u2028":"u2028","\u2029":"u2029"};s.templateSettings={escape:/<%-([\s\S]+?)%>/g,evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,variable:""};var jt={a:"d,c,x",p:"c=f(c,x)",h:"if(c(A,i,d)===false)return t"},Ft={i:"{}",p:"c=f(c,x)",h:"var p=c(A,i,d);(h.call(t,p)?t[p]++:t[p]=1)"},It={i:"true",h:"if(!c(A,i,d))return!t"},qt={q:i,r:i,a:"m",p:"for(var a=1,b=arguments.length;a<b;a++){if(j=arguments[a]){",h:"t[i]=A",e:"}}"},Rt={i:"[]",h:"c(A,i,d)&&t.push(A)"},Ut={p:"c=f(c,x)"}
,zt={h:{k:jt.h}},Wt={i:"d||[]",d:{b:"t=Array(k)",k:"t="+(Mt?"Array(k)":"[]")},h:{b:"t[i]=c(A,i,d)",k:"t"+(Mt?"[n]=":".push")+"(c(A,i,d))"}},Xt={q:i,a:"m,c,x",i:"{}",p:"var R=typeof c=='function';if(R)c=f(c,x);else var s=e.apply(E,arguments)",h:"if(R?!c(A,i,m):M(s,i)<0)t[i]=A"},Vt=l({a:"m",i:"{}",h:"t[A]=i"});Nt&&(v=function(e){return e?Z.call(e,"callee"):i});var $t=st||function(e){return rt.call(e)==ht};m(/x/)&&(m=function(e){return"[object Function]"==rt.call(e)});var Jt=Y?function(e){if(!e||"object"!=typeof 
e)return i;var t=e.valueOf,n="function"==typeof t&&(n=Y(t))&&Y(n);return n?e==n||Y(e)==n&&!v(e):g(e)}:g,Kt=l({a:"m",i:"[]",h:"t.push(i)"}),Qt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"},Gt=Vt(Qt),Yt=l(qt,{h:"if(t[i]==null)"+qt.h}),Zt=l(qt),en=l(jt,Ut,zt,{q:i}),tn=l(jt,Ut,zt),nn=l({q:i,a:"m",i:"[]",h:"S(A)&&t.push(i)",e:"t.sort()"}),rn=l({a:"A",i:"true",p:"var H=y.call(A),k=A.length;if(D[H]"+(Nt?"||O(A)":"")+"||(H==X&&k===+k&&S(A.splice)))return!k",h:{k:"return false"}}),sn=ut?function(
e){var t=typeof e;return"function"==t&&tt.call(e,"prototype")?Kt(e):e&&Ht[t]?ut(e):[]}:Kt,on=l(qt,{a:"m,dd,N",p:"var P,C=arguments,a=0;if(N==I){var b=2,ee=C[3],ff=C[4]}else var b=C.length,ee=[],ff=[];while(++a<b){if(j=C[a]){",h:"if((dd=A)&&((P=Q(dd))||T(dd))){var K=false,gg=ee.length;while(gg--)if(K=ee[gg]==dd)break;if(K){t[i]=ff[gg]}else {ee.push(dd);ff.push(A=(A=t[i],P)?(Q(A)?A:[]):(T(A)?A:{}));t[i]=G(A,dd,I,ee,ff)}}else if(dd!=null)t[i]=dd"}),un=l(Xt),an=l({a:"m",i:"[]",h:"t"+(Mt?"[n]=":".push"
)+"([i,A])"}),fn=l(Xt,{p:"if(typeof c!='function'){var i=0,s=e.apply(E,arguments),k=s.length;while(++i<k){var p=s[i];if(p in m)t[p]=m[p]}}else {c=f(c,x)",h:"if(c(A,i,m))t[i]=A",e:"}"}),ln=l({a:"m",i:"[]",h:"t.push(A)"}),cn=l({a:"d,hh",i:"false",n:i,d:{b:"if(y.call(d)==w)return d.indexOf(hh)>-1"},h:"if(A===hh)return true"}),hn=l(jt,Ft),pn=l(jt,It),dn=l(jt,Rt),vn=l(jt,Ut,{i:"z",h:"if(c(A,i,d))return A"}),mn=l(jt,Ut),gn=l(jt,Ft,{h:"var p=c(A,i,d);(h.call(t,p)?t[p]:t[p]=[]).push(A)"}),yn=l(Wt,{a:"d,U"
,p:"var C=v.call(arguments,2),R=typeof U=='function'",h:{b:"t[i]=(R?U:A[U]).apply(A,C)",k:"t"+(Mt?"[n]=":".push")+"((R?U:A[U]).apply(A,C))"}}),bn=l(jt,Wt),wn=l(Wt,{a:"d,bb",h:{b:"t[i]=A[bb]",k:"t"+(Mt?"[n]=":".push")+"(A[bb])"}}),En=l({a:"d,c,B,x",i:"B",p:"var V=arguments.length<3;c=f(c,x)",d:{b:"if(V)t=j[++i]"},h:{b:"t=c(t,A,i,d)",k:"t=V?(V=false,A):c(t,A,i,d)"}}),Sn=l(jt,Rt,{h:"!"+Rt.h}),xn=l(jt,It,{i:"false",h:It.h.replace("!","")}),Tn=l(jt,Ft,Wt,{h:{b:"t[i]={a:c(A,i,d),b:i,c:A}",k:"t"+(Mt?"[n]="
:".push")+"({a:c(A,i,d),b:i,c:A})"},e:"t.sort(I);k=t.length;while(k--)t[k]=t[k].c"}),Nn=l(Rt,{a:"d,aa",p:"var s=[];J(aa,function(A,p){s.push(p)});var cc=s.length",h:"for(var Z=true,r=0;r<cc;r++){var p=s[r];if(!(Z=A[p]===aa[p]))break}Z&&t.push(A)"}),Cn=l({q:i,r:i,a:"m",p:"var L=arguments,i=0,k=L.length;if(k>1){while(++i<k)t[L[i]]=F(t[L[i]],t);return t}",h:"if(S(A))t[i]=F(A,t)"});s.VERSION="0.8.2",s.after=function(e,t){return 1>e?t():function(){if(1>--e)return t.apply(this,arguments)}},s.bind=L,s.bindAll=
Cn,s.chain=function(e){return e=new s(e),e.__chain__=n,e},s.clone=y,s.compact=function(e){for(var t=-1,n=e?e.length:0,r=[];++t<n;){var i=e[t];i&&r.push(i)}return r},s.compose=function(){var e=arguments;return function(){for(var t=arguments,n=e.length;n--;)t=[e[n].apply(this,t)];return t[0]}},s.contains=cn,s.countBy=hn,s.debounce=function(e,t,n){function i(){a=r,n||(o=e.apply(u,s))}var s,o,u,a;return function(){var r=n&&!a;return s=arguments,u=this,bt(a),a=wt(i,t),r&&(o=e.apply(u,s)),o}},s.defaults=
Yt,s.defer=function(e){var n=nt.call(arguments,1);return wt(function(){return e.apply(t,n)},1)},s.delay=function(e,n){var r=nt.call(arguments,2);return wt(function(){return e.apply(t,r)},n)},s.difference=function(e){var t=[];if(!e)return t;for(var n=-1,r=e.length,i=Q.apply(_,arguments),i=o(i,r);++n<r;){var s=e[n];i(s)||t.push(s)}return t},s.escape=function(e){return e==r?"":(e+"").replace(V,h)},s.every=pn,s.extend=Zt,s.filter=dn,s.find=vn,s.first=S,s.flatten=x,s.forEach=mn,s.forIn=en,s.forOwn=tn,
s.functions=nn,s.groupBy=gn,s.has=function(e,t){return e?Z.call(e,t):i},s.identity=A,s.indexOf=T,s.initial=function(e,t,n){return e?nt.call(e,0,-(t==r||n?1:t)):[]},s.intersection=function(e){var t=arguments.length,n=[],r=-1,i=e?e.length:0,s=[];e:for(;++r<i;){var u=e[r];if(0>T(s,u)){for(var a=1;a<t;a++)if(!(n[a]||(n[a]=o(arguments[a])))(u))continue e;s.push(u)}}return s},s.invert=Vt,s.invoke=yn,s.isArguments=v,s.isArray=$t,s.isBoolean=function(e){return e===n||e===i||rt.call(e)==pt},s.isDate=function(
e){return rt.call(e)==dt},s.isElement=function(e){return e?1===e.nodeType:i},s.isEmpty=rn,s.isEqual=b,s.isFinite=function(e){return ot(e)&&rt.call(e)==vt},s.isFunction=m,s.isNaN=function(e){return rt.call(e)==vt&&e!=+e},s.isNull=function(e){return e===r},s.isNumber=function(e){return rt.call(e)==vt},s.isObject=function(e){return e?Ht[typeof e]:i},s.isPlainObject=Jt,s.isRegExp=function(e){return rt.call(e)==gt},s.isString=function(e){return rt.call(e)==yt},s.isUndefined=function(e){return e===t},s
.keys=sn,s.last=function(e,t,n){if(e){var i=e.length;return t==r||n?e[i-1]:nt.call(e,-t||i)}},s.lastIndexOf=function(e,t,n){var r=e?e.length:0;for("number"==typeof n&&(r=(0>n?at(0,r+n):ft(n,r-1))+1);r--;)if(e[r]===t)return r;return-1},s.lateBind=function(e,t){return a(t,e,nt.call(arguments,2))},s.map=bn,s.max=w,s.memoize=function(e,t){var n={};return function(){var r=t?t.apply(this,arguments):arguments[0];return Z.call(n,r)?n[r]:n[r]=e.apply(this,arguments)}},s.merge=on,s.min=function(e,t,n){var r=
Infinity,i=-1,s=e?e.length:0,o=r;if(t||s!==+s)t=f(t,n),mn(e,function(e,n,i){n=t(e,n,i),n<r&&(r=n,o=e)});else for(;++i<s;)e[i]<o&&(o=e[i]);return o},s.mixin=O,s.noConflict=function(){return e._=B,this},s.object=function(e,t){for(var n=-1,r=e?e.length:0,i={};++n<r;){var s=e[n];t?i[s]=t[n]:i[s[0]]=s[1]}return i},s.omit=un,s.once=function(e){var t,s=i;return function(){return s?t:(s=n,t=e.apply(this,arguments),e=r,t)}},s.pairs=an,s.partial=function(e){return a(e,nt.call(arguments,1))},s.pick=fn,s.pluck=
wn,s.random=function(e,t){return e==r&&t==r&&(t=1),e=+e||0,t==r&&(t=e,e=0),e+G(lt()*((+t||0)-e+1))},s.range=function(e,t,n){e=+e||0,n=+n||1,t==r&&(t=e,e=0);for(var i=-1,t=at(0,K((t-e)/n)),s=Array(t);++i<t;)s[i]=e,e+=n;return s},s.reduce=En,s.reduceRight=E,s.reject=Sn,s.rest=N,s.result=function(e,t){var n=e?e[t]:r;return m(n)?e[t]():n},s.shuffle=function(e){var t=-1,n=Array(e?e.length:0);return mn(e,function(e){var r=G(lt()*(++t+1));n[t]=n[r],n[r]=e}),n},s.size=function(e){var t=e?e.length:0;return t===+
t?t:sn(e).length},s.some=xn,s.sortBy=Tn,s.sortedIndex=C,s.tap=function(e,t){return t(e),e},s.template=function(e,t,n){e||(e=""),n||(n={});var r,i,o=0,u=s.templateSettings,a="__p += '",f=n.variable||u.variable,l=f;e.replace(RegExp((n.escape||u.escape||X).source+"|"+(n.interpolate||u.interpolate||X).source+"|"+(n.evaluate||u.evaluate||X).source+"|$","g"),function(t,n,i,s,u){a+=e.slice(o,u).replace($,c),a+=n?"'+__e("+n+")+'":s?"';"+s+";__p+='":i?"'+((__t=("+i+"))==null?'':__t)+'":"",r||(r=s||j.test(
n||i)),o=u+t.length}),a+="';",l||(f="obj",r?a="with("+f+"){"+a+"}":(n=RegExp("(\\(\\s*)"+f+"\\."+f+"\\b","g"),a=a.replace(z,"$&"+f+".").replace(n,"$1__d"))),a=(r?a.replace(I,""):a).replace(q,"$1").replace(R,"$1;"),a="function("+f+"){"+(l?"":f+"||("+f+"={});")+"var __t,__p='',__e=_.escape"+(r?",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}":(l?"":",__d="+f+"."+f+"||"+f)+";")+a+"return __p}";try{i=Function("_","return "+a)(s)}catch(h){throw h.source=a,h}return t?i(t):(i.source=
a,i)},s.throttle=function(e,t){function n(){a=new Date,u=r,s=e.apply(o,i)}var i,s,o,u,a=0;return function(){var r=new Date,f=t-(r-a);return i=arguments,o=this,0>=f?(bt(u),a=r,s=e.apply(o,i)):u||(u=wt(n,f)),s}},s.times=function(e,t,n){for(var e=+e||0,r=-1,i=Array(e);++r<e;)i[r]=t.call(n,r);return i},s.toArray=function(e){if(!e)return[];var t=e.length;return t===+t?(Ct?rt.call(e)==yt:"string"==typeof e)?e.split(""):nt.call(e):ln(e)},s.unescape=function(e){return e==r?"":(e+"").replace(F,d)},s.union=
function(){for(var e=-1,t=Q.apply(_,arguments),n=t.length,r=[];++e<n;){var i=t[e];0>T(r,i)&&r.push(i)}return r},s.uniq=k,s.uniqueId=function(e){var t=P++;return e?e+t:t},s.values=ln,s.where=Nn,s.without=function(e){for(var t=-1,n=e?e.length:0,r=o(arguments,1,20),i=[];++t<n;){var s=e[t];r(s)||i.push(s)}return i},s.wrap=function(e,t){return function(){var n=[e];return arguments.length&&et.apply(n,arguments),t.apply(this,n)}},s.zip=function(e){for(var t=-1,n=e?w(wn(arguments,"length")):0,r=Array(n);++
t<n;)r[t]=wn(arguments,t);return r},s.all=pn,s.any=xn,s.collect=bn,s.detect=vn,s.drop=N,s.each=mn,s.foldl=En,s.foldr=E,s.head=S,s.include=cn,s.inject=En,s.methods=nn,s.select=dn,s.tail=N,s.take=S,s.unique=k,O(s),s.prototype.chain=function(){return this.__chain__=n,this},s.prototype.value=function(){return this.__wrapped__},mn("pop push reverse shift sort splice unshift".split(" "),function(e){var t=_[e];s.prototype[e]=function(){var e=this.__wrapped__;return t.apply(e,arguments),St&&e.length===0&&delete 
e[0],this.__chain__&&(e=new s(e),e.__chain__=n),e}}),mn(["concat","join","slice"],function(e){var t=_[e];s.prototype[e]=function(){var e=t.apply(this.__wrapped__,arguments);return this.__chain__&&(e=new s(e),e.__chain__=n),e}}),typeof define=="function"&&typeof define.amd=="object"&&define.amd?(e._=s,define('underscore',[],function(){return s})):M?"object"==typeof module&&module&&module.exports==M?(module.exports=s)._=s:M._=s:e._=s})(this);

//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  // var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, {silent: true});
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);

define("backbone", ["underscore","zepto"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Backbone;
    };
}(this)));

define('localstorage',["underscore","backbone"],function(_,Backbone){function S4(){return((1+Math.random())*65536|0).toString(16).substring(1)}function guid(){return S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()}var Store=function(name){this.name=name;var store=localStorage.getItem(this.name);this.data=store&&JSON.parse(store)||{}};_.extend(Store.prototype,{save:function(){localStorage.setItem(this.name,JSON.stringify(this.data))},create:function(model){if(!model.id)model.id=model.attributes.id=guid();
this.data[model.id]=model;this.save();return model},update:function(model){this.data[model.id]=model;this.save();return model},find:function(model){return this.data[model.id]},findAll:function(){return _.values(this.data)},destroy:function(model){delete this.data[model.id];this.save();return model}});Backbone.sync=function(method,model,options){var resp;var store=model.localStorage||model.collection.localStorage;switch(method){case "read":resp=model.id?store.find(model):store.findAll();break;case "create":resp=
store.create(model);break;case "update":resp=store.update(model);break;case "delete":resp=store.destroy(model);break}if(resp)options.success(resp);else options.error("Record not found")};return Store});



define('models/currency',[
  'underscore',
  'backbone',
  'collections/denominations'
], function(_, Backbone, DenominationsCollection) {
  var CurrencyModel = Backbone.Model.extend({
    defaults: {
      code: '???',
      coins: [],
      fraction: 'cent',
      fractionSymbol: '¢',
      fractionSymbolAfter: true,
      name: 'Unknown Dollar',
      notes: [],
      pluralName: "Unknown Dollars",
      range: null,
      whole: 'dollar',
      wholeSymbol: '$',
      wholeSymbolAfter: false,
      worth: undefined
    },

    coins: function() {
      return DenominationsCollection.where({
        code: this.model.get('code'),
        type: 'coin'
      })
    },

    notes: function() {
      return DenominationsCollection.where({
        code: this.model.get('code'),
        type: 'note'
      })
    }
  })

  return CurrencyModel
})
;


define('models/denomination',[
  'underscore',
  'backbone',
  'require',
  'models/currency'
], function(_, Backbone, require, Currency) {
  var DECIMAL_POINTS = 2

  var DenominationModel = Backbone.Model.extend({
    defaults: {
      currencyCode: undefined,
      type: undefined,
      value: undefined
    },

    currency: function() {
      var Currencies = require('collections/currencies')
      return Currencies.where({code: this.get('currencyCode')})[0]
    },

    valueFormatted: function() {
      return this.get('value') < 1 ? this.get('value').toFixed(DECIMAL_POINTS).toString().replace(/0\.0?(\d{1,2})/g, '$1') : this.get('value')
    },

    worthIn: function(currency) {
      var Currencies = require('collections/currencies')

      var worth = this.get('value') *
        Currencies.where({code: this.get('currencyCode')})[0].get('worth') /
        (currency instanceof String ? Currencies.where({code: currency})[0].get('worth') : currency.get('worth'))

      return worth.toFixed(DECIMAL_POINTS) !== 0.00 ? worth.toFixed(DECIMAL_POINTS) : 0.01
    }
  })

  return DenominationModel
})
;


define('collections/denominations',[
  'underscore',
  'backbone',
  'localstorage',
  'models/denomination'
], function(_, Backbone, Store, Denomination) {
  var DenominationsCollection = Backbone.Collection.extend({
    model: Denomination,

    localStorage: new Store('Denominations'),

    comparator: function(denomination) {
      return denomination.get('value')
    },

    deleteAll: function() {
      this.models.forEach(function(model) {
        model.destroy()
      })

      this.reset()
    }
  })

  return new DenominationsCollection()
})
;


define('collections/currencies',[
  'underscore',
  'backbone',
  'localstorage',
  'collections/denominations',
  'models/currency'
], function(_, Backbone, Store, DenominationsCollection, Currency) {
  var CurrenciesCollection = Backbone.Collection.extend({
    model: Currency,

    localStorage: new Store('Currencies'),

    // Sort currencies by their actual name and not their ISO code.
    // Some currencies have weird codes that make lists seem odd (eg Swiss
    // Franc is CHF).
    comparator: function(currency) {
      return currency.get('name')
    },

    coins: function(code, range) {
      return DenominationsCollection.where({
        currencyCode: code,
        type: 'coin'
      })
    },

    deleteAll: function() {
      this.models.forEach(function(model) {
        model.destroy()
      })

      this.reset()
    },

    denominations: function(code, range) {
      return DenominationsCollection.where({
        currencyCode: code
      }).filter(function(denomination) {
        if (range === undefined) {
          range = denomination.currency().get('range')
        }
        return (denomination.get('value') >= range[0] &&
                denomination.get('value') <= range[1])
      })
    },

    notes: function(code, range) {
      return DenominationsCollection.where({
        currencyCode: code,
        type: 'notes'
      })
    }
  })

  return new CurrenciesCollection()
})
;
/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */


define('app',[
  'zepto',
  'currency-data',
  'collections/currencies',
  'collections/denominations',
  'models/currency',
  'models/denomination'
], function($, CurrencyData, CurrenciesCollection, DenominationsCollection, Currency, Denomination) {
  if (!window._faceValueDataCache) {
    window._faceValueDataCache = {}
  }

  var GLOBALS = {
    DEFAULT_FOREIGN_CURRENCY: 'EUR',
    DEFAULT_HOME_CURRENCY: 'USD',
    HAS: {
      nativeScroll: (function() {
        return 'WebkitOverflowScrolling' in window.document.createElement('div').style
      })()
    },
    TIME_TO_UPDATE: 3600 * 24 // Update currencies/denominations every day
  }

  var dataCache = window._faceValueDataCache

  function initialize(callback) {
    if (GLOBALS.HAS.nativeScroll) {
      $('body').addClass('native-scroll')
    }

    // TODO: Improve this.
    // This is a hacky cache-bust thing while I figure out a better way...
    cacheReady()

    // OMG, this is how we cache bust for now.
    window.applicationCache.addEventListener('cached', function() {
      cacheReady()
      window.location.reload()
    })

    window.applicationCache.addEventListener('updateready', function() {
      cacheReady()
      window.location.reload()
    })

    if (get('cacheReady')) {
      $('body').removeClass('cache-loading')
    } else {
      $('#loading-text').animate({opacity: 1})
    }

    CurrenciesCollection.fetch({
      success: function() {
        DenominationsCollection.fetch({
          success: function() {
            if (!get('foreignCurrency')) {
              set('foreignCurrency', GLOBALS.DEFAULT_FOREIGN_CURRENCY)
            }

            if (!get('homeCurrency')) {
              set('homeCurrency', GLOBALS.DEFAULT_HOME_CURRENCY)
            }

            // Update currency/denomination info every hour.
            if (!get('lastTimeCurrencyDataUpdated') ||
                timestamp() - get('lastTimeCurrencyDataUpdated') > GLOBALS.TIME_TO_UPDATE) {
              CurrencyData.update(function(worth) {
                set('worth', worth)

                fetchCurrencyData(callback)
              })
            } else {
              callback()
            }
          }
        })
      }
    })
  }

  function cacheReady() {
    $('body').removeClass('cache-loading')
    set('cacheReady', true)
  }

  function get(key, fallback) {
    if (dataCache[key] !== undefined) {
      // console.info('cache hit', '### ' + key + ' ###', dataCache[key])
      return dataCache[key]
    } else if (window.localStorage[key] !== undefined) {
      dataCache[key] = JSON.parse(window.localStorage[key])
      // console.info('cache miss', '### ' + key + ' ###', dataCache[key])
      return dataCache[key]
    } else {
      // console.info('not found')
      return fallback
    }
  }

  function fetchCurrencyData(callback) {
    $.ajax({
      url: 'denominations.json',
      dataType: 'json',
      success: function(results) {
        updateCurrencyData(results)

        callback()
      },
      error: function() {
        console.log('failed')
      }
    })
  }

  function set(key, value) {
    window.localStorage[key] = JSON.stringify(value)
    return dataCache[key] = value
  }

  function timestamp(date) {
    if (!date) {
      date = new Date()
    }

    return Math.round(date.getTime() / 1000)
  }

  function updateCurrencyData(currencyData) {
    for (var i in currencyData) {
      var currency = CurrenciesCollection.where({code: i})[0];

      // This currency doesn't exist yet, so we'll create it.
      if (!currency) {
        currency = new Currency({code: i})
        CurrenciesCollection.add(currency)
      }

      currency.set(_.pick(currencyData[i],
        'fraction',
        'fractionSymbol',
        'fractionSymbolAfter',
        'name',
        'pluralName',
        'range',
        'whole',
        'wholeSymbol',
        'wholeSymbolAfter'
      ))

      currency.set({
        worth: get('worth')[i]
      })

      currency.save()
    }

    // Update/create denomination data.
    CurrenciesCollection.each(function(model) {
      _(['coins', 'notes']).each(function(type) {
        for (var i in currencyData[model.get('code')][type]) {
          var denomination = DenominationsCollection.where({
            currencyCode: model.get('code'),
            value: parseFloat(_.keys(currencyData[model.get('code')][type][i])[0]),
            type: type.slice(0, -1)
          })[0];

          // No denomination with these properties exists, so it's new.
          if (!denomination) {
            denomination = new Denomination({
              currencyCode: model.get('code'),
              style: _.values(currencyData[model.get('code')][type][i])[0],
              type: type.slice(0, -1),
              value: parseFloat(_.keys(currencyData[model.get('code')][type][i])[0]),
            })

            DenominationsCollection.add(denomination)
          } else {
            denomination.set({
              style: _.values(currencyData[model.get('code')][type][i])[0]
            })
          }

          denomination.save()
        }
      })
    })

    set('lastTimeCurrencyDataUpdated', timestamp())
  }

  return _(GLOBALS).extend({
    get: get,
    initialize: initialize,
    set: set,
    timestamp: timestamp,
    updateCurrencyData: updateCurrencyData
  })
})
;
/**
 * @license RequireJS text 2.0.3 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

define('text',['module'], function (module) {
    

    var text, fs,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [],
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.3',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var strip = false, index = name.indexOf("."),
                modName = name.substring(0, index),
                ext = name.substring(index + 1, name.length);

            index = ext.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = ext.substring(index + 1, ext.length);
                strip = strip === "strip";
                ext = ext.substring(0, index);
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + '.' +
                                     parsed.ext) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node)) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback) {
            var file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file.indexOf('\uFEFF') === 0) {
                file = file.substring(1);
            }
            callback(file);
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback) {
            var xhr = text.createXhr();
            xhr.open('GET', url, true);

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                stringBuffer.append(line);

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    }

    return text;
});

define('text!templates/currencies/controls.ejs',[],function () { return '<a id="currency-switcher" href="#/convert/<%= homeCurrency.get(\'code\') %>-<%= currency.get(\'code\') %>">\n  <span class="off-screen"><%= currency.get(\'code\') %> &lt;=&gt; <%= homeCurrency.get(\'code\') %></span>\n</a>\n\n<div id="currency-selector">\n  <div class="regular">\n    What are my <a href="#first-currency" class="select-currency" data-currency="foreign"><%= currency.get(\'pluralName\') %></a>\n    <br>\n    worth in <strong><%= homeCurrency.get(\'pluralName\') %></strong>?\n  </div>\n  <div class="small">\n    <a href="#first-currency" class="select-currency" data-currency="foreign"><%= currency.get(\'code\') %> %></a> &gt; <a href="#second-currency" class="select-currency" data-currency="home"><%= homeCurrency.get(\'code\') %> %></a>\n  </div>\n</div>\n';});

define('text!templates/currencies/list_item.ejs',[],function () { return '<a href="#/convert/<%= currency.get(\'code\') %>-<%= homeCurrency.get(\'code\') %>"\n   class="change-currency" data-currency="<%= currency.get(\'code\') %>">\n  <%= currency.get(\'name\') %>\n</a>\n';});



define('views/currencies',[
  'app',
  'zepto',
  'underscore',
  'backbone',
  'collections/currencies',
  'models/currency',
  'text!templates/currencies/controls.ejs',
  'text!templates/currencies/list_item.ejs'
], function(App, $, _, Backbone, Currencies, Currency, controlsTemplate, listItemTemplate) {
  var controlsView = Backbone.View.extend({
    el: '#header',
    $el: $('#header'),
    model: Currency,
    tagName: 'div',
    template: _.template(controlsTemplate),

    // The DOM events specific to an item.
    events: {
      'click .select-currency': 'selectCurrency'
    },

    initialize: function() {
      $('.currency-list-selector').on('click', this.closeSelection)

      this.model.on('change', this.render, this)
      this.render()
    },

    render: function() {
      this.$el.html(this.template({
        currency: this.model,
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      })).removeClass().addClass('{code}-flag'.format({code: this.model.get('code')}))

      return this
    },

    closeSelection: function(event) {
      // Don't close the selection div if the user actually clicked on a
      // currency link in the list.
      var targetElement = event.originalTarget || event.target

      if (!$(targetElement).hasClass('change-currency')) {
        $('.currency-list-selector').addClass('hide')

        event.preventDefault()
      }
    },

    selectCurrency: function(event) {
      $('#{currency}-select'.format({
        currency: $(event.target).data('currency')
      })).removeClass('hide')

      event.preventDefault()
    }
  })

  var listItemView = Backbone.View.extend({
    model: Currency,
    tagName: 'li',
    template: _.template(listItemTemplate),

    // The DOM events specific to an item.
    events: {
      'click .change-currency': 'changeCurrency'
    },

    attributes: function() {
      return {
        'class': 'flag {code}-flag'.format({code: this.model.get('code')}),
        'data-currency': this.model.get('code')
      }
    },

    initialize: function() {
      this.model.on('change', this.render, this)
    },

    render: function() {
      this.$el.html(this.template({
        currency: this.model,
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      }))

      return this
    },

    changeCurrency: function(event) {
      $('.currency-list-selector').addClass('hide')
    }
  })

  return {
    controls: controlsView,
    listItem: listItemView
  }
})
;
define('text!templates/denominations/show.ejs',[],function () { return '<div class="<%= denomination.get(\'style\') %> <%= denomination.get(\'type\') %>">\n  <div class="color <%= denomination.get(\'style\') %>"></div>\n  <div class="inner"><% if ((denomination.get(\'value\') < 1 && !currency.get(\'fractionSymbolAfter\')) || (denomination.get(\'value\') >= 1 && !currency.get(\'wholeSymbolAfter\'))) { %><span class="symbol"><%= denomination.get(\'value\') < 1 ? currency.get(\'fractionSymbol\') : currency.get(\'wholeSymbol\') %></span><% } %><% if (denomination.get(\'value\') < 1) { %><span class="fraction"><% } %><%= denomination.valueFormatted() %><% if (denomination.get(\'value\') < 1) { %></span><% } %><% if ((denomination.get(\'value\') < 1 && currency.get(\'fractionSymbolAfter\')) || (denomination.get(\'value\') >= 1 && currency.get(\'wholeSymbolAfter\'))) { %><span class="symbol"><%= denomination.get(\'value\') < 1 ? currency.get(\'fractionSymbol\') : currency.get(\'wholeSymbol\') %></span><% } %>\n  </div>\n</div>\n\n<div class="subtitle"><% if ((denomination.worthIn(homeCurrency) < 1 && !homeCurrency.get(\'fractionSymbolAfter\')) || (denomination.worthIn(homeCurrency) >= 1 && !homeCurrency.get(\'wholeSymbolAfter\'))) { %><span class="symbol"><%= denomination.worthIn(homeCurrency) < 1 ? homeCurrency.get(\'fractionSymbol\') : homeCurrency.get(\'wholeSymbol\') %></span><% } %><%= denomination.worthIn(homeCurrency) %><% if ((denomination.worthIn(homeCurrency) < 1 && homeCurrency.get(\'fractionSymbolAfter\')) || (denomination.worthIn(homeCurrency) >= 1 && homeCurrency.get(\'wholeSymbolAfter\'))) { %><span class="symbol"><%= denomination.worthIn(homeCurrency) < 1 ? homeCurrency.get(\'fractionSymbol\') : homeCurrency.get(\'wholeSymbol\') %></span><% } %></div>\n</div>\n';});



define('views/denominations',[
  'app',
  'zepto',
  'underscore',
  'backbone',
  'collections/currencies',
  'models/denomination',
  'text!templates/denominations/show.ejs'
], function(App, $, _, Backbone, Currencies, Denomination, showTemplate) {
  var ShowView = Backbone.View.extend({
    className: 'denomination col span_1',
    model: Denomination,
    template: _.template(showTemplate),

    // The DOM events specific to an item.
    events: {
    },

    initialize: function() {
      this.model.on('change', this.render, this)
    },

    render: function() {
      this.$el.html(this.template({
        currency: this.model.currency(),
        denomination: this.model,
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      }))

      return this
    }
  })

  return ShowView
})
;


define('views/app',[
  'zepto',
  'underscore',
  'backbone',
  'app',
  'collections/currencies',
  'collections/denominations',
  'views/currencies',
  'views/denominations',
], function($, _, Backbone, App, Currencies, Denominations, CurrencyView, DenominationView) {
  var AppView = Backbone.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: '#denominations',
    $el: $('#denominations'),

    events: {
    },

    initialize: function() {
      App.set('homeCurrency', this.options.homeCurrency)
      App.set('foreignCurrency', this.options.foreignCurrency)

      this.setupControls()
      this.removeAllDenominations()

      this.render()
    },

    render: function() {
      var view = this

      Denominations.fetch({
        success: function() {
          Currencies.denominations(App.get('foreignCurrency'))
                    .forEach(function(denomination) {
                      view.addOne(denomination)
                    })
        }
      })

      return this
    },

    addOne: function(denomination) {
      var view = new DenominationView({
        model: denomination
      })
      $('#{type}s .denomination-list'.format({type: denomination.get('type')})).append(view.render().el)

      // This is some CSS magic snagged from @potch and the Gaia.
      var valueText = view.$el.find('.inner')[0]
      var valWidth = valueText.offsetWidth;
      var maxWidth = valueText.parentNode.offsetWidth;
      var scaleFactor = Math.min(1, (maxWidth - 25) / valWidth);
      valueText.style.transform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
      valueText.style.MozTransform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
      valueText.style.WebkitTransform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
    },

    removeAllDenominations: function(currency) {
      $('.denomination').remove()
    },

    addToCurrencySelectors: function(currency) {
      // Add this currency to the foreign selector, as long as it's not the
      // active home currency.
      if (App.get('homeCurrency') !== currency.get('code')) {
        var view = new CurrencyView.listItem({
          active: App.get('foreignCurrency') === currency.get('code'),
          model: currency
        })

        $('#foreign-select ul').append(view.render().el)
      }
    },

    setupControls: function() {
      $('.currency-list-selector li').remove()
      this.controls = new CurrencyView.controls({
        model: Currencies.where({
          code: App.get('foreignCurrency')
        })[0]
      })

      var view = this
      Currencies.fetch({
        success: function(results) {
          results.forEach(function(c) {
            view.addToCurrencySelectors(c)
          })
        }
      })
    }
  })

  return AppView
})
;


define('routers/app',[
  'zepto',
  'backbone',
  'app',
  'collections/denominations',
  'views/app'
], function($, Backbone, App, Denominations, AppView) {
  var AppRouter = Backbone.Router.extend({
    routes:{
      'convert/:foreignCurrency-:homeCurrency': 'convert',
      '': 'index'
    },

    initialize: function() {
      return this
    },

    convert: function(foreignCurrency, homeCurrency) {
      // Initialize the application view
      var view = new AppView({
        foreignCurrency: foreignCurrency,
        homeCurrency: homeCurrency
      })
    },

    index: function() {
      this.navigate('convert/{foreign}-{home}'.format({
        foreign: App.get('foreignCurrency'),
        home: App.get('homeCurrency')
      }), {trigger: true})
    }
  })

  return AppRouter
})
;
/*global Backbone:true */


// Require.js allows us to configure shortcut alias
require.config({
  paths: {
    backbone: 'lib/backbone',
    localstorage: 'lib/backbone.localstorage',
    text: 'lib/require.text',
    underscore: 'lib/lodash',
    zepto: 'lib/zepto'
  },
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  shim: {
    'backbone': {
      deps: [
        'underscore',
        'zepto'
      ],
      exports: 'Backbone'
    },
    'underscore': {
      exports: '_'
    },
    'zepto': {
      exports: 'Zepto'
    }
  }
})

require([
  'app',
  'routers/app'
], function(App, AppRouter) {
  function init() {
    // Initialize routing and start Backbone.history()
    var router = new AppRouter()
    router.initialize()

    Backbone.history.start()
  }

  App.initialize(init)
})
;
define("main", function(){});
