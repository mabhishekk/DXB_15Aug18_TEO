/*global location*/
sap.ui.define([
		"z_vr/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"z_vr/model/formatter",
		"sap/m/MessageToast",
		'sap/ui/model/Filter', 
		'sap/ui/model/FilterOperator',
		'sap/m/MessageBox'
	], function (BaseController,JSONModel, History,	formatter, MessageToast, Filter, FilterOperator, MessageBox) {
		"use strict";

		return BaseController.extend("opensap.manageproducts.controller.Edit", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the edit controller is instantiated.
			 * @public
			 */
			
			onInit: function() {
				// Register to the add route matched
				this.getRouter().getRoute("edit").attachPatternMatched(this._onRouteMatched, this);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			_onRouteMatched: function(oEvent) {
				this._PartnerNo = oEvent.getParameter("arguments").objectId;
				this._sId       = "/ZVENDOR_COMPANYSet('"+  this._PartnerNo +  "')";
				this.getView().bindElement(this._sId);
				
				this.tempModel = new sap.ui.model.json.JSONModel("./json/createData.json");
				this.getView().setModel(this.tempModel,'tempModel');
				
				var oMdl = this.getOwnerComponent().getModel();
				oMdl.read(this._sId,{
					success : function(oData) {
						this.tempModel.setProperty('/headerData', oData);
						this._bindRegion(oData.Country);
						this.tempModel.setProperty('/zvm_identificationSet', oData.partner_identity.results);
						this.tempModel.setProperty('/bankDetails',            oData.partner_bank.results);
						this._bindView(oData.Category);
					}.bind(this),
					error : function(oError) {
						this.getRouter().getTargets().display("objectNotFound");
					}.bind(this),
					urlParameters : {
						"$expand" : "partner_identity,partner_bank"
					}
				});
			},
			
			_onMetadataLoaded: function () {
				// create default properties
				this.tempModel = new sap.ui.model.json.JSONModel("./json/createData.json");
				this.getView().setModel(this.tempModel,'tempModel');
				
			},
			
			_bindView: function (sCategory){
				var oSelectedIndex = formatter.VendorIndex(sCategory);
				this._OnCompanyOrFreelancer(oSelectedIndex);
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
					this.getRouter().navTo("object", {
						objectId: this._PartnerNo
					});
				}
			},
			
			onSave: function(oEvent){
//				this.getView().setBusy(true);
				var oModel                 = this.getOwnerComponent().getModel();
				var that				   = this;
				var inputData              = jQuery.extend(true, {}, this.tempModel.getProperty('/headerData'));
				inputData.SalKey2          = 'U';
				inputData.partner_bank     = this.tempModel.getProperty('/bankDetails');
				inputData.partner_identity = this.tempModel.getProperty('/zvm_identificationSet');
				debugger;
				oModel.create("/ZVENDOR_COMPANYSet",inputData,{
					success:function(oEvnt){
						debugger;
						that.getView().setBusy(false);
						that.getView().getModel().refresh();
						var sText = that.getResourceBundle().getText("vendrCret")+ oEvnt.Partner;
						MessageBox.success(oEvnt.Partner, {
							onClose: function(){
								that.getRouter().navTo("object", {
									objectId: oEvnt.Partner
								});
							}
						});
					},
					error:function(oEvnt){
						debugger;
						that.getView().setBusy(false);
						var sText = that.getResourceBundle().getText("vendrCret")
						MessageBox.error(sText, {
							title : that.getResourceBundle().getText("Error")
						});
					}
				})
			}
			
		});

	}
);