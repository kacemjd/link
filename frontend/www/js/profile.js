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
    if (newPhone.length != 10 || newPhone[0] != "0" || !reg.test(newPhone)) {
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
          sessionStorage.name == newUsername;
        }
        if (updateString.newPhone != "") {
          sessionStorage.phone == newPhone;
        }
        if (updateString.newPerimeter != "") {
          sessionStorage.perimeter == newPerimeter;
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
