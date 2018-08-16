sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/Button'
  ], function (Controller, Dialog, Text, Button) {
	"use strict";

	return Controller.extend("z_expense_claim.controller.BaseController", {
		submitAggrement: function(oEvent){
			if (!this.ConfirmDialog) {
				this.ConfirmDialog = new Dialog({
							title     : this.getResourceBundle().getText("Confirm"),
							type      : 'Message',
							state     : 'Warning',
							draggable : true,
							content : new Text({
										text : this.getResourceBundle().getText("submitMsg")
									}),
							beginButton : new Button({
								text : this.getResourceBundle().getText("Yes"),
								type : "Accept",
								press : function() {
									this.ConfirmDialog.close();
									this.getView().setBusy(true);
									this._onECsaveSubmit(oEvent);
								}.bind(this)
							}),
							endButton : new Button({
								text : this.getResourceBundle().getText("No"),
								type : "Reject",
								press : function() {
									this.ConfirmDialog.close();
								}.bind(this)
							})
						});

				// to get access to the global model
				this.getView().addDependent(this.ConfirmDialog);
			}

			this.ConfirmDialog.open();
		},
		
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