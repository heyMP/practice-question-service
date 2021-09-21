import { html, css, LitElement } from 'lit-element';
import { PracticeQuestionService } from "../lib/PracticeQuestionService.js";
import "../note-pad.js";

export class PracticeQuestion extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: var(--practice-question--padding, 25px);
        color: var(--practice-question--text-color, #000);
        position: relative;
        overflow: hidden;
      }

      [part="dialog"] {
        display: block;
        transform: scale(0);
        transition: all .3s;
      }

      :host([__state="submitting"]) [part="dialog"],
      :host([__state="successful_submission"]) [part="dialog"],
      :host([__state="error_submitting"]) [part="dialog"],
      :host([__state="service_unavailable"]) [part="dialog"] {
        transform: scale(1);
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
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      endpoint: { type: String },
      fields: { type: String},
      __state: { type: String, reflect: true },
      __dialogText: { type: String },
      __dialogState: { type: String },
      __errors: { type: Array }
    };
  }

  constructor() {
    super();
    this.title = 'Hey there';
    this.counter = 5;
    this.endpoint = "";
    this.fields = "question, answer, note";
    this.__formValue;
    this.__state = "ready";
    this.__dialogText = "";
    this.__dialogState = "closed";
    this.__errors = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.addEventListener("focusin", this.__focusinHandler.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener("focusin", this.__focusinHandler.bind(this));
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, name) => {
      // Cool new technique for computing multiple properties in a performant way.
      if (["endpoint", "__state"].includes(name)) {
        this.__practiceQuestionService = new PracticeQuestionService(this.endpoint);
        clearTimeout(this.__ping);
        this.__ping = setTimeout(() => {
          // if the web component wasn't explicitly set to un
          // then ping the service
          if (this.__state !== "service_unavailable") {
            this.__practiceQuestionService.ping(this.endpoint)
              .then(res => {
                console.log(res)
                if (res.status === 204) {
                  this.__state = "ready"
                }
                else {
                  this.__state = "service_unavailable"
                }
              })
              .catch(() => this.__state = "service_unavailable")
          }
        }, 0)
      }

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
            this.__dialogState = "opened";
            setTimeout(() => {
              this.__state = "ready";
              this.__clearFormValues();
              this.__dialogState = "closed";
              this.__dialogText = "";
            }, 2000)
            break;

          case "service_unavailable":
            this.__dialogText = "Service Unavailable 🔌"
            this.__dialogState = "opened";
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
    this.__form = event.path[0];
    // get an array of form values
    const values = this.constructor.collectFormValues(this.__form);
    // convert the array into an object
    let variables = {}
    for (let value of values) {
      variables[value.name] = value.value;
    }
    const { answer, note, question } = variables;
    this.__practiceQuestionService.createQuestion(answer, note, question)
      .then(res => {
        if (res.errors) {
          this.__state = "error_submitting"
          // find a good error message for user.
          this.__errors = res.errors.map(error => {
            const message = error.message
            if (message.includes("question_check_empty_string")) {
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
    const formItems = this.__form.querySelectorAll('[name]');
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
    <note-pad .dialogState=${this.__dialogState}>
      ${this.title ? html`<h1 slot="header">${this.title}</h1>`: ""}
      <form @submit=${this.submit}>
        <div part="field">
          <label part="label" for="question">question</label>
          <textarea id="question" name="question" part="question" rows="4" .disabled=${this.__state !== "ready"} required placeholder="Question"></textarea>
        </div>

        ${this.fields.includes('answer') ? html`
        <div part="field">
          <label part="label" for="answer">answer</label>
          <textarea id="answer" name="answer" part="answer" .disabled=${this.__state !== "ready"} placeholder="Answer"></textarea>
        </div>
        `: ''}

        ${this.fields.includes('note') ? html`
        <div part="field">
          <label part="label" for="note">note</label>
          <textarea id="note" name="note" part="note" placeholder="Note" .disabled=${this.__state !== "ready"}></textarea>
        </div>
        `: ''}


        <input type="submit" value="Submit" part="button">
      </form>

      ${(this.__dialogText || this.__errors.length > 0) ? html`
        <div slot="dialog">
          ${this.__dialogText ? html`
            <div part="dialog-text">${this.__dialogText}</div>
          ` : ''}
          ${this.__errors ? html`
            ${this.__errors.map(error => html`
              <div part="error">${error.message}</div>
            `)}
          ` : ""}
        </div>
      ` : ''}
    </note-pad>
    `;
  }
}
