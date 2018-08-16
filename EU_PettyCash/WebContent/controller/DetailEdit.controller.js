sap.ui.define([
		"z_pettycash_fi/controller/BaseController",
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_pettycash_fi/model/formatter" 
	], function(Controller, History, Device, MessageBox, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_pettycash_fi.controller.DetailEdit",{
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
				this.getView().byId("id_EditPCExpTbl").setModel(this.lModel);
				this.getView().byId('idEditPettyCashDoc').setModel(this.lModel);
				this.getOwnerComponent().getRouter().getRoute("pettyCashDetailsEdit").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._sPettyCashNumber = oEvent.getParameter("arguments").sId;
				this._sId              = "/pcashheaderSet('"+  oEvent.getParameter("arguments").sId +  "')";
				this.getView().bindElement(this._sId);
				
				var oMdl = this.getOwnerComponent().getModel();
				oMdl.read(this._sId,{
					success : function(oData) {
						this.lModel.setData(oData);
						this._sDocumentnumber = oData.Documentnumber;
						this.lModel.setProperty("/tempDelData",[]);
					}.bind(this),
					error : function(oError) {
						
					}.bind(this),
					urlParameters : {
						"$expand" : "cashtoitems"
					}
				});
				var sFilter = "Postingnumber eq '" + this._sPettyCashNumber + "'";
				oMdl.read("/FilelistSet", {success: function(oData){
						var vPath = "/navigcashtodms";
						this.lModel.setProperty(vPath, oData.results);
					}.bind(this),
					urlParameters : {
						"$filter" : sFilter
					}
				})
			},
			
			onOpenDetailDialItem:function(oEvent){
				
				var sKostl = this.getView().byId("idPCeditDept").getSelectedKey();
				var expSet = sap.ui.getCore().byId("id_editexpSet");
				var aFilters = [];
				aFilters.push( new sap.ui.model.Filter("Kostl", "EQ", sKostl) );
				
				expSet.setModel(this.getView().getModel());
				expSet.setModel(this.lModel,"lModel");

				expSet.bindItems({
							path : "/ExpensetypeSet",
							filters: new sap.ui.model.Filter(aFilters, true),
							template : new sap.ui.core.ListItem(
									{
										text : "{Txt50}",
										key : "{GlAccount}",
										additionalText : "{GlAccount}"
									})
						});
				var currPath = "lModel>"+ this.cntxt.getPath()+ "/Glaccount";
				expSet.bindProperty("selectedKey",currPath); 
			},
			
			onPCdialog: function(oEvent) {
				var GLaccount = this.getView().byId("id_expSet");
				
				var CostCenter = this.getView().byId("idPCeditDept").getSelectedKey();
				
				var sPath1 = "Kostl";
				var sOperator1 = "EQ";
				var sValue1 = CostCenter;
				var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
				
				// get the list items binding
				var oBinding = GLaccount.getBinding("items");
				
				//Apply filter(s)
				oBinding.filter(oFilter1);
			},
			
			onAfterRendering : function() {
				var cmCC = this.getView().byId("idPCeditDept");
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
			
			editPCaddButtonPressed: function(oEvent) {
				if (!this.pressDialog) {
					this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
							"z_pettycash_fi.view.fragment.PCitems",
							this);
					// to get access to the global
					// model
					this.getView().addDependent(this.pressDialog);
					jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pressDialog);
				}
				this.pressDialog.open();
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
			
			onPCselection: function(oEvent) {
				this.cntxt = oEvent.getSource().getBindingContext();
				if (!this.pcItemDetailDialog) {
					this.pcItemDetailDialog = sap.ui.xmlfragment(
							"z_pettycash_fi.view.fragment.PCeditItems",
							this);
					// to
					this.getView().addDependent(this.pcItemDetailDialog);
					jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pcItemDetailDialog);
				}
				// this.prItemDetailDialog.bindElement(cntxt);
				this.pcItemDetailDialog.setModel(this.lModel);
				this.tAmnt = this.lModel.getProperty("/Hnetamount");
				this.tAmnt = this.tAmnt - ( this.cntxt.getObject().Netvalue);
				this.pcItemDetailDialog.setBindingContext(this.cntxt);
				this.pcItemDetailDialog.open();
				
			},
			
			onExVatVal: function(oEvent) {
				var sVat   = parseFloat(this.getView().byId("id_eVATno").getSelectedKey());
				var value  = parseFloat(this.getView().byId("id_enAmnt").getValue());
				var Vat    = (value * sVat)/100;
				this.getView().byId("id_netValue").setValue( (Vat + value).toFixed(2));
			},
			
			onPCitemsSave : function(oEvent) {
				var paymentValue = parseFloat(this.getView().byId("id_enAmnt").getValue());
				var VATvalue     = parseFloat(this.getView().byId("id_eVATno").getSelectedKey());
				if (paymentValue === "") {
					this.getView().byId("id_enAmnt").setValueState(sap.ui.core.ValueState.Error);
				} 
//				else if(paymentValue <= VATvalue){
//					var msg = this.getResourceBundle().getText("ItemSaveVATerror");
//					jQuery.sap.require("sap.m.MessageBox");
//					sap.m.MessageBox.error(msg);
//				} 
				else {	
				var tablObj = {};

				tablObj.Glaccount    = this.getView().byId("id_expSet").getSelectedKey();
				tablObj.Ltext        = this.getView().byId("id_expSet").getSelectedItem().mProperties.text;
				tablObj.Positiontext = this.getView().byId("id_desc").getValue();
				tablObj.Vendor       = this.getView().byId("id_vendor").getValue();
				tablObj.Matnr        = this.getView().byId("id_eiRno").getValue();
				tablObj.Taxvalue     = this.getView().byId("id_eVATno").getSelectedKey();
				tablObj.Ppayments    = Math.round(this.getView().byId("id_enAmnt").getValue()* 100) / 100;
				tablObj.Netvalue     = this.getView().byId("id_netValue").getValue();
				tablObj.Justification= this.getView().byId("id_justification").getValue();
				
				if (tablObj.Netvalue){
					tablObj.Netvalue  = parseFloat(tablObj.Netvalue).toFixed(2);
				} else {
					tablObj.Netvalue  = 0;
				}
				
				var lTbl = this.lModel.getProperty("/cashtoitems/results");
				lTbl.push(tablObj);
				this.lModel.setProperty("/cashtoitems/results", lTbl);
				
				oEvent.getSource().getParent().close();
				
				var iTotalAmount = this.byId("idPCeditTamt").getText();
				if (iTotalAmount === "0 AED"){
					iTotalAmount = tablObj.Netvalue;
				} else {
					iTotalAmount = parseFloat(iTotalAmount) + parseFloat(tablObj.Netvalue);
				}
				iTotalAmount = parseFloat(iTotalAmount).toFixed(2);
				this.byId("idPCeditTamt").setText(iTotalAmount + ' AED');
				
				this._clearDialogue();
				}
			},
			
			_clearDialogue: function() {
				this.getView().byId("id_expSet").setSelectedKey('');
				this.getView().byId("id_desc").setValue('');
				this.getView().byId("id_vendor").setValue('');
				this.getView().byId("id_eiRno").setValue('');
				this.getView().byId("id_enAmnt").setValue('');
				this.getView().byId("id_netValue").setValue('');
				this.getView().byId("id_justification").setValue('');
				this.getView().byId("id_enAmnt").setValueState(sap.ui.core.ValueState.None);
			},
			
			onPCitemsClose : function(oEvent) {
				oEvent.getSource().getParent().close();
			},
			
			onPCeditItemsSave:function(oEvent){
				var paymentValue = parseFloat(sap.ui.getCore().byId("id_editenAmnt").getValue());
				var VATvalue     = parseFloat(sap.ui.getCore().byId("id_enAmntVAT").getSelectedKey());
				if (paymentValue === "") {
					sap.ui.getCore().byId("id_enAmnt").setValueState(sap.ui.core.ValueState.Error);
				}
//				else if(paymentValue <= VATvalue){
//					var msg = this.getResourceBundle().getText("ItemSaveVATerror");
//					jQuery.sap.require("sap.m.MessageBox");
//					sap.m.MessageBox.error(msg);
//				} 
				else {
					this.tAmnt = this.tAmnt + parseFloat(this.cntxt.getObject().Netvalue);
					this.lModel.setProperty("/Hnetamount",this.tAmnt);
					this.onPCitemsClose(oEvent);
				}
			},
			
			onPCeditItemsReset: function(oEvent) {
				oEvent.getSource().getParent().close();
				
				var arr = this.cntxt.getPath().split("/");
				var items = this.lModel.getProperty('/cashtoitems/results');
				var pInt = parseInt(arr[arr.length - 1]);
			
				if(items[pInt].Itemno){
					var tempDelData = this.lModel.getProperty("/tempDelData");
					var pcData = $.extend(true, {},items[pInt]);
					var temp = {};
					temp.Itemno        = pcData.Itemno;
					temp.Taxvalue      = pcData.Taxvalue;												
					temp.Kostl         = pcData.Kostl;
					temp.Glaccount     = pcData.Glaccount;
					temp.Matnr         = pcData.Matnr;
					temp.Positiontext  = pcData.Positiontext;
					temp.Ltext         = pcData.Ltext;
					temp.Ppayments     = pcData.Ppayments;
					tempDelData.push(temp);
					this.lModel.setProperty("/tempDelData",tempDelData);
				}
				var fAmount    = items[pInt].Netvalue;
				var fNetAmount = parseFloat(this.getView().byId("idPCeditTamt").getText());
					fNetAmount = fNetAmount - fAmount;
				this.byId("idPCeditTamt").setText(fNetAmount + ' AED');																						
				items.splice(pInt, 1);
				this.lModel.setProperty('/cashtoitems/results',items);
				
//				var sPath      = oEvent.getSource().getBindingContext().getPath();
//				var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
//				var aItems     = this.lModel.getProperty('/cashtoitems/results');
//				var fAmount    = aItems[index].Ppayments;
//				var fNetAmount = parseFloat(this.getView().byId("idPCeditTamt").getText());
//					fNetAmount = fNetAmount - fAmount;
//				this.byId("idPCeditTamt").setText(fNetAmount + ' AED');	
//				aItems.splice(index, 1);
//				this.lModel.setProperty('/cashtoitems/results', aItems);
//				oEvent.getSource().getParent().close();
			},
			
			handlePCCancel : function(oEvent) {
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
//										sap.m.MessageToast.show("Submitted");
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
			
			handlePCsave: function(oEvent) {
				var sListItems = this.lModel.getProperty("/cashtoitems").length;
				var sEmptyItemError = this.getResourceBundle().getText("PcEmptyItemError");
				if(sListItems === 0){
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.information(sEmptyItemError);
				} else {
					this._onPCsave(oEvent);
				}
			},
			
			handlePCsaveAndSubmit: function(oEvent){
				var sListItems = this.lModel.getProperty("/cashtoitems").length;
				var sEmptyItemError = this.getResourceBundle().getText("PcEmptyItemError");
				if(sListItems === 0){
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.information(sEmptyItemError);
				} else {
					this._onAggrement(oEvent);
				}
			},
			
			onEditVal: function(oEvent){
				var sVat   = parseFloat(sap.ui.getCore().byId("id_enAmntVAT").getSelectedKey());
				var value  = parseFloat(sap.ui.getCore().byId("id_editenAmnt").getValue());
				var Vat    = (value * sVat)/100;
				sap.ui.getCore().byId("id_editNetValue").setValue( (Vat + value).toFixed(2));
			},
			
			_onAggrement : function(oEvent) {
				if (!this.IagreeDialog) {
					this.IagreeDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Aggrement"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("PcAggrementText")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Agree"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.IagreeDialog.close();
										this._onPCsaveSubmit(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Cancel"),
									type : "Reject",
									press : function() {
										this.IagreeDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.IagreeDialog);
				}

				this.IagreeDialog.open();
			},
			_onPCsave : function(oEvent) {
				this.getView().setBusy(true);
				var delItems         = this.lModel.getProperty("/tempDelData");
				var that             = this;
				var temObj           = {};
				temObj.Postingnumber = this.lModel.oData.Postingnumber;
				temObj.Accountant    = this.lModel.oData.Accountant;
				temObj.Kostl         = this.getView().byId("idPCeditDept").getSelectedKey()	;
				temObj.Hnetamount    = parseFloat(this.getView().byId("idPCeditTamt").getText()).toString();
				temObj.Documentdate  = this.getView().byId("idPCeditPostDate").getDateValue();
				temObj.Currency      = "AED";
				temObj.Flag3         = "U";
				temObj.cashtoitems   = this.lModel.getProperty("/cashtoitems/results");
				
				for(var i =0;i<delItems.length;i++){	
					temObj.cashtoitems.push(delItems[i]);		
				}
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						that.getView().setBusy(false);
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("PcUpdateSuccess",[sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
//						that.lModel.setProperty("/cashtoitems",[]);
//						that.getView().byId("idPRname").setText(oUserName.getProperty("text"));
//						that.getView().byId("eAmnt").setText('0 AED');
//						that.getView().byId("dtPick").setDateValue(new Date());
						that.getOwnerComponent().getModel().refresh();
						that.getOwnerComponent().getRouter().navTo("pettyCashDetailsDisplay", {sId: sPostingNumber},!Device.system.phone);
						
//						sap.ui.getCore().byId("eAmnt").setText('0 AED');
//						sap.ui.getCore().byId("dtPick").setDateValue(new Date());
						
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
				
				
//				sap.m.MessageToast.show(msg);
			},
			
			_onPCsaveSubmit: function(oEvent) {
				this.getView().setBusy(true)
				var delItems         = this.lModel.getProperty("/tempDelData");
//				var oUserName     = this.getView().byId('idPReditName');
//				var sPathUserName = oUserName.getBindingContext().sPath;
//				var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
				var that          = this;
				
				var temObj           = {};
				temObj.Postingnumber = this.lModel.oData.Postingnumber;
				temObj.Kostl         = this.getView().byId("idPCeditDept").getSelectedKey()	;
				temObj.Accountant    = this.lModel.oData.Accountant;
				temObj.Hnetamount    = parseFloat(this.getView().byId("idPCeditTamt").getText()).toString();
				temObj.Documentdate  = this.getView().byId("idPCeditPostDate").getDateValue();
				temObj.Currency      = "AED";
				temObj.Flag3         = "U";
				temObj.Wfsubmit      = "X";
				temObj.cashtoitems   = this.lModel.getProperty("/cashtoitems/results");
				
				for(var i =0;i<delItems.length;i++){	
					temObj.cashtoitems.push(delItems[i]);		
				}
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						that.getView().setBusy(false);
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("PcSubmitSuccess",[sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
						that.getOwnerComponent().getRouter().navTo("pettyCashDetailsDisplay", {sId: sPostingNumber},!Device.system.phone);
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
			
			handlePCsaveEdit: function(oEvent) {
				var that= this;
				var temObj = {};
				temObj.Postingnumber = this.lModel.oData.Postingnumber;
				temObj.Accountant    = this.getView().byId("idPCeditName").getValue();
				temObj.Kostl         = this.getView().byId("idPCeditDept").getSelectedKey();
				tablObj.Taxvalue     = this.getView().byId("id_enAmntVAT").getValue()
//				temObj.Postingdate   = this.getView().byId("idPCeditPostDate").getDateValue();
				temObj.Flag3         = "U";
//				temObj.Hnetamount    = this.getView().byId("idPCeditTamt").getValue();
//				temObj.Currency      = this.getView().byId("idPCeditCurr").getValue();
				temObj.Hnetamount    = parseFloat(this.getView().byId("idPCeditTamt").getText()).toString();
				temObj.Currency      = "AED";
				temObj.Wfstatus      = "X";
				temObj.cashtoitems = this.lModel.getProperty("/cashtoitems/results");
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = "Posting Number : " + sPostingNumber;
						sap.m.MessageToast.show(msg);
						that.lModel.setProperty("/cashtoitems",[]);
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
			handlePCWithdraw: function(oEvent) {
				if (!this.CancelDialog) {
					this.CancelDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Cancel"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("WithdrawRequest")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Yes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.CancelDialog.close();
										this._handlePCWithdraw(oEvent);
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
			
			_handlePCWithdraw: function(oEvent) {
				var that   = this;
				var temObj = {};
				temObj.Postingnumber = this.lModel.oData.Postingnumber;
				temObj.Flag3         = "D";
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("PcWithdrawSuccess",[sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
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
				if(this._sPettyCashNumber){
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
		        var dArr           = this.lModel.getProperty("/navigcashtodms");
		        var that           = this;
		        reader.onload      = (function(theFile) {
		        	return function(evt) {
			            var base64Index       = evt.target.result.indexOf(base64marker) +base64marker.length; 
			            var base64            = evt.target.result.substring(base64Index);
			            tablObj.Filedata      = base64; 
			            tablObj.addordelete   = "A";
			            tablObj.Doknr         = doknr;
			            tablObj.Postingnumber = that._sPettyCashNumber;
			            that.tempModel.setProperty("/navigcashtodms",tablObj);       // workaround as Odata not returning data properly
			            that.getView().getModel().create("/FilelistSet",tablObj,{
			            	success:function(oData){
			            		var dArr       = this.lModel.getProperty("/navigcashtodms");
			            		var oData      = that.tempModel.getProperty("/navigcashtodms"); // workaround
			            		delete oData.Filedata; // workaround
			            		delete oData.Mimetype; // workaround
			            		dArr.push(oData);
			            		that.lModel.setProperty("/navigcashtodms",dArr);
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
			
			onNavBack:function(){
				var sPreviousHash = sap.ui.core.routing.History.getInstance().getPreviousHash();
				// The history contains a previous
				// entry
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					// There is no history!
					// Navigate to master page
					this.getOwnerComponent().getRouter().navTo("master", {},true);
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
			
			formatCurrency: function(sValue){
				return Math.round(sValue * 100) / 100;
			}
			
			});
			
			return PageController;
	});
