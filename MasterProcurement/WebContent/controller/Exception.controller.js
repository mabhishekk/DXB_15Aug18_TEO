sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Label',
		'sap/m/MessageToast',
		'sap/m/Text',
		'sap/m/TextArea',
		"z_master_fi/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/ui/model/Filter',
		"z_master_fi/model/formatter" 
	], function(Button, Dialog, Label, MessageToast, Text, TextArea, 
			Controller, History, Device, MessageBox, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_master_fi.controller.Exception",{
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
				this.getOwnerComponent().getRouter().getRoute("exception").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._postingId   = oEvent.getParameter("arguments").objectId;
				this._sId         = "/RewardsSet('"+  oEvent.getParameter("arguments").objectId +  "')";
				this.getView().bindElement(this._sId);
				this.getOwnerComponent().getModel().refresh();
				
				var sPettyCashNumber = this._postingId;
				this._DocList(sPettyCashNumber);
			},
							
			onAfterRendering : function() {
				this.getView().getModel().refresh();
			},
			
			_DocList: function(sPettyCashNumber) {
				var oElement = this.getView().byId("idRewardsDoc");
				var oTemplate = new sap.m.StandardListItem({
					title: "{Docfile}"
				});
				var aFilter =[];
				aFilter.push(new Filter("Postingnumber", "EQ", sPettyCashNumber) );
				oElement.bindItems({
					path : "/FilelistSet",
					filters: new Filter(aFilter, true),
					template : oTemplate
				});
				
			},
			
			handleRAPrint: function (oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPath           = sBindingContext.sPath;
				var sPostingNumber  = sBindingContext.getModel().getData(sPath).Postingnumber;
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='RF',appno='" +sPostingNumber+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true); 
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
					this.getOwnerComponent().getRouter().navTo("requestlist", {},true);
				}
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
		});
		return PageController;
});