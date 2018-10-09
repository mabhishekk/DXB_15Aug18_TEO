sap.ui.define([
		"sap/ui/core/mvc/Controller",
		'sap/ui/model/Filter', 
		'sap/ui/model/FilterOperator',
	], function (Controller, Filter, FilterOperator) {
		"use strict";

		return Controller.extend("z_vrandnda.controller.BaseController", {
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
					this.getView().byId('idSecondName').setText('');
					this.getView().byId('idSecondName').setRequired(false);
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
					this.getView().byId('idSecondName').setText('Last Name');
					this.getView().byId('idSecondName').setRequired(true);
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
				var oViewModel    = this.getView().getModel('tempModel');
				var aIdentifyData = oViewModel.getProperty('/zvm_identificationSet');
				var pData         = jQuery.extend(true, {}, oViewModel.getProperty('/addIndentification'));
				pData.AddInd      = 'X';  
				aIdentifyData.push(pData);  
				oViewModel.setProperty('/zvm_identificationSet',aIdentifyData);
			},
			
			handleIdentifyDelete: function(oEvent){
				var sPath           = oEvent.getParameter("listItem").getBindingContext('tempModel').getPath();
				var oViewModel      = this.getView().getModel('tempModel');
				var aSelectedData   = oViewModel.getProperty(sPath);                                       // get the all the data of the selected line item
				var aItem           = jQuery.extend(true, {}, aSelectedData);
				if(aItem.AddInd === ''){
					aItem.DelInd        = 'X';                                                                  // set the flag for Delete Indicator
					var aDeleteItemData = oViewModel.getProperty('/IdentifyDeletedItem');
					aDeleteItemData.push(aItem); 
					oViewModel.setProperty('/IdentifyDeletedItem',aDeleteItemData);
				}
				var index           = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
				var aIndentifyData  = oViewModel.getProperty('/zvm_identificationSet'); 
				aIndentifyData.splice(index, 1);
				oViewModel.setProperty('/zvm_identificationSet',aIndentifyData);
			},
			
			handlePaymentAdd: function(oEvent){
				var aPaymentData  = this.tempModel.getProperty('/bankDetails');
				var oViewModel    = this.getView().getModel('tempModel');
				var pData         = jQuery.extend(true, {}, oViewModel.getProperty('/addBankDetails'));
				pData.AddInd      = 'X';  
				aPaymentData.push(pData);  
				oViewModel.setProperty('/bankDetails', aPaymentData);
			},
			
			handlePaymentDelete: function(oEvent){
				var oViewModel      = this.getView().getModel('tempModel');
				var sPath           = oEvent.getParameter("listItem").getBindingContext('tempModel').getPath();
				var aSelectedData   = oViewModel.getProperty(sPath);                                       // get the all the data of the selected line item
				var aItem           = jQuery.extend(true, {}, aSelectedData);
				if(aItem.AddInd === ''){
					aItem.DelInd        = 'X';                                                                  // set the flag for Delete Indicator
					var aDeleteItemData = oViewModel.getProperty('/BankDeletedItem');
					aDeleteItemData.push(aItem); 
					oViewModel.setProperty('/BankDeletedItem',aDeleteItemData);
				}
				var index           = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
				var aIndentifyData  = oViewModel.getProperty('/bankDetails'); 
				aIndentifyData.splice(index, 1);
				oViewModel.setProperty('/bankDetails',aIndentifyData);
			},
			
			onSelectBankCountry: function(oEvent){
				var aSelectedCell   = oEvent.getSource().getParent().getCells();
				var SelectedCountry = aSelectedCell[0].getSelectedKey();
				var oBinding        = oEvent.getSource().getParent().getCells()[1].getBinding('items');
				oBinding.filter([ new Filter([
					new Filter({
						path: 'Banks',
				        operator: FilterOperator.EQ,
				        value1: SelectedCountry
					})
				])]);
			},
		});

	}
);
