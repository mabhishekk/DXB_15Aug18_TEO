sap.ui.define([
	'poChangeApp/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'poChangeApp/model/formatter'
], function (BaseController, cart, JSONModel, Filter, formatter) {
	"use strict";

	return BaseController.extend("poChangeApp.controller.Welcome", {
		onShowPO: function () {
			this.getRouter().navTo("PoMaster");
		}
	});
});