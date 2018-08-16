sap.ui.define([
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_usergr/model/formatter" 
	], function(Controller, History, Device, MessageBox, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_usergr.controller.DetailEdit",{
			formatter : formatter,
			
			/**
			 * Called when a controller is instantiated and its View
			 * controls (if available) are already created. Can be used
			 * to modify the View before it is displayed, to bind event
			 * handlers and do other one-time initialization.
			 * 
			 * @memberOf z_pr.app
				 */
		onInit : function() {
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			this.getView().byId("ECeditItems").setModel(this.lModel);
			this.getOwnerComponent().getRouter().getRoute("goodsReceiptDetailsEdit").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent) {
			this._sId = "/claimHeaderSet('"+  oEvent.getParameter("arguments").sId +  "')";
			this.getView().bindElement(this._sId);
			
			var oMdl = this.getOwnerComponent().getModel();
			oMdl.read(this._sId,{
				success : function(oData) {
					this.lModel.setData(oData);
				}.bind(this),
				error : function(oError) {
					
				}.bind(this),
				urlParameters : {
					"$expand" : "navtoitem_claim"
				}
			});
		},
	
						
		onAfterRendering : function() {
			var cmCC = this.getView().byId("id_ECheader_DP");
			var aFilters = [];

			var lang = sap.ui.getCore().getConfiguration()
					.getLanguage();
			aFilters.push(new sap.ui.model.Filter("Spras",
					sap.ui.model.FilterOperator.EQ, lang));

			cmCC.bindItems("/costcentrelistSet?$filter=Spras eq '"+lang+"'",
					new sap.ui.core.ListItem({
						key : "{Kostl}",
						text : "{Ktext}",
						additionalText : "{Kostl}"
					}));
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
		handleECaddButtonPressed: function(oEvent){
			if (!this.pressDialog) {
				this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
						"z_usergr.view.fragment.ECitems",
						this);
				// to get access to the global
				// model
				this.getView().addDependent(this.pressDialog);
			}
			this.pressDialog.open();
		},
		
		onCurrencySelection: function(oEvent){
			var oCurrency = oEvent.getSource().getSelectedKey();
			if (oCurrency === "USD"){
				this.getView().byId("id_ECexch").setValue("3.675");
			}
			var sFCamount   = this.getView().byId("id_ECamt").getValue();
			var sFCcurrency = this.getView().byId("id_Fcurr").getSelectedKey();
			var sExhRate    = this.getView().byId("id_ECexch").getValue();
			this.getView().byId("id_AEDamt").setValue(Math.round(sFCamount*sExhRate*100) / 100);
		},
		onCurrencyInput: function(oEvent) {
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			var sFCamount   = this.getView().byId("id_ECamt").getValue();
			var sFCcurrency = this.getView().byId("id_Fcurr").getSelectedKey();
			var sExhRate    = this.getView().byId("id_ECexch").getValue();
			var sAEDamount  = this.getView().byId("id_AEDamt").getValue();
			if (sFCcurrency === "USD"){
				sthis.getView().byId("id_ECexch").setValue("3.675");
			}
			this.getView().byId("id_AEDamt").setValue(Math.round(sFCamount*sExhRate*100) / 100);
		},
		
		onECselection: function(oEvent) {
			this.cntxt = oEvent.getSource().getBindingContext();
			if (!this.pcItemDetailDialog) {
				this.pcItemDetailDialog = sap.ui.xmlfragment(
						"z_usergr.view.fragment.ECeditItems",
						this);
				// to
				this.getView().addDependent(this.prItemDetailDialog);
			}
			// this.prItemDetailDialog.bindElement(cntxt);
			this.pcItemDetailDialog.setModel(this.lModel);
			this.tAmnt = this.lModel.getProperty("/Hnetamount");
			this.tAmnt = this.tAmnt - ( this.cntxt.getObject().Ppayments);
			this.pcItemDetailDialog.setBindingContext(this.cntxt);
			this.pcItemDetailDialog.open();
			
		},
		
		onECitemsClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		onECitemsSave:function(oEvent){
			
			
			this.tAmnt = this.tAmnt + ( this.cntxt.getObject().Ppayments);
			this.lModel.setProperty("/Hnetamount",this.tAmnt);
			this.onECitemsClose(oEvent);
			
		},
		
		onEditCurrencySelection: function(oEvent){
			var oCurrency = oEvent.getSource().getSelectedKey();
			if (oCurrency === "USD"){
				this.getView().byId("id_ECeditExch").setValue("3.675");
			}
			var sFCamount   = sap.ui.getCore().byId("id_ECeditAmt").getValue();
			var sFCcurrency = sap.ui.getCore().byId("id_EditFcurr").getSelectedKey();
			var sExhRate    = sap.ui.getCore().byId("id_ECeditExch").getValue();
			sap.ui.getCore().byId("id_EditAEDamt").setValue(Math.round(sFCamount*sExhRate*100) / 100);
		},
		onEditCurrencyInput: function(oEvent) {
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			var sFCamount   = sap.ui.getCore().byId("id_ECeditAmt").getValue();
			var sFCcurrency = sap.ui.getCore().byId("id_EditFcurr").getSelectedKey();
			var sExhRate    = sap.ui.getCore().byId("id_ECeditExch").getValue();
			var sAEDamount  = sap.ui.getCore().byId("id_EditAEDamt").getValue();
			if (sFCcurrency === "USD"){
				sap.ui.getCore().byId("id_ECeditExch").setValue("3.675");
			}
			sap.ui.getCore().byId("id_EditAEDamt").setValue(Math.round(sFCamount*sExhRate*100) / 100);
		},
		
		onOpenDetailDialItem:function(oEvent){
			
			var expSet = sap.ui.getCore().byId("id_editexpSet");
			
			expSet.setModel(this.getView().getModel());
			expSet.setModel(this.lModel,"lModel");

			expSet.bindItems({
						path : "/ExpensetypeSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Txt50}",
									key : "{GlAccount}",
									additionalText : "{GlAccount}"
								})
					});
			var currPath = "lModel>"+ this.cntxt.getPath()+ "/Glaccount";
			expSet.bindProperty("selectedKey",currPath); 
			
			var currSet = sap.ui.getCore().byId("id_EditFcurr");
			
			currSet.setModel(this.getView().getModel());
			currSet.setModel(this.lModel,"lModel");

			currSet.bindItems({
						path : "/currencySet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Waers}",
									key : "{Waers}",
									additionalText : "{Landx50}"
								})
					});
			var currencyPath = "lModel>"+ this.cntxt.getPath()+ "/Landx50";
			currSet.bindProperty("selectedKey",currencyPath); 
		},
		
		onECitemsDelete: function(oEvent) {
			var sPath      = oEvent.getSource().getBindingContext().getPath();
			var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aItems     = this.lModel.getProperty('/navtoitem_claim/results');
			var fAmount    = aItems[index].Ppayments;
			var fNetAmount = parseFloat(this.getView().byId("idECeditTotalAmt").getText());
				fNetAmount = fNetAmount - fAmount;
			this.byId("idECeditTotalAmt").setText(fNetAmount + ' AED');	
			aItems.splice(index, 1);
			this.lModel.setProperty('/navtoitem_claim/results', aItems);
			oEvent.getSource().getParent().close();
		},
		
		handlePCsave : function(oEvent) {
			var msg = 'Saved';
			sap.m.MessageToast.show(msg);
			window.history.go(-1);
		},
		
		onPCeditItemsSave:function(oEvent){
			
			this.tAmnt = this.tAmnt + ( this.cntxt.getObject().Ppayments);
			this.lModel.setProperty("/Hnetamount",this.tAmnt);
			this.onECitemsClose(oEvent);
			
		},
		
		
		onECitemsSave: function(oEvent) {
			var paymentValue = this.getView().byId("id_AEDamt").getValue();
			if (paymentValue === "") {
				this.getView().byId("id_AEDamt").setValueState(sap.ui.core.ValueState.Error);
			} else {
				
				var sForeignAmount = this.getView().byId("id_ECamt").getValue();
				if( sForeignAmount === ""){
					sForeignAmount = "1";
				} 
				
				var sExchangeRate   = this.getView().byId("id_ECexch").getValue();
				if( sExchangeRate === ""){
					sExchangeRate = "1";
				}
				
				var tablObj = {};
				
				tablObj.Glaccount    = this.getView().byId("id_ECexpSet").getSelectedKey();
				tablObj.Ltext        = this.getView().byId("id_ECexpSet").getSelectedItem().mProperties.text;
				tablObj.Positiontext = this.getView().byId("id_ECdesc").getValue();
				tablObj.Matnr        = this.getView().byId("id_ECinvRef").getValue();
				tablObj.Fgnamount    = sForeignAmount;
				tablObj.Currency     = this.getView().byId("id_Fcurr").getSelectedKey();
				tablObj.Exrate       = sExchangeRate;
				tablObj.Ppayments    = this.getView().byId("id_AEDamt").getValue();
				
				if (tablObj.Ppayments){
					tablObj.Ppayments  = parseFloat(tablObj.Ppayments).toFixed(2);
				} else {
					tablObj.Ppayments  = 0;
				}
				
				var lTbl = this.lModel.getProperty("/navtoitem_claim/results");
				lTbl.push(tablObj);
				this.lModel.setProperty("/navtoitem_claim/results", lTbl);
				
				oEvent.getSource().getParent().close();
				
				var iTotalAmount = this.byId("idECeditTotalAmt").getText();
				if (iTotalAmount === "0 AED"){
					iTotalAmount = tablObj.Ppayments;
				} else {
					iTotalAmount = parseFloat(iTotalAmount) + parseFloat(tablObj.Ppayments);
				}
				iTotalAmount = parseFloat(iTotalAmount).toFixed(2);
				this.byId("idECeditTotalAmt").setText(iTotalAmount + ' AED');
				
				this._clearDialogue();
			}
		},
		
		_clearDialogue: function() {
			var tablObj = {};
			tablObj.Glaccount    = this.getView().byId("id_ECexpSet").setSelectedKey('');
//			tablObj.Kostl        = this.getView().byId("id_ECexpSet").getValue();
			tablObj.Positiontext = this.getView().byId("id_ECdesc").setValue('');
			tablObj.Matnr        = this.getView().byId("id_ECinvRef").setValue('');
			tablObj.Fgnamount    = this.getView().byId("id_ECamt").setValue('');
			tablObj.Currency     = this.getView().byId("id_Fcurr").setSelectedKey('AED');
			tablObj.Exrate       = this.getView().byId("id_ECexch").setValue('');
			tablObj.Ppayments    = this.getView().byId("id_AEDamt").setValue('');
		},
		
		handlePCsaveAndSubmit : function(oEvent) {
			if (!this.IagreeDialog) {
				this.IagreeDialog = new sap.m.Dialog(
					{
						title : 'Aggrement',
						type : 'Message',
						draggable : true,
						content : new sap.m.Text(
								{
									text : "The above expenses have been incurred in the course of TEO’s business. No other claim in respect of the above is being or will be made to TEO, either by myself or by any other person."
								}),
						beginButton : new sap.m.Button({
							text : "I Agree",
							type : "Accept",
							press : function() {
								sap.m.MessageToast
										.show("Submitted");
								this.IagreeDialog.close();
								window.history.go(-1);
							}.bind(this)
						}),
						endButton : new sap.m.Button({
							text : 'Cancel',
							type : "Reject",
							press : function() {
								this.IagreeDialog.close();
								window.history.go(-1);
							}.bind(this)
						})
					});
	
				// to get access to the global model
				this.getView().addDependent(this.IagreeDialog);
			}
	
			this.IagreeDialog.open();
		},
		
		handleExpenseCalimEditSave: function(oEvent) {
			var that= this;
			var temObj = {};
			temObj.Postingnumber = this.lModel.oData.Postingnumber;
			temObj.Accountant    = this.getView().byId("id_EChdusr_List").getValue();
			temObj.Hnetamount    = this.getView().byId("id_EChd_tamt").getValue();
			temObj.DocumentDate  = this.getView.byId("idECdocDate").getDateValue();
//			temObj.Currency      = this.getView().byId("idECHeaderCurr").getValue();
//			temObj.Postingdate   = this.getView().byId("dtPick").getDateValue();
			temObj.Currency      = "AED";
			temObj.Flag3         = "U";
			temObj.Flag4         = this.getView().byId("id_EChd_Trans").getSelectedIndex().toString();
			temObj.Kostl         = this.getView().byId("id_ECheader_DP").getSelectedKey();
			temObj.navtoitem_claim = this.lModel.getProperty("/navtoitem_claim/results");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/claimHeaderSet",temObj,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = "Posting Number : " + sPostingNumber;
					sap.m.MessageToast.show(msg);
					that.lModel.setProperty("/navtoitem_claim",[]);
					that.getOwnerComponent().getModel().refresh()
					that.getOwnerComponent().getRouter().navTo("pettyCashDetailsDisplay", {sId: sPostingNumber},true);
					
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
		
		handleExpenseCalimEditCancel : function(oEvent) {
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.confirm(
					"Are you sure you want to Cancel?", {
						icon : sap.m.MessageBox.Icon.WARNING,
						title : "Cancel",
					});
			this.onNavBack();
		},
		
		onNavBack : function() {
			var oHistory = History.getInstance(),
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
		
		handleExpenseCalimEditSave: function(oEvent) {
			var sListItems = this.lModel.getProperty("/navtoitem_claim").length;
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information("Please enter Expense Claim Items");
			} else {
				this._onECsave(oEvent);
			}
		},
		handleECsaveAndSubmit: function(oEvent){
			var sListItems = this.lModel.getProperty("/navtoitem_claim").length;
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information("Please enter Expense Claim Items");
			} else {
				this._onECsaveSubmit(oEvent);
			}
		},
		
		_onECsave: function(oEvent) {
			var oUserName     = this.getView().byId('idECname');
			var sPathUserName = oUserName.getBindingContext().sPath;
			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			var that          = this;
			var temObj        = {};
			
//			temObj.Accountant      = sUserid;
			temObj.Postingnumber = this.lModel.oData.Postingnumber;
			temObj.Hnetamount      = parseFloat(this.getView().byId("idECtotalAmt").getText()).toString();
			temObj.DocumentDate    = this.getView.byId("idECdocDate").getDateValue();
			temObj.Currency        = "AED";
			temObj.Flag3           = "I";
			temObj.Flag4           = this.getView().byId("id_EC_BorC").getSelectedIndex().toString();
			temObj.Kostl           = this.getView().byId("id_EC_DP").getSelectedKey();
			temObj.navtoitem_claim = this.lModel.getProperty("/navtoitem_claim/results");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/claimHeaderSet",temObj,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = "Expense Claim Request No. " + sPostingNumber + " has been saved.";
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.lModel.setProperty("/navtoitem_claim",[]);
					that.getView().byId("idECname").setText(oUserName.getProperty("text"));
					that.getView().byId("idECtotalAmt").setText('0 AED');
					that.getView().byId("idECdate").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
					
				},
				error:function(oData){
					var eMsg = JSON.parse(oData.responseText).error.message.value;
//					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//					jQuery.sap.require("sap.m.MessageBox");
					MessageBox.error(eMsg);
					debugger;	
					
				}
				
			})
			
		},
		
		_onECsaveSubmit: function(oEvent) {
//			var oUserName     = this.getView().byId('idECname');
//			var sPathUserName = oUserName.getBindingContext().sPath;
//			var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
			var that          = this;
			var temObj        = {};
			
//			temObj.Accountant      = this.getView().byId("idECeditName");
			temObj.Postingnumber = this.lModel.oData.Postingnumber;
			temObj.Hnetamount      = parseFloat(this.getView().byId("idECeditTotalAmt").getText()).toString();
			temObj.Documentdate    = this.getView().byId("idECeditDocDate").getDateValue();
			temObj.Currency        = "AED";
			temObj.Flag3           = "I";
			temObj.Wfsubmit        = "X";
			temObj.Flag4           = this.getView().byId("id_EChd_Trans").getSelectedIndex().toString();
			temObj.Kostl           = this.getView().byId("id_ECheader_DP").getSelectedKey();
			temObj.navtoitem_claim = this.lModel.getProperty("/navtoitem_claim/results");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/claimHeaderSet",temObj,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = "Expense Claim Request No. " + sPostingNumber + " has been Submitted.";
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.lModel.setProperty("/navtoitem_claim",[]);
//					that.getView().byId("idECname").setText(oUserName.getProperty("text"));
//					that.getView().byId("idECtotalAmt").setText('0 AED');
//					that.getView().byId("idECdate").setDateValue(new Date());
					that.getOwnerComponent().getModel().refresh();
					
				},
				error:function(oData){
					var eMsg = JSON.parse(oData.responseText).error.message.value;
//					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//					jQuery.sap.require("sap.m.MessageBox");
					MessageBox.error(eMsg);
					debugger;	
				}
			})
		},
	});
	
	return PageController;
});
