sap.ui.define( [
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller", 
	"sap/ui/Device",
	"z_goods_receipt/model/formatter",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
  ], function (jQuery, Controller, Device, formatter, Filter, FilterOperator){
	"use strict";
		return Controller.extend("z_goods_receipt.controller.Master", {
			formatter : formatter,
			onInit : function () {
				var pomodel = this.getOwnerComponent().getModel();
				var oList = this.getView().byId("list");
				oList.setModel(pomodel);
				
				if(this.getOwnerComponent().getModel("device").isPhone)
				this.getOwnerComponent().getRouter().getRoute("masterMobile").attachPatternMatched(this._onRouteMatched, this);
				else
				this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
			},
		
			_onRouteMatched: function(oEvent) {debugger;
				var pomodel = this.getOwnerComponent().getModel();
				var oList = this.getView().byId("list");
				oList.setModel(pomodel);
				try{
					this.poNumber = this.getOwnerComponent().getComponentData().startupParameters.id[0];
				}catch(oEr){
					this.poNumber = "1000000226" ;	
				}
				var startupParameter = this.poNumber;
				var oMidData         = startupParameter.substring(4,7);
				if(oMidData === 'TEO'){
					this.getView().byId("idsgbtn").setSelectedKey("PO");
				}else {
					this.getView().byId("idsgbtn").setSelectedKey("PR");
				}
				this.onSearchField();
			},
		
			onSelectionChange: function(oEvent) {
				debugger;
				var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
				var oModel    = oBindContext.getModel();
				var sPath     = oBindContext.getPath();
				var sPoNumber = oModel.getData(sPath).PoNumber;
				var sNoOfGr   = oModel.getData(sPath).Noofgr;
				if (sNoOfGr === " 0"){
					this.getOwnerComponent().getRouter().navTo("goodsReceiptDetailsCreate", {sId: sPoNumber},!Device.system.phone);
				} else {
					this.getOwnerComponent().getRouter().navTo("goodsReceiptDetailsDisplay",{sId: sPoNumber},!Device.system.phone);
				}
			},
		
			onSearchField: function(oEvent) { debugger;
				var sSerachItem = "";
				var sValue1;
				try{
					var sSearchItem1 = oEvent.getSource().getValue();
					sValue1 = sSearchItem1;
				}catch(oEr){
					sSerachItem = this.poNumber;
					sValue1 = sSerachItem;
				}
				var sPath1 = "PoNumber";
				var sOperator1 = "EQ";
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
				this._getPMFDialog().setFilterSearchCallback(null).setFilterSearchOperator(sap.m.StringFilterOperator.Contains).open();
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