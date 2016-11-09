
var getZip = function (tool, key) {
  $.ajax({
    type:'POST',
    url: "/downloads/getTool",
    data: {"tool": tool, "key": key},
    success: function (response)  {
      $('#downloadLink')[0].click()
  }  
  });
};

var getKey = function(tool)  {
  $.ajax({
    type:'POST',
    url: "https://www.metrics.api.authorship.me/users/create",
    data: {login: $('#APIloginField').text().trim(), subscription: "0"},
    success: function(response) {
      getZip(tool, response.key);
    },
  });
};

$(document).on('click','#chrome', function(e) {
  getKey("chrome");
});

$(document).on('click','#wordpress', function(e) {
  getKey("wordpress");
});



