sap.ui.define([
		"z_vr/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"z_vr/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageToast"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast) {
		"use strict";

		return BaseController.extend("z_vr.controller.Vendorlist", {
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the add button gets pressed
			 * @public
			 */
			onAddButtonPress: function(oEvent){
				this.getRouter().navTo("add");
			},
			
			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},
			
			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("Lifnr")
				});
			},

		});
	}
);