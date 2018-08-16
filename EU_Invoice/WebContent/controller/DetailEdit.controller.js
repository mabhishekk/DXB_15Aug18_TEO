sap.ui.define([
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_user_invoice/model/formatter",
		'sap/ui/model/Filter',
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/Button',
		"z_user_invoice/controller/BaseController", 
	], function(History, Device, MessageBox, formatter, Filter, Dialog, Text, Button, Controller){
		"use strict";
		
		var PageController = Controller.extend("z_user_invoice.controller.DetailEdit",{
			// get the formatter
			formatter : formatter,
			//get the text from Internationalization
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit: function() {
				this.getView().setBusy(true);
				this.lModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.lModel, "lModel");
				
				this.getOwnerComponent().getRouter().getRoute("invoiceDetailsEdit").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._PoNumber    = oEvent.getParameter("arguments").sId;
				this._InvNumber   = oEvent.getParameter("arguments").sInv;
				this._UrlLoadData(this._PoNumber, this._InvNumber);
			},
			
			_UrlLoadData: function(sPoNumber, sInvNumber){
				var viewData      = {
						"InvInfo"      : {},
						"PoInfo"       : {},
						"MatData"      : {},
						"SrvDat"       : {},
						"naviginvtodms": [],
						"LocalTaxData" :[
							{'Mwskz':'V0', 'Text1':'0 %'}, 
							{'Mwskz':'V2', 'Text1':'5 %'}, 
							{'Mwskz':'VX', 'Text1':'RCM'}
						]
				};
				this.lModel.setData(viewData);
				var sInvHeadPath  = "/INVHEADDISPSet('"+ this._InvNumber + "')";
				var iconTab       = this.byId("id_iconTB");
				iconTab.setSelectedKey("IN");
				var oMdl          = this.getOwnerComponent().getModel();
				oMdl.read(sInvHeadPath, {
					success : function(oData) {
						this.lModel.setProperty("/InvInfo",oData);
//						this.sDocType = 
					}.bind(this),
					error : function(oError) {
						this.getView().setBusy(false);
						var err   = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
						var sErr  = err.getElementsByTagName("message")[0].innerHTML
						MessageBox.error(sErr, {
							title : "Error",
						});
					}.bind(this),
					urlParameters : {
						"$expand" : "navtoinvitemdisp"
					}
				});
				var sPoInvPath    = "/INVHEADERSet('"+this._PoNumber+"')";
				var oMdl          = this.getOwnerComponent().getModel();
				oMdl.read(sPoInvPath, {
					success : function(oData) {
						this.getView().setBusy(false);
						this.lModel.setProperty("/PoInfo",oData);
					}.bind(this),
					error : function(oError) {
						this.getView().setBusy(false);
						var err   = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
						var sErr  = err.getElementsByTagName("message")[0].innerHTML
						MessageBox.error(sErr, {
							title : "Error",
						});
					}.bind(this),
					urlParameters : {

					}
				});
				this._UploadTableDoc(this._InvNumber);
			},
			
			_UploadTableDoc: function(sInvNumber){
				this.lModel.setProperty('/naviginvtodms',[]);
				var oModel  = this.getView().getModel();
				var fltr = "pogrinvnumber  eq '"+ sInvNumber +"'";
				var that = this;
				oModel.read("/FilelistSet",{
					success:function(oData){
						this.lModel.setProperty("/naviginvtodms", oData.results);
					}.bind(this),
					error:function(oError){
					},
					urlParameters:{
						"$filter":fltr
					}
				})
			},
			
			onItemPress: function(oEvent){
				var sPath               = oEvent.getSource().oBindingContexts.lModel.sPath;
				var aPathData           = this.lModel.getProperty(sPath);
				this.selectedMatDocNo   = aPathData.Matdocno;
				this.selectedMatDocItem = aPathData.Matdocitem;
				
				if (!this.ServiceOrderDialog) {
					this.ServiceOrderDialog = sap.ui.xmlfragment(this.createId("ServiceOrderDetail"),"z_user_invoice.view.fragment.ServiceOrder",this); 
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
			
			onServiceOrderClose: function(oEvent){
		        oEvent.getSource().getParent().close();
		    },
			
		    _onSubmit: function(oEvent){
		    	this.getView().setBusy(true);
		    	var aInvheader     = this.lModel.getProperty('/InvInfo'),
		    		aItem          = this.lModel.getProperty('/InvInfo/navtoinvitemdisp/results'),
		    		i;
//		    	var aInvItem       = JSON.parse(JSON.stringify(aItem)),
		    	var	aInvItem       = jQuery.extend(true, [], aItem),
		    		iInvItemlength = aInvItem.length,
		    	    that           = this,
				    temObj         = {};
				
				temObj.Invno       = this._InvNumber;
				temObj.PoNumber    = aInvheader.PoNumber;
				temObj.Vendor      = aInvheader.Vendor;
				temObj.Vendor_name = aInvheader.Vendor_Name;
				temObj.Pmnttrms    = aInvheader.Pmnttrms;
				temObj.Ptermtext   = "";
				temObj.Currency    = aInvheader.Currency;
				temObj.VendorInvNo = aInvheader.INVReversedocno;
				temObj.Invpostdate = aInvheader.Invpostdate;
				temObj.Invdate     = aInvheader.Invdate;
				temObj.GRAmt       = aInvheader.Totalgramt;
				temObj.Flag        = "U";
				
				for(i = 0; i < iInvItemlength; i++){
					aInvItem[i].Currency      = "";
					aInvItem[i].InvoiceAmount = aInvItem[i].ItemAmount;
					aInvItem[i].MatDocItem    = aInvItem[i].Matdocitem;
					aInvItem[i].MatDocNo      = aInvItem[i].Matdocno;
					aInvItem[i].MatDocYear    = aInvItem[i].Invyear;
					aInvItem[i].PoNumber      = this._PoNumber;
					aInvItem[i].Tax_Code      = aInvItem[i].TaxCode;
					aInvItem[i].InvQty        = aInvItem[i].Grquantity;
					aInvItem[i].Grquantity    = aInvItem[i].Grqtydelivered;
					if( this.lModel.getProperty('/InvInfo/DocType') === '9'){
						delete aInvItem[i].GRAmount;
						aInvItem[i].GRAmount  = aInvItem[i].ItemAmount;
					}
					delete aInvItem[i].Invitem;
					delete aInvItem[i].Invno;
					delete aInvItem[i].Invyear;
					delete aInvItem[i].ItemAmount;
					delete aInvItem[i].Matdocitem;
					delete aInvItem[i].Matdocno;
					delete aInvItem[i].TaxCode;
					delete aInvItem[i].Vatvalue;
					delete aInvItem[i].INVHEADDISP;
					delete aInvItem[i].__metadata;
					delete aInvItem[i].__proto__;
				}
				
				temObj.navtoinvitem = aInvItem;
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/INVHEADERSet",temObj,{
					success:function(oData){
						that.getView().setBusy(false);
						var sInvno = oData.Invno;
						var msg = that.getResourceBundle().getText("SubmitSuccess", [sInvno]);
						jQuery.sap.require("sap.m.MessageBox");
//						that.lModel.setProperty("/navtoinvitem/results",[]);
//						that.docModel.setProperty("/naviginvtodms",[]);
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
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						MessageBox.error(eMsg,{
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						});
					}
				})
		    },
		    
			handleCancel: function(oEvent){
				this.getOwnerComponent().getRouter().navTo("invoiceDetailsDisplay",{sId: this._PoNumber},!Device.system.phone);
			},
			
			// upload document to DMS
		      onFileUpload:function(oEvent){
					this.getView().setBusy(true);
					var tablObj        = {};
					var doknr          = this.lModel.getProperty('/InvInfo/Documentnumber');
				    var fragmentId     = this.getView().createId("itemsFragment");		 
					var matrnFile      = this.byId("EditMatrnFile");
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
							var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
							var base64       = evt.target.result.substring(base64Index);
							tablObj.Filedata = base64; 
//							if(doknr != ""){
								tablObj.addordelete = "A";
								tablObj.Doknr         = doknr;
								tablObj.pogrinvnumber = that._sInvNo;
							  	that.getView().getModel().create("/FilelistSet",tablObj,{
							  		success:function(oData){
							  			var dArr       = this.lModel.getProperty("/naviginvtodms");
							  			dArr.push(oData);
							  			that.lModel.setProperty("/naviginvtodms",dArr);
							  			that.getView().getModel().refresh();
							  			that._UploadTableDoc(that._InvNumber);
							  			that.getView().setBusy(false);
							  		}.bind(that),
							  		error:function(oError){
							  			that.getView().setBusy(false);
							  			this._handleError(oError);
							  		}.bind(that)})
//						  	}else{
//							  	}
						  	matrnFile.clear();
						}
					  
					})();
					  reader.readAsDataURL(tblFile);
				},
				
				onFileDelete: function(oEvent){
			    	  var Obj   = oEvent.getParameter('listItem').getBindingContext('lModel').getObject();
					  var sPath = oEvent.getParameter('listItem').getBindingContext('lModel').getPath();
					  this._onFileDelete(oEvent, Obj, sPath);
			      }
		});
		return PageController;
	});