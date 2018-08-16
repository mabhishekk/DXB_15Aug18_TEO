sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageBox',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/Button'
  ], function (Controller, MessageBox, Dialog, Text, Button) {
	"use strict";

	return Controller.extend("z_invoice.controller.BaseController", {
		handleSubmit: function(oEvent){
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
									this._onSubmit(oEvent);
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
		
		onDateChange: function(oEvent){
			var selectedDate = oEvent.getSource().getDateValue();
			var iDate        = selectedDate .getDate();
			var formatter    = new Intl.DateTimeFormat("en-us", { month: "long" });
			var sMonth       = formatter.format(new Date(selectedDate ));
			var iYear        = selectedDate.getFullYear();
			selectedDate     = new Date(sMonth + ' ' + iDate + ', ' + iYear +' 00:00:00 GMT+00:00');
			oEvent.getSource().setDateValue(selectedDate)
		},
		
		handleIconTabBarSelect:function(oEvent){
	        var oModel       = this.getView().getModel();
	        var icKey        = oEvent.getParameter('selectedKey');
	        var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
	        if(icKey == "PR"){
	          var shlHash = "z_pr-change&/PR-"+this._PrNumber+"/Edit"
	          var hrefForProductDisplay  =  oCrossAppNav.toExternal({
	              target : { shellHash : shlHash }
	          }); 
	        }else if(icKey == "QR"){
	          var shlHash = "z_pr-change&/PR-"+this._PrNumber+"/quotation"
	          var hrefForProductDisplay  =  oCrossAppNav.toExternal({
	              target : { shellHash : shlHash }
	          });
	        }else if(icKey == "QC"){
	          var shlHash = "z_pr-change&/PR-"+this._PrNumber+"/quotComparision"
	          var hrefForProductDisplay  =  oCrossAppNav.toExternal({
	              target : { shellHash : shlHash }
	          });
	        }else if(icKey == "PO"){
	          var hrefForProductDisplay = oCrossAppNav.toExternal({
	              target : { semanticObject : "zPurchasingOrder", action : "create" },
	              params : { id: this._PrNumber}
	            }); 


	        }else if(icKey == "GR"){
	          var hrefForProductDisplay = oCrossAppNav.toExternal({
	              target : { semanticObject : "ZGOODSRECEIPT", action : "create" },
	              params : { id: this._PoNumber}
	            });
	        }/*else if(icKey == "IN"){
	          var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
	           
	          var hrefForProductDisplay = oCrossAppNav.toExternal({
	              target : { semanticObject : "ZINVOICE", action : "create" },
	              params : { id: this.sId}
	            });

	        } */

	      },
	      
	      _onFileDelete:function(oEvent, Obj, sPath){
				this.fdelObj  = Obj;
				this.sdelPath = sPath;
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
								this._onDeleteDocItem(oEvent);
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
			
			_onDeleteDocItem: function(oEvent){
				this.getView().setBusy(true);			
				var navPath     = this.sdelPath.slice(0,-1)
				var docItemPath = this.sdelPath[this.sdelPath.length-1]
				var dMdl        = this.getView().getModel();			
				if(this._PoNumber){
					var fltr = "pogrinvnumber eq '"+this.fdelObj.pogrinvnumber+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
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
	});
});