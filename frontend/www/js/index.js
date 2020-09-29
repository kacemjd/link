var app = {
  // Application Constructor
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },

  // deviceready Event Handler
  onDeviceReady: function () {
    var storage = window.sessionStorage;

    function onSuccess(contacts) {
      var contactPhone = [];
      var contactName = [];
      var phoneNumber;
      if (contacts) {
        for (var i = 0; i < contacts.length; i++) {
          if (contacts[i].phoneNumbers) {
            for (var j = 0; j < contacts[i].phoneNumbers.length; j++) {
              contactName.push(encodeURI(contacts[i].displayName));
              phoneNumber = contacts[i].phoneNumbers[j].value.toString();
              phoneNumber = phoneNumber.replace(/ /g, "");
              phoneNumber = phoneNumber.substring(
                phoneNumber.length - 9,
                phoneNumber.length
              );
              contactPhone.push(phoneNumber);
            }
          }
        }
      }
      storage.setItem("contactPhone", contactPhone.toString());
      storage.setItem("contactName", contactName.toString());
    }

    function onError(contactError) {
      alert("onError!");
    }

    var options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    var fields = ["displayName"];
    navigator.contacts.find(fields, onSuccess, onError, options);

    $("#login-button").click(function () {
      window.location = "login.html";
    });

    $("#register-button").click(function () {
      window.location = "registration.html";
    });

    function onBackKeyDown(e) {
      e.preventDefault();
      if (sessionStorage.token) {
            returnToMainPage();
      }
    }

    $(document).bind("backbutton", onBackKeyDown);

  },
};

app.initialize();
