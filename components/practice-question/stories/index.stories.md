```js script
import { html } from '@open-wc/demoing-storybook';
import '../practice-question.js';

export default {
  title: 'PracticeQuestion',
  component: 'practice-question',
  options: { selectedPanel: "storybookjs/knobs/panel" },
};
```

# PracticeQuestion

A component for...

## Features:

- a
- b
- ...

## How to use

### Installation

```bash
yarn add practice-question
```

```js
import 'practice-question/practice-question.js';
```

```js preview-story
export const Simple = () => html`
  <practice-question></practice-question>
`;
```

## Variations

###### Custom Title

```js preview-story
export const CustomTitle = () => html`
  <practice-question title="Hello World"></practice-question>
`;
```
