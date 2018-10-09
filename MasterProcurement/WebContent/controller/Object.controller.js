/*global location*/
sap.ui.define([
		"z_master_fi/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"z_master_fi/model/formatter",
		"sap/m/MessageToast"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
        MessageToast
	) {
		"use strict";

		return BaseController.extend("z_master_fi.controller.Object", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
			},
			
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("ZVENDOR_COMPANYSet", {
						Partner :  sObjectId
					});
					this._sObjectId = sObjectId;
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},
			
			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound
			 * @private
			 */
			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					parameters: {
						expand: "partner_identity,partner_bank"
					},
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								// Busy indicator on view should only be set if metadata is loaded,
								// otherwise there may be two busy indications next to each other on the
								// screen. This happens because route matched handler already calls '_bindView'
								// while metadata is loaded.
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
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

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				var oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.Partner,
					sObjectName = oObject.Partner;

				// Everything went fine.
				oViewModel.setProperty("/busy", false);
			},
			
			onEditButtonPress: function(oEvent){
				this.getRouter().navTo("edit", {
					objectId: this._sObjectId
				});
			}

		});

	}
);