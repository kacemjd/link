$("document").ready(function () {
  $("form").submit(function (e) {
    e.preventDefault();
    var email = $("#email").val();
    var pwd = $("#password").val();
    var pwdConf = $("#confirm-password").val();
    var name = $("#username").val();
    var phone = $("#phonenumber").val();

    var reg = new RegExp("^[0-9]+$");

    if (name.length < 2) {
      alert("Please insert a username");
    } else if (
      !email.includes("@") ||
      !email.includes(".") ||
      email.length < 5
    ) {
      alert("Bad email format");
    } else if (phone.length != 10 || phone[0] != "0" || !reg.test(phone)) {
      alert("Bad phone format");
    } else if (pwd.length < 8) {
      alert("Password length must be longer than 7 characters!");
    } else if (pwdConf != pwd) {
      alert("The confirmation password doesn't match!");
    } else {
      $.ajax({
        url: "https://" + SERVER_IP + ":3000/signup",
        type: "POST",
        data:
          "email=" +
          email +
          "&pwd=" +
          pwd +
          "&phone=" +
          phone +
          "&name=" +
          name,
        success: function (resultat, statut) {
          alert(resultat.response);
          window.location = "login.html";
        },

        error: function (resultat, statut, erreur) {
          alert("error:" + resultat.responseJSON.response);
        },
      });
    }
  });

  $("#link_register").click(function () {
    window.location = "login.html";
  });
});
