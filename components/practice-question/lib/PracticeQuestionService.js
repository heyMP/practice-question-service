/*
This is an example snippet - you should consider tailoring it
to your service.
*/

export class PracticeQuestionService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  fetchGraphQL(operationName, variables) {
    return fetch(
      this.endpoint,
      {
        method: 'POST',
        headers: {
          'X-Hasura-User-Id': 'cf2a31e4-21e8-4272-8c1f-a06d875d7e71',
          'X-Hasura-Role': 'user',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: this.operationsDoc,
          variables,
          operationName,
        }),
      }
    ).then(res => res.json());
  }

  operationsDoc = `
  query getQuestions {
    questions {
      question
      updated_at
      user_id
      note
      id
      created_at
      answer
    }
  }
  
  query getQuestion($id: Int!) {
    questions(where: {id: {_eq: $id}}) {
      question
      updated_at
      user_id
      note
      id
      created_at
      answer
    }
  }

  mutation createQuestion($question: String!, $answer: String!, $note: String = "", $tags: String = "") {
    insert_questions_one(object: {question: $question, answer: $answer, note: $note, tags: $tags}) {
      id
    }
  }
`;

  fetchGetQuestions() {
    return this.fetchGraphQL('getQuestions', {});
  }

  fetchGetQuestion(id) {
    return this.fetchGraphQL('getQuestion', { id: id });
  }

  createQuestion(answer, note, question) {
    return this.fetchGraphQL('createQuestion', {
      answer: answer,
      note: note,
      question: question,
    });
  }

  ping() {
    return fetch(this.endpoint, {
      method: "OPTIONS",
      headers: { "Content-Type": "application/json" }
    });
  }
}
