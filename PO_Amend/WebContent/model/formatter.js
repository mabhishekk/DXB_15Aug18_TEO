sap.ui.define([], function () {
	"use strict";
	return {
		PRrequestType: function (sType) {
			if (sType == "0"){
				return 0;
			} else if (sType == "1"){
				return 1;
			} else if (sType == "2"){
				return 2;
			} else {
				return;
			}
				
		},
		PRrequestTypeVisible: function (sType) {
			if (sType === "0"){
				return true;
			} else if (sType === "1"){
				return false;
			} else if (sType === "2"){
				return true;
			} else {
				return;
			}
				
		},
		
		ZTrueFalse:function(oParm){
			if(oParm == "X"){
				return true;
					
			}else{
				
				return false;
			}
			
			
		},
		
		formatStatus:function(oVal){
			var oBundle = this.getResourceBundle();
			if(oVal == 'S'){
				return oBundle.getText("Submitted");
			} else if(oVal == 'A'){
				return oBundle.getText("Approved");
			} else if(oVal == 'R'){
				return oBundle.getText("Rejected");
			} else if(oVal == 'C'){
				return oBundle.getText("Cancelled");
			} else if(oVal == 'O'){
				return oBundle.getText("Saved");
			}else {
				return;
			}
		},
		
		PRstatusText: function (sStatus) {
			if (sStatus === "A"){
				return "Approved";
			} else if (sStatus === "S") {
				return "Submitted";
			} else if  (sStatus === "R") {
				return "Rejected";
			} else {
				return;
			}
		},
		
		
		PODescText: function (sStatus) {
			if (sStatus === ""){
				return "Test Description";
			} else {
				return;
			}
		},
		
		
		
		
		PRstatusState: function (sState) {
			if (sState === "A") {
				return "Success";
			} else if (sState === "S") {
				return "Warning";
			} else if (sState === "R"){
				return "Error";
			} else {
				return "None";
			}
		},
		
		PRmasterRequestType: function (sRequest) {
			if (sRequest == "0"){
				return "Urgent";
			} else if (sRequest == "1"){
				return "Routine";
			} else if (sRequest == "2"){
				return "Exclusive Vendor/ Agency";
			} else {
				return;
			}
				
		},
		
		
		requestType:function(oParm){
			
		if(oParm)	
			return parseInt(oParm);
		else
			return 1;
			
		},
		
		Zjusdelivery:function(oParm){
			if(oParm)
		return	oParm.split(',');
			else
				return ""
		},
		
		
		ZjusdeliveryT:function(oParm){
			
			var strng = "";
			if(oParm){
			if(oParm.indexOf("del") != -1){
				strng = "*Delivery"
				
			}
			
			if(oParm.indexOf("qua") != -1){
				 
				strng = strng + "*Quality";
			}
			
			if(oParm.indexOf("pri")!= -1){
				strng = strng + "*Price";
				
			}
			
			if(oParm.indexOf("Tf")!= -1){
				strng = strng + "*Technical Feedback";
				
			}
			
			if(oParm.indexOf("othr")!= -1){
				
				strng = strng + "*Others";
			}
			
			return strng;
			}else{
				
				return ""
			}
			
			
			
		},
		
		formatStatus:function(oVal){
			var oBundle = this.getResourceBundle();
			if(oVal == 'S'){
				return oBundle.getText("Submitted");
			} else if(oVal == 'A'){
				return oBundle.getText("Approved");
			} else if(oVal == 'R'){
				return oBundle.getText("Rejected");
			} else if(oVal == 'C'){
				return oBundle.getText("Cancelled");
			} else if(oVal == 'O'){
				return oBundle.getText("Saved");
			} else {
				return;
			}
		},
		
		
		
		Excemtion:function(oValue){
			
			if(oValue == 'X'){
				return true;
				
			}else{
				
				return false;
			}
			
			
		}
		
		
	};
});