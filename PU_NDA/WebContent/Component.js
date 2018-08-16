sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device'
], function (UIComponent, ResourceModel, JSONModel, Device) {
	"use strict";

	return UIComponent.extend("z_nda.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the resource and application models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {
			// call overwritten init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);
//			var oModel = new JSONModel("mock/data.json");
//			this.setModel(oModel);
			this.setModel(this.createDeviceModel(), "device");
			this.getModel().iSizeLimit = 300; 
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
			this.setModel(oDeviceModel, "device");
			oDeviceModel.setDefaultBindingMode("OneWay");
//			this.setModel(oDeviceModel, "device");
			return oDeviceModel;
			
		},

	});

});
