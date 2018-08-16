sap.ui.define( [
		"jquery.sap.global",
		"poAmendApp/controller/BaseController", 
		"sap/ui/Device",
		"poAmendApp/model/formatter" ,
		
	], function (jQuery, Controller, Device, formatter) {
	"use strict";

	return Controller.extend("poAmendApp.controller.Master", {
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
		onAfterRendering: function(){
			//Get the ObjectAttributes placed in the list
	        var oObjectAttributes = $('#list').find('.sapMObjectAttributeDiv');
	        $.each(oObjectAttributes, function(index, item) {
	          var oObjectAttributeID = sap.ui.getCore().byId(oObjectAttributes[index].id);
	          oObjectAttributeID.getAggregation("_textControl").setProperty("maxLines", 10);
	        });
		},
		
		onSelectionChange: function(oEvent) {

			var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			var oModel = oBindContext.getModel();
			var sPath = oBindContext.getPath();
			var sPOnumber = oModel.getData(sPath).PoNumber;
		
			//debugger;
			this.getOwnerComponent().getRouter().navTo("PO", {id: sPOnumber});
			
		},
		
	
		
		onSearchField: function(oEvent) { 
			var sSearchItem = oEvent.getSource().getValue();
			
			var sPath1 = "PoNumber";
			var sOperator1 = "EQ";
			var sValue1 = sSearchItem;
			var oFilter1 = new sap.ui.model.Filter(sPath1, sap.ui.model.FilterOperator.Contains, sValue1);
			
			// get the list items binding
			var oBinding = this.byId("list").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
			
		},


	});

}, /* bExport= */ true);