Ti.include('soapclient.js');


          
var username = 'demo1';
var password = 'info5678';
var authstr = 'Basic ' +Titanium.Utils.base64encode(username+':'+password);

var selectingService = false;
var currentServiceIndex  = -1;
var services = [];
services[0]={title:'範例',functionName:'urn:ZEbiz001'
	,wsdl:'http://ifecc60.ose.com.tw:8000/sap/bc/srt/wsdl/bndg_E172990212E127F1998600219B741ED8/wsdl11/allinone/ws_policy/document?sap-client=800'};
services[1]={title:'訂單轉進貨單',functionName:'n0:ZMmShipdoc'
	, wsdl:'http://ifecc60.ose.com.tw:8000/sap/bc/srt/wsdl/bndg_E182E2A99FAFBBF1998600219B741ED8/wsdl11/allinone/ws_policy/document?sap-client=800'};

var xhr = Ti.Network.createHTTPClient();

Titanium.UI.setBackgroundColor('#FFF');

var win = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundImage: 'img/background.png'
});

//create a table view
var data = [];
var serviceTable = Titanium.UI.createTableView({
	height: 100,
	width: 	320,
	top: 	40,
	left: 	0
}); 
for(var i = 0; i < services.length; i++){
	var aService = services[i];
	//create table row
	var row = Titanium.UI.createTableViewRow({
		_title:aService.title,
		_description: aService.functionName,
		className: 'recipe-row',
		filter: aService.title,
		height:44,
		backgroundColor: '#fff',
		selected:false
	});
	//title label for row at index i
	var titleLabel = Titanium.UI.createLabel({
		text: aService.title,
		font : {fontSize: 14, fontWeight : ' bold' },
		left: 10,
		top: 5,
		height: 20,
		width: 210,
		color:'#232'
	});
		
		row.add(titleLabel);
		
		//description view for row at index i
	var descriptionLabel = Titanium.UI.createLabel({
		text: aService.description,
		font : {fontSize: 10, fontWeight : ' normal ' },
		left: 	10,
		top: 	25,
		width: 	200,
		height: 15,
		color:	'#9a9'
	});
		
	row.add(descriptionLabel);
	//add the row to data array
	data.push(row);
}
	// set the data to tableview's data
serviceTable.data = data;
	
serviceTable.addEventListener('click', serviceIsSelected);
win.add(serviceTable);


	
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

var buttonLeft = Ti.UI.createButton({ color:'black', title:'Load', top:120, right:50, height:42, width:100 });

win.add(buttonLeft);
buttonLeft.addEventListener('click', function(e) {
  trySoapClient(); 
});



win.open();

//function.....	
//event function
function serviceIsSelected(e){
	var index = e.index;
	for (var i = 0; i < serviceTable.data.length; ++i) {
		var rowData = serviceTable.data[i];
	
		if( i == index && currentServiceIndex == index ||  i != index){
			rowData.backgroundColor = '#333';
    		rowData.selected = false;
  			
		}else if( i == index)
		{
			rowData.backgroundColor = '#409EE6';
   			rowData.selected = true;
   			currentServiceIndex = index;
		}
    }
  	
	Ti.API.info('currentServiceIndex:'+currentServiceIndex);
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
