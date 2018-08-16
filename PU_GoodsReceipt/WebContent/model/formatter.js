sap.ui.define([], function () {
	"use strict";
	return {
		
		formatDate : function(v) {
		     jQuery.sap.require("sap.ui.core.format.DateFormat");
		     var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MM-YYYY"});
		     return oDateFormat.format(new Date(v));
		},
		
		precedingZeros: function(sVal){
			return parseInt(sVal, 10);
		},
		
		PODescText: function (sStatus) {
			if (sStatus === ""){
				return "No Description Found";
			} else {
				return;
			}
		},
	};
});