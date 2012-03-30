

var url = "http://ifecc60.ose.com.tw:8000/sap/bc/srt/rfc/sap/z_web_ebiz_001/800/z_web_ebiz_001/z_web_ebiz_001";
var username = 'demo1';
var password = 'info5678';
var xhr = Ti.Network.createHTTPClient();

Titanium.UI.setBackgroundColor('#FFF');

var win = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundImage: 'img/background.png'
});

//approach one
var buttonLeft = Ti.UI.createButton({ color:'black', title:'SAP', top:50, left:50, height:42, width:100 });

win.add(buttonLeft);
buttonLeft.addEventListener('click', function(e) {
  soapSAP(); 
});



win.open();

//function.....	
function soapSAP(){ 
	//User and Password of SAP 
	var authstr = 'Basic ' +Titanium.Utils.base64encode(username+':'+password);
	Ti.API.info('authstr:'+authstr);
//End Point
	xhr.open('POST', url, false);
//SOAP Message
	var soapRequest=
  	"<?xml version=\"1.0\" encoding=\"utf-8\"?>" 
  	+"<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:soap:functions:mc-style\">"
  	+"<soapenv:Header/>"
	+"<soapenv:Body>"
	+"<urn:ZEbiz001>"
	+"<IEbeln>3000000005</IEbeln>"
	+"<ILifnr>5550</ILifnr>"
	+"</urn:ZEbiz001>"
	+"</soapenv:Body>"
	+"</soapenv:Envelope>"
  	Ti.API.info('soapRequest: ' + soapRequest);

	//Important: Add Header  Authorization and SOAP Message
	xhr.setRequestHeader('Content-Type','text/xml; charset=utf-8');
	xhr.setRequestHeader('Authorization', authstr);
	xhr.setRequestHeader('Content-Length', soapRequest.length); 
	xhr.send(soapRequest);
	xhr.onreadystatechange=doUpdate();
	return false;
}
function doUpdate(){
  debugger;

  if(xhr.readyState==4)
  {

    alert('Response from the server: ' + xhr.status);
    Ti.API.info('Response from the server: ' + xhr.responseText);

  }
}