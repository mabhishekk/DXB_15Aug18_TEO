sap.ui.define( [
		"jquery.sap.global",
		"sap/ui/core/mvc/Controller", 
		"sap/ui/Device",
		"z_pettycash_fi/model/formatter",
		"sap/ui/model/Filter"
	], function (jQuery, Controller, Device, formatter, Filter) {
	"use strict";

	return Controller.extend("z_pettycash_fi.controller.Master", {
		
		formatter : formatter,
		
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		onInit : function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
			/*
			* Navigate to the first item by default only on desktop and tablet (but not phone). 
			* Note that item selection is not handled as it is
			* out of scope of this sample
			*/
			
			if(!Device.system.phone) {
//				this.getOwnerComponent().getRouter().navTo("pettyCashHome", true);
				this.getOwnerComponent().getRouter().navTo("pettyCashDetailsCreate",{sId: "New"}, true);
			}
			
//			if(!Device.system.phone) {
//				this.getOwnerComponent().getRouter()
//					.navTo("pettyCashDetailsDisplay", {sId: 9917000000}, true);				
//			}
		},
		
		onSearchField: function(oEvent) {
			var sSearchItem = oEvent.getSource().getValue();
			
			var sPath1 = "PostingNumber";
			var sOperator1 = "EQ";
			var sValue1 = sSearchItem;
			var oFilter1 = new Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = this.byId("list").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
			
		},
			
		onSelectionChange: function(oEvent) {
//			var sOrderId = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("orderId");
			var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			var oModel = oBindContext.getModel();
			var sPath = oBindContext.getPath();
			var sPostingNumber = oModel.getData(sPath).PostingNumber;
			this.getOwnerComponent().getRouter().navTo("pettyCashDetailsDisplay", {sId: sPostingNumber},!Device.system.phone);
		},

		
		onExit : function () {
			
		},
		
		onAddPettyCash : function (oEvent) {
			this.getView().byId('list').removeSelections();
			this.getOwnerComponent().getRouter().navTo("pettyCashDetailsCreate", {sId: "New"}, !Device.system.phone);
		}
	});

}, /* bExport= */ true);