sap.ui.define([
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/ui/model/Filter',
		"z_cc/model/formatter" 
	], function(Controller, History, Device, MessageBox, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_cc.controller.DetailDisplay",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			/**
			 * Called when a controller is instantiated and its View
			 * controls (if available) are already created. Can be used
			 * to modify the View before it is displayed, to bind event
			 * handlers and do other one-time initialization.
			 * 
			 * @memberOf z_pr.app
			 */
			onInit : function() {
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getOwnerComponent().getRouter().getRoute("CreditCardDetailsDisplay").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._sPostingNumber = oEvent.getParameter("arguments").sId;
				this._sId            = "/CreditHeaderSet('"+  oEvent.getParameter("arguments").sId +  "')";
				this.getView().bindElement(this._sId);
				this.getOwnerComponent().getModel().refresh();
				
				var sCreditCardNumber = this._sPostingNumber;
				this._DocList(sCreditCardNumber);
			},
							
			onAfterRendering : function() {
				
			},
			
			_DocList: function(sCreditCardNumber) {
				var oElement = this.getView().byId("idCreditCardDoc");
				var oTemplate = new sap.m.StandardListItem({
					title: "{Docfile}"
				});
				var aFilter =[];
				aFilter.push(new Filter("Postingnumber", "EQ", sCreditCardNumber) );
				oElement.bindItems({
					path : "/FilelistSet",
					filters: new Filter(aFilter, true),
					template : oTemplate
				});
				
			},
			
		/**
		 * Called when the Controller is destroyed. Use this one to
		 * free resources and finalize activities.
		 * 
		 * @memberOf z_pr.app
		 */
		// onExit: function() {
		//
		// }
			
			handleCCEdit: function (oEvent) {
				var sPostingNumber = oEvent.getSource().getBindingContext().getModel().getData(oEvent.getSource().getBindingContext().sPath).Postingnumber;
				this.getOwnerComponent().getRouter()
					.navTo("CreditCardDetailsEdit", 
						{sId: sPostingNumber},
						!Device.system.phone);
			},
			
			handleEditButtonPressed: function() {
				alert("Hello");
			},
			
			onSelectionChange: function (oEvent) {
				if (!this.pressDialog) {
					this.pressDialog = sap.ui.xmlfragment(
							"z_pettycash_fi.view.fragment.PCitems",
							this);
					// to get access to the global
					// model
					this.getView().addDependent(this.pressDialog);
				}
				this.pressDialog.open();
			},
			
			onPCitemsClose : function(oEvent) {
				oEvent.getSource().getParent().close();
			},
			
			onNavBack:function(){
				var sPreviousHash = History.getInstance().getPreviousHash();
				// The history contains a previous
				// entry
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					// There is no history!
					// Naviate to master page
					this.getOwnerComponent().getRouter().navTo("master", {},true);
				}
			},
			
			handleCCPrint: function (oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPath           = sBindingContext.sPath;
				var sPostingNumber  = sBindingContext.getModel().getData(sPath).Postingnumber;
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='CC',appno='" +sPostingNumber+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true); 
			},
			
			onDocSelectionChange: function (oEvent) {
				var oBindContext= oEvent.getSource().getSelectedItem().getBindingContext();
				var oModel      = oBindContext.getModel();
				var sPath       = oBindContext.getPath();
				var sDoknr      = oModel.getData(sPath).Doknr;
				var sSerialno   = oModel.getData(sPath).Serialno;
				var sDocPath    = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" +sDoknr+"',lang='',ndavalue='" +sSerialno+ "')/$value ";
				window.open(sDocPath,true); 
			},
			
			handleWithdraw: function(oEvent) {
				if (!this.WithdrawDialog) {
					this.WithdrawDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Withdraw"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("WithdrawRequest")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Yes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.WithdrawDialog.close();
										this._handleWithdraw(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("No"),
									type : "Reject",
									press : function() {
										this.WithdrawDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.WithdrawDialog);
				}

				this.WithdrawDialog.open();
			},
			
			_handleWithdraw: function(oEvent) {
				var that   = this;
				var temObj = {};
				temObj.Postingnumber = this._sPostingNumber;
				temObj.Flag3         = "C";
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("CcWithdrawSuccess", [sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
					},
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(emsg	);
						debugger;	
						
					}
					
				})
			},
			
			handleDelete: function(oEvent) {
				if (!this.DeleteDialog) {
					this.DeleteDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Delete"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("CancelRequest")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Yes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.DeleteDialog.close();
										this._handleDelete(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("No"),
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
			
			_handleDelete: function(oEvent) {
				var that   = this;
				var temObj = {};
				temObj.Postingnumber = this._sPostingNumber;
				temObj.Flag3         = "D";
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("CcCancelSuccess", [sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
					},
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(emsg	);
						debugger;	
						
					}
					
				})
			},
			
		});
		
		return PageController;
});

//sap.ui.controller("z_pettycash_fi.controller.DetailDisplay", {
//
//	/**
//	 * Called when a controller is instantiated and its View
//	 * controls (if available) are already created. Can be used
//	 * to modify the View before it is displayed, to bind event
//	 * handlers and do other one-time initialization.
//	 * 
//	 * @memberOf z_pr.app
//	 */
//	onInit : function() {
//		this.getView().bindElement("/pcashheaderSet('9917000030')");
//	},
//
//					
//	onAfterRendering : function() {
//		
//	},
//
///**
// * Called when the Controller is destroyed. Use this one to
// * free resources and finalize activities.
// * 
// * @memberOf z_pr.app
// */
//// onExit: function() {
////
//// }
//	
//	handlePCEdit: function (oEvent) {
////		var sProductId = oEvent.getSource().getBindingContext().getProperty("productId");
////		this.getOwnerComponent().getRouter()
////			.navTo("detailEdit");
//		
//		sap.ui.core.UIComponent.getRouterFor(this).navTo("editData");
//	}
//	
//});