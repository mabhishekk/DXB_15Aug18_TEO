sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/Button'
  ], function (Controller, Dialog, Text, Button) {
	"use strict";

	return Controller.extend("providenta.fi.rewards.controller.BaseController", {
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
							this._SaveSubmitRewards(oEvent);
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
		},
		
		handleLiveInput:function(oEvent){
			var oInput           = oEvent.getSource(),
				iValueLength     = oInput.getValue().length,
				iMaxLength       = oInput.getMaxLength(),
				iWarningLength   = iMaxLength - 10,	
				iRemainingLength = iMaxLength - iValueLength,
				sStateText       = this.getResourceBundle().getText("CharactersLeft",[iRemainingLength]),
				sState;
			if (iValueLength > iWarningLength && iValueLength < iMaxLength){
				sState = 'Warning';
			}else if (iValueLength == iMaxLength){
				sState = 'Error';
			}else{
				sState = 'None';
			}
		    
		    oInput.setValueState(sState);
		    oInput.setValueStateText(sStateText);
		},
		
		_deleteFile:function(oEvent, ofdelObj, sdelPath, sRequestNo){
			this.fdelObj  = ofdelObj;
			this.sdelPath = sdelPath;
			var sDocfile  = this.fdelObj.Docfile;
			if (!this.delItemDialog) {
				this.delItemDialog = new sap.m.Dialog({
					title : this.getResourceBundle().getText("warning"),
					state : 'Warning',
					type  : 'Message',															
					content : new sap.m.Text({
								text : this.getResourceBundle().getText("delMsg",[sDocfile])
							}),
					beginButton : new sap.m.Button({
						text : this.getResourceBundle().getText("Yes"),
						type : "Accept",
						press : function(oEvt) {
							this._onDeleteDocItem(oEvent, sRequestNo);
							this.delItemDialog.close();
						}.bind(this)
					}),
					endButton : new sap.m.Button({
						text : this.getResourceBundle().getText("No"),
						type : "Reject",
						press : function() {
							this.delItemDialog.close();
						}.bind(this)
					})
				});
				// to get access to the global model
				this.getView().addDependent(this.delItemDialog);
			}
			this.delItemDialog.open();
		},
		
		_onDeleteDocItem: function(oEvent, sRequestNo){
			this.getView().setBusy(true);			
			var navPath     = this.sdelPath.slice(0,-1)
			var docItemPath = this.sdelPath[this.sdelPath.length-1]
			var dMdl        = this.getView().getModel();			
			if(sRequestNo){
				var fltr = "Postingnumber eq '"+this.fdelObj.Postingnumber+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
				var that = this;
				dMdl.read("/FilelistSet",{
						success:function(oData){					
							var dItems = this.lModel.getProperty(navPath);									
							dItems.splice(parseInt(docItemPath),1);
							this.lModel.setProperty(navPath,dItems);
							this.getView().setBusy(false);				
						}.bind(this),
						error:function(oError){										
							this.getView().setBusy(false);
						}.bind(this),
						urlParameters:{
							"$filter":fltr
						}
				})
			}
		},
	});
});