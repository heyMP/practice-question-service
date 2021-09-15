import { html, css, LitElement } from 'lit-element';
import "../lottie-animation.js";  
import { LottieAnimation } from './LottieAnimation.js';

export class NotePad extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--notepad--font-family, apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
        overflow: hidden;
        position: relative;
      }

      [part='container'] {
        background-image: repeating-linear-gradient(var(--note-pad--linear-gradient, #fff,#fff 24px,#e6e7e8 25px));
        padding: var(--note-pad--container--padding, 0 25px 25px);
        border: var(--note-pad--container--border, 1px solid #e6e7e8);
        border-bottom-left-radius: var(--note-pad--container--bottom-left-radius, 25px);
        border-bottom-right-radius: var(--note-pad--container--bottom-right-radius, 25px);
      }

      [part='header'] {
        display: var(--note-pad--header--display, flex);
        align-items: var(--note-pad--header--align-items, center);
        background-color: var(--note-pad--header--background-color, #61a7c2);
        padding: var(--note-pad--header--padding, 15px);
      }

      [part='header'] *,
      [part='header'] ::slotted(*) {
        color: var(--note-pad--header--h1--font-color, #fff);
        font-size: var(--note-pad--header--h1--font-size, 24px);
        font-weight: var(--note-pad--header--h1--font-weight, 400);
        text-transform: var(--note-pad--header--h1--text-transform, uppercase);
        letter-spacing: var(--note-pad--header--h1--letter-spacing, 4px);
      }

      [part='header-icon'] {
        padding: var(--note-pad--header-icon--padding, 0 25px 0 20px);
      }

      [part='content'] ::slotted() {
        display: none;
      }

      label {
        /* todo make accessible */
        display: none;
      }

      form {
        display: flex;
        flex-direction: column;
      }

      form > *:not(:first-child) {
        margin-top: 15px;
      }

      textarea {
        background-color: #e6e7e8;
        border-radius: 16px;
        padding: 10px;
        font-size: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-weight: 200;
        /* Conversion between XD and CSS */
        letter-spacing: calc(50em * 0.001);
        border: none;
        width: 100%;
        box-sizing: border-box;
        max-width: 100%;
      }

      textarea:focus {
        outline: none;
        border-left: 6px solid #61a7c2;
      }

      textarea::placeholder {
        color: #5A5B5E;
        font-weight: 400;
      }

      textarea#question {
        margin: 25px 0 0 0;
      }

      input[type='submit'] {
        border-radius: 16px;
        background: #61a7c2;
        border: none;
        color: white;
        font-size: 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-weight: 300;
        /* Conversion between XD and CSS */
        letter-spacing: calc(75em * 0.001);
        padding: 15px 25px;
        text-transform: uppercase;
        flex: none;
        align-self: flex-end;
      }

      [part*="dialog"] {
        position: absolute;
        top: 50%;
        left: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80%;
        height: 50%;
        max-width: 400px;
        border-radius: 16px;
        transform: scale(0) translate(-50%, -50%);
        transform-origin: top left;
        transition: all .3s ease;
        padding: 10px;
        font-family: var(--notepad--font-family, apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
        font-size: var(--note-pad--dialog--font-size, 22px);
        background-color: var(--note-pad--dialog--background-color, #61a7c2);
        color: var(--note-pad--dialog--color, #fff);
      }

      [part*="dialog opened"] {
        transform: scale(1) translate(-50%, -50%);
      }

      [part*="dialog"] svg {
        width: 100%;
        transform: translate3d(0px, 0px, 0px) scale(2);
      }
      
      [part*="dialog opened"] svg {
        transform: translate3d(0px, 0px, 0px) scale(2);
      }
    `;
  }

  static get properties() {
    return {
      dialogState: { type: String },
    };
  }

  constructor() {
    super();
    this.dialogState = "closed"
  }

  openDialog() {
    this.dialogState = "opened"
  }

  closeDialog() {
    this.dialogState = "closed"
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, name) => {
      if (name === "dialogState") {
    // Notify other elements that the dialogOpen has changed
      this.__dispatchEvent("dialog-state-changed", { detail: { state: this.dialogState }})
      const lottieElement = this.shadowRoot.querySelector(`[part*="dialog"] lottie-animation`)
      const svg = lottieElement.querySelector('svg')
      // stop the animation initially
      if (lottieElement.animation) {
        lottieElement.animation.stop();
      }
      switch (this.dialogState) {
        case "closed":
          if (lottieElement.animation) {
            lottieElement.animation.goToAndPlay(1250);
          }
          break;

        case "opened":
          if (lottieElement.animation) {
            console.log('play')
            lottieElement.animation.play();

            /**
             * @todo this needs cleared out when the state changes.
             */
            setTimeout(() => {
              lottieElement.animation.pause();
            }, 1000);
          }
          break;


          default: 
            break;
        }
      }
    })
  }

  __dispatchEvent(name, options = {}) {
    const defaultOptions = {
      bubbles: true,
      composed: true
    }
    this.dispatchEvent(new CustomEvent(name, Object.assign({}, defaultOptions, options)))
  }


  firstUpdated() {
    // Start listening to slot changes to transpose content slot changes
    this.shadowRoot
      .querySelector('#content-holding-pen slot')
      .addEventListener('slotchange', this.contentSlotChanged.bind(this));
    // Start listening to slot changes to transpose content slot changes
    this.shadowRoot
      .querySelector('[part*="dialog"] slot')
      .addEventListener('slotchange', this.dialogSlotChanged.bind(this));
  }

  disconnectedCallback() {
    this.shadowRoot
      .querySelector('#content-holding-pen slot')
      .removeEventListener('slotchange', this.contentSlotChanged.bind(this));
    this.shadowRoot
      .querySelector('[part*="dialog"] slot')
      .removeEventListener('slotchange', this.dialogSlotChanged.bind(this));
  }

  /**
   * Transpose default slot to content area in shadowRoot.
   */
  contentSlotChanged(e) {
    // Get a list of all the immediate children in the light dom that do not have a named slot attribute
    clearTimeout(this.__transposeContentRegion);
    this.__transposeContentRegion = setTimeout(() => {
      const contentSlotChildren = [...this.children].filter(
        element => !element.hasAttribute('slot')
      );
      for (let element of contentSlotChildren) {
        this.shadowRoot.querySelector("[part='content']").innerHTML = '';
        this.shadowRoot.querySelector("[part='content']").appendChild(element);
        const textAreaElements = this.shadowRoot.querySelectorAll(
          '[part="content"] textarea'
        );
        for (let textarea of textAreaElements) {
          this.unregisterTextAreaAutoExpand(textarea);
          this.registerTextAreaAutoExpand(textarea);
        }
      }
    }, 0);
  }

  /**
   * @todo this is bugged.  Keeps opening after submission.
   */
  dialogSlotChanged(event) {
    // // Get a list of all the immediate children in the light dom that do not have a named slot attribute
    // clearTimeout(this.__deriveDialogState);
    // this.__deriveDialogState = setTimeout(() => {
    //   const slotChildren = [...this.children];
    //   if (slotChildren.length > 0) {
    //     this.dialogState = "opened";
    //   }
    //   else {
    //     this.dialogState = "closed";
    //   }
    // }, 0);
  }

  registerTextAreaAutoExpand(element) {
    element.addEventListener('input', this.textAreaAutoResize.bind(this));
  }

  unregisterTextAreaAutoExpand(element) {
    element.removeEventListener('input', this.textAreaAutoResize.bind(this));
  }

  textAreaAutoResize(event) {
    const element = event.target;
    clearTimeout(element.textAreaAutoResize);
    element.textAreaAutoResize = setTimeout(() => {
      if (typeof element.defaultHeight === 'undefined') {
        const value = element.value;
        element.value = '';
        element.defaultHeight = element.scrollHeight;
        element.value = value;
      }
      // Resize height to 1px real quick.
      element.style.height = '1px';
      // resize the textarea based on scrollHeight
      if (element.scrollHeight > element.defaultHeight) {
        element.style.height = element.scrollHeight + 'px';
      } else {
        element.style.height = '';
      }
    }, 100);
  }

  render() {
    return html`
      <div part="header">
        <div part="header-icon">
          <svg fill="white" width="49" height="49" viewBox="0 0 24 24">
            <path
              d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1.25 17c0 .69-.559 1.25-1.25 1.25-.689 0-1.25-.56-1.25-1.25s.561-1.25 1.25-1.25c.691 0 1.25.56 1.25 1.25zm1.393-9.998c-.608-.616-1.515-.955-2.551-.955-2.18 0-3.59 1.55-3.59 3.95h2.011c0-1.486.829-2.013 1.538-2.013.634 0 1.307.421 1.364 1.226.062.847-.39 1.277-.962 1.821-1.412 1.343-1.438 1.993-1.432 3.468h2.005c-.013-.664.03-1.203.935-2.178.677-.73 1.519-1.638 1.536-3.022.011-.924-.284-1.719-.854-2.297z"
            />
          </svg>
        </div>
        <slot name="header"><h1>Test Question</h1></slot>
      </div>
      <div part="container">
        <div part="content"></div>
        <div part="footer"><slot name="footer"></slot></div>
        <div id="content-holding-pen" style="display: none;"><slot></slot></div>
      </div>

      <div part="dialog ${this.dialogState}">
        <slot name="dialog"></slot>
        <!-- <lottie-animation path="../assets/dialog.json"></lottie-animation> -->
      </div>
    `;
  }
}
