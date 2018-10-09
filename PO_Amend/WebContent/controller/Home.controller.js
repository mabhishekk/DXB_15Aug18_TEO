sap.ui.define([
	'poChangeApp/controller/BaseController',
	'poChangeApp/model/formatter',
	'sap/ui/Device',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (
	BaseController,
	formatter,
	Device,
	Filter,
	FilterOperator) {
	"use strict";

	return BaseController.extend("poChangeApp.controller.Home", {
		formatter : formatter,
		
		onInit : function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
		},
		
		onSelectionChange: function(oEvent){
			this.getOwnerComponent().getModel("globalModel").setData({});
			var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext('poCds');
			var oModel = oBindContext.getModel('poCds');
			var sPurOrdId = oModel.getData(oBindContext.getPath()).ebeln;
			this._router.navTo("poDetail", {id: sPurOrdId}, !Device.system.phone);
		},
		
		onSearchField: function(oEvent){
			var aFilter = [];
			aFilter.push(new Filter("ebeln",  FilterOperator.Contains, this.byId("idPOSearch").getValue()));

			// filter binding
			var oList = this.byId("list");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		}
	});
});