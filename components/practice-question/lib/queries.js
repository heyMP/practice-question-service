/*
This is an example snippet - you should consider tailoring it
to your service.
*/

function fetchGraphQL(operationsDoc, operationName, variables) {
  return fetch(
    "http://localhost:8080/v1/graphql",
    {
      method: "POST",
      headers: {
        "Authorization": "cf2a31e4-21e8-4272-8c1f-a06d875d7e71",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  ).then(res => res.json());
}

const operationsDoc = `
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

  mutation createQuestion($answer: String = "", $note: String = "", $question: String = "") {
    insert_questions(objects: {note: $note, question: $question, answer: $answer}) {
      affected_rows
    }
  }
`;

export const fetchGetQuestions = () => {
  return fetchGraphQL(
    operationsDoc,
    "getQuestions",
    {}
  );
}

export const fetchGetQuestion = (id) => {
  return fetchGraphQL(
    operationsDoc,
    "getQuestion",
    {"id": id}
  );
}

export const executeCreateQuestion = (answer, note, question) => {
  return fetchGraphQL(
    operationsDoc,
    "createQuestion",
    {"answer": answer, "note": note, "question": question}
  );
}