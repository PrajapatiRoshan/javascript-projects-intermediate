import { factorial, log } from 'mathjs';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

class Calculator {
  #calculatorBtnsObj = [
    //row -- 1
    [
      { text: 'deg', data: 'deg' },
      { text: 'rad', data: 'rad' },
      { text: 'n!', data: 'fact(' },
      { text: 'AC', data: '' },
      { text: 'Backspace', data: '-1' },
    ],
    //row -- 2
    [
      { text: 'sin', data: 'sin(' },
      { text: 'cos', data: 'cos(' },
      { text: 'tan', data: 'tan(' },
      { text: 'log', data: 'log(' },
      { text: 'ln', data: 'ln(' },
    ],
    //row -- 3
    [
      { text: 'Sin^-1', data: 'sin-1(' },
      { text: 'cos^-1', data: 'cos-1(' },
      { text: 'tan^-1', data: 'tan-1(' },
      { text: 'x^n', data: '^' },
      { text: 'nx', data: 'nsqrt(x)' },
    ],
    //row -- 4
    [
      { text: '7', data: '7' },
      { text: '8', data: '8' },
      { text: '9', data: '9' },
      { text: '(', data: '(' },
      { text: ')', data: ')' },
    ],
    //row -- 5
    [
      { text: '4', data: '4' },
      { text: '5', data: '5' },
      { text: '6', data: '6' },
      { text: '*', data: '*' },
      { text: '/', data: '/' },
    ],
    //row -- 6
    [
      { text: '1', data: '1' },
      { text: '2', data: '2' },
      { text: '3', data: '3' },
      { text: '+', data: '+' },
      { text: '-', data: '-' },
    ],
    //row -- 7
    [
      { text: '.', data: '.' },
      { text: '0', data: '0' },
      { text: '&Pi;', data: Math.PI },
      { text: '%', data: '%' },
      { text: '=', data: '=' },
    ],
  ];

  #btnsContainer = document.querySelector('.btn-container');
  #form = document.querySelector('.form');
  #resultArea = document.querySelector('.display textarea');
  #result = '';
  #isDegrees = false; // Flag to determine if input is in degrees
  #isEqualPress = false; // Flag to determine if input is in degrees
  #degEl;
  #radEl;

  constructor() {
    this.#calculatorBtns();
    this.#form.addEventListener('submit', (e) => e.preventDefault());
    this.#btnsContainer.addEventListener('click', this._operations.bind(this));
    this.#degEl = document.querySelector(`[data-value="deg"]`);
    this.#radEl = document.querySelector(`[data-value="rad"]`);
  }

  #calculatorBtns() {
    const markup = this.#calculatorBtnsObj
      .map((_row, _r) =>
        _row
          .map(
            (_btn, _c) =>
              `<button data-value="${_btn.data}"  class="${
                _r < 3
                  ? 'function'
                  : _c > 2 || (_r === 6 && [0, 2].includes(_c))
                  ? 'operator'
                  : ''
              } ${_btn.data === 'rad' ? 'active' : ''}">${this.#validText(
                this.#commontext(_btn.text)
              )}</button>`
          )
          .join('')
      )
      .join('');
    this.#btnsContainer.insertAdjacentHTML('beforeend', markup);
  }

  #validText(text) {
    let markup = text;
    if (text.includes('^')) {
      const _tx = text.split('^');
      markup = _tx[0] + `<sup>${_tx[1]}</sup>`;
    } else if (text.includes('Backspace')) {
      markup = `<span class="material-symbols-outlined">backspace</span>`;
    }
    return markup;
  }

  #commontext(text) {
    const _text = text.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
    return _text;
  }

  _operations(e) {
    const _btn = e.target.closest('button');
    const _btnValue = _btn.dataset.value;

    // Check if the text contains 'deg' or 'rad'
    if (_btnValue === 'deg' || _btnValue === 'rad') {
      this.#degEl.classList.toggle('active');
      this.#radEl.classList.toggle('active');
    }
    if (this.#result.includes('deg')) {
      this.#isDegrees = true;
    }

    if (this.#isEqualPress) {
      this.#isEqualPress = false;
      this.#result = '';
    }

    if (_btnValue === '') {
      this.#result = '';
    } else if (_btnValue === '-1') {
      this.#result = this.#result.slice(0, -1);
    } else if (_btnValue === '=') {
      this.#result = this.#evaluate().toString();
      this.#isEqualPress = true;
    } else {
      this.#result += _btnValue;
    }
    this.#display();
  }

  #replaceText(text) {
    const _text = text.replace(/deg/g, '').replace(/rad/g, '');
    return _text;
  }

  #display() {
    this.#resultArea.innerHTML = this.#replaceText(this.#commontext(this.#result));
  }

  #factorial(num) {
    let n = Number(num);
    if (Number.isInteger(n)) {
      if (n === 0 || n === 1) return 1;
      return n * this.#factorial(n - 1);
    } else {
      const z = n + 1;
      const val =
        Math.sqrt((2 * Math.PI) / z) *
        Math.pow((1 / Math.E) * (z + 1 / (12 * z - 1 / (10 * z))), z);
      return parseFloat(Number(val).toFixed(5));
    }
  }

  #evaluate() {
    try {
      const regex = /\(([^()]+)\)/g;
      let match;
      const _updateTx = this.#replaceText(this.#result)
        .replace(/ /g, '')
        .replace(/−/g, '-')
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/log\s*\(\s*([^)]+?)\s*\)/g, 'Math.log10($1)')
        .replace(/ln\s*\(\s*([^)]+?)\s*\)/g, 'Math.log($1)')
        .replace(/sin\s*\(\s*([^)]+?)\s*\)/g, (_, angle) => {
          return this.#isDegrees
            ? `Math.sin((${angle}) * Math.PI / 180)`
            : `Math.sin(${angle})`;
        })
        .replace(/cos\s*\(\s*([^)]+?)\s*\)/g, (_, angle) => {
          return this.#isDegrees
            ? `Math.cos((${angle}) * Math.PI / 180)`
            : `Math.cos(${angle})`;
        })
        .replace(/tan\s*\(\s*([^)]+?)\s*\)/g, (_, angle) => {
          return this.#isDegrees
            ? `Math.tan((${angle}) * Math.PI / 180)`
            : `Math.tan(${angle})`;
        })
        .replace(/sin-1/g, `Math.asin`)
        .replace(/'cos-1\s*\(\s*([^)]+?)\s*\)/g, (p1) => {
          if (parseFloat(p1) === 0) {
            return '90';
          } else {
            return `Math.acos(${p1})`;
          }
        })
        .replace(/tan-1/g, 'Math.atan')
        .replace(/\^/g, '**')
        .replace(/\·/g, '.')
        .replace(/fact\(\s*(\d+(\.\d+)?)\s*\)/g, (_, p1) =>
          this.#factorial(p1).toString()
        )
        .replace(
          /(\w+\.\w+\(\d+\))\s*√\s*(\d+)|(\d+)\s*√\s*(\d+)/g,
          (match, p1, p2, p3, p4) => {
            if (p1 && p2) {
              // If matched pattern is <function>(<argument>)√<number>
              return `Math.pow(${p2}, 1/${p1})`;
            } else if (p3 && p4) {
              // If matched pattern is <number>√<number>
              return `Math.pow(${p4}, 1/${p3})`;
            }
            return match; // Return unchanged if no match
          }
        )
        .replace(/negate\((\-?\d+\.?\d*)\)/g, '-$1');
      return eval(_updateTx);
    } catch (error) {
      return 'Error' + error;
    }
  }
}

const calulator = new Calculator();
