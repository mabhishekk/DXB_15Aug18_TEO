sap.ui.define([], function () {
	"use strict";
	return {
		
		formatDate : function(v) {
		     jQuery.sap.require("sap.ui.core.format.DateFormat");
		     var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MM-YYYY"});
		     return oDateFormat.format(new Date(v));
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
			} else if(oVal == 'E'){
				return oBundle.getText("ReSubmitted");
			} else {
				return;
			}
		},
		
		fStatus:function(oVal){
			if(oVal == 'S'){
				return "Warning";
			} else if(oVal == 'A'){
				return "Success";
			} else if(oVal == 'R'){
				return "Error";
			} else if(oVal == 'C'){
				return "None";
			} else {
				return;
			}
		},
		
		formatMtdTrans:function(oVal){
			if (oVal === "0") {
				return oBundle.getText("Bank");
			} else if (oVal === "1") {
				return oBundle.getText("Cash");
			} else {
				return ;
			}
		},
		
		formatMtdTranIndex: function(oVal){
			if (oVal === "0") {
				return 0;
			} else if (oVal === "1") {
				return 1;
			} else {
				return;
			}
		}
		
	};
});