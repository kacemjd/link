$(document).ready(function () {
  var storage = window.sessionStorage;

  var contactPhone = null;
  if (storage.getItem("contactPhone") != null) {
    contactPhone = storage.getItem("contactPhone").split(",");
  }

  var currentLocationData = storage.getItem("currentLocationData").split(",");
  var currentLocationLongitude = parseFloat(currentLocationData[0]);
  var currentLocationLatitude = parseFloat(currentLocationData[1]);
  var map = null;
  var circleLayer = null;

  var contactPosition;

  getUserInfo();
  getMessages();
  initClickListeners();

  var socket = io.connect("https://" + SERVER_IP + ":3000");

  socket.on("newMessageOnServer", function (msg) {
    getMessages();
  });
  socket.on("refreshMessagesList", function (list) {
    displayMessagesList(list);
  });

  //Fonction de retour à la page d'accueil
  function returnToMainPage() {
    getMessages();
    $("#addActivityPage").css("display", "none");
    $("#profilePage").css("display", "none");
    $("#mapPage").css("display", "none");
    $("#myImage").removeAttr("src");
    $("#myImage").css("display", "none");
    $("#myImage").css("z-index", "1");
    $("#mainPage").fadeIn();
    storage.setItem("myImage", "");
    var node = document.getElementById("map");
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  //Définition des fonctions

  function initClickListeners() {
    $("#addActivityButton").click(function () {
      $("#mainPage").css("display", "none");
      $("#myImage").css("display", "none");
      $("#myImage").css("z-index", "1");
      $("#addActivityPage").fadeIn();
      storage.setItem("myImage", "");
    });

    $("#map_link").click(function () {
      $("#mainPage").css("display", "none");
      $("#mapPage").fadeIn();
      displayMap();
    });

    $("#profile_link").click(function () {
      $("#mainPage").css("display", "none");
      $("#profilePage").fadeIn();
    });

    $("#logout_link").click(function () {
      window.location = "index.html";
      sessionStorage.token = null;
    });

    $(".back").click(function () {
      returnToMainPage();
    });

    function onBackKeyDown(e) {
      e.preventDefault();
      returnToMainPage();
    }

    $(document).bind("backbutton", onBackKeyDown);

    function takePicture() {
      // on indique le nom de la fonction en cas
      // de reussite et en cas d echec
      navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        correctOrientation: true,
        targetWidth: 720,
        destinationType: Camera.DestinationType.DATA_URL,
      });

      // L image a ete prise avec succes .
      // On l affiche dans la balise image
      function onSuccess(imageData) {
        storage.setItem("myImage", imageData);
        $("#myImage").attr("src", "data:image / jpeg ; base64 ," + imageData);
        $("#myImage").css("z-index", "2");
        $("#myImage").css("display", "block");
      }

      // echec : on affiche le message d erreur
      function onFail(message) {
        alert("Failed because: " + message);
      }
    }

    $("#cameraImage").click(function () {
      takePicture();
    });

    $("#sendImage").click(function () {
      var message = $("#messageArea").val();
      var photo = storage.getItem("myImage");
      if (message.length < 10) {
        alert("Please enter a longer message :)");
      } else {
        $.ajax({
          url: "https://" + SERVER_IP + ":3000/sendMessage",
          type: "POST",
          headers: {
            Authorization: sessionStorage.token,
          },
          data:
            "message=" +
            message +
            "&photo=" +
            photo.replace(/\+/g, "-").replace(/\//g, "_"),
          success: function (resultat, statut) {
            alert(resultat.response);
            returnToMainPage();
            socket.emit("newMessage");
            $("#messageArea").val("");
          },
          error: function (resultat, statut, erreur) {
            alert("error:" + resultat.responseJSON.response);
          },
        });
      }
    });

    $("#save").click(function (e) {
      e.preventDefault();
      newUsername = $("#name").val();
      newPhone = $("#phone").val();
      oldPwd = $("#oldPwd").val();
      newPwd = $("#newPwd").val();
      newPwdConf = $("#newPwdConf").val();
      newPerimeter = $("#perimeter").val();
      var reg = new RegExp("^[0-9]+$");

      var updateString = {
        newUsername: "",
        newPhone: "",
        newPwd: "",
        newPerimeter: "",
      };
      var error = 0;
      if (newUsername != sessionStorage.name) {
        if (newUsername.length < 2) {
          error = 1;
          alert("Please enter a username");
        } else {
          error = 0;
          updateString.newUsername = newUsername;
        }
      }
      if (newPhone != sessionStorage.phone && error == 0) {
        if (
          newPhone.length != 10 ||
          newPhone[0] != "0" ||
          !reg.test(newPhone)
        ) {
          error = 1;
          alert("Bad phone format");
        } else {
          error = 0;
          updateString.newPhone = newPhone;
        }
      }
      if (newPerimeter != sessionStorage.perimeter) {
        error = 0;
        updateString.newPerimeter = newPerimeter + "000";
      }
      if (newPwd != "" && error == 0) {
        if (newPwd.length < 8) {
          error = 1;
          alert("Password length must be longer than 7 characters");
        } else if (newPwd != newPwdConf) {
          error = 1;
          alert("Password and confirmation are different");
        } else {
          error = 0;
          updateString.oldPwd = oldPwd;
          updateString.newPwd = newPwd;
        }
      }

      if (
        error == 0 &&
        (updateString.newUsername != "" ||
          updateString.newPhone != "" ||
          updateString.newPwd != "" ||
          updateString.newPerimeter != "")
      ) {
        $.ajax({
          url: "https://" + SERVER_IP + ":3000/updateUserInfos",
          type: "PUT",
          headers: {
            Authorization: sessionStorage.token,
          },
          data: "infos=" + JSON.stringify(updateString),
          success: function (resultat, statut) {
            alert(resultat.response);
            if (updateString.newUsername != "") {
              sessionStorage.name = newUsername;
            }
            if (updateString.newPhone != "") {
              sessionStorage.phone = newPhone;
            }
            if (updateString.newPerimeter != "") {
              //Màj en cas de changement de périmètre
              sessionStorage.perimeter = newPerimeter;
            }
            $("#oldPwd").val("");
            $("#newPwd").val("");
            $("#newPwdConf").val("");
          },

          error: function (resultat, statut, erreur) {
            alert("error:" + resultat.responseJSON.response);
          },
        });
      }
    });
  }

  function updateLocation() {
    $.ajax({
      url: "https://" + SERVER_IP + ":3000/updateLocation",
      type: "PUT",
      headers: {
        Authorization: sessionStorage.token,
      },
      data: "infos=" + getCurrentLocation(),
      success: function (resultat, statut) {},

      error: function (resultat, statut, erreur) {
        alert("error:" + resultat.responseJSON.response);
      },
    });
  }

  function getUserInfo() {
    $.ajax({
      url: "https://" + SERVER_IP + ":3000/getUserInfos",
      type: "GET",
      headers: {
        Authorization: sessionStorage.token,
      },
      success: function (resultat, statut) {
        sessionStorage.name = resultat.response.name;
        sessionStorage.phone = resultat.response.phone;
        sessionStorage.email = resultat.response.email;
        perim = resultat.response.perimeter.toString();
        sessionStorage.perimeter = perim.substring(0, perim.length - 3);

        $("#perimeter").val(sessionStorage.perimeter);
        $("#perimeterOutputId").val($("#perimeter").val());
        $("#perimeter").on("input change", function () {
          $("#perimeterOutputId").val($("#perimeter").val());
        });

        $("#name").val(sessionStorage.name);

        $("#phone").val(sessionStorage.phone);

        $("#mapPage").css("display", "none");
      },

      error: function (resultat, statut, erreur) {
        alert("error:" + resultat.responseJSON.response);
      },
    });
  }

  function getMessages() {
    updateLocation();

    $.ajax({
      url: "https://" + SERVER_IP + ":3000/getMessages",
      type: "GET",
      headers: {
        Authorization: sessionStorage.token,
      },
      success: function (resultat, statut) {
        if (resultat.response.length != 0) {
          displayMessagesList(resultat.response);
          if (resultat.someMessagesExpired == true) {
            socket.emit("newMessage");
          }
        } else {
          $("#messagesList").html("");
        }
      },

      error: function (resultat, statut, erreur) {
        alert("error:" + resultat.responseJSON.response);
      },
    });
  }

  function getCurrentLocation() {
    return (
      '{"location": [' +
      currentLocationLongitude +
      ", " +
      currentLocationLatitude +
      "]}"
    );
  }

  function displayMessagesList(messageList) {
    $("#messagesList").html("");
    contactPosition = null;
    contactPosition = {};
    messageList.forEach((element) => {
      contactEmail = element.author.email;
      if (contactEmail in contactPosition) {
        if (
          Date.parse(element.creation) >
          Date.parse(contactPosition[contactEmail].creation)
        ) {
          contactPosition[contactEmail].coordinates = element.coordinates;
        }
      } else {
        contactPosition[contactEmail] = {
          coordinates: element.coordinates,
          creation: element.creation,
        };
      }

      var phoneNumber = element.authorPhone;
      phoneNumber = phoneNumber.replace(/ /g, "");
      phoneNumber = phoneNumber.substring(
        phoneNumber.length - 9,
        phoneNumber.length
      );
      var phoneMessage = "null";
      if (contactPhone != null) {
        contactPhone.forEach((number) => {
          if (phoneNumber == number) {
            phoneMessage = "(in phone contacts)";
          } else {
            phoneMessage = "(not in phone contacts)";
          }
        });
      }

      let test = new Date(Date.parse(element.creation));
      var options = { month: "long", day: "numeric" };
      var options2 = { minute: "numeric", hour: "numeric" };

      messageDate =
        test.toLocaleDateString("en-US", options) +
        ", " +
        test.toLocaleTimeString("en-US", options2);

      if (element.hasOwnProperty("photo")) {
        if (element.photo.localeCompare("")) {
          $("#messagesList").append(
            "<li><p><i>" +
              messageDate +
              "</i>, <b>" +
              element.author +
              "</b> " +
              phoneMessage +
              ":</br>" +
              "<img class='myPhoto' src='data:image/jpeg;base64," +
              element.photo.replace(/\-/g, "+").replace(/\_/g, "/") +
              "'/>" +
              "<p id='message'>" +
              element.body +
              "</p>" +
              "</p></li>"
          );
        } else {
          $("#messagesList").append(
            "<li><p><i>" +
              messageDate +
              "</i>, <b>" +
              element.author +
              "</b> " +
              phoneMessage +
              "</b>:</br>" +
              "<p id='message'>" +
              element.body +
              "</p>" +
              "</p></li>"
          );
        }
      } else {
        $("#messagesList").append(
          "<li><p><i>" +
            messageDate +
            "</i>, <b>" +
            element.author +
            "</b> " +
            phoneMessage +
            "</b>:</br>" +
            "<p id='message'>" +
            element.body +
            "</p>" +
            "</p></li>"
        );
      }
    });
    storage.setItem("contactPosition", JSON.stringify(contactPosition));
  }

  function displayMap() {
    var contactPosition = JSON.parse(storage.getItem("contactPosition"));

    var iconFeatures = [];
    var iconFeature = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([currentLocationLongitude, currentLocationLatitude])
      ),
      name: "User1",
    });
    iconFeatures.push(iconFeature);

    var vectorSource = new ol.source.Vector({
      features: iconFeatures, //add an array of features
    });

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(
        /** @type {olx.style.IconOptions} */ ({
          src: "img/markerYou2.png",
        })
      ),
    });

    var overlay = new ol.layer.Vector({
      source: vectorSource,
      style: iconStyle,
    });

    // Finally we create the map
    window.map = new ol.Map({
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        overlay,
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([
          currentLocationLongitude,
          currentLocationLatitude,
        ]),
        zoom: 10,
      }),
    });

    addCircle(sessionStorage.perimeter);

    for (contact in contactPosition) {
      iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat([
            contactPosition[contact].coordinates[0],
            contactPosition[contact].coordinates[1],
          ])
        ),
        name: "User1",
      });
      iconFeatures.push(iconFeature);
      vectorSource = new ol.source.Vector({
        features: iconFeatures, //add an array of features
      });
      iconStyle = new ol.style.Style({
        image: new ol.style.Icon(
          /** @type {olx.style.IconOptions} */ ({
            src: "img/markerContact2.png",
          })
        ),
      });
      overlay = new ol.layer.Vector({
        source: vectorSource,
        style: iconStyle,
      });
      window.map.addLayer(overlay);
    }
  }

  function addCircle(radius) {
    if (window.circleLayer != null) {
      window.map.removeLayer(window.circleLayer);
    }
    var view = window.map.getView();
    var projection = view.getProjection();
    var resolutionAtEquator = view.getResolution();
    var center = view.getCenter();
    var pointResolution = ol.proj.getPointResolution(
      projection,
      resolutionAtEquator,
      center
    );
    var resolutionFactor = resolutionAtEquator / pointResolution;
    var radius = radius * resolutionFactor;
    var circleIconFeatures = [];
    var circleIconFeature = new ol.Feature({
      geometry: new ol.geom.Circle(center, radius * 1000),
      name: "Circle",
    });
    circleIconFeatures.push(circleIconFeature);
    var circleVectorSource = new ol.source.Vector({
      features: circleIconFeatures, //add an array of features
    });
    window.circleLayer = new ol.layer.Vector({
      source: circleVectorSource,
    });
    window.map.addLayer(window.circleLayer);
  }

  setInterval(function () {
    getMessages();
  }, 120000);
});
