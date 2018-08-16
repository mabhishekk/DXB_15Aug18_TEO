sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/Button'
  ], function (Controller, Dialog, Text, Button) {
	"use strict";

	return Controller.extend("z_pettycash_fi.controller.BaseController", {
		// format date to get the date as per UTC, this is done to save date from -1
		onDateChange: function(oEvent){
			var selectedDate = oEvent.getSource().getDateValue();
			var iDate        = selectedDate .getDate();
			var formatter    = new Intl.DateTimeFormat("en-us", { month: "long" });
			var sMonth       = formatter.format(new Date(selectedDate ));
			var iYear        = selectedDate.getFullYear();
			selectedDate     = new Date(sMonth + ' ' + iDate + ', ' + iYear +' 00:00:00 GMT+00:00');
			oEvent.getSource().setDateValue(selectedDate)
		}
	});
});