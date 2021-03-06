sap.ui.controller("z_inbox.controller.welcome", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf prinbox.app
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf prinbox.app
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf prinbox.app
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf prinbox.app
*/
//	onExit: function() {
//
//	}
	onNavBack: function() {
		this.getOwnerComponent().getRouter().navTo("master", {},true);
//		var sPreviousHash = sap.ui.core.routing.History.getInstance().getPreviousHash();
//		// The history contains a previous entry
//		if (sPreviousHash !== undefined) {
//			history.go(-1);
//		} else {
//			// There is no history!
//			// Navigate to master page
//			this.getOwnerComponent().getRouter().navTo("master", {},true);
//		}
	}
});