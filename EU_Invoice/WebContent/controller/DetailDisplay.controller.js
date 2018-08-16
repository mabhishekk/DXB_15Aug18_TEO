sap.ui.define([
		"z_user_invoice/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/m/Text',
		'sap/m/ObjectIdentifier',
		'sap/ui/model/Filter',
		"z_user_invoice/model/formatter" 
	], function(Controller, History, Device, MessageBox, Text, ObjectIdentifier, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_user_invoice.controller.DetailDisplay",{
formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit : function() {
				this.lModel   = new sap.ui.model.json.JSONModel();
				this.docModel = new sap.ui.model.json.JSONModel();
				var docTbl    = this.getView().byId("id_docMnts");
				docTbl.setModel(this.lModel);
				var tableDocData = {"naviginvtodms" : []};
				this.docModel.setData(tableDocData);
				
				this.getOwnerComponent().getRouter().getRoute("invoiceDetailsDisplay").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._PoNumber = oEvent.getParameter("arguments").sId;
				this._sId      = "/INVPONODISPSet('"+  oEvent.getParameter("arguments").sId +  "')";
				var POmodel    = this.getOwnerComponent().getModel();
				POmodel.read(this._sId,{
					success : function(oData) {
						debugger;
						this._PrNumber = oData.PreqNo;
						this.lModel.setProperty('/InvInformation',oData);
					}.bind(this),
					error : function(oError) {
						
					}.bind(this)
				});
				POmodel.read("/INVHEADERSet('"+ this._PoNumber  +"')",{
		        	success : function(oData) {
		                this.lModel.setProperty('/PoInformation',oData);
		                var sPoCurrency = this.lModel.getProperty('/PoInformation/Currency');
		                this.getView().byId("idPoAmt").setText(this.lModel.getProperty('/PoInformation/Totalpoamt') + " " + sPoCurrency);
		                if(sPoCurrency === 'AED'){
		                	this.getView().byId("idGrAmt").setText(this.lModel.getProperty('/PoInformation/GRAmt') + " " + sPoCurrency);
		                }else{
		                	this.getView().byId("idGrAmt").setText(this.lModel.getProperty('/PoInformation/Totalgramt') + " " + sPoCurrency);
		                }
		                
		              }.bind(this),
		              error : function(oError) {

		              }.bind(this)
		        });
				this.getView().bindElement(this._sId);
				var oMdl       = this.getOwnerComponent().getModel();
				var sPath      = "/INVPONODISPSet('" + this._PoNumber + "')/potoinvnodisp"
				oMdl.read(sPath,{
					success : function(oData) {
						this.lModel.setData(oData);
						var sInvNo     = oData.results[0].Invno;
						var sDocStatus = oData.results[0].Invdesc;
			            this.getView().byId("idEdit").setVisible(sDocStatus === 'O'?true:false);
						this._sInvNo   = sInvNo;
						this.lModel.setProperty('/naviginvtodms',[]);
						this._bindView(sInvNo);
//						this._DocList(sInvNo);
						this._UploadTableDoc(sInvNo);
					}.bind(this),
					error : function(oError) {
						console.log(oData);
					}.bind(this)
				});
				
				this.getOwnerComponent().getModel().refresh();
			},
			
			onAfterRendering: function() {
				
			},
			
			_bindView: function(sInvNo){
				var sPath  = "/INVHEADDISPSet('"+sInvNo +"')";
				var oInvModel = this.getOwnerComponent().getModel();
				oInvModel.read(sPath,{
					success : function(oData) {
						this._sDocumentnumber = oData.Documentnumber;
						var sDocType          = oData.DocType;
						this._bindTable(sPath, sDocType);
					}.bind(this),
					error : function(oError) {
						console.log(oData);
					}.bind(this)
				});
				this.getView().byId('idInvoiceHeader').bindElement(sPath);
				this.getView().byId('idInvoiceHeader1').bindElement(sPath);
			},
			
//			_DocList: function(sInvNo) {
//				var oElement = this.getView().byId("idInvoiceDoc");
//				var oTemplate = new sap.m.StandardListItem({
//					title: "{Docfile}"
//				});
//				var aFilter =[];
//				aFilter.push(new Filter("pogrinvnumber", "EQ", sInvNo) );
//				oElement.bindItems({
//					path : "/FilelistSet",
//					filters: new Filter(aFilter, true),
//					template : oTemplate
//				});
//				
//			},
			
			_UploadTableDoc: function(sInvNo) {
				this.lModel.setProperty('/naviginvtodms',[]);
				var oModel  = this.getView().getModel();
				var fltr = "pogrinvnumber  eq '"+ sInvNo +"'";
				var that = this;
				oModel.read("/FilelistSet",{
					success:function(oData){
						var files = this.lModel.getProperty("/naviginvtodms");
						that.lModel.setProperty("/naviginvtodms",$.merge(files,oData.results));
					}.bind(this),
					error:function(oError){
					},
					urlParameters:{
						"$filter":fltr
					}
				})
			},
			
			onInvoiceSelect: function(oEvent){
				var sInvNo   = oEvent.getSource().getSelectedKey("text");
		        var aInvData = this.lModel.getProperty('/results');
		        for (var i = 0; i < aInvData.length; i++){
		        	if( sInvNo === aInvData[i].Invno){
		        		var sDocStatus = aInvData[i].Invdesc;
		        	}
		        };
		        this.getView().byId("idEdit").setVisible(sDocStatus === 'O'?true:false);
				this._sInvNo = sInvNo;
				this.lModel.setProperty('/naviginvtodms',[]);
				this._bindView(sInvNo);
//				this._DocList(sInvNo);
				this._UploadTableDoc(sInvNo);
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
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{Quantity}"}),
						new Text({ text: "{Grqtydelivered}"}),
						new Text({ text: "{Poqtypending}"}),
						new Text({ text: "{Grquantity}"}),
						new Text({ text: "{Orderunit}"}),
						new Text({ text: "{ItemAmount}"}),
//						new Text({ text: "{TaxCode}"}),
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
							that.ServiceOrderDialog = sap.ui.xmlfragment(that.createId("ServiceOrderDetail"),"z_invoice.view.fragment.ServiceOrder",that); 
							that.getView().addDependent(that.ServiceOrderDialog);
							jQuery.sap.syncStyleClass(that.getView().getController().getOwnerComponent().getContentDensityClass(), that.getView(), that.ServiceOrderDialog);
						}
						that.ServiceOrderDialog.open();
					},
					cells:[
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{ItemAmount}"}),
//						new Text({ text: "{TaxCode}"}),
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
		//Handle Icon tab bar 	
			
			
			handleCreate: function(oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPoNumber       = sBindingContext.getModel().getData(sBindingContext.sPath).PoNumber;
				this.getOwnerComponent().getRouter().navTo("invoiceDetailsCreate",{sId: sPoNumber},	true);
			},
			
			handleDelete:  function(oEvent){
				if (!this.DeleteDialog) {
					this.DeleteDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Delete"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("DeleteMsg")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Yes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.DeleteDialog.close();
										this._DeleteYes(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("No"),
									type : "Reject",
									press : function() {
										this.DeleteDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.DeleteDialog);
				}

				this.DeleteDialog.open();
			},
			
			_DeleteYes: function(oEvent){
				var that           = this;
				var temObj         = {};
				
				temObj.PoNumber    = this._PoNumber;
				temObj.Matdocno    = this.getView().byId('idinvoiceNo').getSelectedKey();
				temObj.Flag        = "D";
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/GRHEADERSet",{
					
					success:function(oData){
						var sMatdocno = oData.Matdocno;
						var msg = that.getResourceBundle().getText("DeleteSuccess", [sMatdocno]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
						
					},
					error:function(oData){
						var eMsg = JSON.parse(oData.responseText).error.message.value;
//						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//						jQuery.sap.require("sap.m.MessageBox");
						MessageBox.error(eMsg);
						debugger;	
					}
				})
			},
			
//			onFileUpload:function(oEvent){
//				var tablObj = {};
//				  var fragmentId       = this.getView().createId("itemsFragment");
//				  tablObj.Serialno     = (this.docModel.getProperty("/naviginvtodms").length+1).toString();
//				  var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
//				  var tblFileInputId   = matrnFile .getId() +'-fu';
//				  var reader           = new FileReader();
//				  var tblFileInput     = $.sap.domById(tblFileInputId);
//				  var tblFile          = tblFileInput.files[0];
//				  tablObj.Docfile      = tblFile.name;
//				  tablObj.Mimetype     = tblFile.type;
//				  var base64marker     = 'data:' + tblFile.type + ';base64,';
//				  var dArr             = this.docModel.getProperty("/naviginvtodms");
//				  var that             = this;
//				  
//				  reader.onload =
//				  (function(theFile) {
//					  return function(evt) {
//						  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
//						  	var base64       = evt.target.result.substring(base64Index);
//						  	tablObj.Filedata = base64.toString(); 
//						  	dArr.push(tablObj);
//						  	that.docModel.setProperty("/naviginvtodms",dArr);
//						  	matrnFile.clear();
//					  }
//				  })();
//				  reader.readAsDataURL(tblFile);
//			},
			
			onDocSelectionChange: function (oEvent) {
//				var oBindContext= oEvent.getSource().getSelectedItem().getBindingContext();
//				var oModel      = oBindContext.getModel();
//				var sPath       = oBindContext.getPath();
//				var sDoknr      = oModel.getData(sPath).Doknr;
//				var sSerialno   = oModel.getData(sPath).Serialno;
				var oSelected   = oEvent.getSource().getBindingContext().getObject();
				var sDoknr      = oSelected.Doknr;
				var sSerialno   = oSelected.Serialno;
				var sDocPath    = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" +sDoknr+"',lang='',ndavalue='" +sSerialno+ "')/$value ";
				window.open(sDocPath,true); 
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
						var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
						var base64       = evt.target.result.substring(base64Index);
						tablObj.Filedata = base64; 
//						if(doknr != ""){
							tablObj.addordelete = "A";
							tablObj.Doknr         = doknr;
							tablObj.pogrinvnumber = that._sInvNo;
						  	that.getView().getModel().create("/FilelistSet",tablObj,{
						  		success:function(oData){
						  			var dArr       = this.lModel.getProperty("/naviginvtodms");
						  			dArr.push(oData);
						  			that.lModel.setProperty("/naviginvtodms",dArr);
						  			that.getView().getModel().refresh();
						  			that._UploadTableDoc(that._sInvNo);
						  			that.getView().setBusy(false);
						  		}.bind(that),
						  		error:function(oError){
						  			that.getView().setBusy(false);
						  			this._handleError(oError);
						  		}.bind(that)})
//					  	}else{
//						  	}
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
		// onExit: function() {
		//
		// }
		      handleEdit: function(oEvent){
		    	  var sInvoiceNumber = this._sInvNo;
				  this.getOwnerComponent().getRouter().navTo("invoiceDetailsEdit", {sId: this._PoNumber, sInv: sInvoiceNumber}, !Device.system.phone);
		      },
		      
		      onFileDelete: function(oEvent){
		    	  var Obj   = oEvent.getParameter('listItem').getBindingContext().getObject();
				  var sPath = oEvent.getParameter('listItem').getBindingContext().getPath();
				  this._onFileDelete(oEvent, Obj, sPath);
		      }
		});
		
		return PageController;		
});