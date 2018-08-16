sap.ui.define([
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"poApp/model/formatter" 
	], function(Controller, History, Device, MessageBox, formatter){
		"use strict";
		
		var PageController = Controller.extend("poApp.controller.goodsReceipt.DetailCreate",{
			formatter : formatter,
			
			onInit: function() {
				this.lModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.lModel, "lModel");
				this.getView().byId("id_GR_CreateItems").setModel(this.lModel);
				
				this.getOwnerComponent().getRouter().getRoute("goodsReceiptDetailsCreate").attachPatternMatched(this._onRouteMatched, this);
			},
		
		_onRouteMatched: function(oEvent) {
			this._PoNumber = oEvent.getParameter("arguments").sId;
			this._sId      = "/GRHEADERSet('"+  oEvent.getParameter("arguments").sId +  "')";
			this.getView().bindElement(this._sId);
			
			var oMdl = this.getOwnerComponent().getModel();
			oMdl.read(this._sId,{
				success : function(oData) {
					this.lModel.setData(oData);
					this.getView().byId("id_GR_CreateItems").setModel(this.lModel);
					this.lModel.setProperty("/tempDelData",[]);
				}.bind(this),
				error : function(oError) {
					
				}.bind(this),
				urlParameters : {
					"$expand" : "navtogritem"
				}
			});
		},
		
		onAfterRendering : function() {
			
		},
		
		handleDelete: function(oEvent){
			var arr   = oEvent.getParameter("listItem").getBindingContext().getPath().split("/");
			var items =  this.lModel.getProperty('/navtogritem/results');
			var pInt  = parseInt(arr[arr.length - 1]);
			
			if(items[pInt].Itemno){
				var tempDelData = this.lModel.getProperty("/tempDelData");
				var raData = $.extend(true, {},items[pInt]);
				var temp = {};
				temp.PoItem        = raData.PoItem;
				temp.ShortText     = raData.ShortText;												
				temp.Quantity      = raData.Quantity;
				temp.Grqtydelivered= raData.Grqtydelivered;
				temp.Poqtypending  = raData.Poqtypending;
				temp.Grquantity    = raData.Grquantity;
				temp.Orderunit     = raData.Orderunit;
				temp.NetPrice      = raData.NetPrice;
				temp.Costcenter    = raData.Costcenter;
				temp.Glaccount     = raData.Glaccount;
				tempDelData.push(temp);
				this.lModel.setProperty("/tempDelData",tempDelData);
			}
			
			items.splice(pInt, 1);
			this.lModel.setProperty('/navtogritem/results',items);
		},
		
		onQuantity: function(oEvent){
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},
		
		handleSubmit: function(oEvent) {
			var delItems       = this.lModel.getProperty("/tempDelData");
			var oData          = this.lModel.oData;
			var that           = this;
			var temObj         = {};
			
			temObj.PoNumber    = oData.PoNumber;
			temObj.Vendor      = oData.Vendor;
			temObj.Vendor_name = oData.Vendor_name;
			temObj.Flag        = "C";
			temObj.navtogritem = this.lModel.getProperty("/navtogritem/results");
			
			for(var i =0;i<delItems.length;i++){	
				temObj.navtogritem.push(delItems[i]);		
			}
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/GRHEADERSet",temObj,{
				
				success:function(oData){
					var sMatdocno = oData.Matdocno;
					var msg = "Goods Receipt Document no. " + sMatdocno + " has been generated.";
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg,{
						onClose: function(sAction) {
							that.getOwnerComponent().getRouter().navTo("goodsReceiptDetailsDisplay",{sId: temObj.PoNumber},	!Device.system.phone);
						}
					});
					that.getOwnerComponent().getModel().refresh();
					
				},
				error:function(oData){
					var eMsg = JSON.parse(oData.responseText).error.message.value;
//					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//					jQuery.sap.require("sap.m.MessageBox");
					MessageBox.error(eMsg);
					debugger;	
				}
			})
		},
		
		handleCancel : function(oEvent) {
			if (!this.CancelDialog) {
				this.CancelDialog = new sap.m.Dialog({
							title : 'Cancel',
							type : 'Message',
							draggable : true,
							content : new sap.m.Text({
										text : "Do you want to Cancel?"
									}),
							beginButton : new sap.m.Button({
								text : "Yes",
								type : "Accept",
								press : function() {
//									sap.m.MessageToast.show("Submitted");
									this.CancelDialog.close();
									this._CancelYes(oEvent);
								}.bind(this)
							}),
							endButton : new sap.m.Button({
								text : 'No',
								type : "Reject",
								press : function() {
									this.CancelDialog.close();
								}.bind(this)
							})
						});

				// to get access to the global model
				this.getView().addDependent(this.CancelDialog);
			}

			this.CancelDialog.open();
		},
		
		
		_CancelYes: function(oEvent) {
			var sPreviousHash = History.getInstance().getPreviousHash();
			// The history contains a previous
			// entry
			if (sPreviousHash !== undefined) {
				var sPoNumber         = this._PoNumber;
				this.getOwnerComponent().getRouter().navTo("goodsReceiptDetailsDisplay",{sId: sPoNumber},	!Device.system.phone);
			} else {
				// There is no history!
				// Naviate to master page
				this.getOwnerComponent().getRouter().navTo("master", {},true);
			}
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
		
	});
		
		return PageController;
});

