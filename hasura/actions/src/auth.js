module.exports = function (app) {
  app.get("/auth", async (req, res) => {
    // success just forward headers
    return res.json({
      'x-hasura-role': req.get('x-hasura-role'),
      'x-hasura-user-id': req.get('x-hasura-user-id'),
      'x-hasura-admin-secret': req.get('x-hasura-admin-secret')
    });
  });
};
