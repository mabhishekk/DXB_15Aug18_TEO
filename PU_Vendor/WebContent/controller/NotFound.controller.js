sap.ui.define([
		"z_vr/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("z_vr.controller.NotFound", {

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