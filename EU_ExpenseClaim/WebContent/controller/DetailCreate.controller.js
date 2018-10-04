sap.ui.define([
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_expense_claim/model/formatter",
		"z_expense_claim/controller/BaseController"
	], function(History, Device, MessageBox, formatter, Controller){
		"use strict";
		
		var PageController = Controller.extend("z_expense_claim.controller.DetailCreate",{
			
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit: function() {
				this.lModel = new sap.ui.model.json.JSONModel();
				var tbl = this.getView().byId("id_ECexpTbl");
				tbl.setModel(this.lModel);
				var tbData = {
					"navtoitem_claim" : [
					]
				};
				this.lModel.setData(tbData);
				
				this.docModel = new sap.ui.model.json.JSONModel();
				var docTbl    = this.getView().byId("id_docMnts");
				docTbl.setModel(this.docModel);
				var tableDocData = {"navigcliamtodocuments" : []};
				this.docModel.setData(tableDocData);
				
				this.byId("idECdate").setDateValue(new Date());
			},
		
		/**
		 * Called when a controller is instantiated and its View
		 * controls (if available) are already created. Can be used
		 * to modify the View before it is displayed, to bind event
		 * handlers and do other one-time initialization.
		 * 
		 * @memberOf z_pr.app
		 */
		onAfterRendering : function() {
			var sUserName = this.getView().byId("idECname");
			sUserName.bindElement("/loginuserSet('')");
			
			var cmCC = this.getView().byId("id_EC_DP");
			var aFilters = [];

			var lang = sap.ui.getCore().getConfiguration()
					.getLanguage();
			aFilters.push(new sap.ui.model.Filter("Spras",
					sap.ui.model.FilterOperator.EQ, lang));

			cmCC.bindItems("/costcentrelistSet?$filter=Spras eq '"+lang+"'",
					new sap.ui.core.ListItem({
						key : "{Kostl}",
						text : "{Ltext}",
						additionalText : "{Kostl}"
					}));
		},
		
		handleECaddButtonPressed : function(oEvent) {
			if (!this.pressDialog) {
				this.pressDialog = sap.ui.xmlfragment(
						"z_expense_claim.view.fragment.ECitems",
						this);
				// to get access to the global
				// model
				this.getView().addDependent(this.pressDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pressDialog);
			}
			this.pressDialog.open();
		},
		
		onECdialog: function(oEvent) {
			var GLaccount = sap.ui.getCore().byId("id_ECexpSet");
			
			var CostCenter = this.getView().byId("id_EC_DP").getSelectedKey();
			
			var sPath1 = "Kostl";
			var sOperator1 = "EQ";
			var sValue1 = CostCenter;
			var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = sap.ui.getCore().byId("id_ECexpSet").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
		},
		
		onCurrencyInput: function(oEvent) {
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			this._calculateNetAmount();
//			this._onCurrencyExch(sFCcurrency);
//			sap.ui.getCore().byId("id_AEDamt").setValue(Math.round(sFCamount*sExhRate*100) / 100);
		},
		
		onCurrencySelection: function(oEvent){
			var oCurrency = oEvent.getSource().getSelectedKey();
			this._onCurrencyExch(oCurrency);
			this._calculateNetAmount();
//			var sFCamount   = sap.ui.getCore().byId("id_ECamt").getValue();
//			var sFCcurrency = sap.ui.getCore().byId("id_Fcurr").getSelectedKey();
//			var sExhRate    = sap.ui.getCore().byId("id_ECexch").getValue();
//			sap.ui.getCore().byId("id_AEDamt").setValue(Math.round(sFCamount*sExhRate*100) / 100);
		},
		
		onExVatVal: function(oEvent){
			this._calculateNetAmount();
		},
		
		_onCurrencyExch:  function(Currency){
			if (Currency === "USD"){
				sap.ui.getCore().byId("id_ECexch").setValue("3.675");
				sap.ui.getCore().byId("id_ecVATno").setSelectedKey('0');
				sap.ui.getCore().byId('idECvatLabel').setVisible(false);
				sap.ui.getCore().byId("id_ecVATno").setVisible(false);
				sap.ui.getCore().byId('idECexchRateLabel').setVisible(true);
				sap.ui.getCore().byId("id_ECexch").setVisible(true);
			} else if (Currency === "AED") {
				sap.ui.getCore().byId("id_ECexch").setValue("1.00");
				sap.ui.getCore().byId('idECvatLabel').setVisible(true);
				sap.ui.getCore().byId("id_ecVATno").setVisible(true);
				sap.ui.getCore().byId('idECexchRateLabel').setVisible(false);
				sap.ui.getCore().byId("id_ECexch").setVisible(false);
			} else {
				sap.ui.getCore().byId("id_ecVATno").setSelectedKey('0');
				sap.ui.getCore().byId('idECvatLabel').setVisible(false);
				sap.ui.getCore().byId("id_ecVATno").setVisible(false);
				sap.ui.getCore().byId('idECexchRateLabel').setVisible(true);
				sap.ui.getCore().byId("id_ECexch").setVisible(true);
			}
		},
		
		_calculateNetAmount: function(){
			var sFCamount   = sap.ui.getCore().byId("id_ECamt").getValue();
			var sFCcurrency = sap.ui.getCore().byId("id_Fcurr").getSelectedKey();
			var sExhRate    = sap.ui.getCore().byId("id_ECexch").getValue();
			var sAEDamount  = sap.ui.getCore().byId("id_AEDamt").getValue();
			var sVatPercent = sap.ui.getCore().byId("id_ecVATno").getSelectedKey();
			var taxableAmt  = Math.round(sFCamount*sExhRate*100) / 100;
			var VatAmount   = taxableAmt * sVatPercent/100;
			var NetAmt      = (taxableAmt + VatAmount).toFixed(2);
			sap.ui.getCore().byId("id_AEDamt").setValue(NetAmt);
		},
		
		onItemsClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		onECitemsSave: function(oEvent) {
			var sForeignAmount = Number(sap.ui.getCore().byId("id_ECamt").getValue()).toFixed(2);
			if( sForeignAmount === ""){
				sap.ui.getCore().byId("id_ECamt").setValueState(sap.ui.core.ValueState.Error);
				sap.ui.getCore().byId("id_AEDamt").setValueState(sap.ui.core.ValueState.Error);
			} else {
				
				var tablObj = {};
				
				tablObj.Glaccount    = sap.ui.getCore().byId("id_ECexpSet").getSelectedKey();
				tablObj.Ltext        = sap.ui.getCore().byId("id_ECexpSet").getSelectedItem().mProperties.text;
				tablObj.Vendor       = sap.ui.getCore().byId("id_Vendor").getValue();
				tablObj.Positiontext = sap.ui.getCore().byId("id_ECdesc").getValue();
				tablObj.Matnr        = sap.ui.getCore().byId("id_ECinvRef").getValue();
				tablObj.Fgnamount    = sForeignAmount;
				tablObj.Currency     = sap.ui.getCore().byId("id_Fcurr").getSelectedKey();
				tablObj.Exrate       = sap.ui.getCore().byId("id_ECexch").getValue();
				tablObj.Taxvalue     = sap.ui.getCore().byId("id_ecVATno").getSelectedKey();
				tablObj.Ppayments    = sap.ui.getCore().byId("id_AEDamt").getValue();
				
				if (tablObj.Ppayments){
					tablObj.Ppayments  = parseFloat(tablObj.Ppayments).toFixed(2);
				} else {
					tablObj.Ppayments  = 0;
				}
				
				var lTbl = this.lModel.getProperty("/navtoitem_claim");
				lTbl.push(tablObj);
				this.lModel.setProperty("/navtoitem_claim", lTbl);
				
				oEvent.getSource().getParent().close();
				
				var iTotalAmount = this.byId("idECtotalAmt").getText();
				if (iTotalAmount === "0 AED"){
					iTotalAmount = tablObj.Ppayments;
				} else {
					iTotalAmount = parseFloat(iTotalAmount) + parseFloat(tablObj.Ppayments);
				}
				iTotalAmount = parseFloat(iTotalAmount).toFixed(2);
				this.byId("idECtotalAmt").setText(iTotalAmount + ' AED');
				
				this._clearDialogue();
			}
		},
		
		_clearDialogue: function() {
			var tablObj = {};
			tablObj.Glaccount    = sap.ui.getCore().byId("id_ECexpSet").setSelectedKey('');
//			tablObj.Kostl        = sap.ui.getCore().byId("id_ECexpSet").getValue();
			tablObj.Positiontext = sap.ui.getCore().byId("id_ECdesc").setValue('');
			tablObj.Vendor       = sap.ui.getCore().byId("id_Vendor").setValue('');
			tablObj.Matnr        = sap.ui.getCore().byId("id_ECinvRef").setValue('');
			tablObj.Fgnamount    = sap.ui.getCore().byId("id_ECamt").setValue('');
			tablObj.Currency     = sap.ui.getCore().byId("id_Fcurr").setSelectedKey('AED');
			tablObj.Exrate       = sap.ui.getCore().byId("id_ECexch").setValue('1');
			tablObj.Ppayments    = sap.ui.getCore().byId("id_AEDamt").setValue('');
		},
		
		handleUECDelete: function(oEvent) {
			var sPath      = oEvent.getParameter('listItem').getBindingContext().getPath();
			var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aItems     = this.lModel.getProperty('/navtoitem_claim');
			var fAmount    = aItems[index].Ppayments;
			var fNetAmount = parseFloat(this.getView().byId("idECtotalAmt").getText());
				fNetAmount = fNetAmount - fAmount;
			this.byId("idECtotalAmt").setText(fNetAmount + ' AED');	
			aItems.splice(index, 1);
			this.lModel.setProperty('/navtoitem_claim', aItems);
		},
		
		handleECsave: function(oEvent) {
			var sListItems      = this.lModel.getProperty("/navtoitem_claim").length;
			var sEmptyItemError = this.getResourceBundle().getText("EcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sEmptyItemError);
			} else {
				this._onECsave(oEvent);
			}
		},
		
		handleECsaveAndSubmit: function(oEvent) {
			var sListItems = this.lModel.getProperty("/navtoitem_claim").length;
			var sEmptyItemError = this.getResourceBundle().getText("EcEmptyItemError");
			var these = this;
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sEmptyItemError);
			} else {
				this.submitAggrement(oEvent);
			}
		},
		
		_onECsave: function(oEvent) {
			this.getView().setBusy(true);
			var oUserName     = this.getView().byId('idECname');
			var sPathUserName = oUserName.getBindingContext().sPath;
			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			var that          = this;
			var temObj        = {};
			
//			temObj.Accountant      = this.getView().byId("id_ECusr_List").getValue();
			temObj.Accountant      = sUserid;
			temObj.Hnetamount      = parseFloat(this.getView().byId("idECtotalAmt").getText()).toString();;
//			temObj.Currency        = this.getView().byId("curr").getValue();
			temObj.Documentdate     = this.getView().byId("idECdate").getDateValue();
			temObj.Currency        = "AED";
			temObj.Flag3           = "I";
//			temObj.Flag4           = this.getView().byId("id_EC_BorC").getSelectedIndex().toString();
			temObj.Kostl           = this.getView().byId("id_EC_DP").getSelectedKey();
			temObj.navtoitem_claim = this.lModel.getProperty("/navtoitem_claim");
			temObj.navigcliamtodocuments = this.docModel.getProperty("/navigcliamtodocuments");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/claimHeaderSet",temObj,{
				
				success:function(oData){
					that.getView().setBusy(false);
					var sPostingNumber = oData.Postingnumber;
					var msg            = that.getResourceBundle().getText("EcSaveSuccess",[sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.lModel.setProperty("/navtoitem_claim",[]);
					that.getView().byId("idECname").setText(oUserName.getProperty("text"));
					that.getView().byId("idECtotalAmt").setText('0 AED');
					that.getView().byId("idECdate").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
					that.getOwnerComponent().getRouter().navTo("expenseClaimDetailsDisplay", {sId: sPostingNumber},!Device.system.phone);
//					var msg = "Posting Number : " + sPostingNumber;
//					sap.m.MessageToast.show(msg);
//					that.lModel.setProperty("/navtoitem_claim",[]);
//					that.getOwnerComponent().getModel().refresh()
//					that.getOwnerComponent().getRouter().navTo("expenseClaimDetailsDisplay", {sId: sPostingNumber},true);
					
				},
				error:function(oData){
					that.getView().setBusy(false);
//					var eMsg= $(oData.responseText).find("message").first().text();
					var eMsg = JSON.parse(oData.responseText).error.message.value;
//					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//					jQuery.sap.require("sap.m.MessageBox");
					MessageBox.error(eMsg);
					debugger;	
				}
			})
		},
		
		_onECsaveSubmit: function(oEvent){
			debugger;
			this.getView().setBusy(true);
			var oUserName     = this.getView().byId('idECname');
			var sPathUserName = oUserName.getBindingContext().sPath;
			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			var that          = this;
			var temObj        = {};
			
			temObj.Accountant      = sUserid;
			temObj.Hnetamount      = parseFloat(this.getView().byId("idECtotalAmt").getText()).toString();;
			temObj.Documentdate    = this.getView().byId("idECdate").getDateValue();
			temObj.Currency        = "AED";
			temObj.Flag3           = "I";
			temObj.Wfsubmit        = "X";
			temObj.Kostl           = this.getView().byId("id_EC_DP").getSelectedKey();
			temObj.navtoitem_claim = this.lModel.getProperty("/navtoitem_claim");
			temObj.navigcliamtodocuments = this.docModel.getProperty("/navigcliamtodocuments");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/claimHeaderSet",temObj,{
				
				success:function(oData){
					that.getView().setBusy(false);
					var sPostingNumber = oData.Postingnumber;
					var msg            = that.getResourceBundle().getText("EcSubmitSuccess",[sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.lModel.setProperty("/navtoitem_claim",[]);
					that.getView().byId("idECname").setText(oUserName.getProperty("text"));
					that.getView().byId("idECtotalAmt").setText('0 AED');
					that.getView().byId("idECdate").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
					that.getOwnerComponent().getRouter().navTo("expenseClaimDetailsDisplay", {sId: sPostingNumber},!Device.system.phone);
				},
				error:function(oData){
					that.getView().setBusy(false);
//					var eMsg= $(oData.responseText).find("message").first().text();
					var eMsg = JSON.parse(oData.responseText).error.message.value;
//					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//					jQuery.sap.require("sap.m.MessageBox");
					MessageBox.error(eMsg);
					debugger;	
				}
			})
		},
		
		handleECcreateCancel : function(oEvent) {
//			jQuery.sap.require("sap.m.MessageBox");
//			sap.m.MessageBox.confirm(
//					"Are you sure you want to Cancel?", {
//						icon : sap.m.MessageBox.Icon.WARNING,
//						title : "Cancel",
//					});
			this.lModel.setProperty("/navtoitem_claim",[]);
			this.getView().byId("idECtotalAmt").setText('0 AED');
			this.getView().byId("idECdate").setDateValue(new Date());
			this.getOwnerComponent().getModel().refresh();
		},
		
		onNavBack : function() {
			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			// discard new product from model.
//			this.getOwnerComponent().getModel().deleteCreatedEntry(this._oContext);

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getOwnerComponent().getRouter().navTo("master",{}, bReplace);
			}
		},
		
		handleTypeMissmatch : function(oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value;});
			var sSupportedFileTypes = aFileTypes.join(", ");
			MessageToast.show("The file type *." + oEvent.getParameter("fileType") + 
					" is not supported. Choose one of the following types: " +
									sSupportedFileTypes);
		},
		
		/*
		 * 
		 * File Upload */
		
		onFileUpload:function(oEvent){
//			 tablObj.matrnBudExem =sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getValue();
			// File Upload
			var tablObj = {};
			  var fragmentId       = this.getView().createId("itemsFragment");
//			  if(this.sId)
//				  tablObj.PreqItem = (this.lModel.getProperty("/navigcashtodocuments/results").length+1).toString();
//			  else
//				  tablObj.PreqItem = (this.docModel.getProperty("/navigcashtodocuments").length+1).toString();
			  tablObj.Serialno     = (this.docModel.getProperty("/navigcliamtodocuments").length+1).toString();
//			  var matrnFile        =sap.ui.core.Fragment.byId(fragmentId, "matrnFile");
			  var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
			  var tblFileInputId   = matrnFile .getId() +'-fu';
			  var reader           = new FileReader();
			  var tblFileInput     = $.sap.domById(tblFileInputId);
			  var tblFile          = tblFileInput.files[0];
			  tablObj.Docfile      = tblFile.name;
			  tablObj.Mimetype     = tblFile.type;
			  var base64marker     = 'data:' + tblFile.type + ';base64,';
			  var dArr             = this.docModel.getProperty("/navigcliamtodocuments");
			  var that             = this;
			  
			  reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64       = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64.toString(); 
					  	dArr.push(tablObj);
					  	that.docModel.setProperty("/navigcliamtodocuments",dArr);
					  	matrnFile.clear();
				  }
			  })();
			  reader.readAsDataURL(tblFile);
		},
		handleLiveInput:function(oEvent){
			var oInput           = oEvent.getSource(),
				iValueLength     = oInput.getValue().length,
				iMaxLength       = oInput.getMaxLength(),
				iWarningLength   = iMaxLength - 10,	
				iRemainingLength = iMaxLength - iValueLength,
				sStateText       = this.getResourceBundle().getText("CharactersLeft",[iRemainingLength]),
				sState;
			if (iValueLength > iWarningLength && iValueLength < iMaxLength){
				sState = 'Warning';
			}else if (iValueLength == iMaxLength){
				sState = 'Error';
			}else{
				sState = 'None';
			}
		    
		    oInput.setValueState(sState);
		    oInput.setValueStateText(sStateText);
		}
	});
		
		return PageController;
});
