sap.ui.define([
		"z_inbox/controller/FiBaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_inbox/model/formatter" 
	], function(Controller, History, Device, MessageBox, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_inbox.controller.rewardsApprn.RewardsApprnEdit",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit: function() {
				this.lModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.lModel, "lModel");
				this.tempModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.tempModel, "tempModel");
				this.getView().byId("id_EditECexpTbl").setModel(this.lModel);
				this.getView().byId('idEditPettyCashDoc').setModel(this.lModel);
				this.getOwnerComponent().getRouter().getRoute("RewardsApprnEdit").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this.getView().setModel(this.getView().getModel("fiService"));
				this._sWorkItemId = oEvent.getParameter("arguments").instId;
				this.rId = oEvent.getParameter("arguments").id ;
				this._sId = "/RewardsSet('"+  oEvent.getParameter("arguments").id +  "')";
				this.getView().bindElement(this._sId);
				
				var oMdl = this.getOwnerComponent().getModel("fiService");
				oMdl.read(this._sId,{
					success : function(oData) {
						this.lModel.setData(oData);
						this.lModel.setProperty("/tempDelData",[]);
					}.bind(this),
					error : function(oError) {
						
					}.bind(this),
					urlParameters : {
						"$expand" : "navtoitem_rewards"
					}
				});
				
				var sFilter = "Postingnumber eq '" + this.rId + "'";
				oMdl.read("/FilelistSet", {success: function(oData){
						var vPath = "/navigrewardstodocuments";
						this.lModel.setProperty(vPath, oData.results);
					}.bind(this),
					urlParameters : {
						"$filter" : sFilter
					}
				})
			},
			
			onAfterRendering : function() {
				var sUserName = this.getView().byId("idERA_benificiaryName");
				sUserName.bindElement("/loginuserSet('')");
				
				var cmCC = this.getView().byId("idERA_dept");
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
		
//			onCurrencyInput: function(oEvent) {
//				var oVal = oEvent.getSource().getValue();
//				if (oVal === "") {
//					oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
//				} else {
//					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
//				}
//			},
			
			onCountrySelection: function(oEvent) {
				var sCountryKey = oEvent.getSource().getSelectedKey();
				
			    var sPath1 = "Land1";
			    var sOperator1 = "EQ";
			    var sValue1 = sCountryKey;
			    var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);

			    // get the list items binding
			    var oBinding = this.byId("idERA_region").getBinding("items");

			    //Apply filter(s)
			    oBinding.filter(oFilter1);
			},
		
		handleERewardsSaveAndSubmit: function(oEvent){
			var sListItems = this.lModel.getProperty("/navtoitem_rewards/results").length;
			var sItemMsg   = this.getResourceBundle().getText("ECEcEmptyItemError");
			if(sListItems === 0){
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.information(sItemMsg);
			} else {
				this._SaveSubmitRewards(oEvent);
			}
		},
			
		_SaveSubmitRewards: function(oEvent) {
			
			var that= this;
			var delItems      = this.lModel.getProperty("/tempDelData");
			var temObj = {};
			temObj.Postingnumber =  this.lModel.oData.Postingnumber;
			temObj.Accountant   = this.lModel.oData.Accountant;
			temObj.Documentdate = this.getView().byId("idERA_date").getDateValue(); 
			temObj.Hnetamount   = parseFloat(this.getView().byId("idEditECtotalAmt").getText()).toString();
			temObj.Currency     = 'AED';
			temObj.Kostl        = this.getView().byId("idERA_dept").getSelectedKey();
			temObj.Beneficiary  = this.getView().byId('idERA_benificiaryName').getSelectedKey(); ;
			temObj.Char3        = this.getView().byId("idERA_purpose").getValue();
			temObj.Reason        = this.getView().byId("idERA_reason").getValue();
			temObj.Flag3        = "U";
			temObj.Wfsubmit     = "X";
			temObj.navtoitem_rewards = this.lModel.getProperty("/navtoitem_rewards/results");
			for(var i =0;i<delItems.length;i++){	
				temObj.navtoitem_rewards.push(delItems[i]);		
			}
			var oModel = this.getOwnerComponent().getModel("fiService");
			oModel.create("/RewardsSet",temObj,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = that.getResourceBundle().getText("RARaUpdateSuccess",[sPostingNumber]);
					jQuery.sap.require("sap.m.MessageBox");					
//					sap.m.MessageBox.success(msg);
					that.getOwnerComponent().getModel().refresh();
					that.getOwnerComponent().getModel().refresh("fiService");
					that.getOwnerComponent().getRouter().navTo("RewardsApprn", {id : that.rId, instId : that._sWorkItemId });
					
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
		
		handleERewardsCancel : function(oEvent) {
			if (!this.CancelDialog) {
				this.CancelDialog = new sap.m.Dialog({
							title : this.getResourceBundle().getText("RACancel"),
							type : 'Message',
							draggable : true,
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("RACancelRequest"),
									}),
							beginButton : new sap.m.Button({
								text : this.getResourceBundle().getText("RAYes"),
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
				var sWiId          = this._sWorkItemId;
				var sBindingCnxt   = oEvent.getSource().getBindingContext();
				var sPostingNumber = sBindingCnxt.getModel().getData(sBindingCnxt.sPath).Postingnumber;
				this.getOwnerComponent().getRouter().navTo("RewardsApprn", {id: sPostingNumber, instId:this._sWorkItemId },	!Device.system.phone);
			} else {
				// There is no history!
				// Naviate to master page
				this.getOwnerComponent().getRouter().navTo("master", {},true);
			}
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
								text : this.getResourceBundle().getText("FIdelMsg",[sDocfile])
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
			if(this.rId){
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
	        var dArr           = this.lModel.getProperty("/navigrewardstodocuments");
	        var that           = this;
	        reader.onload      = (function(theFile) {
	        	return function(evt) {
		            var base64Index       = evt.target.result.indexOf(base64marker) +base64marker.length; 
		            var base64            = evt.target.result.substring(base64Index);
		            tablObj.Filedata      = base64; 
		            tablObj.addordelete   = "A";
		            tablObj.Doknr         = doknr;
		            tablObj.Postingnumber = that.rId;
		            that.tempModel.setProperty("/navigrewardstodocuments",tablObj);       // workaround as Odata not returning data properly
		            that.getView().getModel().create("/FilelistSet",tablObj,{
		            	success:function(oData){
		            		var dArr       = this.lModel.getProperty("/navigrewardstodocuments");
		            		var oData      = that.tempModel.getProperty("/navigrewardstodocuments"); // workaround
		            		delete oData.Filedata; // workaround
		            		delete oData.Mimetype; // workaround
		            		dArr.push(oData);
		            		that.lModel.setProperty("/navigrewardstodocuments",dArr);
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
		
		onSelection: function(oEvent) {
			this.cntxt = oEvent.getSource().getBindingContext();
			if (!this.ItemDetailDialog) {
				this.ItemDetailDialog = sap.ui.xmlfragment(
						"z_inbox.view.rewardsApprn.RAeditItems",
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
		
		onOpenDetailDialItem:function(oEvent){
			
			var sKostl = this.getView().byId("idERA_dept").getSelectedKey();
			var expSet = sap.ui.getCore().byId("id_EditECexpSet");
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
			
			var FGcurr = sap.ui.getCore().byId("id_EditFcurr");
			FGcurr.setModel(this.getView().getModel());
			FGcurr.setModel(this.lModel,"lModel");

			FGcurr.bindItems({
						path : "/currencySet",
						template : new sap.ui.core.ListItem(
								{
									key: "{Waers}", 
									text: "{Waers}",	
									additionalText: "{Landx50}"
								})
					});
			var FGcurrPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
			FGcurr.bindProperty("selectedKey",FGcurrPath); 
		},
		
		onItemsClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		onEditItemsReset: function(oEvent) {
			oEvent.getSource().getParent().close();
			var arr = this.cntxt.getPath().split("/");
			var items = this.lModel.getProperty('/navtoitem_rewards/results');
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
				temp.Matnr         = pcData.Matnr;
				temp.Ppayments     = pcData.Ppayments;
				temp.Fgnamount     = pcData.Fgnamount;
				temp.Currency      = pcData.Currency;
				temp.Exrate        = pcData.Exrate;
				tempDelData.push(temp);
				this.lModel.setProperty("/tempDelData",tempDelData);
			}
			var fAmount    = items[pInt].Ppayments;
			var fNetAmount = parseFloat(this.getView().byId("idEditECtotalAmt").getText());
				fNetAmount = fNetAmount - fAmount;
			this.byId("idEditECtotalAmt").setText(fNetAmount + ' AED');																						
			items.splice(pInt, 1);
			this.lModel.setProperty('/navtoitem_rewards/results',items);
		},
		
		handleECaddButtonPressed: function(oEvent) {
			if (!this.pressDialog) {
				this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
						"z_inbox.view.rewardsApprn.RAitems",
						this);
				// to get access to the global
				// model
				this.getView().addDependent(this.pressDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.pressDialog);
			}
			this.pressDialog.open();
		},
		
		onECdialog: function(oEvent) {
			var GLaccount  = this.getView().byId("id_ECexpSet");
			var CostCenter = this.getView().byId("idERA_dept").getSelectedKey();
			var sPath1     = "Kostl";
			var sOperator1 = "EQ";
			var sValue1    = CostCenter;
			var oFilter1   = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = this.getView().byId("id_ECexpSet").getBinding("items");
			
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
			var oUICore = this.getView();
			this._calculateNetAmount(oUICore);
		},
		
		_onCurrencyExch:  function(oCurrency, oUICore){
			if (oCurrency === "USD"){
				oUICore.byId("id_ECexch").setValue("3.675");
				oUICore.byId("id_ecVATno").setSelectedKey('0');
				oUICore.byId('idECvatLabel').setVisible(false);
				oUICore.byId("id_ecVATno").setVisible(false);
				oUICore.byId('idECexchRateLabel').setVisible(true);
				oUICore.byId("id_ECexch").setVisible(true);
			} else if (oCurrency === "AED") {
				oUICore.byId("id_ECexch").setValue("1.00");
				oUICore.byId('idECvatLabel').setVisible(true);
				oUICore.byId("id_ecVATno").setVisible(true);
				oUICore.byId('idECexchRateLabel').setVisible(false);
				oUICore.byId("id_ECexch").setVisible(false);
			} else {
				oUICore.byId("id_ecVATno").setSelectedKey('0');
				oUICore.byId('idECvatLabel').setVisible(false);
				oUICore.byId("id_ecVATno").setVisible(false);
				oUICore.byId('idECexchRateLabel').setVisible(true);
				oUICore.byId("id_ECexch").setVisible(true);
			}
		},
		
		_calculateNetAmount: function(oUICore){
			var sFCamount   = oUICore.byId("id_ECamt").getValue();
			var sFCcurrency = oUICore.byId("id_Fcurr").getSelectedKey();
			var sExhRate    = oUICore.byId("id_ECexch").getValue();
			var sAEDamount  = oUICore.byId("id_AEDamt").getValue();
			var sVatPercent = oUICore.byId("id_ecVATno").getSelectedKey();
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
			var sFCamount   = oUICore.byId("id_EditECamt").getValue();
			var sFCcurrency = oUICore.byId("id_EditFcurr").getSelectedKey();
			var sExhRate    = oUICore.byId("id_EditECexch").getValue();
			var sAEDamount  = oUICore.byId("id_EditAEDamt").getValue();
			var sVatPercent = oUICore.byId("idECeditVATno").getSelectedKey();
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
				oUICore.byId("id_EditECexch").setValue("3.675");
				oUICore.byId("idECeditVATno").setSelectedKey('0');
				oUICore.byId('idECeditVatLabel').setVisible(false);
				oUICore.byId("idECeditVATno").setVisible(false);
			} else if (oCurrency === "AED") {
				oUICore.byId("id_EditECexch").setValue("1.00");
				oUICore.byId('idECeditVatLabel').setVisible(true);
				oUICore.byId("idECeditVATno").setVisible(true);
			} else {
				oUICore.byId("idECeditVATno").setSelectedKey('0');
				oUICore.byId('idECeditVatLabel').setVisible(false);
				oUICore.byId("idECeditVATno").setVisible(false);
			}
		},
		
		onEditExVatVal: function(oEvent){
			var oUICore   = sap.ui.getCore();
			this._calculateEditedNetAmount(oUICore);
		},
		
		onEditItemsSave:function(oEvent){
			this.tAmnt = this.tAmnt + parseFloat(this.cntxt.getObject().Ppayments);
			this.lModel.setProperty("/Hnetamount",this.tAmnt);
			this.onItemsClose(oEvent);
		},
		
		onECitemsSave : function(oEvent) {
			var sForeignAmount = this.getView().byId("id_ECamt").getValue();
			if( sForeignAmount === ""){
				this.getView().byId("id_ECamt").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("id_AEDamt").setValueState(sap.ui.core.ValueState.Error);
			} else {
			
			var tablObj = {};

			tablObj.Glaccount    = this.getView().byId("id_ECexpSet").getSelectedKey();
			tablObj.Ltext        = this.getView().byId("id_ECexpSet").getSelectedItem().mProperties.text;
			tablObj.Positiontext = this.getView().byId("id_ECdesc").getValue();
			tablObj.Matnr        = this.getView().byId("id_ECinvRef").getValue();
			tablObj.Fgnamount    = sForeignAmount;
			tablObj.Currency     = this.getView().byId("id_Fcurr").getSelectedKey();
			tablObj.Exrate       = this.getView().byId("id_ECexch").getValue();
			tablObj.Ppayments    = this.getView().byId("id_AEDamt").getValue();
			
			if (tablObj.Ppayments){
				tablObj.Ppayments  = parseFloat(tablObj.Ppayments).toFixed(2);
			} else {
				tablObj.Ppayments  = 0;
			}
			
			var lTbl = this.lModel.getProperty("/navtoitem_rewards/results");
			lTbl.push(tablObj);
			this.lModel.setProperty("/navtoitem_rewards/results", lTbl);
			
			oEvent.getSource().getParent().close();
			
			var iTotalAmount = this.byId("idEditECtotalAmt").getText();
			if (iTotalAmount === "0 AED"){
				iTotalAmount = tablObj.Ppayments;
			} else {
				iTotalAmount = parseFloat(iTotalAmount) + parseFloat(tablObj.Ppayments);
			}
			iTotalAmount = parseFloat(iTotalAmount).toFixed(2);
			this.byId("idEditECtotalAmt").setText(iTotalAmount + ' AED');
			
			this._clearDialogue();
			}
		},
		
		_clearDialogue: function() {
			
			this.getView().byId("id_ECexpSet").setSelectedKey('');
//			this.getView().byId("id_ECexpSet").getValue();
			this.getView().byId("id_ECdesc").setValue('');
			this.getView().byId("id_ECinvRef").setValue('');
			this.getView().byId("id_ECamt").setValue('');
			this.getView().byId("id_Fcurr").setSelectedKey('AED');
			this.getView().byId("id_ECexch").setValue('1');
			this.getView().byId("id_AEDamt").setValue('');
		},
	});
	return PageController;
});
