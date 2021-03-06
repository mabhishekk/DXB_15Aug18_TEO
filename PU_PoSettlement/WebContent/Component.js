sap.ui.define([
	"sap/ui/core/UIComponent",
	'sap/ui/model/json/JSONModel',
	"sap/ui/Device"	
], function(UIComponent, JSONModel,Device) {
	"use strict";

	return UIComponent.extend("poSettleApp.Component", {
		metadata: {
			
			manifest: "json"
		},
		

		
		init: function () {
			// call overwritten init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);
//			var oModel = new JSONModel("mock/data.json");
//			this.setModel(oModel);
			this.setModel(this.createDeviceModel(), "device");

			this.getModel("pom").iSizeLimit = 300;
			UIComponent.prototype.init.apply(this, arguments);

			// Parse the current url and display the targets of the route that matches the hash
			this.getRouter().initialize();

			
		},
		createDeviceModel : function () {
			
			var oDeviceModel = new JSONModel({
				// feature toggle for a save for later functionality in the Cart.view.xml
				isTouch: sap.ui.Device.support.touch,
				isNoTouch: !sap.ui.Device.support.touch,
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
				listMode: (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType: (sap.ui.Device.system.phone) ? "Active" : "Inactive"
			});
			oDeviceModel.setDefaultBindingMode("OneWay");
//			this.setModel(oDeviceModel, "device");
			return oDeviceModel;
			
//			jQuery.sap.require("userPr.model.formatter");
			
		},
		
		
		
		myNavBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this._oRouter.navTo("home", {}, true);
			}
		}

		
		
	});
	});