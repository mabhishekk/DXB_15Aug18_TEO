sap.ui.define([
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/m/Text',
		'sap/ui/model/Filter',
		"poApp/model/formatter" 
	], function(Controller, History, Device, MessageBox, Text, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("poApp.controller.invoice.DetailDisplay",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit : function() {
				this.getOwnerComponent().getRouter().getRoute("invoiceDetailsDisplay").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._PoNumber = oEvent.getParameter("arguments").sId;
				this._sId      = "/INVPONODISPSet('"+  oEvent.getParameter("arguments").sId +  "')";
				this.getView().bindElement(this._sId);
				this.getOwnerComponent().getModel().refresh();
//				this._bindItem();
			},
			
			_bindItem: function() {
				var aGrItems = this.getView().byId('idinvoiceNo').getItems();
				if (aGrItems.length === 0){
					var sPoNumber = this._PoNumber;
					this.getOwnerComponent().getRouter().navTo("invoiceDetailsCreate",{sId: sPoNumber},	!Device.system.phone);
				}else{
					var sMatdocno = aGrItems[0].getProperty('text');
					this._bindTable(sMatdocno);
				}
			},
			
			onAfterRendering: function() {
//				this._bindItem();
			},
			
			onInvoiceSelect: function(oEvent){
				var sInvno = oEvent.getSource().getSelectedItem().getProperty("text");
				var sPath  = "/INVHEADDISPSet('"+sInvno +"')";
				this.getView().byId('idInvoiceHeader').bindElement(sPath);
				this._bindTable(sPath);
			},
			
			_bindTable: function(sPath){
				var oElement  = this.getView().byId("id_Invoice_displayItems");
				var oTemplate = new sap.m.ColumnListItem({
					cells:[
						new Text({ text: "{Invitem}"}),
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{Quantity}"}),
						new Text({ text: "{Grqtydelivered}"}),
						new Text({ text: "{Poqtypending}"}),
						new Text({ text: "{Grquantity}"}),
						new Text({ text: "{Orderunit}"}),
						new Text({ text: "{ItemAmount}"}),
						new Text({ text: "{Glaccount}"}),
						new Text({ text: "{Costcenter}"}),
					]
				});
				
				var sPath = sPath + "/navtoinvitemdisp";
				oElement.bindItems(sPath, oTemplate);
			},
			
			handleCreate: function(oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPoNumber       = sBindingContext.getModel().getData(sBindingContext.sPath).PoNumber;
				this.getOwnerComponent().getRouter().navTo("invoiceDetailsCreate",{sId: sPoNumber},	!Device.system.phone);
			},
			
			handleDelete:  function(oEvent){
				if (!this.DeleteDialog) {
					this.DeleteDialog = new sap.m.Dialog({
								title : 'Delete',
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : "Do you want to Delete?"
										}),
								beginButton : new sap.m.Button({
									text : "Yes",
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.DeleteDialog.close();
										this._DeleteYes(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : 'No',
									type : "Reject",
									press : function() {
										this.DeleteDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.DeleteDialog);
				}

				this.DeleteDialog.open();
			},
			
			_DeleteYes: function(oEvent){
				var that           = this;
				var temObj         = {};
				
				temObj.PoNumber    = this._PoNumber;
				temObj.Matdocno    = this.getView().byId('idinvoiceNo').getSelectedKey();
				temObj.Flag        = "D";
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/GRHEADERSet",{
					
					success:function(oData){
						var sMatdocno = oData.Matdocno;
						var msg = "Invoice Document no. " + sMatdocno + " has been Deleted.";
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
						
					},
					error:function(oData){
						var eMsg = JSON.parse(oData.responseText).error.message.value;
//						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//						jQuery.sap.require("sap.m.MessageBox");
						MessageBox.error(eMsg);
						debugger;	
					}
				})
			},
		// onExit: function() {
		//
		// }
			
		});
		
		return PageController;		
});