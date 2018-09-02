sap.ui.define([
		"sap/ui/core/mvc/Controller",
		'sap/ui/model/Filter', 
		'sap/ui/model/FilterOperator',
	], function (Controller, Filter, FilterOperator) {
		"use strict";

		return Controller.extend("z_vr.controller.BaseController", {
			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},

			/**
			 * Convenience method for getting the view model by name.
			 * @public
			 * @param {string} [sName] the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Getter for the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			_OnCompanyOrFreelancer: function (oSelectedIndex){
				var oItemTemplate           = new sap.ui.core.ListItem({
					key           : "{tempModel>key}",
					text          : "{tempModel>text}",
					additionalText: "{tempModel>key}"
				});
				var oIdentificationTemplate = new sap.ui.core.ListItem({
					key           : "{tempModel>Type}",
					text          : "{tempModel>Type}",
					additionalText: "{tempModel>Text}"
				});
				if(oSelectedIndex === 0){
					this.tempModel.setProperty('/headerData/VendorOrCompany','VC');
					this.tempModel.setProperty('/Company', true);
					this.tempModel.setProperty('/Freelancer', false);
					this.getView().byId('idFirstName').setText('Name');
					this.getView().byId('idTitle').bindItems({
						path    : "tempModel>/CompanyTitle",
						template: oItemTemplate
					});
					var aCompanyIdentify = this.tempModel.getProperty('/CompanyIdentification');
					this.tempModel.setProperty('/Identification', aCompanyIdentify);
				}else{
					this.tempModel.setProperty('/headerData/VendorOrCompany','VF');
					this.tempModel.setProperty('/Company', false);
					this.tempModel.setProperty('/Freelancer', true);
					this.getView().byId('idFirstName').setText('First Name');
					this.getView().byId('idTitle').bindItems({
						path: "tempModel>/FreelancerTitle",
						template: oItemTemplate
					});
					var aFreelancerIndentify = this.tempModel.getProperty('/FreelancerIdentification');
					this.tempModel.setProperty('/Identification', aFreelancerIndentify);
				}
			},
			
			_bindRegion: function (sCountry){
				var oBinding        = this.getView().byId("idRegion").getBinding("items");
				oBinding.filter([ new Filter([
					new Filter({
						path: 'Bland',
				        operator: FilterOperator.EQ,
				        value1: sCountry
					})
				])]);
			},
			
			handleIdentifyAdd: function(oEvent){
				var aIdentifyData = this.tempModel.getProperty('/zvm_identificationSet');
				var pData         = jQuery.extend(true, {}, this.tempModel.getProperty('/addIndentification'));
				aIdentifyData.push(pData);  
				this.tempModel.setProperty('/zvm_identificationSet',aIdentifyData);
			},
		});

	}
);
