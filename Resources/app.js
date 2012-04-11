Ti.include('soapclient.js');


          
var username = 'demo1';
var password = 'info5678';
var authstr = 'Basic ' +Titanium.Utils.base64encode(username+':'+password);

var xhr = Ti.Network.createHTTPClient();

Titanium.UI.setBackgroundColor('#FFF');

var win = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundImage: 'img/background.png'
});

var tf1 = Titanium.UI.createTextField({
    color:'#336699',
    height:35,
    top:10,
    left:10,
    width:250,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});



win.add(tf1)

var picker = Ti.UI.createPicker({
  top:50
});
var data = [];
data[0]=Ti.UI.createPickerRow({title:'範例 urn:ZEbiz001',wsdl:'http://ifecc60.ose.com.tw:8000/sap/bc/srt/wsdl/bndg_E172990212E127F1998600219B741ED8/wsdl11/allinone/ws_policy/document?sap-client=800'});
data[1]=Ti.UI.createPickerRow({title:'訂單轉進貨單 n0:ZMmShipdoc',wsdl:'http://ifecc60.ose.com.tw:8000/sap/bc/srt/wsdl/bndg_E182E2A99FAFBBF1998600219B741ED8/wsdl11/allinone/ws_policy/document?sap-client=800'});

picker.add(data);
picker.selectionIndicator = true;
 
win.add(picker);

picker.setSelectedRow(0, 2, false);

tf1.addEventListener('focus',function(e){
	
});
//approach one
var buttonLeft = Ti.UI.createButton({ color:'black', title:'Fixed', top:100, left:50, height:42, width:100 });

win.add(buttonLeft);
buttonLeft.addEventListener('click', function(e) {
  soapSAP(); 
});

//approach two
var buttonLeft = Ti.UI.createButton({ color:'black', title:'WSDL', top:100, right:50, height:42, width:100 });

win.add(buttonLeft);
buttonLeft.addEventListener('click', function(e) {
  trySoapClient(); 
});



win.open();

//function.....	
function soapSAP(){

	var soap_url = "http://ifecc60.ose.com.tw:8000/sap/bc/srt/rfc/sap/z_web_ebiz_001/800/z_web_ebiz_001/z_web_ebiz_001";
 
	//User and Password of SAP 
	Ti.API.info('authstr:'+authstr);
//End Point
	xhr.open('POST', soap_url, true);
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
	//xhr.setRequestHeader('Content-Length', soapRequest.length); 
	xhr.send(soapRequest);
	xhr.onreadystatechange=doUpdate();
	return false;
}
function doUpdate(){
 // debugger;

  if(xhr.readyState==4)
  {

    alert('Response from the server: ' + xhr.status);
    Ti.API.info('Response from the server: ' + xhr.responseText);

  }
}

function trySoapClient(){

	var pl = new SOAPClientParameters();
	var wsdlurl = 'http://ifecc60.ose.com.tw:8000/sap/bc/srt/wsdl/bndg_E1742FF69F1057F1998600219B741ED8/wsdl11/allinone/ws_policy/document?sap-client=800';
	pl.add("IEbeln", 3000000005);
	pl.add("ILifnr",5550);
	SOAPClient.invoke(wsdlurl, authstr, "urn:ZEbiz001", pl, true, trySoapCliento_callBack);

}

function trySoapCliento_callBack(r){
	// alert('Response from the server: ' + xhr.status);
    Ti.API.info('trySoapCliento_callBack Response from the server: ' + r);

}
