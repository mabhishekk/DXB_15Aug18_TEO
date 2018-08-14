/*global location*/
sap.ui.define([
		"z_vr/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"z_vr/model/formatter",
		"sap/m/MessageToast"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
        MessageToast
	) {
		"use strict";

		return BaseController.extend("opensap.manageproducts.controller.Object", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler for navigating back.
			 * It checks if there is a history entry. If yes, history.go(-1) will happen.
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();

				if (sPreviousHash !== undefined) {
					// The history contains a previous entry
					history.go(-1);
				} else {
					// Otherwise we go backwards with a forward history
					var bReplace = true;
					this.getRouter().navTo("vendorlist", {}, bReplace);
				}
			},

			

		});

	}
);