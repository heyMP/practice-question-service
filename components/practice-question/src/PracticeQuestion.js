import { html, css, LitElement } from 'lit-element';

export class PracticeQuestion extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--practice-question-text-color, #000);
      }

      [part="label"] {
        display: block;
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      counter: { type: Number },
    };
  }

  constructor() {
    super();
    this.title = 'Hey there';
    this.counter = 5;
  }

  submit() {
    const values = this.constructor.collectFormValues(this.shadowRoot)
    // @todo find es6 way of doing this
    const arrayToObject = (arr, keyField, valueField) => Object.assign({}, ...arr.map(item => ({[item[keyField]]: item[valueField]})))
    const variables = arrayToObject(values, "name", "value");
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
      .then(res => console.log(res.data));
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
    `;
  }
}
