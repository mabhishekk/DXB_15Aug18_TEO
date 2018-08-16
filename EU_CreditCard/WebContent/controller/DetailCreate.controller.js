sap.ui.define([
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_cc/model/formatter" ,
		"z_cc/controller/BaseController"
	], function(History, Device, MessageBox, formatter, Controller){
		"use strict";
		
		var PageController = Controller.extend("z_cc.controller.DetailCreate",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit : function() {
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.lModel = new sap.ui.model.json.JSONModel();
				var tbl = this.getView().byId("idCreditTable");
				tbl.setModel(this.lModel);
				var tbData = {
					"navtocredit" : [
					]
				};
				this.lModel.setData(tbData);
				
				this.docModel = new sap.ui.model.json.JSONModel();
				var docTbl    = this.getView().byId("id_docMnts");
				docTbl.setModel(this.docModel);
				var tableDocData = {"navigcredittodocuments" : []};
				this.docModel.setData(tableDocData);
				
				this.byId("idCCdate").setDateValue(new Date());
			},
			
		onAfterRendering : function() {
			var sUserName = this.getView().byId("idCCusrList");
			sUserName.bindElement("/loginuserSet('')");
			
			var cmCC = this.getView().byId("idCC_dept");
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
		
		onCCdialog: function(oEvent) {
			var GLaccount = sap.ui.getCore().byId("idCCexpSet");
			
			var CostCenter = this.getView().byId("idCC_dept").getSelectedKey();
			
			var sPath1 = "Kostl";
			var sOperator1 = "EQ";
			var sValue1 = CostCenter;
			var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = sap.ui.getCore().byId("idCCexpSet").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
		},
		
		handleCCaddButtonPressed : function(oEvent) {
			if (!this.pressDialog) {
				this.pressDialog = sap.ui.xmlfragment(
						"z_cc.view.fragment.CCitems",
						this);
				// to get access to the global
				// model
				this.getView().addDependent(this.pressDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pressDialog);
			}
			this.pressDialog.open();
		},
		
		onCurrencyInput: function(oEvent) {
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			this._calculateNetAmount();
		},
		
		onCurrencySelection: function(oEvent){
			var oCurrency = oEvent.getSource().getSelectedKey();
			this._onCurrencyExch(oCurrency);
			this._calculateNetAmount();
		},
		
		onExVatVal: function(oEvent){
			this._calculateNetAmount();
		},
		
		_onCurrencyExch:  function(Currency){
			if (Currency === "USD"){
				sap.ui.getCore().byId("id_CCexch").setValue("3.675");
				sap.ui.getCore().byId("id_ccVATno").setSelectedKey('0');
				sap.ui.getCore().byId('idCCvatLabel').setVisible(false);
				sap.ui.getCore().byId("id_ccVATno").setVisible(false);
				sap.ui.getCore().byId('idCCexchRateLabel').setVisible(true);
				sap.ui.getCore().byId("id_CCexch").setVisible(true);
			} else if (Currency === "AED") {
				sap.ui.getCore().byId("id_CCexch").setValue("1.00");
				sap.ui.getCore().byId('idCCvatLabel').setVisible(true);
				sap.ui.getCore().byId("id_ccVATno").setVisible(true);
				sap.ui.getCore().byId('idCCexchRateLabel').setVisible(false);
				sap.ui.getCore().byId("id_CCexch").setVisible(false);
			} else {
				sap.ui.getCore().byId("id_ccVATno").setSelectedKey('0');
				sap.ui.getCore().byId('idCCvatLabel').setVisible(false);
				sap.ui.getCore().byId("id_ccVATno").setVisible(false);
				sap.ui.getCore().byId('idCCexchRateLabel').setVisible(true);
				sap.ui.getCore().byId("id_CCexch").setVisible(true);
			}
		},
		
		_calculateNetAmount: function(){
			var sFCamount   = sap.ui.getCore().byId("idCCamt").getValue();
			var sFCcurrency = sap.ui.getCore().byId("id_Fcurr").getSelectedKey();
			var sExhRate    = sap.ui.getCore().byId("id_CCexch").getValue();
			var sAEDamount  = sap.ui.getCore().byId("id_AEDamt").getValue();
			var sVatPercent = sap.ui.getCore().byId("id_ccVATno").getSelectedKey();
			var taxableAmt  = Math.round(sFCamount*sExhRate*100) / 100;
			var VatAmount   = taxableAmt * sVatPercent/100;
			var NetAmt      = taxableAmt + VatAmount;
			sap.ui.getCore().byId("id_AEDamt").setValue(NetAmt);
		},
		
		onECitemsClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		onECitemsSave: function(oEvent) {
			var sForeignAmount    = sap.ui.getCore().byId("idCCamt").getValue();
			var sJustification    = sap.ui.getCore().byId("idCCJustPur").getValue();
			if (sForeignAmount === "") {
				sap.ui.getCore().byId("idCCamt").setValueState(sap.ui.core.ValueState.Error);
			} else if (sJustification === "") {
				sap.ui.getCore().byId("idCCJustPur").setValueState(sap.ui.core.ValueState.Error);
			} else {
			var tablObj = {};
			
			tablObj.Purchdate    = sap.ui.getCore().byId("idCCpurchaseDate").getDateValue();
			tablObj.Glaccount    = sap.ui.getCore().byId("idCCexpSet").getSelectedKey();
			tablObj.Ltext        = sap.ui.getCore().byId("idCCexpSet").getSelectedItem().mProperties.text;
//			tablObj.Kostl        = sap.ui.getCore().byId("idCCexpSet").getValue();
			tablObj.Positiontext = sap.ui.getCore().byId("idCCitem").getValue();
			tablObj.Vendor       = sap.ui.getCore().byId("idCCvendor").getValue();
			tablObj.Fgnamount    = sForeignAmount;
			tablObj.Currency     = sap.ui.getCore().byId("id_Fcurr").getSelectedKey();
			tablObj.Exrate       = sap.ui.getCore().byId("id_CCexch").getValue();
			tablObj.Taxvalue     = sap.ui.getCore().byId("id_ccVATno").getSelectedKey();
			tablObj.Ppayments    = sap.ui.getCore().byId("id_AEDamt").getValue();
			tablObj.Justification= sap.ui.getCore().byId("idCCJustPur").getValue();
			
			if (tablObj.Ppayments){
				tablObj.Ppayments  = parseFloat(tablObj.Ppayments).toFixed(2);
			} else {
				tablObj.Ppayments  = 0;
			}
			
			var lTbl = this.lModel.getProperty("/navtocredit");
			lTbl.push(tablObj);
			this.lModel.setProperty("/navtocredit", lTbl);
			
			oEvent.getSource().getParent().close();
			
			var iTotalAmount = this.byId("eCCnetAmnt").getText();
			if (iTotalAmount === "0 AED"){
				iTotalAmount = tablObj.Ppayments;
			} else {
				iTotalAmount = parseFloat(iTotalAmount) + parseFloat(tablObj.Ppayments);
			}
			iTotalAmount = parseFloat(iTotalAmount).toFixed(2);
			this.byId("eCCnetAmnt").setText(iTotalAmount + ' AED');
			
			this._clearDialogue();
			}
		},
		
		_clearDialogue: function() {
			sap.ui.getCore().byId("idCCpurchaseDate").setDateValue(new Date());
			sap.ui.getCore().byId("idCCexpSet").setSelectedKey('');
//			sap.ui.getCore().byId("idCCexpSet").getValue();
			sap.ui.getCore().byId("idCCitem").setValue('');
			sap.ui.getCore().byId("idCCvendor").setValue('');
			sap.ui.getCore().byId("idCCamt").setValue('');
			sap.ui.getCore().byId("idCCamt").setValueState(sap.ui.core.ValueState.None);
			sap.ui.getCore().byId("idCCJustPur").setValue('');
			sap.ui.getCore().byId("idCCJustPur").setValueState(sap.ui.core.ValueState.None);
		},
		
		handleUCCDelete : function(oEvent) {
			var sPath      = oEvent.getParameter('listItem').getBindingContext().getPath();
			var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aItems     = this.lModel.getProperty('/navtocredit');
			var fAmount    = aItems[index].Ppayments;
			var fNetAmount = parseFloat(this.getView().byId("eCCnetAmnt").getText());
				fNetAmount = fNetAmount - fAmount;
			this.byId("eCCnetAmnt").setText(fNetAmount + ' AED');	
			aItems.splice(index, 1);
			this.lModel.setProperty('/navtocredit', aItems);
		},
		
		handleCreditCardSave: function(oEvent) {
			var sListItems       = this.lModel.getProperty("/navtocredit").length;
			var sEmptyItemError  = this.getResourceBundle().getText("CcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sEmptyItemError);
			} else {
				this._onCCsave(oEvent);
			}
		},
		
		_onCCsave: function(oEvent) {
			this.getView().setBusy(true);
			var oUserName     = this.getView().byId('idCCusrList');
			var sPathUserName = oUserName.getBindingContext().sPath;
			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			var that          = this;
			var temObj        = {};
			
			temObj.Documentdate = this.getView().byId("idCCdate").getDateValue(); 
//			temObj.Accountant   = this.getView().byId("idCCusrList").getValue();
			temObj.Accountant   = sUserid;
			temObj.Pernr        = this.getView().byId("idCCusrList").getSelectedKey();
			temObj.Pernrfullname= this.getView().byId("idCCusrList").getSelectedItem().mProperties.text;
			temObj.Kostl        = this.getView().byId("idCC_dept").getSelectedKey();
			temObj.Hnetamount   = parseFloat(this.getView().byId("eCCnetAmnt").getText()).toString();
			temObj.Currency     = "AED";
			temObj.Flag3        = "I";
			temObj.navtocredit  = this.lModel.getProperty("/navtocredit");
			temObj.navigcredittodocuments = this.docModel.getProperty("/navigcredittodocuments");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/CreditHeaderSet",temObj,{
				
				success:function(oData){
					that.getView().setBusy(false);
					var sPostingNumber = oData.Postingnumber;
					var msg = that.getResourceBundle().getText("CcSaveSuccess",[sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg, {
						onClose: function(){
							that.getOwnerComponent().getRouter().navTo("CreditCardDetailsDisplay",{sId: sPostingNumber}, true);
						}
					});
					that.lModel.setProperty("/navtocredit",[]);
//					that.getView().byId("idCCusrList").setValue(oUserName.getProperty("value"));
					that.getView().byId("eCCnetAmnt").setText('0 AED');
					that.getView().byId("idCCdate").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
//					sap.m.MessageToast.show(msg);
//					that.lModel.setProperty("/navtoitem_claim",[]);
//					that.getOwnerComponent().getModel().refresh()
					
				},
				error:function(oData){
					that.getView().setBusy(false);
					var emsg= $(oData.responseText).find("message").first().text();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.error(emsg	);
					debugger;	
					
				}
				
			})
		},
		
		handleCCSaveAndSubmit: function(oEvent) {
			var sListItems       = this.lModel.getProperty("/navtocredit").length;
			var sEmptyItemError  = this.getResourceBundle().getText("CcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sEmptyItemError);
			} else {
				this.submitAggrement(oEvent);
			}
		},
		
		_onCCsaveSubmit: function(oEvent) {
			this.getView().setBusy(true);
			var oUserName     = this.getView().byId('idCCusrList');
			var sPathUserName = oUserName.getBindingContext().sPath;
			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			var that          = this;
			var temObj        = {};
			
			temObj.Documentdate = this.getView().byId("idCCdate").getDateValue(); 
//			temObj.Accountant   = this.getView().byId("idCCusrList").getValue();
			temObj.Accountant   = sUserid;
			temObj.Pernr        = this.getView().byId("idCCusrList").getSelectedKey();
			temObj.Pernrfullname= this.getView().byId("idCCusrList").getSelectedItem().mProperties.text;
			temObj.Kostl        = this.getView().byId("idCC_dept").getSelectedKey();
			temObj.Hnetamount   = parseFloat(this.getView().byId("eCCnetAmnt").getText()).toString();
			temObj.Currency     = "AED";
			temObj.Flag3        = "I";
			temObj.Wfsubmit     = "X";
			temObj.navtocredit  = this.lModel.getProperty("/navtocredit");
			temObj.navigcredittodocuments = this.docModel.getProperty("/navigcredittodocuments");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/CreditHeaderSet",temObj,{
				
				success:function(oData){
					that.getView().setBusy(false);
					var sPostingNumber = oData.Postingnumber;
					var msg = that.getResourceBundle().getText("CcSubmitSuccess",[sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg, {
						onClose: function(){
							that.getOwnerComponent().getRouter().navTo("CreditCardDetailsDisplay",{sId: sPostingNumber}, true);
						}
					});
					that.lModel.setProperty("/navtocredit",[]);
//					that.getView().byId("idCCusrList").setValue(oUserName.getProperty("value"));
					that.getView().byId("eCCnetAmnt").setText('0 AED');
					that.getView().byId("idCCdate").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
//					sap.m.MessageToast.show(msg);
//					that.lModel.setProperty("/navtoitem_claim",[]);
//					that.getOwnerComponent().getModel().refresh()
					
				},
				error:function(oData){
					that.getView().setBusy(false);
					var emsg= $(oData.responseText).find("message").first().text();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.error(emsg	);
					debugger;	
					
				}
				
			})
		},
		
		onNavBack:function(){
			var sPreviousHash = History.getInstance().getPreviousHash();
			// The history contains a previous
			// entry
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				// There is no history!
				// Naviate to master page
				this.getOwnerComponent().getRouter().navTo("master", {},true);
			}
		},
		handleCreditCancel: function(oEvent) {
			this.lModel.setProperty("/navtocredit",[]);
			this.getView().byId("eCCnetAmnt").setText('0 AED');
			this.getView().byId("idCCdate").setDateValue(new Date());
			this.getView().byId("idCCjustification").setValue('')
			this.getOwnerComponent().getModel().refresh();
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
			  tablObj.Serialno     = (this.docModel.getProperty("/navigcredittodocuments").length+1).toString();
//			  var matrnFile        =sap.ui.core.Fragment.byId(fragmentId, "matrnFile");
			  var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
			  var tblFileInputId   = matrnFile .getId() +'-fu';
			  var reader           = new FileReader();
			  var tblFileInput     = $.sap.domById(tblFileInputId);
			  var tblFile          = tblFileInput.files[0];
			  tablObj.Docfile      = tblFile.name;
			  tablObj.Mimetype     = tblFile.type;
			  var base64marker     = 'data:' + tblFile.type + ';base64,';
			  var dArr             = this.docModel.getProperty("/navigcredittodocuments");
			  var that             = this;
			  
			  reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64       = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64.toString(); 
					  	dArr.push(tablObj);
					  	that.docModel.setProperty("/navigcredittodocuments",dArr);
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
