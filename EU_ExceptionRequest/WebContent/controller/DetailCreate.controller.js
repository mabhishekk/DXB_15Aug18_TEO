sap.ui.define([
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"providenta/fi/rewards/model/formatter",
		"providenta/fi/rewards/controller/BaseController"
	], function(History, Device, MessageBox, formatter, Controller){
		"use strict";
		
		var PageController = Controller.extend("providenta.fi.rewards.controller.DetailCreate",{
			formatter : formatter,
			
			onInit: function() {
				this.lModel = new sap.ui.model.json.JSONModel();
				var tbl = this.getView().byId("id_excTbl");
				tbl.setModel(this.lModel);
				var tbData = {
					"navtoitem_rewards" : [
					]
				};
				this.lModel.setData(tbData);
				
				this.docModel = new sap.ui.model.json.JSONModel();
				var docTbl    = this.getView().byId("id_docMnts");
				docTbl.setModel(this.docModel);
				var tableDocData = {"navigrewardstodocuments" : []};
				this.docModel.setData(tableDocData);
				
				this.byId("idRA_date").setDateValue(new Date());
			},
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onAfterRendering : function() {
				var sUserName = this.getView().byId("idRA_benificiaryName");
				sUserName.bindElement("/loginuserSet('')");
				
				var cmCC = this.getView().byId("idRA_dept");
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
				
//			  var sPath1   = "Land1";
//			  var sOperator1 = "EQ";
//			  var sValue1    = "AE";
//			  var oFilter1   = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
//
//			  // get the list items binding
//			  var oBinding = this.byId("idRA_region").getBinding("items");
//
//			  //Apply filter(s)
//			  oBinding.filter(oFilter1);
			},
		
			onCurrencyInput: function(oEvent) {
				var oVal = oEvent.getSource().getValue();
				if (oVal === "") {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				} else {
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				}
			},
			
			onCountrySelection: function(oEvent) {
				var sCountryKey = oEvent.getSource().getSelectedKey();
//				var sPath = "/RegionSet/?$filter=Land1 eq '"+sCountryKey+"'";
//				this.getView().byId("idRA_region").bindItems(sPath,
//						new sap.ui.core.ListItem({
//							key : "{Herbl}",
//							text : "{BEZEI}"
//						}))
				
				  var sPath1 = "Land1";
				  var sOperator1 = "EQ";
				  var sValue1 = sCountryKey;
				  var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);

				  // get the list items binding
				  var oBinding = this.byId("idRA_region").getBinding("items");

				  //Apply filter(s)
				  oBinding.filter(oFilter1);
			},
		
		handleRewardsSave: function(oEvent) {
			var sListItems      = this.lModel.getProperty("/navtoitem_rewards").length;
			var sEmptyItemError = this.getResourceBundle().getText("EcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sEmptyItemError);
			} else {
				this._SaveRewards(oEvent);
			}
		},
			
		_SaveRewards: function(oEvent) {
			this.getView().setBusy(true);
			var oUserName     = this.getView().byId('idRA_benificiaryName');
			var sPathUserName = oUserName.getBindingContext().sPath;
			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			
			var that            = this;
			var temObj          = {};
			temObj.Accountant   = sUserid;
			temObj.Documentdate = this.getView().byId("idRA_date").getDateValue(); 
			temObj.Hnetamount   = parseFloat(this.getView().byId("idECtotalAmt").getText()).toString();
			temObj.Currency     = "AED";
			temObj.Kostl        = this.getView().byId("idRA_dept").getSelectedKey();
			temObj.Beneficiary  = this.getView().byId('idRA_benificiaryName').getSelectedKey(); ;
			temObj.Char3        = this.getView().byId("idRA_purpose").getValue();
			temObj.Reason       = this.getView().byId("idRA_reason").getValue();
			temObj.Flag3        = "I";
			temObj.navtoitem_rewards       = this.lModel.getProperty('/navtoitem_rewards')
			temObj.navigrewardstodocuments = this.docModel.getProperty("/navigrewardstodocuments");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/RewardsSet",temObj,{
				
				success:function(oData){
					that.getView().setBusy(false);
					var sPostingNumber = oData.Postingnumber;
					var msg = that.getResourceBundle().getText("RaSaveSuccess",[sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg, {
						onClose: function(){
							that.getOwnerComponent().getRouter().navTo("RewardsAppreciationDetailsDisplay",{sId: sPostingNumber}, true);
						}
					});
					that.getView().byId("idRA_currency").setSelectedKey('AED');
//					that.getView().byId("idRA_PObox").setValue('');
					that.getView().byId("idRA_purpose").setValue('');
					that.getView().byId("idRA_reason").setValue('');
					that.getView().byId("idRA_benificiaryName").setValue('');
					that.getView().byId("idRA_amount").setValue('');
					that.getView().byId("idRA_date").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
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
		
		handleRewardsSaveAndSubmit: function(oEvent){
			var sListItems      = this.lModel.getProperty("/navtoitem_rewards").length;
			var sEmptyItemError = this.getResourceBundle().getText("EcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sEmptyItemError);
			} else {
				this._SaveSubmitRewards(oEvent);
			}
		},
			
		_SaveSubmitRewards: function(oEvent) {
			this.getView().setBusy(true);
			var oUserName     = this.getView().byId('idRA_benificiaryName');
			var sPathUserName = oUserName.getBindingContext().sPath;
			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			
			var that= this;
			var temObj = {};
			temObj.Accountant   = sUserid;
			temObj.Documentdate = this.getView().byId("idRA_date").getDateValue(); 
			temObj.Hnetamount   = parseFloat(this.getView().byId("idECtotalAmt").getText()).toString();
			temObj.Currency     = "AED";
			temObj.Kostl        = this.getView().byId("idRA_dept").getSelectedKey();
			temObj.Beneficiary  = this.getView().byId('idRA_benificiaryName').getSelectedKey(); ;
			temObj.Char3        = this.getView().byId("idRA_purpose").getValue();
			temObj.Reason        = this.getView().byId("idRA_reason").getValue();
			temObj.Flag3        = "I";
			temObj.Wfsubmit     = "X";
			temObj.navtoitem_rewards       = this.lModel.getProperty('/navtoitem_rewards')
			temObj.navigrewardstodocuments = this.docModel.getProperty("/navigrewardstodocuments");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/RewardsSet",temObj,{
				
				success:function(oData){
					that.getView().setBusy(false);
					var sPostingNumber = oData.Postingnumber;
					var msg = that.getResourceBundle().getText("RaSubmitSuccess",[sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg, {
						onClose: function(){
							that.getOwnerComponent().getRouter().navTo("RewardsAppreciationDetailsDisplay",{sId: sPostingNumber}, true);
						}
					});
					that.getView().byId("idRA_currency").setSelectedKey('AED');
//					that.getView().byId("idRA_PObox").setValue('');
					that.getView().byId("idRA_purpose").setValue('');
					that.getView().byId("idRA_reason").setValue('');
					that.getView().byId("idRA_benificiaryName").setValue('');
					that.getView().byId("idRA_amount").setValue('');
					that.getView().byId("idRA_date").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
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
		
		handleRewardsCancel: function(oEvent) {
			this.getView().byId("idRA_currency").setSelectedKey('AED');
//			this.getView().byId("idRA_PObox").setValue('');
			this.getView().byId("idRA_purpose").setValue('');
			this.getView().byId("idRA_reason").setValue('');
			this.getView().byId("idRA_amount").setValue('0');
			this.getView().byId("idRA_date").setDateValue(new Date());
			this.getOwnerComponent().getModel().refresh();
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
			// File Upload
			var tablObj          = {};
			var fragmentId       = this.getView().createId("itemsFragment");
			tablObj.Serialno     = (this.docModel.getProperty("/navigrewardstodocuments").length+1).toString();
			var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
			var tblFileInputId   = matrnFile .getId() +'-fu';
			var reader           = new FileReader();
			var tblFileInput     = $.sap.domById(tblFileInputId);
			var tblFile          = tblFileInput.files[0];
			tablObj.Docfile      = tblFile.name;
			tablObj.Mimetype     = tblFile.type;
			var base64marker     = 'data:' + tblFile.type + ';base64,';
			var dArr             = this.docModel.getProperty("/navigrewardstodocuments");
			var that             = this;
			  
			reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64       = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64.toString(); 
					  	dArr.push(tablObj);
					  	that.docModel.setProperty("/navigrewardstodocuments",dArr);
					  	matrnFile.clear();
				  }
			  })();
			  reader.readAsDataURL(tblFile);
		},
		
		handleECaddButtonPressed : function(oEvent) {
			if (!this.pressDialog) {
				this.pressDialog = sap.ui.xmlfragment("providenta.fi.rewards.view.fragment.ECitems", this);
				// to get access to the global
				// model
				this.getView().addDependent(this.pressDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pressDialog);
			}
			this.pressDialog.open();
		},
		
		onItemsClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		onECdialog: function(oEvent) {
			var GLaccount  = sap.ui.getCore().byId("id_ECexpSet");
			var CostCenter = this.getView().byId("idRA_dept").getSelectedKey();
			var sPath1     = "Kostl";
			var sOperator1 = "EQ";
			var sValue1    = CostCenter;
			var oFilter1   = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			// get the list items binding
			var oBinding = sap.ui.getCore().byId("id_ECexpSet").getBinding("items");
			//Apply filter(s)
			oBinding.filter(oFilter1);
		},
		
		onECitemsSave: function(oEvent) {
			var sForeignAmount = sap.ui.getCore().byId("id_ECamt").getValue();
			if( sForeignAmount === ""){
				sap.ui.getCore().byId("id_ECamt").setValueState(sap.ui.core.ValueState.Error);
				sap.ui.getCore().byId("id_AEDamt").setValueState(sap.ui.core.ValueState.Error);
			} else {
				
				var tablObj = {};
				
				tablObj.Glaccount    = sap.ui.getCore().byId("id_ECexpSet").getSelectedKey();
				tablObj.Ltext        = sap.ui.getCore().byId("id_ECexpSet").getSelectedItem().mProperties.text;
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
				
				var lTbl = this.lModel.getProperty("/navtoitem_rewards");
				lTbl.push(tablObj);
				this.lModel.setProperty("/navtoitem_rewards", lTbl);
				
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
			tablObj.Positiontext = sap.ui.getCore().byId("id_ECdesc").setValue('');
			tablObj.Matnr        = sap.ui.getCore().byId("id_ECinvRef").setValue('');
			tablObj.Fgnamount    = sap.ui.getCore().byId("id_ECamt").setValue('');
			tablObj.Currency     = sap.ui.getCore().byId("id_Fcurr").setSelectedKey('AED');
			tablObj.Exrate       = sap.ui.getCore().byId("id_ECexch").setValue('1');
			tablObj.Ppayments    = sap.ui.getCore().byId("id_AEDamt").setValue('');
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
			var NetAmt      = taxableAmt + VatAmount;
			sap.ui.getCore().byId("id_AEDamt").setValue(NetAmt);
		},
		
		handleUECDelete: function(oEvent) {
			var sPath      = oEvent.getParameter('listItem').getBindingContext().getPath();
			var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aItems     = this.lModel.getProperty('/navtoitem_rewards');
			var fAmount    = aItems[index].Ppayments;
			var fNetAmount = parseFloat(this.getView().byId("idECtotalAmt").getText());
				fNetAmount = fNetAmount - fAmount;
			this.byId("idECtotalAmt").setText(fNetAmount + ' AED');	
			aItems.splice(index, 1);
			this.lModel.setProperty('/navtoitem_rewards', aItems);
		},
	});
	return PageController;
});
