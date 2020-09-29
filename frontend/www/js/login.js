$("document").ready(function () {
  var storage = window.sessionStorage;

  var getLocationSuccess = function (position) {
    var currentLocationData = [];
    currentLocationData.push(position.coords.longitude);
    currentLocationData.push(position.coords.latitude);
    currentLocationData.push(position.coords.altitude);
    currentLocationData.push(position.coords.accuracy);
    currentLocationData.push(position.coords.altitudeAccuracy);
    currentLocationData.push(position.coords.heading);
    currentLocationData.push(position.coords.speed);
    currentLocationData.push(position.timestamp);

    storage.setItem("currentLocationData", currentLocationData.toString());
    $(".loader-wrapper").fadeOut("slow");

    window.location = "main.html";
  };

  function getLocationError(error) {
    alert("code: " + error.code + "\n" + "message: " + error.message + "\n");
  }

  $("form").submit(function (e) {
    e.preventDefault();
    var email = $("#email").val();
    var pwd = $("#pwd").val();

    $.ajax({
      url: "https://" + SERVER_IP + ":3000/signin",
      type: "POST",
      data: "email=" + email + "&pwd=" + pwd,
      success: function (resultat, statut) {
        sessionStorage.token = resultat.response;
        $(".loader-wrapper").fadeIn("slow");
        navigator.geolocation.getCurrentPosition(
          getLocationSuccess,
          getLocationError
        );
      },

      error: function (resultat, statut, erreur) {
        alert("error:" + resultat.responseJSON.response);
      },
    });
  });

  $("#link_login").click(function () {
    window.location = "registration.html";
  });
});
