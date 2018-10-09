sap.ui.define([
	] , function () {
		"use strict";

		return {

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
			
			formatDate : function(v) {
			     jQuery.sap.require("sap.ui.core.format.DateFormat");
			     var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MMM-YYYY"});
			     return oDateFormat.format(new Date(v));
			},
			
			type: function (sValue) {
				if (sValue === '1') {
					return 'Freelancer';
				}else if (sValue === '2') {
					return 'Company';
				}else if (sValue === '3'){
					return 'Group';
				}else{
					return 'Type Not Defined';
				}
				
			}
		};

	}
);
