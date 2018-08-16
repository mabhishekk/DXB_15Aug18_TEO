sap.ui.define( [
		"jquery.sap.global",
		"poSettleApp/controller/BaseController", 
		"sap/ui/Device",
		"poSettleApp/model/formatter" ,
		
	], function (jQuery, Controller, Device, formatter) {
	"use strict";

	return Controller.extend("poSettleApp.controller.Master", {
		formatter : formatter,
		onInit : function () {
			var pomodel = this.getOwnerComponent().getModel("pom");
			var oList = this.getView().byId("list");
			oList.setModel(pomodel);
			if(this.getOwnerComponent().getModel("device").isPhone)
				this.getOwnerComponent().getRouter().getRoute("masterMobile").attachPatternMatched(this._onRouteMatched, this);
				else
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
			
		},
		
		
		
		_onRouteMatched: function(oEvent) {
			var pomodel = this.getOwnerComponent().getModel("pom");
			var oList = this.getView().byId("list");
			oList.setModel(pomodel);
			
			
		},

		
		onSelectionChange: function(oEvent) {
debugger;var oEvent1 = this.getOwnerComponent().getModel("lModelNav").getProperty("/oEvent1")
			var oBindContext = oEvent1.getSource().getSelectedItem().getBindingContext();
			var oModel = oBindContext.getModel();
			var sPath = oBindContext.getPath();
			var sPOnumber = oModel.getData(sPath).PoNumber;
		
			//debugger;
			this.getOwnerComponent().getRouter().navTo("PO", {id: sPOnumber});
			
		},
		
		
		onSearchField: function(oEvent) { debugger;
			var sSearchItem = oEvent.getSource().getValue();
			
			var sPath1 = "PoNumber";
			var sOperator1 = "EQ";
			var sValue1 = sSearchItem;
			var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = this.byId("list").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
			
		},


	});

}, /* bExport= */ true);