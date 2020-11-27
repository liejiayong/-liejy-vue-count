<script>
import { requestAnimationFrame, cancelAnimationFrame } from './raf.js';
export default {
  name: 'JyLieCount',
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
      validator(value) {
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
      default(t, b, c, d) {
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
  data() {
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
    countDown() {
      return this.start > this.end;
    },
  },
  watch: {
    start() {
      if (this.autoplay) {
        this._start();
      }
    },
    end() {
      if (this.autoplay) {
        this._start();
      }
    },
  },
  mounted() {
    if (this.autoplay) {
      this._start();
    }
    this.$emit('mounted');
  },
  destroyed() {
    cancelAnimationFrame(this.rAF);
  },
  methods: {
    _start() {
      this.localStart = this.start;
      this.startTime = null;
      this.localDuration = this.duration;
      this.paused = false;
      this.rAF = requestAnimationFrame(this.count);
    },
    pauseResume() {
      if (this.paused) {
        this.resume();
        this.paused = false;
      } else {
        this.pause();
        this.paused = true;
      }
    },
    pause() {
      cancelAnimationFrame(this.rAF);
    },
    resume() {
      this.startTime = null;
      this.localDuration = +this.remaining;
      this.localStart = +this.printVal;
      requestAnimationFrame(this.count);
    },
    reset() {
      this.startTime = null;
      cancelAnimationFrame(this.rAF);
      this.displayValue = this.formatNumber(this.start);
    },
    count(timestamp) {
      if (!this.startTime) this.startTime = timestamp;
      this.timestamp = timestamp;
      const progress = timestamp - this.startTime;
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

      let renderVNode = 0;
      const formatNum = this.formatNumber(this.printVal);
      if (this.childEle) {
        renderVNode = this.formatWrapEle(formatNum, this.childEle);
      } else {
        renderVNode = formatNum;
      }
      this.displayValue = formatNum;
      this.renderVNode = renderVNode;
      if (progress < this.localDuration) {
        this.rAF = requestAnimationFrame(this.count);
      } else {
        this.$emit('finish');
      }
    },
    formatWrapEle(num, ele) {
      let arr = num.split('');
      arr = arr.map((str) => {
        return `<${ele}>${str}</${ele}>`;
      });
      return arr.join('');
    },
    formatNumber(num) {
      num = num.toFixed(this.decimals);
      num += '';
      const x = num.split('.');
      let x1 = x[0];
      const x2 = x.length > 1 ? this.decimal + x[1] : '';
      const rgx = /(\d+)(\d{3})/;
      if (this.separator && !this.isNumber(this.separator)) {
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + this.separator + '$2');
        }
      }
      return this.prefix + x1 + x2 + this.suffix;
    },
    isNumber(val) {
      return !isNaN(parseFloat(val));
    },
  },
  render(h) {
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
</script>
