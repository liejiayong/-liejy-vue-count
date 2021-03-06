var lastTime = 0;
var prefixes = 'webkit moz ms o'.split(' ');

var requestAnimationFrame;
var cancelAnimationFrame;

var isServer = typeof window === 'undefined';
if (isServer) {
  requestAnimationFrame = function() {
    return;
  };
  cancelAnimationFrame = function() {
    return;
  };
} else {
  requestAnimationFrame = window.requestAnimationFrame;
  cancelAnimationFrame = window.cancelAnimationFrame;
  var prefix;
  for (var i = 0; i < prefixes.length; i++) {
    if (window.requestAnimationFrame && window.cancelAnimationFrame) {
      break;
    }
    prefix = prefixes[i];
    requestAnimationFrame = requestAnimationFrame || window[prefix + 'RequestAnimationFrame'];
    cancelAnimationFrame = cancelAnimationFrame || window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
  }

  if (!requestAnimationFrame || !cancelAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
  }
}

var script = {
  name: 'JylieCount',
  props: {
    start: {
      type: Number,
      required: false,
      default: 0,
    },
    end: {
      type: Number,
      required: false,
      default: 0,
    },
    duration: {
      type: Number,
      required: false,
      default: 3000,
    },
    autoplay: {
      type: Boolean,
      required: false,
      default: true,
    },
    // 小数位数
    decimals: {
      type: Number,
      required: false,
      default: 0,
      validator: function validator(value) {
        return value >= 0;
      },
    },
    // 小数位符号
    decimal: {
      type: String,
      required: false,
      default: '.',
    },
    // 分隔符
    separator: {
      type: String,
      required: false,
      default: ',',
    },
    // 前缀
    prefix: {
      type: String,
      required: false,
      default: '',
    },
    // 后缀
    suffix: {
      type: String,
      required: false,
      default: '',
    },
    useEasing: {
      type: Boolean,
      required: false,
      default: true,
    },
    easingFn: {
      type: Function,
      default: function default$1(t, b, c, d) {
        return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b;
      },
    },
    wrapEle: {
      type: String,
      required: false,
      default: 'span',
    },
    childEle: {
      type: String,
      required: false,
      default: '',
    },
  },
  data: function data() {
    return {
      localStart: this.start,
      displayValue: this.formatNumber(this.start) || '',
      printVal: null,
      paused: false,
      localDuration: this.duration,
      startTime: null,
      timestamp: null,
      remaining: null,
      rAF: null,
      renderLabel: this.wrapEle ? this.wrapEle : 'span',
      renderVNode: '',
    };
  },
  computed: {
    countDown: function countDown() {
      return this.start > this.end;
    },
  },
  watch: {
    start: function start() {
      if (this.autoplay) {
        this._start();
      }
    },
    end: function end() {
      if (this.autoplay) {
        this._start();
      }
    },
  },
  mounted: function mounted() {
    if (this.autoplay) {
      this._start();
    }
  },
  destroyed: function destroyed() {
    window.cancelAnimationFrame(this.rAF);
  },
  methods: {
    _start: function _start() {
      this.localStart = this.start;
      this.startTime = null;
      this.localDuration = this.duration;
      this.paused = false;
      this.rAF = window.requestAnimationFrame(this.count);
    },
    pauseResume: function pauseResume() {
      if (this.paused) {
        this.resume();
        this.paused = false;
      } else {
        this.pause();
        this.paused = true;
      }
    },
    pause: function pause() {
      window.cancelAnimationFrame(this.rAF);
    },
    resume: function resume() {
      this.startTime = null;
      this.localDuration = +this.remaining;
      this.localStart = +this.printVal;
      window.requestAnimationFrame(this.count);
    },
    reset: function reset() {
      this.startTime = null;
      window.cancelAnimationFrame(this.rAF);
      this.displayValue = this.formatNumber(this.start);
    },
    count: function count(timestamp) {
      if (!this.startTime) { this.startTime = timestamp; }
      this.timestamp = timestamp;
      var progress = timestamp - this.startTime;
      this.remaining = this.localDuration - progress;

      if (this.useEasing) {
        if (this.countDown) {
          this.printVal = this.localStart - this.easingFn(progress, 0, this.localStart - this.end, this.localDuration);
        } else {
          this.printVal = this.easingFn(progress, this.localStart, this.end - this.localStart, this.localDuration);
        }
      } else {
        if (this.countDown) {
          this.printVal = this.localStart - (this.localStart - this.end) * (progress / this.localDuration);
        } else {
          this.printVal = this.localStart + (this.end - this.localStart) * (progress / this.localDuration);
        }
      }
      if (this.countDown) {
        this.printVal = this.printVal < this.end ? this.end : this.printVal;
      } else {
        this.printVal = this.printVal > this.end ? this.end : this.printVal;
      }

      var renderVNode = 0;
      var formatNum = this.formatNumber(this.printVal);
      if (this.childEle) {
        renderVNode = this.formatWrapEle(formatNum, this.childEle);
      } else {
        renderVNode = formatNum;
      }
      this.displayValue = formatNum;
      this.renderVNode = renderVNode;
      if (progress < this.localDuration) {
        this.rAF = window.requestAnimationFrame(this.count);
      } else {
        this.$emit('finish');
      }
    },
    formatWrapEle: function formatWrapEle(num, ele) {
      var arr = num.split('');
      arr = arr.map(function (str) {
        return ("<" + ele + ">" + str + "</" + ele + ">");
      });
      return arr.join('');
    },
    formatNumber: function formatNumber(num) {
      num = num.toFixed(this.decimals);
      num += '';
      var x = num.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? this.decimal + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      if (this.separator && !this.isNumber(this.separator)) {
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + this.separator + '$2');
        }
      }
      return this.prefix + x1 + x2 + this.suffix;
    },
    isNumber: function isNumber(val) {
      return !isNaN(parseFloat(val));
    },
  },
  render: function render(h) {
    return h(
      this.renderLabel,
      {
        domProps: {
          innerHTML: this.renderVNode,
        },
      },
      null
    );
  },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
var __vue_script__ = script;

/* template */

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = undefined;
  /* style inject */
  
  /* style inject SSR */
  

  
  var jCount = normalizeComponent_1(
    {},
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  )

var index = {
  install: function install(Vue) {
    Vue.component("jcount", jCount);
  }
};
if (typeof window !== "undefined" && window.Vue) {
  window.Vue.component("jcount", jCount);
}

export default index;
export { jCount };
