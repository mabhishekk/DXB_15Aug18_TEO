sap.ui.define([
		"z_master_fi/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("z_master_fi.controller.NotFound", {

			/**
			 * Navigates to the vendorlist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("vendorlist");
			}

		});

	}
);