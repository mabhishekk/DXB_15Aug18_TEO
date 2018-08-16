sap.ui.define( [
		"jquery.sap.global",
		"providentia/pr/controller/BaseController", 
		"sap/ui/Device",
		"providentia/pr/model/formatter" ,
		
	], function (jQuery, Controller, Device, formatter) {
	"use strict";

	return Controller.extend("providentia.pr.controller.Master", {
		formatter : formatter,
		onInit : function () {
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
		},
		
		
		
		_onRouteMatched: function(oEvent) {
			/*
			* Navigate to the first item by default only on desktop and tablet (but not phone). 
			* Note that item selection is not handled as it is
			* out of scope of this sample
			*/
//			if(!Device.system.phone) {
//				this.getOwnerComponent().getRouter()
//					.navTo("orderDetails", {orderId: 0}, true);				
//			}
		},
		onSelectionChange: function(oEvent) {
//			var sOrderId = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("orderId");
			var oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			var oModel       = oBindContext.getModel();
			var sPath        = oBindContext.getPath();
			var sPRnumber    = oModel.getData(sPath).Banfn;
			var Applname     = oModel.getData(sPath).Appstatus;
			var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			
//			if(oBindContext.getProperty("Zrequesttype") == "1")
//				this.getOwnerComponent().getRouter().navTo(Applname, {id: sPRnumber});
//			else
//				this.getOwnerComponent().getRouter().navTo("PR", {id: sPRnumber});
			if(Applname == "PO"){
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "zPurchasingOrder", action : "create" },
					  params : { id: sPRnumber}
					}); 
			}else if(Applname == "GR"){
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "ZGOODSRECEIPT", action : "create" },
					  params : { id: sPRnumber}
					});
			}else if(Applname == "IN"){
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "ZINVOICE", action : "create" },
					  params : { id: sPRnumber}
					});
			}else{
				if(oBindContext.getProperty("Zrequesttype") == "1")
					this.getOwnerComponent().getRouter().navTo(Applname, {id: sPRnumber});
				else
					this.getOwnerComponent().getRouter().navTo("PR", {id: sPRnumber});
			}
		},
		
		
		
		onSearchField: function(oEvent) {
			var sSearchItem = oEvent.getSource().getValue();
			
			var sPath1 = "Banfn";
			var sOperator1 = "EQ";
			var sValue1 = sSearchItem;
			var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = this.byId("list").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
			
		},
		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("userPr.view.fragments.MasterListSettings", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		

		_getPMFDialog : function () {
			if (!this._oPMFDialog) {
				this._oPMFDialog = sap.ui.xmlfragment("userPr.view.fragments.PRMFDialogFilter", this);
				this.getView().addDependent(this._oPMFDialog);
			}
			return this._oPMFDialog;
		},
		handlePRMFilterPress: function () {
			this._getPMFDialog()
				.setFilterSearchCallback(null)
				.setFilterSearchOperator(sap.m.StringFilterOperator.Contains)
				.open();
		},
		
		//Create Group Popover
		handlePRMGroupPress: function (oEvent) {
			// create popover
			if (!this._PRMGroupPopover) {
				this._PRMGroupPopover = sap.ui.xmlfragment("userPr.view.fragments.popover.PRMGroupPopover", this);
				this.getView().addDependent(this._PRMGroupPopover);
//				this._PRMGroupPopover.bindElement("/ProductCollection/0");
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._PRMGroupPopover.openBy(oButton);
			});
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