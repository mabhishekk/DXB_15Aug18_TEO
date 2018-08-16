sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Label',
		'sap/m/MessageToast',
		'sap/m/Text',
		'sap/m/TextArea',
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/ui/model/Filter',
		"z_inbox/model/formatter" ,
		'sap/m/ObjectIdentifier'
	], function(Button, Dialog, Label, MessageToast, Text, TextArea, 
			Controller, History, Device, MessageBox, Filter, formatter, ObjectIdentifier){
		"use strict";
		
		var PageController = Controller.extend("z_inbox.controller.invoice.invoiceDisplay",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit : function() {
				this.lModel      = new sap.ui.model.json.JSONModel();
				this.getOwnerComponent().getRouter().getRoute("Invoice").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this.lModel.setProperty('/naviginvtodms',[]);
				this.getView().setModel(this.getView().getModel("poService"));
				this._sWorkItemId= oEvent.getParameter("arguments").instId;
				this._InvoiceNo  = oEvent.getParameter("arguments").id;
				this._sId = "/INVHEADDISPSet('"+  this._InvoiceNo +  "')";
				this.getView().bindElement(this._sId);
				var sInvNo = this._InvoiceNo;
				this._bindView(sInvNo);
				this._UploadTableDoc(sInvNo);
				this.getOwnerComponent().getModel().refresh();
			},
			
			_bindView: function(sInvNo){
				var sPath  = "/INVHEADDISPSet('"+sInvNo +"')";
				var oInvModel = this.getOwnerComponent().getModel('poService');
				oInvModel.read(sPath,{
					success : function(oData) {
						this._sDocumentnumber = oData.Documentnumber;
						this._PoNumber        = oData.PoNumber;
						this._PrNumber        = oData.PreqNo;
						this._Requesttype     = oData.Zrequesttype;
						var sDocType          = oData.DocType;
						this._bindTable(sPath, sDocType);
					}.bind(this),
					error : function(oError) {
						console.log(oData);
					}.bind(this)
				});
				this.getView().byId('idInvoiceHeader').bindElement(sPath);
			},
			
			_bindTable: function(sPath, sDocType){
				if(sDocType === '9'){
					this.getView().byId('idMaterialContainer').setVisible(false);
					this.getView().byId('idServiceContainer').setVisible(true);
					this._bindServiceTable(sPath);
				}else{
					this.getView().byId('idMaterialContainer').setVisible(true);
					this.getView().byId('idServiceContainer').setVisible(false);
					this._bindMaterialTable(sPath);
				}
			},
			
			_bindMaterialTable: function(sPath){
				var oElement  = this.getView().byId("id_Invoice_displayItems");
				var oTemplate = new sap.m.ColumnListItem({
					cells:[
						new Text({ text: "{Invitem}"}),
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{Quantity}"}),
						new Text({ text: "{Grqtydelivered}"}),
						new Text({ text: "{Poqtypending}"}),
						new Text({ text: "{Grquantity}"}),
						new Text({ text: "{Orderunit}"}),
						new Text({ text: "{ItemAmount}"}),
						new Text({ text: {path: "TaxCode",
				              formatter: function(sValue){
				                    if (sValue === 'V0'){
				                      return '0 %';
				                    }else if(sValue === 'V2'){
				                      return '5 %';
				                    }else if(sValue === 'VX'){
				                      return 'RCM';
				                    }
				                  }
				                }}),
						new ObjectIdentifier({ title:"{Costcenter}", text:"{CCDesc}"}),
						new ObjectIdentifier({ title:"{Glaccount}", text:"{GLDesc}"}),
					]
				});
				var sPath = sPath + "/navtoinvitemdisp";
				oElement.bindItems(sPath, oTemplate);
			},
			
			_bindServiceTable: function(sPath){
				var that      = this; 
				var oElement  = this.getView().byId("id_Invoice_displayServiceItems");
				var oTemplate = new sap.m.ColumnListItem({
					type: "Active",
					press: function(oEvent){
						var oSelectedObject     = oEvent.getSource().getBindingContext().getObject();
						that.selectedMatDocNo   = oSelectedObject.Matdocno;
						that.selectedMatDocItem = oSelectedObject.Matdocitem;
						
						if (!that.ServiceOrderDialog) {
							that.ServiceOrderDialog = sap.ui.xmlfragment(that.createId("ServiceOrderDetail"),"z_inbox.view.invoice.ServiceOrder",that); 
							that.getView().addDependent(that.ServiceOrderDialog);
						}
						that.ServiceOrderDialog.open();
					},
					cells:[
						new Text({ text: "{Invitem}"}),
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{ItemAmount}"}),
						new Text({ text: {path: "TaxCode",
				              formatter: function(sValue){
				                    if (sValue === 'V0'){
				                      return '0 %';
				                    }else if(sValue === 'V2'){
				                      return '5 %';
				                    }else if(sValue === 'VX'){
				                      return 'RCM';
				                    }
				                  }
				                }}),
						new ObjectIdentifier({ title:"{Costcenter}", text:"{CCDesc}"}),
						new ObjectIdentifier({ title:"{Glaccount}", text:"{GLDesc}"}),
					]
				});
				var sPath = sPath + "/navtoinvitemdisp";
				oElement.bindItems(sPath, oTemplate);
			},
			
			_UploadTableDoc: function(sInvNo) {
				this.lModel.setProperty('/naviginvtodms',[]);
				var oModel    = this.getView().getModel('poService');
				var fltr      = "pogrinvnumber  eq '"+ sInvNo +"'";
				var oDocTable = this.getView().byId('id_docMnts');
				var that   = this;
				oModel.read("/FilelistSet",{
					success:function(oData){
						var files = that.lModel.getProperty("/naviginvtodms");
						that.lModel.setProperty("/naviginvtodms",$.merge(files,oData.results));
						oDocTable.setModel(that.lModel);
					}.bind(this),
					error:function(oError){
					},
					urlParameters:{
						"$filter":fltr
					}
				})
			},
			
			onServiceOrderDialogOpen: function(oEvent){
				var fragmentId   = this.getView().createId("ServiceOrderDetail");
				var ServiceTable = sap.ui.core.Fragment.byId(fragmentId,"id_GR_ServiceOrder");
				//Display Service Order
				var oServiceTemplate = new sap.m.ColumnListItem({
					cells:[
						new sap.m.Text({ text: "{Grktext1}"}),
						new sap.m.Text({ text: "{Grpercentage}"}),
						new sap.m.Text({ text: "{Gruom}"}),
						new sap.m.Text({ text: "{Currency}"}),
					]
				});
				var aFilters = [];
				aFilters.push( new Filter("Pono"  , "EQ", this.selectedMatDocNo  ));
				aFilters.push( new Filter("Poitem", "EQ", this.selectedMatDocItem));
				ServiceTable.setModel(this.getOwnerComponent().getModel('poService'));
				ServiceTable.bindItems({
					path : "/GRINVSERVICESSet",
					filters: new Filter(aFilters, true),
					template : oServiceTemplate
				});
			},
			
			handleApprove: function(oEvent) {
				if (!this.pressDialog) {
					this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
							"z_inbox.view.fragments.Approve",
							this);
					this.getView().addDependent(this.pressDialog);
					this.getView().byId('l5approve').setVisible(false);
					this.getView().byId('l5usr_List').setVisible(false);
				}
				this.pressDialog.open();				
			},
			
			onOpenApprove: function(oEvent) {
				var Level1Approver = this.getView().byId("l1usr_List");
				var Level2Approver = this.getView().byId("l2usr_List");
				var Level3Approver = this.getView().byId("l3usr_List");
				var Level4Approver = this.getView().byId("l4usr_List");
				var Level5Approver = this.getView().byId("l5usr_List");
				var oModel         = this.getView().getModel();
				
				var aFilters = [];
				var bFilters = [];
				var cFilters = [];
				var dFilters = [];
				var eFilters = [];
				var oTemplate= new sap.ui.core.ListItem({
					text : "{Fullname}",
					key : "{Defaultuser}"
				});
				
				aFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '1') );
				Level1Approver.bindItems({
					path : "/MGTAPPROVALSet",
					filters: new sap.ui.model.Filter(aFilters, true),
					template : oTemplate
				});
				
				bFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '2') );
				Level2Approver.bindItems({
					path : "/MGTAPPROVALSet",
					filters: new sap.ui.model.Filter(bFilters, true),
					template : oTemplate
				});
				
				cFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '3') );
				Level3Approver.bindItems({
					path : "/MGTAPPROVALSet",
					filters: new sap.ui.model.Filter(cFilters, true),
					template : oTemplate
				});
				
				dFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '4') );
				Level4Approver.bindItems({
					path : "/MGTAPPROVALSet",
					filters: new sap.ui.model.Filter(dFilters, true),
					template : oTemplate
				});
				
				eFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '5') );
				Level5Approver.bindItems({
					path : "/MGTAPPROVALSet",
					filters: new sap.ui.model.Filter(eFilters, true),
					template : oTemplate
				});
			},
			
			onApproveClose : function(oEvent) {
				oEvent.getSource().getParent().close();
			},
			
			handleApproveSave : function(oEvent) {
				this.onApproveClose(oEvent);
				var that   = this;
				var level1 = this.getView().byId("l1usr_List").getSelectedKey();
				var level2 = this.getView().byId("l2usr_List").getSelectedKey();
				var level3 = this.getView().byId("l3usr_List").getSelectedKey();
				var level4 = this.getView().byId("l4usr_List").getSelectedKey();
				var level5 = this.getView().byId("l5usr_List").getSelectedKey();
				
				var approver         = {};
				approver.Wiid        = this._sWorkItemId;
				approver.Level1      = level1;
				approver.Level2      = level2;
				approver.Level3      = level3;
				approver.Level4      = level4;
				approver.Level5      = level5;
//				approver.navigwitowiuser = [];
				var oModel = this.getOwnerComponent().getModel("fiService");
				oModel.create("/wfmgtuserselectSet", approver,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = "Request has been forwarded for approvals.";
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh()
						that.getOwnerComponent().getRouter().navTo("welcome",true);
						
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
			
			handleReject : function(oEvent) {
				if (!this.CancelDialog) {
					this.CancelDialog = new Dialog({
								title : this.getResourceBundle().getText("Reject"),
								type : 'Message',															
								content : new Text({
											text : this.getResourceBundle().getText("RejectMsg")
										}),
								beginButton : new Button({
									text : this.getResourceBundle().getText("PCYes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.CancelDialog.close();
										this._CancelYes(oEvent);
									}.bind(this)
								}),
								endButton : new Button({
									text : this.getResourceBundle().getText("PCNo"),
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
				var that = this;											
				var sPath = "/WF_UIAPPROVALSet(WiAagent='IN"+this._InvoiceNo+"',Wiid='" + this._sWorkItemId + "',Decision='R')"											
				this.getOwnerComponent().getModel().read(sPath,{
					success:function(oData){
						var msg = that.getResourceBundle().getText("RejectSuccess");
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh()
						that.getOwnerComponent().getRouter().navTo("welcome",true);
					}.bind(this),
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(emsg	);
					}
				});
			},
			
			onDocSelectionChange: function (oEvent) {
				var oSelected   = oEvent.getSource().getBindingContext().getObject();
				var sDoknr      = oSelected.Doknr;
				var sSerialno   = oSelected.Serialno;
				var sDocPath    = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" +sDoknr+"',lang='',ndavalue='" +sSerialno+ "')/$value ";
				window.open(sDocPath,true); 
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
				var dMdl        = this.getOwnerComponent().getModel('poService');			
				var fltr = "pogrinvnumber eq '"+this.fdelObj.pogrinvnumber+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
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
			},
			
			onFileUpload:function(oEvent){
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
				var dArr           = this.lModel.getProperty("/naviginvtodms");
				var that           = this;
				reader.onload      = (function(theFile) {
					return function(evt) {
						var base64Index       = evt.target.result.indexOf(base64marker) +base64marker.length; 
						var base64            = evt.target.result.substring(base64Index);
						tablObj.Filedata      = base64; 
						tablObj.addordelete   = "A";
						tablObj.Doknr         = doknr;
						tablObj.pogrinvnumber = that._InvoiceNo;
					  	that.getOwnerComponent().getModel('poService').create("/FilelistSet",tablObj,{
					  		success:function(oData){
					  			var dArr       = this.lModel.getProperty("/naviginvtodms");
					  			dArr.push(oData);
					  			that.lModel.setProperty("/naviginvtodms",dArr);
					  			that.getView().getModel('poService').refresh();
					  			that.getView().getModel().refresh();
					  			that._UploadTableDoc(that._InvoiceNo);
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
			handleECprint:function(){
		    	  debugger;
		        var lang            = sap.ui.getCore().getConfiguration().getLanguage();
		        var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='GR',appno='" +this._PoNumber+"',lang='"+lang+"',ndavalue='')/$value";
		        window.open(sPrintPath,true);
	        },
	        onPRnumber: function(oEvent){
	        	var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath;
				var reqType         = this._Requesttype;
				if(reqType       == "0"){
					sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRU',appno='" +this._PrNumber+"',lang='"+lang+"',ndavalue='')/$value";
				}else if(reqType == "2"){
					sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRE',appno='" +this._PrNumber+"',lang='"+lang+"',ndavalue='')/$value";		
				}else if(reqType == "1"){
					sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRR',appno='" +this._PrNumber+"',lang='"+lang+"',ndavalue='')/$value";	
				}
				window.open(sPrintPath,true);
	        	
//	        	var PrNumber = oEvent.getSource().getText();
//	        	this.getOwnerComponent().getRouter().navTo("PRdisplay", {id : PrNumber, instId : 'Display'});
	        },
	        onPOnumber: function(oEvent){
	        	var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath;
				sPrintPath          = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PO',appno='" +this._PoNumber+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true);
//	        	var PoNumber = oEvent.getSource().getText();
//	        	this.getOwnerComponent().getRouter().navTo("POdisplay", {id : PoNumber, instId : 'Display'});
	        },
	        
	        onQC: function(oEvent){
	        	var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath;
	        	sPrintPath          = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='QC',appno='" +this._PrNumber+"',lang='"+lang+"',ndavalue='')/$value";
	        	window.open(sPrintPath,true);
	        },
		    
	        handleEdit: function(oEvent){
	  		  this.getOwnerComponent().getRouter().navTo("InvoiceEdit", {instId: this._PoNumber, id: this._InvoiceNo, witem:this._sWorkItemId}, !Device.system.phone);
	        }
	        
		});
		return PageController;
});