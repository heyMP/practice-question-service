import { html, css, LitElement } from 'lit-element';
import { executeCreateQuestion } from "../lib/queries.js";

export class PracticeQuestion extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--practice-question-text-color, #000);
        position: relative;
        overflow: hidden;
      }

      :host([__state="submitting"]) [part="dialog"],
      :host([__state="successful_submission"]) [part="dialog"],
      :host([__state="error_submitting"]) [part="dialog"],
      :host([__state="service_unavailable"]) [part="dialog"] {
        transform: scale(1);
      }

      [part="dialog"] {
        display: block;
        transform: scale(0);
        transition: all .3s;
      }

      [part="label"] {
        display: block;
      }

      [part="fields"] {
        width: 100%;
      }

      textarea:invalid:not(:placeholder-shown) {
        border: 1px solid red;
      }

      textarea:valid:not(:placeholder-shown) {
        border: 1px solid green;
      }

      /* @todo turn this into a part */
      textarea {
        width: 100%;
      }

      [__state="submitting"] {
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      counter: { type: Number },
      __state: { type: String, reflect: true },
      __dialogText: { type: String },
      __errors: { type: Array }
    };
  }

  constructor() {
    super();
    this.title = 'Hey there';
    this.counter = 5;
    this.__formValue;
    this.__state = "ready";
    this.__dialogText = "";
    this.__errors = [];
  }

  connectedCallback() {
    super.connectedCallback();
    // if the web component wasn't explicitly set to un
    // then ping the service
    if (this.__state !== "service_unavailable") {
      this.pingService();
    }

    this.shadowRoot.addEventListener("focusin", this.__focusinHandler.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener("focusin", this.__focusinHandler.bind(this));
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, name) => {
      if (name === "__state") {
        // Notify other elements that the state has changed
        this.__dispatchEvent("practice-question-changed", { detail: { state: this.__state }})

        switch (this.__state) {
          case "ready":
            break;

          case "submitting":
            this.__dialogText = "Saving Question ⚙"
            break;

          case "error_submitting":
            this.__dialogText = "Oh no, something went wrong! 😿"
            break;

          case "successful_submission":
            this.__dialogText = "Question Saved ✅"
            setTimeout(() => {
              this.__state = "ready";
              this.__clearFormValues();
            }, 2000)
            break;

          case "service_unavailable":
            this.__dialogText = "Service Unavailable 🔌"
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

  submit(event) {
    // prevent the default form submission
    event.preventDefault();
    event.stopPropagation();
    this.__state = "submitting";
    // get an array of form values
    const values = this.constructor.collectFormValues(this.shadowRoot)
    // convert the array into an object
    let variables = {}
    for (let value of values) {
      variables[value.name] = value.value;
    }
    const { answer, note, question } = variables;
    executeCreateQuestion(answer, note, question)
      .then(res => {
        if (res.errors) {
          this.__state = "error_submitting"
          // find a good error message for user.
          this.__errors = res.errors.map(error => {
            const message = error.message
            if (message.includes("answer_check_empty_string")) {
              return {
                id: "answer_check_empty_string",
                message: "Answer field is required"
              }
            }
            else if (message.includes("question_check_empty_string")) {
              return {
                id: "question_check_empty_string",
                message: "Question field is required"
              }
            }
            return error
          })
        }
        else {
          this.__state = "successful_submission"
        }
      })
      .catch(res => {
        this.__state = "error_submitting"
      })
  }

  __clearFormValues() {
    const formItems = this.shadowRoot.querySelectorAll('[name]');
    formItems.forEach(element => {
      element.value = ""
      // also make sure there are default placeholders for error validation
      if (element.hasAttribute("required")) {
        const placeholder = element.getAttribute("placeholder");
        let setPlaceholder = true;
        if (placeholder) {
          if (placeholder !== "" || placeholder !== " ") {
            setPlaceholder = false
          }
        }
        if (setPlaceholder) {
          element.setAttribute("placeholder", " ");
        }
      }
    });
  }

  /**
   * Collect all values of a form
   * @param {DOM Node} element 
   * @return {object}
   *  - value
   *  - name
   */
  static collectFormValues(element) {
    const formItems = element.querySelectorAll('[name]');
    const values = [...formItems].map(i => ({ name: i.name, value: i.value }));
    return values;
  }

  pingService() {
    fetch("http://localhost:8080/v1/graphql", {
      method: "OPTIONS",
      headers: { "Content-Type": "application/json" }
    })
      .catch(() => this.__state = "service_unavailable")
      .finally(() => this.__state = "ready")
  }

  // Add the dirty form field validation trick where
  // we use an empty placeholder to tell if the form
  // has been touched.
  // https://css-tricks.com/form-validation-ux-html-css/
  __focusinHandler(e) {
    if (e.target.hasAttribute("placeholder")) {
      e.target.removeAttribute("placeholder");
    }
  }

  render() {
    return html`
    <form @submit=${this.submit}>
      <div part="field">
        <label part="label" for="question">question</label>
        <textarea id="question" name="question" part="question" .disabled=${this.__state !== "ready"} required placeholder=" "></textarea>
      </div>
      
      <div part="field">
        <label part="label" for="answer">answer</label>
        <textarea id="answer" name="answer" part="answer" .disabled=${this.__state !== "ready"} required placeholder=" "></textarea>
      </div>

      <div part="field">
        <label part="label" for="note">note</label>
        <textarea id="note" name="note" part="note" .disabled=${this.__state !== "ready"}></textarea>
      </div>

      <input type="submit" value="Submit" part="button">
    </form>

      <div part="dialog">
        ${this.__dialogText ? html`
          <div part="dialog-text">${this.__dialogText}</div>
        ` : ''}
        ${this.__errors ? html`
          ${this.__errors.map(error => html`
            <div part="error">${error.message}</div>
          `)}
        ` : ""}
      </div>
    `;
  }
}
