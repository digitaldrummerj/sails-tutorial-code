/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var EmailAddresses = require('machinepack-emailaddresses');
var Passwords = require('machinepack-passwords');

module.exports = {
  create: function createFn(req, res) {
    var email = req.param('email');

    // validate the email address that is passed in
    EmailAddresses.validate({
      string: email,
    }).exec({
      // called if there is a general error
      error: function (err) {
        return res.serverError(err);
      },

      // called if email is invalid
      invalid: function () {
        return res.badRequest('Does not look like an email address to me!');
      },

      // called if the email validation passed
      success: function () {
        // encrypt the password
        // get password from the body of the request with the req.param call
        Passwords.encryptPassword({
          password: req.param('password'),
        }).exec({
          // if there is an error return a server error 500 status code
          error: function (err) {
            return res.serverError(err);
          },

          // if success then move on to the next step
          success: function (result) {
            // create user with email and encryptedPassword to add to the database
            var user = {
              email: email,
              encryptedPassword: result
            };

            // User waterline to create a new user by calling .create and passing in the local user variable
            User.create(user, function (err, createdResult) {
              // check for errors
              if (err) {
                if (err.invalidAttributes
                  && err.invalidAttributes.email
                  && err.invalidAttributes.email[0]
                  && err.invalidAttributes.email[0].rule === 'unique') {
                  return res.alreadyInUse(err);
                }

                return res.serverError(err);
              }
              // add user id to session state
              req.session.user = createdResult.id;

              // return back created user with a status code of 200
              // see api\responses\ok.js for what the ok response is actually doing
              return res.ok(createdResult);
            });
          }
        })
      }
    });
  },
  login: function loginFn(req, res) {
    User.findOne(
      {
        email: req.param('email')
      },
      function (err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        Passwords.checkPassword({
          passwordAttempt: req.param('password'),
          encryptedPassword: result.encryptedPassword
        }).exec({
          error: function (err) {
            return res.serverError(err);
          },

          incorrect: function () {
            return res.forbidden('Invalid Login, Please Try Again!');
          },

          success: function () {
            req.session.user = result.id;

            return res.ok(result);
          }
        })
      }
    )
  },
  logout: function logoutFn(req, res) {
    req.session.user = null;

    return res.ok();
  },
  userIdentity: function (req, res) {
    User.findOne(
      { id: req.session.user },
      function (err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        return res.ok(result);
      }
    );
  },
  find: function findFn(req, res) {
    User.find(
      { id: req.session.user },
      function (err, results) {
        if (err) return res.serverError(err);
        if (results.length === 0) return res.notFound();
        return res.ok(results);
      }
    );
  },
  findOne: function findOneFn(req, res) {
    User.findOne(
      { id: req.session.user },
      function (err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        return res.ok(result);
      }
    );
  },
  update: function updatefn(req, res) {
    EmailAddresses.validate({
      string: req.param('email'),
    }).exec({
      error: function (err) {
        return res.serverError(err);
      },

      invalid: function () {
        return res.badRequest('Does not look like an email address to me!');
      },

      success: function () {
        Passwords.encryptPassword({
          password: req.param('password'),
        }).exec({
          error: function (err) {
            return res.serverError(err);
          },

          success: function (result) {
            var user = {
              email: req.param('email'),
              encryptedPassword: result,
            }
            User.update(
              { id: req.session.user },
              user,
              function (err, result) {
                if (err) return res.serverError(err);
                if (results.length === 0) return res.notFound();

                return res.ok(result);
              }
            );
          },
        });
      },
    });
  },
  delete: function deleteFn(req, res) {
    User.delete(
      {
        id: req.session.user
      }
    ), function (err, result) {
      if (err) return res.serverError(err);
      if (!result) return res.notFound();

      req.session.user = null;

      return res.ok(result);
    }
  },
};

