sap.ui.define([
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_cc/model/formatter",
		"z_cc/controller/BaseController", 
	], function(History, Device, MessageBox, formatter, Controller){
		"use strict";
		
		var PageController = Controller.extend("z_cc.controller.DetailEdit",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			/**
			 * Called when a controller is instantiated and its View
			 * controls (if available) are already created. Can be used
			 * to modify the View before it is displayed, to bind event
			 * handlers and do other one-time initialization.
			 * 
			 * @memberOf z_pr.app
				 */
		onInit : function() {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			this.tempModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.tempModel, "tempModel");
			this.getView().byId("idEditCreditTable").setModel(this.lModel);
			this.getView().byId('idEditPettyCashDoc').setModel(this.lModel);
			this.getOwnerComponent().getRouter().getRoute("CreditCardDetailsEdit").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent) {
			this._CreditCardNo = oEvent.getParameter("arguments").sId;
			this._sId = "/CreditHeaderSet('"+  oEvent.getParameter("arguments").sId +  "')";
			this.getView().bindElement(this._sId);
			
			var oMdl = this.getOwnerComponent().getModel();
			oMdl.read(this._sId,{
				success : function(oData) {
					this.lModel.setData(oData);
					this.lModel.setProperty("/tempDelData",[]);
				}.bind(this),
				error : function(oError) {
					
				}.bind(this),
				urlParameters : {
					"$expand" : "navtocredit"
				}
			});
			
			var sFilter = "Postingnumber eq '" + this._CreditCardNo + "'";
			oMdl.read("/FilelistSet", {success: function(oData){
					var vPath = "/navigcredittodocuments";
					this.lModel.setProperty(vPath, oData.results);
				}.bind(this),
				urlParameters : {
					"$filter" : sFilter
				}
			})
		},
	
		onAfterRendering : function() {

			var cmCC = this.getView().byId("ideCC_dept");
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
	
		onSelection: function(oEvent) {
			this.cntxt = oEvent.getSource().getBindingContext();
			if (!this.ItemDetailDialog) {
				this.ItemDetailDialog = sap.ui.xmlfragment(
						"z_cc.view.fragment.CCeditItems",
						this);
				// to
				this.getView().addDependent(this.ItemDetailDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.ItemDetailDialog);
			}
			// this.prItemDetailDialog.bindElement(cntxt);
			this.ItemDetailDialog.setModel(this.lModel);
			this.tAmnt = this.lModel.getProperty("/Hnetamount");
			this.tAmnt = this.tAmnt - ( this.cntxt.getObject().Ppayments);
			this.ItemDetailDialog.setBindingContext(this.cntxt);
			this.ItemDetailDialog.open();
		},
		
		onEditItemsSave:function(oEvent){
			this.tAmnt = this.tAmnt + parseFloat(this.cntxt.getObject().Ppayments);
			this.lModel.setProperty("/Hnetamount",this.tAmnt);
			this.onItemsClose(oEvent);
		},
		
		onItemsClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		onEditItemsReset: function(oEvent) {
			oEvent.getSource().getParent().close();
			
			var arr = this.cntxt.getPath().split("/");
			var items = this.lModel.getProperty('/navtocredit/results');
			var pInt = parseInt(arr[arr.length - 1]);
		
			if(items[pInt].Itemno){
				var tempDelData = this.lModel.getProperty("/tempDelData");
				var pcData = $.extend(true, {},items[pInt]);
				var temp = {};
				temp.Itemno        = pcData.Itemno;
				temp.Purchdate     = pcData.Purchdate;												
				temp.Kostl         = pcData.Kostl;
				temp.Glaccount     = pcData.Glaccount;
				temp.Positiontext  = pcData.Positiontext;
				temp.Ltext         = pcData.Ltext;
				temp.Ppayments     = pcData.Ppayments;
				temp.Vendor        = pcData.Vendor;
				temp.Justification = pcData.Justification;
				tempDelData.push(temp);
				this.lModel.setProperty("/tempDelData",tempDelData);
			}
			var fAmount    = items[pInt].Ppayments;
			var fNetAmount = parseFloat(this.getView().byId("ideCCnetAmnt").getText());
				fNetAmount = fNetAmount - fAmount;
			this.byId("ideCCnetAmnt").setText(fNetAmount + ' AED');																						
			items.splice(pInt, 1);
			this.lModel.setProperty('/navtocredit/results',items);
			
//			var sPath      = oEvent.getSource().getBindingContext().getPath();
//			var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
//			var aItems     = this.lModel.getProperty('/navtocredit/results');
//			var fAmount    = aItems[index].Ppayments;
//			var fNetAmount = parseFloat(this.getView().byId("ideCCnetAmnt").getText());
//				fNetAmount = fNetAmount - fAmount;
//			this.byId("ideCCnetAmnt").setText(fNetAmount + ' AED');	
//			aItems.splice(index, 1);
//			this.lModel.setProperty('/navtocredit/results', aItems);
//			oEvent.getSource().getParent().close();
		},
		
		handleCCaddButtonPressed: function(oEvent) {
			if (!this.pressDialog) {
				this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
						"z_cc.view.fragment.CCitems",
						this);
				// to get access to the global
				// model
				this.getView().addDependent(this.pressDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pressDialog);
			}
			this.pressDialog.open();
		},
		
		onECitemsClose: function(oEvent){
			this.onItemsClose(oEvent);
		},
		
		onCCdialog: function(oEvent) {
			var GLaccount  = this.getView().byId("idCCexpSet");
			var CostCenter = this.getView().byId("ideCC_dept").getSelectedKey();
			var sPath1     = "Kostl";
			var sOperator1 = "EQ";
			var sValue1    = CostCenter;
			var oFilter1   = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = this.getView().byId("idCCexpSet").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
		},
		
		
		onOpenDetailDialItem:function(oEvent){
			var sKostl = this.getView().byId("ideCC_dept").getSelectedKey();
			var expSet = sap.ui.getCore().byId("ideCCexpSet");
			var aFilters = [];
			aFilters.push( new sap.ui.model.Filter("Kostl", "EQ", sKostl) );
			
			expSet.setModel(this.getView().getModel());
			expSet.setModel(this.lModel,"lModel");

			expSet.bindItems({
				path : "/ExpensetypeSet",
				filters: new sap.ui.model.Filter(aFilters, true),
				template : new sap.ui.core.ListItem({
					text : "{Txt50}",
					key : "{GlAccount}",
					additionalText : "{GlAccount}"
				})
			});
			var currPath = "lModel>"+ this.cntxt.getPath()+ "/Glaccount";
			expSet.bindProperty("selectedKey",currPath); 
			
			var FGcurr = sap.ui.getCore().byId("id_EditFcurr");
			FGcurr.setModel(this.getView().getModel());
			FGcurr.setModel(this.lModel,"lModel");

			FGcurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
					key: "{Waers}", 
					text: "{Waers}",	
					additionalText: "{Landx50}"
				})
			});
			var FGcurrPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
			FGcurr.bindProperty("selectedKey",FGcurrPath); 
		},
		
		onCurrencyInput: function(oEvent) {
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			var oUICore = this.getView();
			this._calculateNetAmount(oUICore);
		},
		
		_onCurrencyExch:  function(oCurrency, oUICore){
			if (oCurrency === "USD"){
				oUICore.byId("id_CCexch").setValue("3.675");
				oUICore.byId("id_ccVATno").setSelectedKey('0');
				oUICore.byId('idCCvatLabel').setVisible(false);
				oUICore.byId("id_ccVATno").setVisible(false);
				oUICore.byId('idCCexchRateLabel').setVisible(true);
				oUICore.byId("id_CCexch").setVisible(true);
			} else if (oCurrency === "AED") {
				oUICore.byId("id_CCexch").setValue("1.00");
				oUICore.byId('idCCvatLabel').setVisible(true);
				oUICore.byId("id_ccVATno").setVisible(true);
				oUICore.byId('idCCexchRateLabel').setVisible(false);
				oUICore.byId("id_CCexch").setVisible(false);
			} else {
				oUICore.byId("id_ccVATno").setSelectedKey('0');
				oUICore.byId('idCCvatLabel').setVisible(false);
				oUICore.byId("id_ccVATno").setVisible(false);
				oUICore.byId('idCCexchRateLabel').setVisible(true);
				oUICore.byId("id_CCexch").setVisible(true);
			}
		},
		
		_calculateNetAmount: function(oUICore){
			var sFCamount   = oUICore.byId("idCCamt").getValue();
			var sFCcurrency = oUICore.byId("id_Fcurr").getSelectedKey();
			var sExhRate    = oUICore.byId("id_CCexch").getValue();
			var sAEDamount  = oUICore.byId("id_AEDamt").getValue();
			var sVatPercent = oUICore.byId("id_ccVATno").getSelectedKey();
			var taxableAmt  = Math.round(sFCamount*sExhRate*100) / 100;
			var VatAmount   = taxableAmt * sVatPercent/100;
			var NetAmt      = taxableAmt + VatAmount;
			oUICore.byId("id_AEDamt").setValue(NetAmt);
		},
		
		onCurrencySelection: function(oEvent){
			var oCurrency = oEvent.getSource().getSelectedKey();
			var oUICore   = this.getView();
			this._onCurrencyExch(oCurrency, oUICore);
			this._calculateNetAmount(oUICore);
		},
		
		onExVatVal: function(oEvent){
			var oUICore   = this.getView();
			this._calculateNetAmount(oUICore);
		},
		
		onEditCurrencyInput: function(oEvent){
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			var oUICore = sap.ui.getCore();
			this._calculateEditedNetAmount(oUICore);
		},
		
		_calculateEditedNetAmount: function(oUICore){
			var sFCamount   = oUICore.byId("id_EditCCamt").getValue();
			var sFCcurrency = oUICore.byId("id_EditFcurr").getSelectedKey();
			var sExhRate    = oUICore.byId("id_EditCCexch").getValue();
			var sAEDamount  = oUICore.byId("id_EditAEDamt").getValue();
			var sVatPercent = oUICore.byId("idCCeditVATno").getSelectedKey();
			var taxableAmt  = Math.round(sFCamount*sExhRate*100) / 100;
			var VatAmount   = taxableAmt * sVatPercent/100;
			var NetAmt      = taxableAmt + VatAmount;
			oUICore.byId("id_EditAEDamt").setValue(NetAmt);
		},
		
		onEditCurrencySelection: function(oEvent){
			var oCurrency = oEvent.getSource().getSelectedKey();
			var oUICore   = sap.ui.getCore();
			this._onEditedCurrencyExch(oCurrency, oUICore);
			this._calculateEditedNetAmount(oUICore);
		},
		
		_onEditedCurrencyExch:  function(oCurrency, oUICore){
			if (oCurrency === "USD"){
				oUICore.byId("id_EditCCexch").setValue("3.675");
				oUICore.byId("idCCeditVATno").setSelectedKey('0');
				oUICore.byId('idCCeditVatLabel').setVisible(false);
				oUICore.byId("idCCeditVATno").setVisible(false);
				oUICore.byId('idCCexchLabel').setVisible(true);
				oUICore.byId("id_EditCCexch").setVisible(true);
			} else if (oCurrency === "AED") {
				oUICore.byId("id_EditCCexch").setValue("1.00");
				oUICore.byId('idCCeditVatLabel').setVisible(true);
				oUICore.byId("idCCeditVATno").setVisible(true);
				oUICore.byId('idCCexchLabel').setVisible(false);
				oUICore.byId("id_EditCCexch").setVisible(false);
			} else {
				oUICore.byId("idCCeditVATno").setSelectedKey('0');
				oUICore.byId('idCCeditVatLabel').setVisible(false);
				oUICore.byId("idCCeditVATno").setVisible(false);
				oUICore.byId('idCCexchLabel').setVisible(true);
				oUICore.byId("id_EditCCexch").setVisible(true);
			}
		},
		
		onEditExVatVal: function(oEvent){
			var oUICore   = sap.ui.getCore();
			this._calculateEditedNetAmount(oUICore);
		},
		
		onECitemsSave: function(oEvent) {
			var sForeignAmount    = this.getView().byId("idCCamt").getValue()
			var sJustification    = this.getView().byId("idCCJustPur").getValue();
			if (sForeignAmount === "") {
				this.getView().byId("idCCamt").setValueState(sap.ui.core.ValueState.Error);
			} else if (sJustification === "") {
				this.getView().byId("idCCJustPur").setValueState(sap.ui.core.ValueState.Error);
			} else {
			var tablObj = {};
			
			tablObj.Purchdate    = this.getView().byId("idCCpurchaseDate").getDateValue();
			tablObj.Glaccount    = this.getView().byId("idCCexpSet").getSelectedKey();
			tablObj.Ltext        = this.getView().byId("idCCexpSet").getSelectedItem().mProperties.text;
//			tablObj.Kostl        = this.getView().byId("idCCexpSet").getValue();
			tablObj.Positiontext = this.getView().byId("idCCitem").getValue();
			tablObj.Vendor       = this.getView().byId("idCCvendor").getValue();
			tablObj.Fgnamount    = sForeignAmount;
			tablObj.Currency     = this.getView().byId("id_Fcurr").getSelectedKey();
			tablObj.Exrate       = this.getView().byId("id_CCexch").getValue();
			tablObj.Taxvalue     = this.getView().byId("id_ccVATno").getSelectedKey();
			tablObj.Ppayments    = this.getView().byId("id_AEDamt").getValue();
			tablObj.Justification= this.getView().byId("idCCJustPur").getValue();
			
			if (tablObj.Ppayments){
				tablObj.Ppayments  = parseFloat(tablObj.Ppayments).toFixed(2);
			} else {
				tablObj.Ppayments  = 0;
			}
			
			var lTbl = this.lModel.getProperty("/navtocredit/results");
			lTbl.push(tablObj);
			this.lModel.setProperty("/navtocredit/results", lTbl);
			
			oEvent.getSource().getParent().close();
			
			var iTotalAmount = this.byId("ideCCnetAmnt").getText();
			if (iTotalAmount === "0 AED"){
				iTotalAmount = tablObj.Ppayments;
			} else {
				iTotalAmount = parseFloat(iTotalAmount) + parseFloat(tablObj.Ppayments);
			}
			iTotalAmount = parseFloat(iTotalAmount).toFixed(2);
			this.byId("ideCCnetAmnt").setText(iTotalAmount + ' AED');
			
			this._clearDialogue();
			}
		},
		
		_clearDialogue: function() {
			this.getView().byId("idCCpurchaseDate").setDateValue(new Date());
			this.getView().byId("idCCexpSet").setSelectedKey('');
//			this.getView().byId("idCCexpSet").getValue();
			this.getView().byId("idCCitem").setValue('');
			this.getView().byId("idCCvendor").setValue('');
			this.getView().byId("idCCamt").setValue('');
			this.getView().byId("idCCamt").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("idCCJustPur").setValue('');
			this.getView().byId("idCCJustPur").setValueState(sap.ui.core.ValueState.None);
		},
		
		handleCreditCardSave: function(oEvent) {
			var sListItems = this.lModel.getProperty("/navtocredit/results").length;
			var sItemMsg   = this.getResourceBundle().getText("CcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sItemMsg);
			} else {
				this._onCCsave(oEvent);
			}
		},
		
		_onCCsave: function(oEvent) {
			var delItems      = this.lModel.getProperty("/tempDelData");
			var that          = this;
			var temObj        = {};
			
			temObj.Documentdate = this.getView().byId("ideCCdate").getDateValue(); 
			temObj.Postingnumber= this.lModel.oData.Postingnumber;
			temObj.Accountant   = this.lModel.oData.Accountant;
			temObj.Pernr        = this.getView().byId("ideCCusrList").getSelectedKey();
			temObj.Pernrfullname= this.getView().byId("ideCCusrList").getSelectedItem().mProperties.text;
			temObj.Kostl        = this.getView().byId("ideCC_dept").getSelectedKey();
			temObj.Hnetamount   = parseFloat(this.getView().byId("ideCCnetAmnt").getText()).toString();
			temObj.Currency     = "AED";
			temObj.Flag3        = "U";
			temObj.navtocredit  = this.lModel.getProperty("/navtocredit/results");
			
			for(var i =0;i<delItems.length;i++){	
				temObj.navtocredit.push(delItems[i]);		
			}
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/CreditHeaderSet",temObj,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = that.getResourceBundle().getText("CcUpdateSuccess", [sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg, {
						onClose: function(){
							that.getOwnerComponent().getRouter().navTo("CreditCardDetailsDisplay",{sId: sPostingNumber}, true);
						}
					});
					that.getOwnerComponent().getModel().refresh();
					
				},
				error:function(oData){
					var emsg= $(oData.responseText).find("message").first().text();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.error(emsg	);
					debugger;	
					
				}
				
			})
		},
		
		handleCCSaveAndSubmit: function(oEvent) {
			var sListItems = this.lModel.getProperty("/navtocredit/results").length;
			var sItemMsg   = this.getResourceBundle().getText("CcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sItemMsg);
			} else {
				this.submitAggrement(oEvent);
			}
		},
		
		_onCCsaveSubmit: function(oEvent) {
			var delItems      = this.lModel.getProperty("/tempDelData");
			var that          = this;
			var temObj        = {};
			
			temObj.Documentdate = this.getView().byId("ideCCdate").getDateValue(); 
			temObj.Postingnumber= this.lModel.oData.Postingnumber;
			temObj.Accountant   = this.lModel.oData.Accountant;
			temObj.Pernr        = this.getView().byId("ideCCusrList").getSelectedKey();
			temObj.Pernrfullname= this.getView().byId("ideCCusrList").getSelectedItem().mProperties.text;
			temObj.Kostl        = this.getView().byId("ideCC_dept").getSelectedKey();
			temObj.Hnetamount   = parseFloat(this.getView().byId("ideCCnetAmnt").getText()).toString();
			temObj.Currency     = "AED";
			temObj.Flag3        = "U";
			temObj.Wfsubmit     = "X";
			temObj.navtocredit  = this.lModel.getProperty("/navtocredit/results");
			
			for(var i =0;i<delItems.length;i++){	
				temObj.navtocredit.push(delItems[i]);		
			}
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/CreditHeaderSet",temObj,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = that.getResourceBundle().getText("CcSubmitSuccess", [sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg, {
						onClose: function(){
							that.getOwnerComponent().getRouter().navTo("CreditCardDetailsDisplay",{sId: sPostingNumber}, true);
						}
					});
					that.getOwnerComponent().getModel().refresh();
				},
				error:function(oData){
					var emsg= $(oData.responseText).find("message").first().text();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.error(emsg	);
					debugger;	
					
				}
				
			})
		},
		
		handleCreditCancel : function(oEvent) {
			if (!this.CancelDialog) {
				this.CancelDialog = new sap.m.Dialog({
							title : this.getResourceBundle().getText("Cancel"),
							type : 'Message',
							draggable : true,
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("CancelEdit")
									}),
							beginButton : new sap.m.Button({
								text : this.getResourceBundle().getText("Yes"),
								type : "Accept",
								press : function() {
//									sap.m.MessageToast.show("Submitted");
									this.CancelDialog.close();
									this._CancelYes(oEvent);
								}.bind(this)
							}),
							endButton : new sap.m.Button({
								text : this.getResourceBundle().getText("No"),
								type : "Reject",
								press : function() {
									this.CancelDialog.close();
								}.bind(this)
							})
						});

				// to get access to the global model
				this.getView().addDependent(this.CancelDialog);
			}

			this.CancelDialog.open();
		},
		
		
		_CancelYes: function(oEvent) {
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
		/**
		 * Called when the Controller is destroyed. Use this one to
		 * free resources and finalize activities.
		 * 
		 * @memberOf z_pr.app
		 */
		// onExit: function() {
		//
		// },
		onNavBack : function() {
			var oHistory      = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			// discard new product from model.
			this.getOwnerComponent().getModel().deleteCreatedEntry(this._oContext);

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getOwnerComponent().getRouter().navTo("master", {}, bReplace);
			}
		},
		
		onFileUpload: function(oEvent){
			this.getView().setBusy(true);
	        var tablObj        = {};
	        var doknr          = this._sDocumentnumber;
	        var fragmentId     = this.getView().createId("itemsFragment");     
	        var matrnFile      = this.byId("matrnFile");
	        var tblFileInputId = matrnFile .getId() +'-fu';
	        var reader         = new FileReader();
	        var tblFileInput   = $.sap.domById(tblFileInputId);
	        var tblFile        = tblFileInput.files[0];
	        tablObj.Docfile    = tblFile.name;
	        tablObj.Mimetype   = tblFile.type;
	        var base64marker   = 'data:' + tblFile.type + ';base64,';
	        var dArr           = this.lModel.getProperty("/navigcredittodocuments");
	        var that           = this;
	        reader.onload      = (function(theFile) {
	        	return function(evt) {
		            var base64Index       = evt.target.result.indexOf(base64marker) +base64marker.length; 
		            var base64            = evt.target.result.substring(base64Index);
		            tablObj.Filedata      = base64; 
		            tablObj.addordelete   = "A";
		            tablObj.Doknr         = doknr;
		            tablObj.Postingnumber = that._CreditCardNo;
		            that.tempModel.setProperty("/navigcredittodocuments",tablObj);       // workaround as Odata not returning data properly
		            that.getView().getModel().create("/FilelistSet",tablObj,{
		            	success:function(oData){
		            		var dArr       = this.lModel.getProperty("/navigcredittodocuments");
		            		var oData = that.tempModel.getProperty("/navigcredittodocuments"); // workaround
		            		delete oData.Filedata; // workaround
		            		delete oData.Mimetype; // workaround
		            		dArr.push(oData);
		            		that.lModel.setProperty("/navigcredittodocuments",dArr);
		            		that.getView().getModel().refresh();
		            		that.getView().setBusy(false);
	                    }.bind(that),
	                    error:function(oError){
	                    	that.getView().setBusy(false);
	                    	this._handleError(oError);
	                    }.bind(that)})
	                matrnFile.clear();
	            }
	        })();
	        reader.readAsDataURL(tblFile);
		},
		
		onFileDelete:function(oEvent){
			this.fdelObj  = oEvent.getParameter('listItem').getBindingContext().getObject();
			this.sdelPath = oEvent.getParameter('listItem').getBindingContext().getPath();
			var sDocfile  = this.fdelObj.Docfile;
			if (!this.delItemDialog) {
				this.delItemDialog = new sap.m.Dialog({
					title : this.getResourceBundle().getText("warning"),
					state : 'Warning',
					type  : 'Message',															
					content : new sap.m.Text({
								text : this.getResourceBundle().getText("delMsg",[sDocfile])
							}),
					beginButton : new sap.m.Button({
						text : this.getResourceBundle().getText("Yes"),
						type : "Accept",
						press : function(oEvt) {
							this._onDeleteDocItem(oEvent);
							this.delItemDialog.close();
						}.bind(this)
					}),
					endButton : new sap.m.Button({
						text : this.getResourceBundle().getText("No"),
						type : "Reject",
						press : function() {
							this.delItemDialog.close();
						}.bind(this)
					})
				});
				// to get access to the global model
				this.getView().addDependent(this.delItemDialog);
			}
			this.delItemDialog.open();
		},
		
		_onDeleteDocItem: function(oEvent){
			this.getView().setBusy(true);			
			var navPath     = this.sdelPath.slice(0,-1)
			var docItemPath = this.sdelPath[this.sdelPath.length-1]
			var dMdl        = this.getView().getModel();			
			if(this._CreditCardNo){
				var fltr = "Postingnumber eq '"+this.fdelObj.Postingnumber+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
				var that = this;
				dMdl.read("/FilelistSet",{
						success:function(oData){					
							var dItems = this.lModel.getProperty(navPath);									
							dItems.splice(parseInt(docItemPath),1);
							this.lModel.setProperty(navPath,dItems);
							this.getView().setBusy(false);				
						}.bind(this),
						error:function(oError){										
							this.getView().setBusy(false);
						}.bind(this),
						urlParameters:{
							"$filter":fltr
						}
				})
			}
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
		},
		
		});
		
		return PageController;
});
