const fetch = require("node-fetch")

module.exports = function (app) {
  const HASURA_OPERATION = `
mutation createQuestion($question: String!, $answer: String!, $note: String = "", $tags: String = "") {
  insert_questions_one(object: {question: $question, answer: $answer, note: $note, tags: $tags}) {
    id
  }
}
`;

// execute the parent operation in Hasura
const execute = async (variables, headers) => {
  const fetchResponse = await fetch(
    "http://host.docker.internal:8080/v1/graphql",
    {
      headers,
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};
  

// Request Handler
app.post('/createQuestion', async (req, res) => {

  // get request input
  const { question, answer, note, tags } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ question, answer, note, tags }, req.body.session_variables);

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.insert_questions_one
  })

});
}