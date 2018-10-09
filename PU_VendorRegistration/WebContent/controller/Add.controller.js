sap.ui.define([
	"z_vrandnda/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	'sap/ui/model/Filter', 
	'sap/ui/model/FilterOperator',
	'sap/m/MessageBox',
	'sap/m/MessagePopover',
	'sap/m/MessagePopoverItem',
	"z_vrandnda/model/formatter",
	'sap/ui/model/json/JSONModel'
], function(BaseController, History, MessageToast, Filter, FilterOperator, 
		MessageBox, MessagePopover, MessagePopoverItem, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("z_vrandnda.controller.Add", {
		formatter: formatter,
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
			this.tempModel = new JSONModel(jQuery.sap.getModulePath("z_vrandnda.json", "/createData.json"));
			this.oVendorId = new JSONModel();
			this.getView().setModel(this.tempModel,'tempModel');
			var sPath          = "/ZPR_CDS_VENDOR_ID";
			var oVendorIdModel = this.getOwnerComponent().getModel('vendorId');
			oVendorIdModel.read(sPath,{
				success : function(oData) {
					this.oVendorId.setData(oData);
				}.bind(this),
				error : function(oError) {
					
				}.bind(this)
			});
		},
		
		onAfterRendering: function(){
			var sCountry = 'AE', oSelectedIndex = 0;
			this.tempModel = new JSONModel(jQuery.sap.getModulePath("z_vrandnda.json", "/createData.json"));
			this._bindRegion(sCountry);
			this._OnCompanyOrFreelancer(oSelectedIndex);
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
		
		onSave: function(oEvent){
			if( this.handleMessagePopoverPress(oEvent)){
				this.getView().setBusy(true);
				var inputData    = jQuery.extend(true, {}, this.tempModel.getProperty('/headerData'));
				if( inputData.Country === 'AE' && inputData.Category == 0){
					var VATlength = inputData.Taxnum.length;
					if (VATlength == 15 || VATlength == undefined || VATlength == 0){
						this._onSave(oEvent);
					}else{
						this.getView().setBusy(false);
						var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.error(
							"\"UAE VAT Number\" contains \"" + VATlength +"\" Digits.\n\It should contain 15 Digits.",
							{
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
					}
				}else{
					this._onSave(oEvent);
				}
			}
		},
		
		_onSave: function(oEvent){
			var oModel                 = this.getOwnerComponent().getModel();
			var that				   = this;
			var oViewModel             = this.getView().getModel('tempModel');
			var inputData              = jQuery.extend(true, {}, oViewModel.getProperty('/headerData'));
			if(inputData.Category === 0){
				inputData.Category = '2';
			}else if(inputData.Category === 1){
				inputData.Category = '1';
			}
			inputData.SalKey2          = 'C';
			inputData.partner_bank     = oViewModel.getProperty('/bankDetails');
			inputData.partner_identity = oViewModel.getProperty('/zvm_identificationSet');
			debugger;
			oModel.create("/ZVENDOR_COMPANYSet",inputData,{
				success:function(oEvnt){
					debugger;
					that.getView().setBusy(false);
					that.getView().getModel().refresh();
					var sText = "Vendor Number: \"" + oEvnt.Partner + "\" has been created. ";
					MessageBox.success(sText, {
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
//					var sText = that.getResourceBundle().getText("vendrCret")
//					MessageBox.error(sText, {
//						title : that.getResourceBundle().getText("Error")
//					});
				}
			})
		},
		
		handleMessagePopoverPress: function (oEvent) {
			var oMessageTemplate = new MessagePopoverItem({
				type: '{type}',
				title: '{title}',
				description: '{description}'	
			});
			var oMessagePopover = new MessagePopover({
				items: {
					path: '/',
					template: oMessageTemplate
				}
			});
//			var aData = this.tempModel.getProperty('/headerData');
			var oViewModel = this.getView().getModel('tempModel');
			var aData      = oViewModel.getProperty('/headerData');
			var oBankDetail= oViewModel.getProperty('/bankDetails');
			var oIdentify  = oViewModel.getProperty('/zvm_identificationSet');
			var aMockMessages = [];;
			var msgItem;
			var errorCount    = 0;
			if( aData.Category == 0){
				if(aData.NameOrg1 == ''){
					msgItem = {type: 'Error',	title: 'Enter Name'};
					aMockMessages.push(msgItem);
					errorCount += 1;
				}
			}else if(aData.Category == 1){
				if(aData.NameOrg1 == ''){
					msgItem = {type: 'Error',	title: 'Enter First Name'};
					aMockMessages.push(msgItem);
					errorCount += 1;
				}
				if(aData.NameOrg2 == ''){
					msgItem = {type: 'Error',	title: 'Enter Last Name'};
					aMockMessages.push(msgItem);
					errorCount += 1;
				}
			}
			if(aData.Akont == ''){
				msgItem = {type: 'Error',	title: 'Select GL account'};
				aMockMessages.push(msgItem);
				errorCount += 1;
			}
			if(aData.Waers == ''){
				msgItem = {type: 'Error',	title: 'Select Currency'};
				aMockMessages.push(msgItem);
				errorCount += 1;
			}
			if(aData.Country == ''){
				msgItem = {type: 'Error',	title: 'Select Country'};
				aMockMessages.push(msgItem);
				errorCount += 1;
			}
			if(aData.City == ''){
				msgItem = {type: 'Warning',	title: 'Enter City'};
				aMockMessages.push(msgItem);
				errorCount += 1;
			}
			if(aData.Email !== ''){
				var email     = aData.Email;
				var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			    if (!email.match(mailregex)) {
			        //alert("Invalid Email");
			    	msgItem = {type: 'Warning',	title: 'Invalid Email'};
					aMockMessages.push(msgItem);
					errorCount += 1;
			    }
			}
			if(oIdentify.length !== 0){
				for(var x=0; x < oIdentify.length; x++){
					if(oIdentify[x].Type === ''){
						msgItem = {type: 'Warning',	title: 'Select ID Type in Identification'};
						aMockMessages.push(msgItem);
						errorCount += 1;
					}else if(oIdentify[x].Idnumber === ''){
						msgItem = {type: 'Warning',	title: 'Enter ID Number in Identification'};
						aMockMessages.push(msgItem);
						errorCount += 1;
					}else{
						var sIdNumber = oIdentify[x].Idnumber;
						var aVendorId = this.oVendorId.getProperty('/results');
						var desc = $.grep( aVendorId, function( n, i ) {
									  return n.idnumber === sIdNumber;
									});
						var stringDesc = JSON.stringify(desc);
						if(desc.length > 0){
							msgItem = {type: 'Error',	title: 'Identification ID Number is already assigned to another Vendor', description: stringDesc};
							aMockMessages.push(msgItem);
							errorCount += 1;
						}
					}
				}
			}
			if(oBankDetail.length !==0){
				for(var x=0; x < oBankDetail.length; x++){
					if(oBankDetail[x].BankCtry === ''){
						msgItem = {type: 'Warning',	title: 'Select Country in Payment Transactions'};
						aMockMessages.push(msgItem);
						errorCount += 1;
					}else if(oBankDetail[x].BankKey === ''){
						msgItem = {type: 'Warning',	title: 'Select Bank Key (Branch Number) in Payment Transactions'};
						aMockMessages.push(msgItem);
						errorCount += 1;
					}else if(oBankDetail[x].BankAcct === ''){
						msgItem = {type: 'Warning',	title: 'Enter Bank Account in Payment Transactions'};
						aMockMessages.push(msgItem);
						errorCount += 1;
					}
				}
			}
			var oModel = new JSONModel();
			oModel.setData(aMockMessages);
			var messagesLength= aMockMessages.length + '';
			this.tempModel.setProperty('/errorData', messagesLength);
			oMessagePopover.setModel(oModel);
			if(errorCount > 0){
				oMessagePopover.toggle(oEvent.getSource());
			}else{
				return true;
			}
			
		}

	});
});