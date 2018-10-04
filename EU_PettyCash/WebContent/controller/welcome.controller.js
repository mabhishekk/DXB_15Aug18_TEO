sap.ui.define([
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_pettycash_fi/model/formatter",
		"z_pettycash_fi/controller/BaseController"
	], function(History, Device, MessageBox, formatter, Controller){
		"use strict";
		
		var PageController = Controller.extend("z_pettycash_fi.controller.welcome",{
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit : function() {
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.lModel = new sap.ui.model.json.JSONModel();
				var tbl     = this.getView().byId("id_expTbl");
				tbl.setModel(this.lModel);
				var tbData       = {"cashtoitems"   : []};
				this.lModel.setData(tbData);
				
				this.docModel = new sap.ui.model.json.JSONModel();
				var docTbl    = this.getView().byId("id_docMnts");
				docTbl.setModel(this.docModel);
				var tableDocData = {"navigcashtodms" : []};
				this.docModel.setData(tableDocData);
				
				this.byId("dtPick").setDateValue(new Date());
			},
			
			onPCdialog: function(oEvent) {
				var GLaccount = sap.ui.getCore().byId("id_expSet");
				
				var CostCenter = this.getView().byId("ccDP").getSelectedKey();
				
				/*GLaccount.bindItems({
					path : "/ExpensetypeSet?$filter=Levelid eq '"+ CostCenter +"'",
					template : new sap.ui.core.ListItem({
								text:"{Txt50}", 
								additionalText: "Gl code - {GlAccount}",
								key:"{GlAccount}"
							})
				});*/
				
				var sPath1 = "Kostl";
				var sOperator1 = "EQ";
				var sValue1 = CostCenter;
				var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
				
				// get the list items binding
				var oBinding = sap.ui.getCore().byId("id_expSet").getBinding("items");
				
				//Apply filter(s)
				oBinding.filter(oFilter1);
			},
			
			onAfterRendering : function() {
				var sUserName = this.getView().byId("idPRname");
				sUserName.bindElement("/loginuserSet('')");
				
				var cmCC = this.getView().byId("ccDP");
				var aFilters = [];

				var lang = sap.ui.getCore().getConfiguration().getLanguage();
				aFilters.push(new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, lang));

				cmCC.bindItems("/costcentrelistSet?$filter=Spras eq '"+lang+"'",
						new sap.ui.core.ListItem({
							key : "{Kostl}",
							text : "{Ltext}",
							additionalText : "{Kostl}"
						}));
			},
			onExVatVal: function(oEvent) {
				var sVat  = parseFloat(sap.ui.getCore().byId("id_eVATno").getSelectedKey());
				var value = parseFloat(sap.ui.getCore().byId("id_enAmnt").getValue());
				var Vat   = (value * sVat)/100;
				sap.ui.getCore().byId("id_netValue").setValue( (Vat + value).toFixed(2));
				if (oEvent.getSource().getId() === 'id_enAmnt'){
					var n     = parseFloat(oEvent.getSource().getValue());
					if(n === +n && n !== (n|0)){
						if (oEvent.getSource().getValue().split('.')[1].length > 2) {
							oEvent.getSource().setValue(parseFloat(oEvent.getSource().getValue()).toFixed(2));
						}
					}
				}
			},
			
			onPCitemsSave : function(oEvent) {
				var paymentValue = parseFloat(sap.ui.getCore().byId("id_enAmnt").getValue());
				var VATvalue     = parseFloat(sap.ui.getCore().byId("id_eVATno").getSelectedKey());
				if (paymentValue === "") {
					sap.ui.getCore().byId("id_enAmnt").setValueState(sap.ui.core.ValueState.Error);
				} 
//				else if(paymentValue <= VATvalue){
//					var msg = this.getResourceBundle().getText("ItemSaveVATerror");
//					jQuery.sap.require("sap.m.MessageBox");
//					sap.m.MessageBox.error(msg);
//				} 
				else {
				var tablObj = {};

				tablObj.Glaccount    = sap.ui.getCore().byId("id_expSet").getSelectedKey();
				tablObj.Ltext        = sap.ui.getCore().byId("id_expSet").getSelectedItem().mProperties.text;
				tablObj.Positiontext = sap.ui.getCore().byId("id_desc").getValue();
				tablObj.Matnr        = sap.ui.getCore().byId("id_eiRno").getValue();
				tablObj.Taxvalue     = sap.ui.getCore().byId("id_eVATno").getSelectedKey();
				tablObj.Vendor       = sap.ui.getCore().byId("id_vendor").getValue();
				tablObj.Currency     ='AED';
				tablObj.Ppayments    = (Math.round(sap.ui.getCore().byId("id_enAmnt").getValue()* 100) / 100).toString();
				tablObj.Netvalue     = sap.ui.getCore().byId("id_netValue").getValue();
				tablObj.Justification= sap.ui.getCore().byId("id_justification").getValue();
				
				if (tablObj.Netvalue){
					tablObj.Netvalue  = parseFloat(tablObj.Netvalue).toFixed(2);
				} else {
					tablObj.Netvalue  = 0;
				}
				
				var lTbl = this.lModel.getProperty("/cashtoitems");
				lTbl.push(tablObj);
				this.lModel.setProperty("/cashtoitems", lTbl);
				
				oEvent.getSource().getParent().close();
				
				var iTotalAmount = this.byId("eAmnt").getText();
				if (iTotalAmount === "0 AED"){
					iTotalAmount = tablObj.Netvalue;
				} else {
					iTotalAmount = parseFloat(iTotalAmount) + parseFloat(tablObj.Netvalue);
				}
				iTotalAmount = parseFloat(iTotalAmount).toFixed(2);
				this.byId("eAmnt").setText(iTotalAmount + ' AED');
				
				this._clearDialogue();
				}
			},
			
			handleUPCDelete : function(oEvent) {
				var sPath      = oEvent.getParameter('listItem').getBindingContext().getPath();
				var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
				var aItems     = this.lModel.getProperty('/cashtoitems');
				var fAmount    = aItems[index].Netvalue;
				var fNetAmount = parseFloat(this.getView().byId("eAmnt").getText());
					fNetAmount = fNetAmount - fAmount;
				this.byId("eAmnt").setText(fNetAmount + ' AED');	
				aItems.splice(index, 1);
				this.lModel.setProperty('/cashtoitems', aItems);
			},
			/**
			 * Called when the Controller is destroyed. Use this one to
			 * free resources and finalize activities.
			 * 
			 * @memberOf z_pr.app
			 */
			// onExit: function() {
			//
			// }

			onShowPR : function() {
				this.getOwnerComponent().getRouter().navTo("master");
			},

			onVendorTypeSelection : function(oEvent) {
				var oSelectedIndex = oEvent.getSource()
						.getSelectedIndex();
				if (oSelectedIndex === 1) {
					this.byId("VR_GeneralInformation").setVisible(false);
					this.byId("VR_LicenseDetail").setVisible(false);
					this.byId("VR_Freelancer").setVisible(true);
				} else {
					this.byId("VR_GeneralInformation").setVisible(true);
					this.byId("VR_LicenseDetail").setVisible(true);
					this.byId("VR_Freelancer").setVisible(false);
				}
			},

			handlePCaddButtonPressed : function(oEvent) {
				if (!this.pressDialog) {
					this.pressDialog = sap.ui.xmlfragment("z_pettycash_fi.view.fragment.PCitems", this);
					// to get access to the global
					// model
					this.getView().addDependent(this.pressDialog);
					jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pressDialog);
				}
				this.pressDialog.open();
			},

			onPCitemsClose : function(oEvent) {
				oEvent.getSource().getParent().close();
				this._clearDialogue();
			},
			
			_clearDialogue: function() {
				sap.ui.getCore().byId("id_expSet").setSelectedKey('');
				sap.ui.getCore().byId("id_desc").setValue('');
				sap.ui.getCore().byId("id_desc").setValueState('None');
				sap.ui.getCore().byId("id_eiRno").setValue('');
				sap.ui.getCore().byId("id_eiRno").setValueState('None');
				sap.ui.getCore().byId("id_eVATno").setValue('');
				sap.ui.getCore().byId("id_enAmnt").setValue('');
				sap.ui.getCore().byId("id_netValue").setValue('');
				sap.ui.getCore().byId("id_justification").setValue('');
				sap.ui.getCore().byId("id_justification").setValueState('None');
				sap.ui.getCore().byId("id_vendor").setValue('');
				sap.ui.getCore().byId("id_vendor").setValueState('None');
				sap.ui.getCore().byId("id_enAmnt").setValueState(sap.ui.core.ValueState.None);
			},
			
			handlePCsave: function(oEvent) {
				this.getView().setBusy(true);
				var sListItems      = this.lModel.getProperty("/cashtoitems").length;
				var sEmptyItemError = this.getResourceBundle().getText("PcEmptyItemError");
				if(sListItems === 0){
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.information(sEmptyItemError);
				} else {
					this._onPCsave(oEvent);
				}
			},
			
			handlePCsaveAndSubmit: function(oEvent) {
				var sListItems = this.lModel.getProperty("/cashtoitems").length;
				var sEmptyItemError = this.getResourceBundle().getText("PcEmptyItemError");
				var these = this;
				if(sListItems === 0){
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.information(sEmptyItemError);
				} else {
					this._onAggrement(oEvent);
				}
			},
			
			_onPCsave : function(oEvent) {
//				this.getModel().submitChanges();
//				var msg = 'Saved';
				var oCreateDate   = this.getView().byId("dtPick").getDateValue();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			          pattern: "yyyy-MM-dd"
				});
				var oDate = dateFormat.format(new Date(oCreateDate));
				oDate = oDate + "T00:00:00";
				
				var oUserName     = this.getView().byId('idPRname');
				var sPathUserName = oUserName.getBindingContext().sPath;
				var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
				var that          = this;
				
				var temObj         = {};
				temObj.Kostl       = this.getView().byId("ccDP").getSelectedKey()	;
//				temObj.Accountant  = this.getView().byId("usr_List").getValue();
				temObj.Accountant  = sUserid;
//				temObj.PostingDate = this.getView().byId("ccDP");
				temObj.Hnetamount  = parseFloat(this.getView().byId("eAmnt").getText()).toString();
//				temObj.Currency    = this.getView().byId("curr").getValue();
				temObj.Currency    = "AED";
//				temObj.Documentdate= this.getView().byId("dtPick").getDateValue();
				temObj.Documentdate= oDate;
				temObj.Flag3       = "I";
				temObj.cashtoitems = this.lModel.getProperty("/cashtoitems");
				temObj.navigcashtodms = this.docModel.getProperty("/navigcashtodms");
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						that.getView().setBusy(false);
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("PcSaveSuccess",[sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.lModel.setProperty("/cashtoitems",[]);
						that.docModel.setProperty("/navigcashtodms",[]);
						that.getView().byId("idPRname").setText(oUserName.getProperty("text"));
						that.getView().byId("eAmnt").setText('0 AED');
						that.getView().byId("dtPick").setDateValue(new Date());
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
			
			_onPCsaveSubmit : function(oEvent) {
//				this.getModel().submitChanges();
//				var msg = 'Saved';
				var oCreateDate   = this.getView().byId("dtPick").getDateValue();
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			          pattern: "yyyy-MM-dd"
				});
				var oDate = dateFormat.format(new Date(oCreateDate));
				oDate = oDate + "T00:00:00";
				
				var oUserName     = this.getView().byId('idPRname');
				var sPathUserName = oUserName.getBindingContext().sPath;
				var sUserid       = oUserName.getModel().getProperty(sPathUserName).Userid;
				var that          = this;
				
				var temObj         = {};
				temObj.Kostl       = this.getView().byId("ccDP").getSelectedKey()	;
//				temObj.Accountant  = this.getView().byId("usr_List").getValue();
				temObj.Accountant  = sUserid;
//				temObj.PostingDate = this.getView().byId("ccDP");
				temObj.Hnetamount  = parseFloat(this.getView().byId("eAmnt").getText()).toString();
//				temObj.Currency    = this.getView().byId("curr").getValue();
				temObj.Currency    = "AED";
//				temObj.Documentdate= this.getView().byId("dtPick").getDateValue();
				temObj.Documentdate= oDate;
				temObj.Flag3       = "I";
				temObj.Wfsubmit    = "X";
				temObj.cashtoitems = this.lModel.getProperty("/cashtoitems");
				temObj.navigcashtodms = this.docModel.getProperty("/navigcashtodms");
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						that.getView().setBusy(false);
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("PcSubmitSuccess",[sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.lModel.setProperty("/cashtoitems",[]);
						that.docModel.setProperty("/navigcashtodms",[]);
						that.getView().byId("idPRname").setText(oUserName.getProperty("text"));
						that.getView().byId("eAmnt").setText('0 AED');
						that.getView().byId("dtPick").setDateValue(new Date());
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
										this.getView().setBusy(true);
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

			handlePCCancel : function(oEvent) {
//				jQuery.sap.require("sap.m.MessageBox");
//				sap.m.MessageBox.confirm(
//						"Are you sure you want to Cancel?", {
//							icon : sap.m.MessageBox.Icon.WARNING,
//							title : "Cancel",
//						});
				this.lModel.setProperty("/cashtoitems",[]);
				this.getView().byId("eAmnt").setText('0 AED');
				this.getView().byId("dtPick").setDateValue(new Date());
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
//				 tablObj.matrnBudExem =sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getValue();
				// File Upload
				var tablObj = {};
				  var fragmentId       = this.getView().createId("itemsFragment");
//				  if(this.sId)
//					  tablObj.PreqItem = (this.lModel.getProperty("/navigcashtodocuments/results").length+1).toString();
//				  else
//					  tablObj.PreqItem = (this.docModel.getProperty("/navigcashtodocuments").length+1).toString();
				  tablObj.Serialno     = (this.docModel.getProperty("/navigcashtodms").length+1).toString();
//				  var matrnFile        =sap.ui.core.Fragment.byId(fragmentId, "matrnFile");
				  var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
				  var tblFileInputId   = matrnFile .getId() +'-fu';
				  var reader           = new FileReader();
				  var tblFileInput     = $.sap.domById(tblFileInputId);
				  var tblFile          = tblFileInput.files[0];
				  tablObj.Docfile      = tblFile.name;
				  tablObj.Mimetype     = tblFile.type;
				  var base64marker     = 'data:' + tblFile.type + ';base64,';
				  var dArr             = this.docModel.getProperty("/navigcashtodms");
				  var that             = this;
				  
				  reader.onload =
				  (function(theFile) {
					  return function(evt) {
						  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
						  	var base64       = evt.target.result.substring(base64Index);
						  	tablObj.Filedata = base64.toString(); 
						  	dArr.push(tablObj);
						  	that.docModel.setProperty("/navigcashtodms",dArr);
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