/**
 * TodoController
 *
 * @description :: Server-side logic for managing todoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  create: function createFn(req, res) {
    var todo = {
      item: req.param('item'),
      user: req.session.user
    };

    Todo.create(todo, function (err, results) {
      if (err) res.serverError(err);

      return res.ok(results);
    });
  },
  find: function findFn(req, res) {
    Todo.find(
      {
        user: req.session.user
      }
    )
      .populate('user')
      .exec(function (err, results) {
        if (err) return res.serverError(err);
        if (results.length === 0) return res.notFound();

        return res.ok(results);
      });
  },
  update: function (req, res) {
    var record = {
      id: req.param('id'),
      completed: req.param('completed'),
      user: req.session.user
    };

    Todo.update(
      {
        user: req.session.user,
        id: req.param('id')
      },
      record,
      function (err, results) {
        if (err) res.serverError(err);
        if (results.length === 0) return res.notFound();

        return res.ok(results);
      }
    );
  },
  delete: function (req, res) {
    Todo.delete(
      {
        user: req.session.user,
        id: req.param('id'),
      },
      function (err, results) {
        if (err) res.serverError(err);
        if (!results) return res.notFound();
        return res.ok(results);
      }
    );
  },
};

