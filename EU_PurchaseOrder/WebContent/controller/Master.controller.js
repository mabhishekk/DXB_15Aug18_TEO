sap.ui.define( [
		"jquery.sap.global",
		"zpo_userapp/controller/BaseController", 
		"sap/ui/Device",
		"zpo_userapp/model/formatter" ,
		
	], function (jQuery, Controller, Device, formatter) {
	"use strict";

	return Controller.extend("zpo_userapp.controller.Master", {
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
		
		
		
		_onRouteMatched: function(oEvent) {debugger;
			var pomodel = this.getOwnerComponent().getModel("pom");
			var oList = this.getView().byId("list");
			oList.setModel(pomodel);
			
			try{
				this.prNumber = this.getOwnerComponent().getComponentData().startupParameters.id[0];
			}catch(oEr){
				this.prNumber = "1000000226" ;	
				
			}
			this.getView().byId("idsgbtn").setSelectedKey("PR");
			this.onSearchField();
		},

		
		onSelectionChange: function(oEvent) {
debugger;
			var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			var oModel = oBindContext.getModel();
			var sPath = oBindContext.getPath();
			var sPOnumber = oModel.getData(sPath).PoNumber;
		
			//debugger;
			this.getOwnerComponent().getRouter().navTo("PO", {id: sPOnumber});
			
		},
		
		
		onSearchField: function(oEvent) { debugger;
		var sSerachItem = "";
		var sValue1;
		
		try{
			var sSearchItem1 = oEvent.getSource().getValue();
			sValue1 = sSearchItem1;
		}catch(oEr){
			sSerachItem = this.prNumber;
			sValue1 = sSerachItem;
			
		}
			
			var sPath1 = "PoNumber";
			var sOperator1 = "EQ";
			//var sValue1 = this.prNumber;
			var sPath2 = "Ind";
			var sOperator2 = "EQ";
			var sValue2 = this.getView().byId("idsgbtn").getSelectedKey();
			var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			var oFilter2 = new sap.ui.model.Filter(sPath2, sOperator2, sValue2);
			
			// get the list items binding
			var oBinding = this.byId("list").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter([oFilter1, oFilter2], true);
			
			
			
		},
		handlePRMFilterPress: function () {
			this._getPMFDialog()
				.setFilterSearchCallback(null)
				.setFilterSearchOperator(sap.m.StringFilterOperator.Contains)
				.open();
		},
		
		
		handleClosePopoverPress: function (oEvent) {
			this._oPRMFilterPopover.close();
		},
		handlePRMCreateFormPress: function (oEvent) {
			this.byId("list").removeSelections()
			 this.getOwnerComponent().getRouter().navTo("master");
		},
		
		/*onNavButtonPress:function(oEvent){
			
			this.goBackHistory();
			
		},*/
		
		onExit : function () {
			if (this._oPRMFilterPopover) {
				this._oPRMFilterPopover.destroy();
			};
			if (this._PRMGroupPopover) {
				this._PRMGroupPopover.destroy();
			}
		},
	});

}, /* bExport= */ true);