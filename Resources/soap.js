// include suds soap library
Titanium.include('suds.js');

var window = Ti.UI.currentWindow;
var label = Ti.UI.createLabel({
  top: 10,
  left: 10,
  width: 'auto',
  height: 'auto',
  text: 'Contacting Drupal soap server...\n'
});

window.add(label);

// define soap params
var url = "http://drupal.vm/sites/all/modules/custom/nusoap/soap-server.php";
var callparams = {
  name: 'Eric.London',
  pass: 'super secret password'
};

// create new suds soap client
var suds = new SudsClient({
  endpoint: url,
  targetNamespace: 'erl.dev'
});

try {
  
  // make soap server call
  suds.invoke('login_fetch_data', callparams, function(xmlDoc) {
  
    // fetch results from method
    results = xmlDoc.documentElement.getElementsByTagName('login_fetch_dataResponse');
       
    // check if results exits
    if (results && results.length>0) {
  
      // output results 
      label.text += "User uid: " + results.item(0).text;      

    }
    else {
      // handle error     
    }

  });
} catch(e) {
  Ti.API.error('Error: ' + e);
}