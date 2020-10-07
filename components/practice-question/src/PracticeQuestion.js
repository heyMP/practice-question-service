import { html, css, LitElement } from 'lit-element';

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
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        transition: all .3s;
      }

      [part="label"] {
        display: block;
      }

      [part="fields"] {
        width: 100%;
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
    };
  }

  constructor() {
    super();
    this.title = 'Hey there';
    this.counter = 5;
    this.__formValue;
    this.__state = "ready";
    this.__dialogText = "";
  }

  connectedCallback() {
    super.connectedCallback();
    // if the web component wasn't explicitly set to un
    // then ping the service
    if (this.__state !== "service_unavailable") {
      this.pingService();
    }
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, name) => {
      if (name === "__state") {
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

  submit() {
    this.__state = "submitting";
    // get an array of form values
    const values = this.constructor.collectFormValues(this.shadowRoot)
    // convert the array into an object
    let variables = {}
    for (let value of values) {
      variables[value.name] = value.value;
    }
    fetch("http://localhost:8080/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation CreateQuestion($question: String, $answer: String, $note: String) {
            insert_question(objects: {answer: $answer, question: $question, note: $note}) {
              returning {
                id
              }
            }
          }
        `,
        variables
      })
    })
      .then(res => res.json())
      .then(res => {
        this.__state = "successful_submission"
      })
      .catch(res => {
        this.__state = "error_submission"
      })
  }

  __clearFormValues() {
    const formItems = this.shadowRoot.querySelectorAll('[name]');
    formItems.forEach(element => {
      element.value = ""
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

  render() {
    return html`
      <div part="field">
        <label part="label" for="question">question</label>
        <textarea id="question" name="question" part="question"></textarea>
      </div>
      
      <div part="field">
        <label part="label" for="answer">answer</label>
        <textarea id="answer" name="answer" part="answer"></textarea>
      </div>

      <div part="field">
        <label part="label" for="note">note</label>
        <textarea id="note" name="note" part="note"></textarea>
      </div>

      <button part="button" @click="${this.submit}">Submit</button>

      <div part="dialog">${this.__dialogText}</div>
    `;
  }
}
