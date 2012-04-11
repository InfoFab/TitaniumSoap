Ti.include('soapclient.js');


          
var username = 'demo1';
var password = 'info5678';
var authstr = 'Basic ' +Titanium.Utils.base64encode(username+':'+password);

var selectingService = false;
var currentService  = '';

var xhr = Ti.Network.createHTTPClient();

Titanium.UI.setBackgroundColor('#FFF');

var win = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundImage: 'img/background.png'
});

var contentView = Ti.UI.createView({
    width: Titanium.Platform.displayCaps.platformWidth,
    height: Titanium.Platform.displayCaps.platformHeight,
    backgroundColor:'#fffdff',
    top: 0,
    left:0
});

contentView.addEventListener('click', function(e){  
    if(selectingService){
      	selectingService = false;
       hidePicker();
    }
});

win.add(contentView);
//Service picker

var picker = Ti.UI.createPicker();
var data = [];
data[0]=Ti.UI.createPickerRow({title:'please select one service'});
data[1]=Ti.UI.createPickerRow({title:'範例 urn:ZEbiz001',wsdl:'http://ifecc60.ose.com.tw:8000/sap/bc/srt/wsdl/bndg_E172990212E127F1998600219B741ED8/wsdl11/allinone/ws_policy/document?sap-client=800'});
data[2]=Ti.UI.createPickerRow({title:'訂單轉進貨單 n0:ZMmShipdoc',wsdl:'http://ifecc60.ose.com.tw:8000/sap/bc/srt/wsdl/bndg_E182E2A99FAFBBF1998600219B741ED8/wsdl11/allinone/ws_policy/document?sap-client=800'});

picker.add(data);
picker.selectionIndicator = true;
if(Ti.Platform.osname == 'android'){
	contentView.add(picker);
}else
{
	win.add(picker);
}

picker.setSelectedRow(0, 0, false);
	
var pickerLabel = Titanium.UI.createLabel({
	color:'#232',
	text:'Choose Service',
	font:{fontSize:14,fontFamily:'Helvetica Neue', fontWeight:'bold'},
	textAlign:'left',
	top:10,
	left:20,
	width:'auto',
	height:30
});
win.add(pickerLabel);

var tf1 = Titanium.UI.createTextField({
    color:'#336699',
   	top:50,
   	left:20,
   	width:220,
   	height:35,
   	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_LINE,
    hintText: 'Press to select...'
});
if(Ti.Platform.osname == 'iphone'){
	
	tf1.addEventListener('focus',function(e){
		selectingService = true;
		tf1.blur();
		picker.animate(slide_in);
	});
	
	win.add(tf1);
	picker.top = 460;
	
}

picker.addEventListener('change',servicePickerIsChanged);

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
//event function
//ANIMATION VARIABLES
var slide_in = Titanium.UI.createAnimation({
	top:460-220
});

var slide_out = Titanium.UI.createAnimation({
	top:460
});
function servicePickerIsChanged(e){
	selectingService = false;
	Ti.API.info('servicePickerIsChanged:'+picker.getSelectedRow(0).wsdl);
	currentService = picker.getSelectedRow(0).wsdl;
	tf1.value = picker.getSelectedRow(0).title;
	//picker.top = 460- picker.height;
	hidePicker();
}
function hidePicker(){
	picker.animate(slide_out);
}

//soap function
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
