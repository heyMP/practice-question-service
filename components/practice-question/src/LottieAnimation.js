import { html, css, LitElement } from 'lit-element';

export class LottieAnimation extends LitElement {
  static get properties() {
    return {
      path: { type: String },
      loop: { type: Boolean },
      autoplay: { type: Boolean },
      animationSpeed: { type: Number, attribute: "animation-speed" },
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        overflow: hidden;
        width: 100px;
        height: 100px;
      }
    `;
  }

  constructor() {
    super();
    this.path = null;
    this.animation = null;
    this.loop = false;
    this.autoplay = false;
    this.animationSpeed = 2;
    this.animation = null;
    this.__registerLottie();
  }

  /**
   * Load lottie from the cdn and register the object
   * to this.__lottie
   */

  updated(changedProperties) {
    changedProperties.forEach((oldValue, name) => {
      if (["path"].includes(name)) {
        this.__loadAnimation();
      }
    });
  }

  __registerLottie() {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.7.3/lottie.min.js";
    script.addEventListener("load", (e) => {
      this.__lottie = window.bodymovin;
      this.__loadAnimation();
    })
    document.head.appendChild(script);
  }

  __loadAnimation() {
    if (this.path && typeof this.__lottie !== "undefined") {
      this.innerHTML = "";
      this.animation = this.__lottie.loadAnimation({
        container: this, // Required
        path: this.path, // Required
        renderer: 'svg', // Required
        loop: this.loop, // Optional
        autoplay: this.autoplay, // Optional
        rendererSettings: {
          preserveAspectRatio: "none"
        }
      });
      this.animation.setSpeed(this.animationSpeed);
    }
  }

  /**
   * Turn off createRenderRoot
   * We use this method so that __loadAnimation
   * function can be responsible for what when the lightdom
   * gets wiped.
   */
  createRenderRoot() {
    return this;
  }
}
