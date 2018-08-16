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
		
		var PageController = Controller.extend("poApp.controller.goodsReceipt.DetailDisplay",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit : function() {
				this.getOwnerComponent().getRouter().getRoute("goodsReceiptDetailsDisplay").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._PoNumber = oEvent.getParameter("arguments").sId;
				this._sId      = "/GRHEADDISPSet('"+  oEvent.getParameter("arguments").sId +  "')";
				this.getView().bindElement(this._sId);
				var oMdl = this.getOwnerComponent().getModel();
				oMdl.read(this._sId,{
					success : function(oData) {
						var sMatdocno = oData.grtoitemdisp.results[0].Matdocno;
						this._BindTable(sMatdocno);
					}.bind(this),
					error : function(oError) {
						console.log(oData);
					}.bind(this),
					urlParameters : {
						"$expand" : "grtoitemdisp"
					}
				});
				this.getOwnerComponent().getModel().refresh();
			},
							
			onAfterRendering: function() {
				
			},
			
			_BindTable: function(sMatdocno) {
				var oElement  = this.getView().byId("id_GR_displayItems");
				var oTemplate = new sap.m.ColumnListItem({
					cells:[
						new Text({ text: "{Matdocitem}"}),
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{Quantity}"}),
						new Text({ text: "{Orderunit}"}),
						new Text({ text: "{ItemAmount}"}),
						new Text({ text: "{Grqtydelivered}"}),
						new Text({ text: "{Poqtypending}"}),
						new Text({ text: "{Costcenter}"}),
						new Text({ text: "{Glaccount}"}),
					]
				});
				
				var aFilters = [];
				aFilters.push( new Filter("Matdocno", "EQ", sMatdocno) );
				oElement.bindItems({
					path : "/GRITEMDISPFINALSet",
					filters: new Filter(aFilters, true),
					template : oTemplate
				});
			},
			
			onGRselect: function(oEvent){
				var sMatdocno = oEvent.getSource().getSelectedItem().getProperty("text");
				this._BindTable(sMatdocno);
			},
			
			handleCreate: function(oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPoNumber       = sBindingContext.getModel().getData(sBindingContext.sPath).PoNumber;
				this.getOwnerComponent().getRouter().navTo("goodsReceiptDetailsCreate",{sId: sPoNumber},	!Device.system.phone);
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
				temObj.Matdocno    = this.getView().byId('idGoodsReceiptNo').getSelectedKey();
				temObj.Flag        = "D";
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/GRHEADERSet",{
					
					success:function(oData){
						var sMatdocno = oData.Matdocno;
						var msg = "Goods Receipt Document no. " + sMatdocno + " has been Deleted.";
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
			
			handlePrint: function (oEvent) {
				var sMatdocno       = this.getView().byId('idGoodsReceiptNo').getSelectedItem().getProperty("text");
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "proxy/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='GR',appno='" +sMatdocno+"',lang='',ndavalue='')/$value";
				window.open(sPrintPath,true); 
			},
			
			onNavBack: function(oEvent){
				var sPreviousHash = History.getInstance().getPreviousHash();
				
				//The history contains a previous entry
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					// There is no history!
					// Naviate to master page
					this.getOwnerComponent().getRouter().navTo("master", {}, true);
				}
			}
		// onExit: function() {
		//
		// }
			
		});
		
		return PageController;
});