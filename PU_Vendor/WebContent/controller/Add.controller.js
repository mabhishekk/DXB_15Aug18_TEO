sap.ui.define([
	"z_vr/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	'sap/ui/model/Filter', 
	'sap/ui/model/FilterOperator',
	'sap/m/MessageBox'
], function(BaseController, History, MessageToast, Filter, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("z_vr.controller.Add", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the add controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Register to the add route matched
			this.getRouter().getRoute("add").attachPatternMatched(this._onRouteMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		_onRouteMatched: function() {
			// register for metadata loaded events
			var oModel = this.getModel();
			oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		
		_onMetadataLoaded: function () {
			// create default properties
			this.tempModel = new sap.ui.model.json.JSONModel("./json/createData.json");
			this.getView().setModel(this.tempModel,'tempModel');
		},
		
		onAfterRendering: function(){
			var sCountry = 'AE';
			this._bindRegion(sCountry);
		},
		/**
		 * Event handler for the cancel action
		 * @public
		 */
		onCancel: function() {
			this.onNavBack();
		},

		/**
		 * Event handler for the save action
		 * @public
		 */
		onSave: function() {
			this.getModel().submitChanges();
		},

		/**
		 * Event handler for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function() {
			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			// discard new product from model.
			this.getModel().deleteCreatedEntry(this._oContext);

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				// this is my third commit
				var bReplace = true;
				this.getRouter().navTo("vendorlist", {}, bReplace);
			}
		},
		onVendorType: function(oEvent){
			var oSelectedIndex          = oEvent.getParameter("selectedIndex");
			this._OnCompanyOrFreelancer(oSelectedIndex);
		},
		
		onSelectCountry: function(oEvent){
			var sCountry = oEvent.getSource().getSelectedKey();
			this._bindRegion(sCountry);
		},
		
		onSelectTableCountry: function(oEvent){
			var aSelectedCell   = oEvent.getSource().getParent().getCells();
			var SelectedCountry = aSelectedCell[6].getSelectedKey();
			var oBinding        = oEvent.getSource().getParent().getCells()[7].getBinding('items');
			oBinding.filter([ new Filter([
				new Filter({
					path: 'Bland',
			        operator: FilterOperator.EQ,
			        value1: SelectedCountry
				})
			])]);
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
		
		onSelectBankKey: function(oEvent){
			var aSelectedCell   = oEvent.getSource().getParent().getCells();
			var sBank           = oEvent.oSource.getSelectedItem().getBindingContext().getObject().Banka;
			aSelectedCell[4].setValue(sBank);
		},
		
		onSelectTableType: function(oEvent){
//			debugger;
//			var aSelectedCell   = oEvent.getSource().getParent().getCells();
//			var sText           = aSelectedCell[0].getSelectedItem().getBindingContext().getObject().Text;
//			aSelectedCell[1].setText(sText);
		},
		
		handleDelete: function(oEvent){
			var sPath           = oEvent.getParameter("listItem").getBindingContext('tempModel').getPath();
			var index           = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aIndentifyData  = this.tempModel.getProperty('/zvm_identificationSet'); 
			aIndentifyData.splice(index, 1);
			this.tempModel.setProperty('/zvm_identificationSet',aIndentifyData);
		},
		
		onSave: function(oEvent){
			this.getView().setBusy(true);
			var oModel                 = this.getOwnerComponent().getModel();
			var that				   = this;
			var inputData              = jQuery.extend(true, {}, this.tempModel.getProperty('/headerData'));
			if(inputData.Category === 0){
				inputData.Category = '2';
			}else if(inputData.Category === 1){
				inputData.Category = '1';
			}
			inputData.SalKey2          = 'C';
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
});