sap.ui.define( [
		"jquery.sap.global",
		"sap/ui/core/mvc/Controller", 
		"sap/ui/Device",
		"z_expense_claim/model/formatter" 
	], function (jQuery, Controller, Device, formatter) {
	"use strict";

	return Controller.extend("z_expense_claim.controller.Master", {
		
		formatter : formatter,
		
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		onInit : function () {
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
			/*
			* Navigate to the first item by default only on desktop and tablet (but not phone). 
			* Note that item selection is not handled as it is
			* out of scope of this sample
			*/
			
			if(!Device.system.phone) {
				this.getOwnerComponent().getRouter()
					.navTo("expenseClaimDetailsCreate",{sId: "New"}, true);				
			}
			
//			if(!Device.system.phone) {
//				this.getOwnerComponent().getRouter()
//					.navTo("pettyCashDetailsDisplay", {sId: 9917000000}, true);				
//			}
		},
		onSelectionChange: function(oEvent) {
//			var sOrderId = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("orderId");
			var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			var oModel = oBindContext.getModel();
			var sPath = oBindContext.getPath();
			var sPostingNumber = oModel.getData(sPath).Postingnumber;
			this.getOwnerComponent().getRouter()
				.navTo("expenseClaimDetailsDisplay", 
						{sId: sPostingNumber},
						!Device.system.phone);
		},

		onSearchField: function(oEvent) {
			var sSearchItem = oEvent.getSource().getValue();
			
			var sPath1 = "Postingnumber";
			var sOperator1 = "EQ";
			var sValue1 = sSearchItem;
			var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1,sValue1);
			
			// get the list items binding
			var oBinding = this.byId("list").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
			
		},
		onExit : function () {
			
		},
		
		onAddPettyCash : function (oEvent) {
			this.getView().byId('list').removeSelections();
			this.getOwnerComponent().getRouter()
				.navTo("expenseClaimDetailsCreate", 
					{sId: "New"},
					!Device.system.phone);
		}
	});

}, /* bExport= */ true);