sap.ui.define([
		"z_vrandnda/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("z_vrandnda.controller.NotFound", {

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