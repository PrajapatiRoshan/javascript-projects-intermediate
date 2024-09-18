const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: [],
    inputs: null,
  },

  eventHandlers: {
    oninput: null,
    onclose: null,
  },

  properties: {
    value: '',
    capsLock: false,
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    // Setup main elements
    this.elements.main.classList.add('keyboard', 'keyboard--hidden');
    this.elements.keysContainer.classList.add('keyboard__keys');
    this.elements.keysContainer.appendChild(this._createKeys());

    //select all keys
    this.elements.keys = this.elements.keysContainer.querySelectorAll('.keyboard__key');

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    // Select all input field
    this.elements.inputs = document.querySelectorAll('.use-keyboard-input');

    // Automatically use keyboard for elements with .use-keyboard-input
    this.elements.inputs.forEach((element) => {
      element.addEventListener('focus', () => {
        this.open(element.value, (currentValue) => {
          element.value = currentValue;
        });
      });
    });
  },

  /**
   * Creates markup for an icon
   * @param {icon_name} icon_name icon name
   * @returns icon markup
   */
  createIconHTML(icon_name) {
    return `<i class="material-icons">${icon_name}</i>`;
  },

  /**
   * validate alphabets
   * @returns boolean
   */
  checkAlphabets() {
    return /^[a-zA-Z\s]+$/.test(str);
  },

  /**
   * @returns Wrapper of all keys
   */
  _createKeys() {
    const fragment = document.createDocumentFragment();
    const keyLayout = [
      '`',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
      '-',
      '=',
      'backspace',
      'q',
      'w',
      'e',
      'r',
      't',
      'y',
      'u',
      'i',
      'o',
      'p',
      '[',
      ']',
      '\\',
      'caps',
      'a',
      's',
      'd',
      'f',
      'g',
      'h',
      'j',
      'k',
      'l',
      ';',
      "'",
      'enter',
      'close',
      'z',
      'x',
      'c',
      'v',
      'b',
      'n',
      'm',
      ',',
      '.',
      '/',
      'space',
    ];

    keyLayout.forEach((key) => {
      const keyElement = document.createElement('button');
      const insertLineBreak = ['backspace', '\\', 'enter', '/'].indexOf(key) !== -1;

      // Add attributes/classes
      keyElement.setAttribute('type', 'button');
      keyElement.classList.add('keyboard__key');

      switch (key) {
        case 'backspace':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = this.createIconHTML('backspace');
          keyElement.addEventListener('click', () => {
            this.properties.value = this.properties.value.substring(
              0,
              this.properties.value.length - 1
            );
            this._triggerEvent('oninput');
          });
          break;
        case 'caps':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable');
          keyElement.innerHTML = this.createIconHTML('keyboard_capslock');
          keyElement.addEventListener('click', () => {
            this._toggleCapsLock();
            keyElement.classList.toggle(
              'keyboard__key--active',
              this.properties.capsLock
            );
          });
          break;
        case 'enter':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = this.createIconHTML('keyboard_return');
          keyElement.addEventListener('click', () => {
            this.properties.value += '\n';
            this._triggerEvent('oninput');
          });
          break;
        case 'space':
          keyElement.classList.add('keyboard__key--extra-wide');
          keyElement.innerHTML = this.createIconHTML('space_bar');
          keyElement.addEventListener('click', () => {
            this.properties.value += ' ';
            this._triggerEvent('oninput');
          });
          break;
        case 'close':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
          keyElement.innerHTML = this.createIconHTML(key);
          keyElement.addEventListener('click', () => {
            this.close();
            this._triggerEvent('onclose');
          });
          break;
        default:
          keyElement.textContent = key.toLowerCase();
          keyElement.addEventListener('click', () => {
            this.properties.value += this.properties.capsLock
              ? key.toUpperCase()
              : key.toLowerCase();
            this._triggerEvent('oninput');
          });
          break;
      }
      fragment.appendChild(keyElement);
      if (insertLineBreak) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    return fragment;
  },

  /**
   * store keyboard state
   */
  _triggerEvent(handlerName) {
    if (typeof this.eventHandlers[handlerName] == 'function') {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  /**
   * Toogle the keyboard characters based on caps lock
   */
  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;
    for (const key of this.elements.keys) {
      // check key is container character not icons
      if (key.childElementCount === 0) {
        key.textContent = this.properties.capsLock
          ? key.textContent.toUpperCase()
          : key.textContent.toLowerCase();
      }
    }
  },

  /**
   * Open keyboard
   */
  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove('keyboard--hidden');
  },

  /**
   * Close keyboard
   */
  close() {
    this.properties.value = '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.add('keyboard--hidden');
  },
};

Keyboard.init();
