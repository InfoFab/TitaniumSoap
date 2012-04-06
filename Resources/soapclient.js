/*****************************************************************************\

 Javascript "SOAP Client" library

 @version: 1.4 - 2005.12.10
 @author: Matteo Casati, Ihar Voitka - http://www.guru4.net/
 @description: (1) SOAPClientParameters.add() method returns 'this' pointer.
               (2) "_getElementsByTagName" method added for xpath queries.
               (3) "_getXmlHttpPrefix" refactored to "_getXmlHttpProgID" (full 
                   ActiveX ProgID).
               
 @version: 1.3 - 2005.12.06
 @author: Matteo Casati - http://www.guru4.net/
 @description: callback function now receives (as second - optional - parameter) 
               the SOAP response too. Thanks to Ihar Voitka.
               
 @version: 1.2 - 2005.12.02
 @author: Matteo Casati - http://www.guru4.net/
 @description: (1) fixed update in v. 1.1 for no string params.
               (2) the "_loadWsdl" method has been updated to fix a bug when 
               the wsdl is cached and the call is sync. Thanks to Linh Hoang.
               
 @version: 1.1 - 2005.11.11
 @author: Matteo Casati - http://www.guru4.net/
 @description: the SOAPClientParameters.toXML method has been updated to allow
               special characters ("<", ">" and "&"). Thanks to Linh Hoang.

 @version: 1.0 - 2005.09.08
 @author: Matteo Casati - http://www.guru4.net/
 @notes: first release.

\*****************************************************************************/

function SOAPClientParameters()
{
	var _pl = new Array();
	this.add = function(name, value) 
	{
		_pl[name] = value; 
		return this; 
	}
	this.toXml = function()
	{
		var xml = "";
		for(var p in _pl)
		{
			if(typeof(_pl[p]) != "function")
				xml += "<" + p + ">" + _pl[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + p + ">";
		}
		return xml;	
	}
}

function SOAPClient() {}

SOAPClient.invoke = function(url, authst, method, parameters, async, callback)
{
	if(async)
	{
		
		SOAPClient._loadWsdl(url, authst, method, parameters, async, callback);
	
	}else
	{
		
		return SOAPClient._loadWsdl(url, authst, method, parameters, async, callback);
	}
}

// private: wsdl cache
SOAPClient_cacheWsdl = new Array();

// private: invoke async
SOAPClient._loadWsdl = function(url, authst, method, parameters, async, callback)
{
	Ti.API.info('SOAPClient._loadWsdl ===========================');
	
	// load from cache?
	var wsdl = SOAPClient_cacheWsdl[url];
	if(wsdl + "" != "" && wsdl + "" != "undefined")
		return SOAPClient._sendSoapRequest(url, method, parameters, async, callback, wsdl);
	// get wsdl
	var wsdlHttpClient = Ti.Network.createHTTPClient();
	wsdlHttpClient.open("GET", url, async);
	wsdlHttpClient.setRequestHeader('Content-Type','text/xml; charset=utf-8');
	wsdlHttpClient.setRequestHeader('Authorization', authstr);
	
	if(async) 
	{
		wsdlHttpClient.onreadystatechange = function() 
		{
			if(wsdlHttpClient.readyState == 4 && wsdlHttpClient.status == 200)
			{
				Ti.API.info('SOAPClient._onLoadWsdl ===========================');
	
				SOAPClient._onLoadWsdl(url, method, parameters, async, callback, wsdlHttpClient);
			}
		}
	}
	wsdlHttpClient.send(null);
	
	if (!async)
	{	
		return SOAPClient._onLoadWsdl(url, method, parameters, async, callback, wsdlHttpClient);
	}
}
SOAPClient._onLoadWsdl = function(url, method, parameters, async, callback, req)
{
	Ti.API.info('Response wsdl from the server: ' + req.responseText)

	var wsdl = req.responseXML;
	SOAPClient_cacheWsdl[url] = wsdl;	// save a copy in cache
	
	return SOAPClient._sendSoapRequest(url, method, parameters, async, callback, wsdl);
}
SOAPClient._sendSoapRequest = function(url, method, parameters, async, callback, wsdl)
{
	
	var requestUrl = wsdl.getElementsByTagName("soap:address").item(0).attributes.getNamedItem("location").value;
	Ti.API.info('requestUrl: ' + requestUrl);
	// get namespace
	var ns = (wsdl.documentElement.attributes["targetNamespace"] + "" == "undefined") ? wsdl.documentElement.attributes.getNamedItem("targetNamespace").nodeValue : wsdl.documentElement.attributes["targetNamespace"].value;
	// build SOAP request
	var soapRequest = 
				"<?xml version=\"1.0\" encoding=\"utf-8\"?>"
				+"<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:sap-com:document:sap:soap:functions:mc-style\">"
  				+"<soapenv:Header/>"
				+"<soapenv:Body>"
				+"<" + method +">" // " xmlns=\"" + ns + "\">" +
				+parameters.toXml() 
				+"</" + method + ">"
				+"</soapenv:Body>"
				+"</soapenv:Envelope>";
	Ti.API.info('_sendSoapRequest: ' + soapRequest)
	Ti.API.info('authstr:'+authstr);		
	// send request
	var requestHttpClinet = Ti.Network.createHTTPClient({ 
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
         	alert('success');
         	if(async) 
			{
				Ti.API.info('SOAPClient._onSendSoapRequest===========');
	
				SOAPClient._onSendSoapRequest(method, async, callback, wsdl, requestHttpClinet);
			}
     	},
     });
	requestHttpClinet.open("POST", requestUrl, async);
	requestHttpClinet.setRequestHeader('Content-Type','text/xml; charset=utf-8');
	requestHttpClinet.setRequestHeader('Authorization', authstr);
	
	if(async) 
	{
		requestHttpClinet.onreadystatechange = function(e) 
		{
			if(requestHttpClinet.readyState == 4 && requestHttpClinet.status == 200)
			{	
				Ti.API.info('requestHttpClinet.readyState == 4 && requestHttpClinet.status == 200');
	
	//			SOAPClient._onSendSoapRequest(method, async, callback, wsdl, requestHttpClinet);
			}
		}
	}
	
	requestHttpClinet.send(soapRequest);
	
	if (!async)
	{
		Ti.API.info('!async========================= call _onSendSoapRequest');		
		return SOAPClient._onSendSoapRequest(method, async, callback, wsdl, requestHttpClinet);
	}
}
SOAPClient._onSendSoapRequest = function(method, async, callback, wsdl, req)
{
	var o = null;
	Ti.API.info('_onSendSoapRequest Response from the server: ' + req.responseText);

	var nd = SOAPClient._getElementsByTagName(req.responseXML, method + "Response");
	if(nd.length == 0)
	{
		if(req.responseXML.getElementsByTagName("faultcode").length > 0)
			throw new Error(500, req.responseXML.getElementsByTagName("faultstring")[0].childNodes[0].nodeValue);
	}
	else
		o = SOAPClient._soapresult2object(nd.item(0), wsdl);
	if(callback)
		callback(o, req.responseXML);
	if(!async)
		return o;		
}

// private: utils
SOAPClient._getElementsByTagName = function(document, tagName)
{
	try
	{
		// trying to get node omitting any namespaces (latest versions of MSXML.XMLDocument)
		return document.selectNodes(".//*[local-name()=\""+ tagName +"\"]");
	}
	catch (ex) {}
	// old XML parser support
	return document.getElementsByTagName(tagName);
}

SOAPClient._soapresult2object = function(node, wsdl)
{
	return SOAPClient._node2object(node, wsdl);
}
SOAPClient._node2object = function(node, wsdl)
{
	// null node
	if(node == null)
		return null;
	// text node
	if(node.nodeType == 3 || node.nodeType == 4)
		return SOAPClient._extractValue(node, wsdl);
	// leaf node
	if (node.childNodes.length == 1 && (node.childNodes[0].nodeType == 3 || node.childNodes[0].nodeType == 4))
		return SOAPClient._node2object(node.childNodes[0], wsdl);
	var isarray = SOAPClient._getTypeFromWsdl(node.nodeName, wsdl).toLowerCase().indexOf("arrayof") != -1;
	// object node
	if(!isarray)
	{
		var obj = null;
		if(node.hasChildNodes())
			obj = new Object();
		for(var i = 0; i < node.childNodes.length; i++)
		{
			var p = SOAPClient._node2object(node.childNodes[i], wsdl);
			obj[node.childNodes[i].nodeName] = p;
		}
		return obj;
	}
	// list node
	else
	{
		// create node ref
		var l = new Array();
		for(var i = 0; i < node.childNodes.length; i++)
			l[l.length] = SOAPClient._node2object(node.childNodes[i], wsdl);
		return l;
	}
	return null;
}
SOAPClient._extractValue = function(node, wsdl)
{
	var value = node.nodeValue;
	switch(SOAPClient._getTypeFromWsdl(node.parentNode.nodeName, wsdl).toLowerCase())
	{
		default:
		case "s:string":			
			return (value != null) ? value + "" : "";
		case "s:boolean":
			return value+"" == "true";
		case "s:int":
		case "s:long":
			return (value != null) ? parseInt(value + "", 10) : 0;
		case "s:double":
			return (value != null) ? parseFloat(value + "") : 0;
		case "s:datetime":
			if(value == null)
				return null;
			else
			{
				value = value + "";
				value = value.substring(0, value.lastIndexOf("."));
				value = value.replace(/T/gi," ");
				value = value.replace(/-/gi,"/");
				var d = new Date();
				d.setTime(Date.parse(value));										
				return d;				
			}
	}
}
SOAPClient._getTypeFromWsdl = function(elementname, wsdl)
{
	var ell = wsdl.getElementsByTagName("s:element");	// IE
	if(ell.length == 0)
		ell = wsdl.getElementsByTagName("element");	// MOZ
	for(var i = 0; i < ell.length; i++)
	{
		if(ell[i].attributes["name"] + "" == "undefined")	// IE
		{
			if(ell[i].attributes.getNamedItem("name") != null && ell[i].attributes.getNamedItem("name").nodeValue == elementname && ell[i].attributes.getNamedItem("type") != null) 
				return ell[i].attributes.getNamedItem("type").nodeValue;
		}	
		else // MOZ
		{
			if(ell[i].attributes["name"] != null && ell[i].attributes["name"].value == elementname && ell[i].attributes["type"] != null)
				return ell[i].attributes["type"].value;
		}
	}
	return "";
}
// private: xmlhttp factory => modified to use HTTPClient
SOAPClient._getHTTPClient = function() 
{
	var req = Ti.Network.createHTTPClient();
	return req;

}

// no use in Titanium
SOAPClient._getXmlHttpProgID = function()
{
	if(SOAPClient._getXmlHttpProgID.progid)
		return SOAPClient._getXmlHttpProgID.progid;
	var progids = ["Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
	var o;
	for(var i = 0; i < progids.length; i++)
	{
		try
		{
			o = new ActiveXObject(progids[i]);
			return SOAPClient._getXmlHttpProgID.progid = progids[i];
		}
		catch (ex) {};
	}
	throw new Error("Could not find an installed XML parser");
}