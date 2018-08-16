sap.ui.define([
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_goods_receipt/model/formatter",
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/Button'
	], function(Controller, History, Device, MessageBox, formatter, Dialog, Text, Button){
		"use strict";
		
		var PageController = Controller.extend("z_goods_receipt.controller.DetailCreate",{
			
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit: function() {
				this.lModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.lModel, "lModel");
				this.getView().byId("id_GR_CreateItems").setModel(this.lModel);
				this.getView().byId("id_GR_CreateItems1").setModel(this.lModel);
				this.byId("idGrCompletionDate").setDateValue(new Date());
				
				this.SOmodel = new sap.ui.model.json.JSONModel();
				var SOdata   = {"POservices": []};
				this.SOmodel.setData(SOdata);
				
				this.getOwnerComponent().getRouter().getRoute("goodsReceiptDetailsCreate").attachPatternMatched(this._onRouteMatched, this);
			},
		
		_onRouteMatched: function(oEvent) {
//			this.prNumber = this.getOwnerComponent().getComponentData().startupParameters.id[0];
			this._PoNumber = oEvent.getParameter("arguments").sId;
			this._sId      = "/GRHEADERSet('"+  oEvent.getParameter("arguments").sId +  "')";
			this.getView().bindElement(this._sId);
			
			var oMdl = this.getOwnerComponent().getModel();
			oMdl.read(this._sId,{
				success : function(oData) {
					this.lModel.setData(oData);
					this._PrNumber = oData.Preq_no;
					var GrItemLength = oData.navtogritem.results.length;
					if(GrItemLength === 0){
						this.getView().byId('idSubmit').setVisible(false);
					}
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
		
		handleSubmit: function(oEvent){
			var sDocType = this.lModel.getData().DocType;
			if(sDocType === '9'){
				var sSOlength = this.SOmodel.getProperty("/POservices").length;
				if(sSOlength == 0){
					var sAlert = this.getResourceBundle().getText("PleaseSelectSO");
					MessageBox.error(sAlert, {
	  					title : this.getResourceBundle().getText("Error"),
	  				});
				}else{
					this.submitAggrement(oEvent);
				}
			}else{
				this.submitAggrement(oEvent);
			}
		},
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
		_onSubmit: function(oEvent) {
			this.getView().setBusy(true);
			var delItems       = this.lModel.getProperty("/tempDelData");
			var oData          = this.lModel.oData;
			var that           = this;
			var temObj         = {};
			
			temObj.PoNumber    = oData.PoNumber;
			temObj.Vendor      = oData.Vendor;
			temObj.Vendor_name = oData.Vendor_name;
			temObj.Flag        = "C";
			temObj.GrPostDate  = this.getView().byId("idGrCompletionDate").getDateValue();
			temObj.navtogritem = this.lModel.getProperty("/navtogritem/results");
			temObj.naviggrheadertoservices=this.SOmodel.getProperty("/POservices");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/GRHEADERSet",temObj,{
				
				success:function(oData){
					var sMatdocno = oData.Vendor_name;
					var msg = that.getResourceBundle().getText("SubmitSuccess", [sMatdocno]);
					jQuery.sap.require("sap.m.MessageBox");
					that.SOmodel.setProperty("/POservices",[]);
					that.lModel.setProperty("/navtogritem/results",[]);
					sap.m.MessageBox.success(msg,{
						onClose: function(sAction) {
							that.getView().setBusy(false);
							that.getOwnerComponent().getRouter().navTo("goodsReceiptDetailsDisplay",{sId: temObj.PoNumber},	!Device.system.phone);
						}
					});
					that.getOwnerComponent().getModel().refresh();
					
				},
				error:function(oData){
					that.getView().setBusy(false);
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
							title : this.getResourceBundle().getText("Cancel"),
							type : 'Message',
							draggable : true,
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("CancelMsg")
									}),
							beginButton : new sap.m.Button({
								text : this.getResourceBundle().getText("Yes"),
								type : "Accept",
								press : function() {
//									sap.m.MessageToast.show("Submitted");
									this.CancelDialog.close();
									this._CancelYes(oEvent);
								}.bind(this)
							}),
							endButton : new sap.m.Button({
								text : this.getResourceBundle().getText("No"),
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
		
	//Icon tab bar selection 	
		handleIconTabBarSelect:function(oEvent){
			var oModel = this.getView().getModel();
			var icKey = oEvent.getParameter('selectedKey');
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
			}/*else if(icKey == "GR"){
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "ZGOODSRECEIPT", action : "create" },
					  params : { id: this.sId}
					});
			}*/else if(icKey == "IN"){
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "ZINVOICE", action : "create" },
					  params : { id: this._PoNumber}
					});
			}	
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
		},
		
		onServiceItemPress: function(oEvent) {
			this.cntxt = oEvent.getSource().getBindingContext();
			//start - get PO Number and selected PO Item Number
			var oBindContext= this.cntxt;
			var oModel      = oBindContext.getModel();
			var sPath       = oBindContext.getPath();

			this.selectedPONumber     = oModel.getData(sPath).PoNumber;
			var itemIndex             = oBindContext.sPath.split("/")[3];
			this.selectedItemPONumber = oModel.getData(sPath).navtogritem.results[itemIndex].PoItem;
			//end - get PO Number and selected PO Item Number
			
			if (!this.ServiceOrderDialog) {
				this.ServiceOrderDialog = sap.ui.xmlfragment(this.createId("ServiceOrderDetail"),"z_goods_receipt.view.fragment.ServiceOrder",this); 
				this.getView().addDependent(this.ServiceOrderDialog);
			}
			this.ServiceOrderDialog.open();
		},
		
		onServiceOrderClose: function(oEvent){
			oEvent.getSource().getParent().close();
		},
		
		onServiceOrderDialogOpen: function(oEvent){
			var fragmentId = this.getView().createId("ServiceOrderDetail");
			//Display Service Order
			var oServiceTemplate = new sap.m.ColumnListItem({
				cells:[
					new sap.m.Text({ text: "{ShortText}"}),
					new sap.m.Input({ value: "{GrPrice}"}),
					new sap.m.Text({ text: "{FormVal1}%"}),
				]
			});
			
			var ServiceOrderPath = "/GRITEMSSet(PoNumber='"+this.selectedPONumber+"',PoItem='"+this.selectedItemPONumber+"')/navigqrtoservices";

			var ServiceTable = sap.ui.core.Fragment.byId(fragmentId,"id_GR_ServiceOrder");
			ServiceTable.setModel(this.getOwnerComponent().getModel());
			ServiceTable.bindItems({path:ServiceOrderPath, template:oServiceTemplate});
		},
		
		onServiceOrderSave: function(oEvent){
			debugger;
			var fragmentId        = this.getView().createId("ServiceOrderDetail");
			var ServiceOrderTabel = sap.ui.core.Fragment.byId(fragmentId,"id_GR_ServiceOrder");
			 var localModel = this.SOmodel.getProperty("/POservices");
			// complete context data assigned to row
			var contexts          = ServiceOrderTabel.getSelectedContexts();
			var itemsData         = contexts.map(function(c) { return c.getObject(); });
			
			//filter item Data, remove unwanted fields and set Grselect to true
			 for (var x = 0, len = itemsData.length; x < len; x++){
				 itemsData[x].Qrlineitem     = this.selectedItemPONumber;
				 itemsData[x].Grselect       = true;
				 delete itemsData[x].__metadata;
				 delete itemsData[x].__proto__;
				//load the data into local JSON
				 localModel.push(itemsData[x]);
			 }
			 this.onServiceOrderClose(oEvent);
		},
		
	});
		
		return PageController;
});