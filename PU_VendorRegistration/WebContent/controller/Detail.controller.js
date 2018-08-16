sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("z_vrandnda.controller.Detail", {

		onInit: function (oEvent) {
//
//			// set explored app's demo model on this sample
//			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/supplier.json"));
//			this.getView().setModel(oModel);
//
//			this.getView().bindElement("/SupplierCollection/0");
//
			// Set the initial form to be the display one
			this._showFormFragment("Display");
		},

		onExit : function () {
			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName)) {
					return;
				}

				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		},

		handleEditPress : function () {

			//Clone the data
//			this._oSupplier = jQuery.extend({}, this.getView().getModel().getData().SupplierCollection[0]);
			this._toggleButtonsAndView(true);

		},

		handleCancelPress : function () {

			//Restore the data
//			var oModel = this.getView().getModel();
//			var oData = oModel.getData();
//
//			oData.SupplierCollection[0] = this._oSupplier;
//
//			oModel.setData(oData);
			this._toggleButtonsAndView(false);

		},

		handleSavePress : function () {

			this._toggleButtonsAndView(false);

		},

		_formFragments: {},

		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("VendorEdit").setVisible(!bEdit);
			oView.byId("VendorSave").setVisible(bEdit);
			oView.byId("VendorCancel").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "Change" : "Display");
		},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "z_vrandnda.view.fragments." + sFragmentName);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.getView().byId("idVendorPage");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},
		
		onVRcompany: function (oEvent) {
			var bEditVisible = this.byId("VendorEdit").getVisible();
			if( bEditVisible === true) {
				this.byId("VR_DisplayGeneralInformation").setVisible(true);
				this.byId("VR_DisplayAddress").setVisible(true);
				this.byId("VR_DisplayLicenseDetail").setVisible(true);
				this.byId("VR_DisplayFreelancer").setVisible(false);
			} else {
				this.byId("VR_ChangeGeneralInformation").setVisible(true);
				this.byId("VR_ChangeAddress").setVisible(true);
				this.byId("VR_ChangeLicenseDetail").setVisible(true);
				this.byId("VR_ChangeFreelancer").setVisible(false);
			}
		},
		
		onVRfreelancer: function (oEvent) {
			var bEditVisible = this.byId("VendorEdit").getVisible();
			if( bEditVisible === true) {
				this.byId("VR_DisplayGeneralInformation").setVisible(false);
				this.byId("VR_DisplayAddress").setVisible(false);
				this.byId("VR_DisplayLicenseDetail").setVisible(false);
				this.byId("VR_DisplayFreelancer").setVisible(true);
			} else {
				this.byId("VR_ChangeGeneralInformation").setVisible(false);
				this.byId("VR_ChangeAddress").setVisible(false);
				this.byId("VR_ChangeLicenseDetail").setVisible(false);
				this.byId("VR_ChangeFreelancer").setVisible(true);
			}
		},

	});


	return PageController;

});