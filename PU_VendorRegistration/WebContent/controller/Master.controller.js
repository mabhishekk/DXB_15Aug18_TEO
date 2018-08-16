sap.ui.define( [
		"jquery.sap.global",
		"sap/ui/core/mvc/Controller", 
		"sap/ui/Device"
	], function (jQuery, Controller, Device) {
	"use strict";

	return Controller.extend("z_vrandnda.controller.Master", {
		onInit : function () {
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
			
		},
		
		
		onSelectionChange: function(oEvent) {
//			var sOrderId = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("orderId");
			var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			var sPRnumber = oBindContext.getProperty('Lifnr');
			var vendrType  = oBindContext.getProperty('Anred') == "Company"?"VC":"VF";
			this.getOwnerComponent().getRouter().navTo("VendorDisplay", {id: sPRnumber,vType:vendrType});
		},
		
	
		onCreate:function(){
			
			var mdl = this.getOwnerComponent().getModel();
		
			this.getOwnerComponent().getRouter().navTo("master");
			
			
			
			
			
			
		},
		
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