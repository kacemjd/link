var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var crypto = require("crypto");
var validator = require("email-validator");
var users = require("../models/userSchema").users;
var messages = require("../models/messageSchema").messages;
const validatePhoneNumber = require("validate-phone-number-node-js");

const KEY = "m yincredibl y(!!1!11!)<'SECRET>)Key'!";

module.exports.connectDB = function () {
  //Set up default mongoose connection

  mongoose.set("useCreateIndex", true);
  var mongoDB = "mongodb+srv://baptistesx:Mydatabase@cluster0-5lcx3.mongodb.net/linkproject";
//  var mongoDB = "mongodb://localhost:27017/linkproject";

  mongoose.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  //Get the default connection
  var db = mongoose.connection;

  //Bind connection to error event (to get notification of connection errors)
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
};

module.exports.checkJWT = function (str, KEY) {
  return jwt.verify(str, KEY, { algorithm: "HS256" }).email;
};

function encPassword(pwd, callback) {
  callback(crypto.createHash("sha256").update(pwd).digest("hex"));
}

module.exports.addUser = function (email, pwd, name, phone, callback) {
  if (validator.validate(email)) {
    if (validatePhoneNumber.validate(phone)) {
      encPassword(pwd, function (encPwd) {
        if (encPwd != null) {
          users.find({ email: email }, function (err, user) {
            if (err) {
              return handleError(err);
            }
            if (user.length != 0) {
              console.error("Email already user: " + email);
              callback(409, { response: "Email already used" });
            } else {
              var newUser = new users({
                name: name,
                email: email,
                pwd: encPwd,
                location: {
                  type: "Point",
                  coordinates: [45.2, 45.2],
                },
                perimeter: 1000,
                phone: phone,
              });

              newUser.save(function (err, user) {
                if (err) {
                  return handleError(err);
                }
                console.log(user + " saved to users collection.");
              });
              callback(201, { response: "User created with success!" });
            }
          });
        } else {
          console.error("Error while encrypting the password");
          callback(500, { response: "Error while encrypting the password" });
        }
      });
    } else {
      console.error("Bad phone format, can't create user " + email);
      callback(409, { response: "Bad phone format" });
    }
  } else {
    console.error("Bad email format, can't create user " + email);
    callback(409, { response: "Bad email format" });
  }
};

module.exports.logUser = function (email, pwd, callback) {
  console.log(email + pwd);
  encPassword(pwd, function (encPwd) {
    users.find(
      {
        email: email,
        pwd: encPwd,
      },
      function (err, user) {
        if (user.length != 0) {
          var payload = { email: email };

          var token = jwt.sign(payload, KEY, {
            algorithm: "HS256",
            expiresIn: "15d",
          });
          console.log(token);
          console.log(email + "Success connection");
          callback(200, { response: token });
        } else {
          console.log("There's no user matching email/password");
          callback(401, {
            response: "There's no user matching email/password",
          });
        }
      }
    );
  });
};

module.exports.updateUserInfos = function (
  email,
  newUsername,
  newPhone,
  oldPwd,
  newPwd,
  newPerimeter,
  callback
) {
  users.findOne({ email: email }, function (err, userToUpdate) {
    var error = 0;
    if (newUsername != "") {
      userToUpdate.name = newUsername;
    }
    if (newPhone != "" && validatePhoneNumber.validate(newPhone)) {
      userToUpdate.phone = newPhone;
    }
    if (newPwd != "") {
      encPassword(oldPwd, function (oldPwdenc) {
        if (oldPwdenc != null) {
          if (oldPwdenc == userToUpdate.pwd) {
            encPassword(newPwd, function (encPwd) {
              if (encPwd != null) {
                userToUpdate.pwd = encPwd;
              }
            });
          } else {
            error = 1;
            callback(401, {
              response: "Wrong old password",
            });
          }
        }
      });
    }
    if (newPerimeter != "") {
      userToUpdate.perimeter = newPerimeter;
    }
    if (error == 0) {
      userToUpdate.save();
      callback(200, {
        response: "User well updated",
      });
    }
  });
};

module.exports.updateLocation = function (email, location, callback) {
  var i = 0;

  users.findOne({ email: email }, function (err, userToUpdate) {
    userToUpdate.location.coordinates = location;
    userToUpdate.save();
    callback(200, {
      response: "User well updated",
    });
  });
};

module.exports.sendMessage = function (email, message, photo, callback) {
  users.findOne({ email: email }, function (err, user) {
    var now = new Date();
    console.log("now: " + now);
    var expire = new Date();
    expire.setMinutes(expire.getMinutes() + 2);

    var msg = new messages({
      body: message,
      photo: photo,
      author: user._id,
      location: user.location,
      creation: now,
      expiration: expire, //To change
    });
    msg.save();
    user.messages.push(msg._id);
    user.save();
    callback(201, {
      response: "Message well sent",
    });
  });
};

module.exports.getUserInfos = function (email, callback) {
  users.findOne({ email: email }, function (err, user) {
    var perimeter = user.perimeter;
    console.log(user.perimeter);
    var name = user.name;
    var phone = user.phone;
    var email = user.email;
    var infos = {
      name: name,
      email: email,
      phone: phone,
      perimeter: perimeter,
    };
    console.log("%j", infos);
    callback(200, { response: infos });
  });
};

module.exports.getMessages = function (email, callback) {
  var expiration = false;
  users.findOne({ email: email }, function (err, user) {
    var perimeter = user.perimeter;
    var long = user.location.coordinates[0];
    var lat = user.location.coordinates[1];
    messages
      .find(
        {
          location: {
            $near: {
              $maxDistance: perimeter,
              $geometry: {
                type: "Point",
                coordinates: [long, lat],
              },
            },
          },
        },
        null,
        { sort: { creation: -1 } },
        function (err, messagesList) {
          if (messagesList != null) {
            var listToSend = [];
            messagesList.forEach(function (message) {
              console.log(message.author.phone);
              if (message.expiration < Date.now()) {
                console.log(message.body);
                console.log("message expiré");
                console.log(message._id);
                messages.findByIdAndRemove(message._id, function (err, offer) {
                  if (err) {
                    throw err;
                  }
                  console.log("well removed");
                  expiration = true;
                });
              } else {
                listToSend.push({
                  body: message.body,
                  photo: message.photo,
                  author: message.author.name,
                  authorPhone: message.author.phone,
                  creation: message.creation,
                  coordinates: message.location.coordinates,
                });
              }
            });
            callback(200, {
              response: listToSend,
              someMessagesExpired: expiration,
            });
          }
        }
      )
      .populate("author", ["name", "phone"]);
  });
};
