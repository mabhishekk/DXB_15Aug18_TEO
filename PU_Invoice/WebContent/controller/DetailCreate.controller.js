sap.ui.define([
		"z_invoice/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_invoice/model/formatter",
		'sap/ui/model/Filter',
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/Button'
	], function(Controller, History, Device, MessageBox, formatter, Filter, Dialog, Text, Button){
		"use strict";
		
		var PageController = Controller.extend("z_invoice.controller.DetailCreate",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
		onInit: function() {
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			this.getView().byId("idInvMaterial").setModel(this.lModel);
			this.getView().byId("idInvService").setModel(this.lModel);
			
			this.docModel = new sap.ui.model.json.JSONModel();
			var docTbl    = this.getView().byId("idInvDoc");
			docTbl.setModel(this.docModel);
			var tableDocData = {"naviginvtodms" : []};
			this.docModel.setData(tableDocData);
			
			this.SOmodel = new sap.ui.model.json.JSONModel();
			var SOdata   = {"POservices": []};
			this.SOmodel.setData(SOdata);
			
			this.byId("idInvPostDate").setDateValue(new Date());
			this.byId("idInvDate").setDateValue(new Date());
			
			this.getOwnerComponent().getRouter().getRoute("invoiceDetailsCreate").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent) {
			this._PoNumber = oEvent.getParameter("arguments").sId;
			this._sId      = "/INVHEADERSet('"+  oEvent.getParameter("arguments").sId +  "')";
			var POmodel    = this.getOwnerComponent().getModel();
			POmodel.read(this._sId,{
				success : function(oData) {
					debugger;
					this._PrNumber = oData.Preq_no;
					this.lModel.setProperty('/InvInformation',oData);
				}.bind(this),
				error : function(oError) {
					
				}.bind(this)
			});
			this.getView().bindElement(this._sId);
			
			var oMdl = this.getOwnerComponent().getModel();
			oMdl.read(this._sId,{
				success : function(oData) {
					this.lModel.setData(oData);
					this.getView().byId("idInvMaterial").setModel(this.lModel);
					this.getView().byId("idInvService").setModel(this.lModel);
					this.lModel.setProperty("/tempDelData",[]);
					this.lModel.setProperty("/lSet",[]);
					this.lModel.setProperty('/LocalTaxData',[{'Mwskz':'V0', 'Text1':'0 %'}, {'Mwskz':'V2', 'Text1':'5 %'}, {'Mwskz':'VX', 'Text1':'RCM'}]);
				}.bind(this),
				error : function(oError) {
					
				}.bind(this),
				urlParameters : {
					"$expand" : "navtoinvitem"
				}
			});
			
			oMdl.read('/TAXCODESSet',{
				success : function(oData) {
					this.lModel.setProperty("/TAXCODESSet",oData);
				}.bind(this),
				error : function(oError) {
					
				}.bind(this)
			});
		},
		
		onAfterRendering : function() {
			
		},
		
		onPayTermSelect: function(oEvent) {
			var sText = oEvent.getSource().getSelectedItem().getProperty("additionalText");
			this.byId('idInvPaymentTermText').setText(sText);
		},
		
		onQuantity: function(oEvent){
			var oVal = oEvent.getSource().getValue();
			if (oVal === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},
		
		handleDelete: function(oEvent){
			var arr         = oEvent.getParameter("listItem").getBindingContext().getPath().split("/");
			var items       =  this.lModel.getProperty('/navtoinvitem/results');
			var pInt        = parseInt(arr[arr.length - 1]);
			var sGRamt      = items[pInt].GRAmount;
			var sTotalGrAmt = this.getView().byId('idTotalGrAmt').getText().split(' ')[0];
			var sTotalGrCur = this.getView().byId('idTotalGrAmt').getText().split(' ')[1];
			var sNetGrAmt   = Number(sTotalGrAmt) - Number(sGRamt);
			this.getView().byId('idTotalGrAmt').setText(sNetGrAmt+' '+sTotalGrCur);
			items.splice(pInt, 1);
			this.lModel.setProperty('/navtoinvitem/results',items);
		},
		
		handleSubmit: function(oEvent){
			var sInvDate   = this.getView().byId('idInvDate').getDateValue();
			var sInvBillno = this.getView().byId('idInvBillNo').getValue().length;
			var sInvAmount = this.getView().byId('idInvAmt').getValue().length;
			if( sInvDate === null ){
				MessageBox.error('Please fill mandatory fields.');
			}else if( sInvBillno == 0){
				MessageBox.error('Please fill mandatory fields.');
			}/*else if( sInvAmount == 0){
				MessageBox.error('Please fill mandatory fields.');
			}*/else{
				this.submitAggrement(oEvent);
			}
		},
		submitAggrement: function(oEvent){
			if (!this.ConfirmDialog) {
				this.ConfirmDialog = new Dialog({
							title     : this.getResourceBundle().getText("Confirm"),
							type      : 'Message',
							state     : 'Warning',
							draggable : true,
							content : new Text({
										text : this.getResourceBundle().getText("submitMsg")
									}),
							beginButton : new Button({
								text : this.getResourceBundle().getText("Yes"),
								type : "Accept",
								press : function() {
									this.ConfirmDialog.close();
									this.getView().setBusy(true);
									this._SubmitInvoice(oEvent);
								}.bind(this)
							}),
							endButton : new Button({
								text : this.getResourceBundle().getText("No"),
								type : "Reject",
								press : function() {
									this.ConfirmDialog.close();
								}.bind(this)
							})
						});

				// to get access to the global model
				this.getView().addDependent(this.ConfirmDialog);
			}

			this.ConfirmDialog.open();
		},
		_SubmitInvoice: function(oEvent) {
			this.getView().setBusy(true);
			var oData          = this.lModel.oData;
			var that           = this;
			var temObj         = {};
			
			temObj.PoNumber    = oData.PoNumber;
			temObj.Vendor      = oData.Vendor;
			temObj.Vendor_name = oData.Vendor_name;
			temObj.Pmnttrms    = this.byId('idInvPaymentTerm').getSelectedKey();
			temObj.Ptermtext   = this.byId('idInvPaymentTermText').getText();
//			temObj.InvAmt      = this.byId('idInvAmt').getValue();
			temObj.Currency    = this.byId('idInvAmtCurr').getSelectedKey();
			temObj.VendorInvNo = this.byId('idInvBillNo').getValue();
			temObj.Invpostdate = this.byId('idInvPostDate').getDateValue();
			temObj.Invdate     = this.byId('idInvDate').getDateValue();
			temObj.GRAmt       = oData.GRAmt;
			temObj.Flag        = "C";
			temObj.navtoinvitem                 = this.lModel.getProperty("/navtoinvitem/results");
//			temObj.navig_inv_header_to_services = this.SOmodel.getProperty("/POservices");
			temObj.naviginv_header_todms        = this.docModel.getProperty("/naviginvtodms");
			
			var oModel = this.getOwnerComponent().getModel();
			oModel.create("/INVHEADERSet",temObj,{
				
				success:function(oData){
					that.getView().setBusy(false);
					var sInvno = oData.Invno;
					var msg = that.getResourceBundle().getText("SubmitSuccess", [sInvno]);
					jQuery.sap.require("sap.m.MessageBox");
					that.lModel.setProperty("/navtoinvitem/results",[]);
					that.docModel.setProperty("/naviginvtodms",[]);
					sap.m.MessageBox.success(msg, {
						onClose: function(sAction) {
							that.getOwnerComponent().getRouter().navTo("invoiceDetailsDisplay", {sId: that._PoNumber}, true);
						}
					});
					that.getOwnerComponent().getModel().refresh();
					
				},
				error:function(oData){
					that.getView().setBusy(false);
					var eMsg = JSON.parse(oData.responseText).error.message.value;
//					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//					jQuery.sap.require("sap.m.MessageBox");
					MessageBox.error(eMsg);
					debugger;	
				}
			})
		},
		
		handleCancel : function(oEvent) {
			if (!this.CancelDialog) {
				this.CancelDialog = new sap.m.Dialog({
							title : this.getResourceBundle().getText("Cancel"),
							type : 'Message',
							draggable : true,
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("CancelMsg"),
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
				var sPoNumber         = this._PoNumber;
				this.getOwnerComponent().getRouter().navTo("invoiceDetailsDisplay",{sId: sPoNumber}, true);
			} else {
				// There is no history!
				// Naviate to master page
				this.getOwnerComponent().getRouter().navTo("master", {},true);
			}
		},
		
		onItemPress: function(oEvent){
			var oBindContext        = oEvent.getSource().getBindingContext();
			var sPath               = oBindContext.getPath();
			var selectedData        = this.lModel.getProperty(sPath);
			this.selectedMatDocNo   = selectedData.MatDocNo;
			this.selectedMatDocItem = selectedData.MatDocItem;
			
			if (!this.ServiceOrderDialog) {
				this.ServiceOrderDialog = sap.ui.xmlfragment(this.createId("ServiceOrderDetail"),"z_invoice.view.fragment.ServiceOrder",this); 
				this.getView().addDependent(this.ServiceOrderDialog);
			}
			this.ServiceOrderDialog.open();
		},
		
		onServiceOrderDialogOpen: function(oEvent){
			var fragmentId   = this.getView().createId("ServiceOrderDetail");
			var ServiceTable = sap.ui.core.Fragment.byId(fragmentId,"id_GR_ServiceOrder");
			//Display Service Order
			var oServiceTemplate = new sap.m.ColumnListItem({
				cells:[
					new sap.m.Text({ text: "{Grktext1}"}),
					new sap.m.Text({ text: "{Grossvalue} {Currency}"}),
					new sap.m.Text({ text: "{Grpercentage} %"}),
//					new sap.m.Text({ text: "{Currency}"}),
				]
			});
			var aFilters = [];
			aFilters.push( new Filter("Pono"  , "EQ", this.selectedMatDocNo  ));
			aFilters.push( new Filter("Poitem", "EQ", this.selectedMatDocItem));
			ServiceTable.setModel(this.getOwnerComponent().getModel());
			ServiceTable.bindItems({
				path : "/GRINVSERVICESSet",
				filters: new Filter(aFilters, true),
				template : oServiceTemplate
			});
		},
		
		onServiceOrderSave: function(oEvent){
			debugger;
			var fragmentId        = this.getView().createId("ServiceOrderDetail");
			var ServiceOrderTabel = sap.ui.core.Fragment.byId(fragmentId,"id_GR_ServiceOrder");
			 var localModel       = this.SOmodel.getProperty("/POservices");
			// complete context data assigned to row
			var contexts          = ServiceOrderTabel.getSelectedContexts();
			var itemsData         = contexts.map(function(c) { return c.getObject(); });
			
			//filter item Data, remove unwanted fields and set Grselect to true
			 for (var x = 0, len = itemsData.length; x < len; x++){
				 delete itemsData[x].__metadata;
				 delete itemsData[x].__proto__;
				//load the data into local JSON
				 localModel.push(itemsData[x]);
			 }
			this.onServiceOrderClose(oEvent);
		},
		
		onServiceOrderClose: function(oEvent){
			oEvent.getSource().getParent().close();
		},
		
		onFileUpload:function(oEvent){
			var tablObj = {};
			  var fragmentId       = this.getView().createId("itemsFragment");
			  tablObj.Serialno     = (this.docModel.getProperty("/naviginvtodms").length+1).toString();
			  var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
			  var tblFileInputId   = matrnFile .getId() +'-fu';
			  var reader           = new FileReader();
			  var tblFileInput     = $.sap.domById(tblFileInputId);
			  var tblFile          = tblFileInput.files[0];
			  tablObj.Docfile      = tblFile.name;
			  tablObj.Mimetype     = tblFile.type;
			  var base64marker     = 'data:' + tblFile.type + ';base64,';
			  var dArr             = this.docModel.getProperty("/naviginvtodms");
			  var that             = this;
			  
			  reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64       = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64.toString(); 
					  	dArr.push(tablObj);
					  	that.docModel.setProperty("/naviginvtodms",dArr);
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

