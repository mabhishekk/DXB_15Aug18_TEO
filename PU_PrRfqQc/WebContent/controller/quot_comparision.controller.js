//sap.ui.controller("providentia.pr.controller.quot_comparision", {
sap.ui.define([ 
	"providentia/pr/controller/BaseController", 
	"sap/ui/core/routing/History",
	"sap/ui/Device", 
	'sap/m/MessageBox',
	"providentia/pr/model/formatter",
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/Button',
	'sap/m/Table',
	'sap/m/Column',
	'sap/m/Label'
  ], function(Controller, History, Device, MessageBox, formatter, Dialog, Text, Button, Table, Column, Label) {
	return Controller.extend("providentia.pr.controller.quot_comparision",{
		formatter: formatter,
	onInit: function() {
		
//		if (!jQuery.support.touch) {
//			this.getView().addStyleClass(
//					"sapUiSizeCompact");
//		}
		this.getOwnerComponent().getRouter().getRoute("QC").attachPatternMatched(this._onRouteMatched,this);
		this.lModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(this.lModel,"lModel");
		this.byId("id_docMnts").setModel(this.lModel);
//		lModel.setData(tempData);
		this.comTbl = this.byId("tbl_Url");
		
	},


	_onRouteMatched:function(oEvent){
		
//		this.sId = oEvent.getParameter("arguments").id;
		this.getView().setBusy(true);
		try{
			this.sId= oEvent.getParameter("arguments").id;
			}catch(oEr){
				this.sId  ;	
				
			}
		
//		this.byId("QCPage").setTitle(this.sId);
		var iconTab = this.byId("id_iconTB");
		iconTab.setSelectedKey("QC");
		var vPath = "/PR_HEADERSet('" + this.sId + "')/prtoqrnavig";
		this.sPath = "/EBAN_DATASet('" + this.sId + "')";
		this.FnlQr = {};
		this.FnlVndr = {};
		var tData = {
				"navigqrtodocuments":[],
				"qrItem"            :{},
				"quotations"        :[],
				"deletedItem"       :[],
			 	"lSet": [
			 		{

			 				"Approvalid": "APP01",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP02",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP03",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP04",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP05",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			},
			 			{
			 				"Approvalid": "APP06",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			},
			 			{
			 				"Approvalid": "APP07",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}
			 		]			 	
			 }
		this.lModel.setData(tData);
		this.lModel.setProperty("/Banfn",this.sId);
//		this.byId("vendorSet").bindItems({
//			path : vPath,
//			template : new sap.ui.core.ListItem(
//					{
//						text : "{Vendorname}-{Ebeln}",						
//						key : "{Ebeln}"
//					})
//			
//		});
		this._loadQuotations(this.sId);
		
		this.byId("vendorSet").setSelectedKey("");
					
		var sPath = "/EBAN_DATASet('" + this.sId + "')/navigtoitems";
		var that = this;
		this.byId("comVbox").bindAggregation("content",{
			path:vPath,
			factory:function(sId, oContext){
				var oBndl = this.getResourceBundle();
				var oGrid = new sap.ui.layout.Grid({
					vSpacing :0,
					defaultSpan:"L5 M5 S12",
					content:[
						new sap.m.Text({text:oBndl.getText("Quotationno")}),
						new sap.m.Text({text:oContext.getObject().Ebeln}),
						new sap.m.Text({text:oBndl.getText("vendor")}),
						new sap.m.Text({text:oContext.getObject().Vendorname})]
				}).addStyleClass("sapUiSmallMarginTop");
				
				var Hbx = new sap.m.HBox({
					items:[new sap.m.CheckBox({
						selected:{
					          parts: [{path: 'Fixpo'}],
					            formatter: function(oValue) {
					              if(oValue === 'X') {
					                return true;
					              }
					              else {
					                return false;
					              }
					            }
					          },
			            editable:{
					          parts: [{path: 'Fixpo'}],
					            formatter: function(oValue) {
					              if(oValue === 'X') {
					                return false;
					              }
					              else {
					                return true;
					              }
					            }
					          },
						select:[this.SelectQR, this]
					}),
					oGrid,
					new sap.m.Text({ text:"{Currency}"})],
					alignItems:"Center"
				});
				 
				 var oTable = new Table({
					 columns:[ 
						 new Column({header:[ new Label({text: oBndl.getText("Description") })]}),
						 new Column({header:[ new Label({text: oBndl.getText("Quantity"   ) })]}),
						 new Column({header:[ new Label({text: oBndl.getText("Value"      ) })]}),
						 new Column({header:[ new Label({text: oBndl.getText("Disvalue"   ) })]}),
						 new Column({header:[ new Label({text: oBndl.getText("Discount"   ) })]}),
						 new Column({header:[ new Label({text: oBndl.getText("SubTotal"   ) })]}),
						 new Column({header:[ new Label({text: oBndl.getText("Vval"       ) })]}),
						 new Column({header:[ new Label({text: oBndl.getText("NetPrice"   ) })]})
					 ]
				 });
				 var oTemplate = new sap.m.ColumnListItem({
					cells:[
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{TargetQty} {Unit}"}),
						new Text({ text: "{NetPrice}"}),
						new Text({ text: "{Discountval} %"}),
						new Text({ text: { parts : [{ path:"NetPrice"}, { path:"Discountval"}], formatter: formatter.discountValue }}),
						new Text({ text: "{Subtotal}"}),
						new Text({ text: "{Valvalue} %"}),
						new Text({ text: "{Finaltotal}"})
					]
				});
				 var sId = oContext.getObject().Ebeln;
				 var vPath = "/qrheaderSet('" + sId + "')/qrnavig"; 
//				 oTable.bindRows(vPath)
				 oTable.bindItems({
						path : vPath,
						template : oTemplate
					});
				return new sap.m.VBox({
					items:[Hbx,oTable]
					
				});
			
			}.bind(this)
//			filters:[new sap.ui.model.Filter("Vendor",sap.ui.model.FilterOperator.StartsWith, "0000000000")]
			
		});
		
		this.getView().setBusy(false);
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
		var oTemplate= new sap.ui.core.ListItem(
				{
					text : "{Fullname}",
					key : "{Defaultuser}"
				});
		
		aFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '1') );
		Level1Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(aFilters, true),
			template : oTemplate
		});
		
		bFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '2') );
		Level2Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(bFilters, true),
			template : oTemplate
		});
		
		cFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '3') );
		Level3Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(cFilters, true),
			template : oTemplate
		});
		
		dFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '4') );
		Level4Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(dFilters, true),
			template : oTemplate
		});
		
		eFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '5') );
		Level5Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(eFilters, true),
			template : oTemplate
		});
	},
	
	
	
	onRecOthersReason:function(oEvent){
		
		var isSelect = oEvent.getParameter('selected');
		if(isSelect){
			this.getView().byId("qc_Others").setVisible(true);	
			
		}else{
			this.getView().byId("qc_Others").setVisible(false);
			
		}
		
	},
	
	//Final QR's Submit
	onSFnlQR: function(oEvent){
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
								this._onSFnlQR(oEvent);
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
	_onSFnlQR:function(oEvent){
		
		this.getView().setBusy(true);
		var tObj = {};
		tObj.Banfn = this.sId;
		
		tObj.navigprtoqrwf = this.lModel.getProperty("/fnlObj");	
		var that = this;
		var oModel = this.getOwnerComponent().getModel();
		oModel.create("/PR_HEADERSet",tObj,{
			success:function(oData){
				that.qcReset();
				that.qcReasnDialog.close();					
				var shText = that.getResourceBundle().getText("qrSelected");
//				+ oData.Banfn;
				that.getOwnerComponent().getModel().refresh();
				that.getView().setBusy(false);
				that.FnlQr = {};
				var tData = {
					 	"lSet": [
					 		{

					 				"Approvalid": "APP01",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP02",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP03",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP04",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP05",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			},
					 			{
					 				"Approvalid": "APP06",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			},
					 			{
					 				"Approvalid": "APP07",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}
					 		]			 	
					 }
				that.lModel.setDate(tData);
				MessageBox.success(
						shText, {
							
							title : that.getResourceBundle().getText("Success"),
						});
				
			},
			error:function(oError){
				
				that.getView().setBusy(false);
				that._handleError(oError);
//				that.qcReasnDialog.close();
				
			}
			
		});
		
		
		
	},
	
	SelectQR:function(oEvent){
		
		var isSelectd = oEvent.getParameter("selected");
		this.Ebeln = oEvent.getSource().getBindingContext().getObject().Ebeln;
//		this.FnlQr.push(Ebeln);
		
		if(isSelectd){
		if (!this.qcReasnDialog) {
			
			
			
			this.qcReasnDialog = sap.ui.xmlfragment(this.getView().sId,"providentia.pr.view.fragments.confirmDialog",this); 
			this.getView().addDependent(this.qcReasnDialog);
			jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.qcReasnDialog);
			this.qcReasnDialog.setModel(this.lModel);
		}	
		try{
			 arFnlObj = this.lModel.getProperty("/fnlObj")||[];
		}catch(e){
			
			arFnlObj = [];
		}
		arFnlObj.push({Ebeln:this.Ebeln,Preqno:this.sId,Fixpo:"X"});
		this.lModel.setProperty("/fnlObj",arFnlObj);
		this.qcReasnDialog.open();
		}else{
			
			var arrFnlObj = this.lModel.getData().fnlObj;
			
			for(var i=0;i<arrFnlObj.length;i++){
				
				if(this.Ebeln == arrFnlObj[i].Ebeln){
					
					arrFnlObj.splice(i,1);
					this.lModel.setProperty("/fnlObj",arrFnlObj);
				}
				
			}
			
			
		}
		
	},
	
	//method for Netprice value calculation at item level
	
	subTotalCalc: function(oEvent){
		var rowCells       = oEvent.getSource().getParent().getCells();
		var discPerc       = rowCells[4].getLiveValue();
		var TargetQty      = rowCells[1].getLiveValue();       //Quantity from Row
		var perUnitPrice   = rowCells[3].getLiveValue();       //Per Unit Price form Row
		var totalQuanVal   = TargetQty * perUnitPrice;
//		var sDiscountValue = ((Number(perUnitPrice) * Number(discPerc)/100)).toFixed(2);
		var iDiscountValue = (Number(perUnitPrice) * Number(discPerc)/100);
		var subTotal       = Number(TargetQty) * (Number(perUnitPrice) - iDiscountValue);
//		var subTotal       = totalQuanVal-((discPerc * totalQuanVal)/100);
		var TotalVatValue  = ((subTotal*rowCells[7].getSelectedKey())/100);
		var gTotal         = subTotal + TotalVatValue;
		gTotal             = parseFloat(gTotal).toFixed(2);
		subTotal           = parseFloat(subTotal).toFixed(2);
		var sDiscountValue = parseFloat(iDiscountValue).toFixed(2);
		rowCells[6].setText(subTotal);
		rowCells[8].setText(gTotal);
		if (parseFloat(discPerc) > 100 ){
			rowCells[4].setValueState('Error');
		}else{
			rowCells[4].setValueState('None');
		}
	},
		
	liveDiscValChange: function(oEvent){
		var sDiscountValue = oEvent.getSource().getLiveValue();
		var rowCells       = oEvent.getSource().getParent().getCells();
		var perUnitPrice   = rowCells[3].getValue();
		var sDiscountPer   = (Number(sDiscountValue) / Number(perUnitPrice) * 100 ).toFixed(2);
		rowCells[4].setValue(sDiscountPer);
		this.subTotalCalc(oEvent);
	},
	
	liveDiscPerChange: function(oEvent){
		var sDiscountValue = oEvent.getSource().getLiveValue();
		var rowCells       = oEvent.getSource().getParent().getCells();
		var perUnitPrice   = rowCells[3].getValue();
		var sDiscountVal   = (Number(perUnitPrice) * Number(sDiscountValue)/100).toFixed(2);
		rowCells[5].setValue(sDiscountVal);
		this.subTotalCalc(oEvent);
	},
	
	liveValueChange: function(oEvent){
		var rowCells       = oEvent.getSource().getParent().getCells();
		var sValue         = rowCells[3].getLiveValue();
		var sDiscPer       = rowCells[4].getLiveValue();
		var sDiscountVal   = (Number(sValue) * Number(sDiscPer)/100).toFixed(2);
		rowCells[5].setValue(sDiscountVal);
		this.subTotalCalc(oEvent);
	},
	
	onQrChange:function(){	
		var vPath = "/qrheaderSet('" + this.qId + "')/qrnavig";
		var tPath = "/qrheaderSet('" + this.qId + "')";
		
		this.lModel.setProperty("/navigqrtodocuments",[]);
		this.byId('idCurrency').bindElement(tPath);
		this.byId("vendor_detail").setText(this.lModel.getProperty(this._sQRpath).Vendorname);
		this.byId('prSave').setVisible(this.lModel.getProperty(this._sQRpath).Fixpo !== 'X' )
		var oModel  = this.getView().getModel();
		var fltr    = "Prno  eq '"+this.qId+"' and PreqItem eq ''";
		var that    = this;
		oModel.read("/filelistSet",{
			success:function(oData){
				var files = this.lModel.getProperty("/navigqrtodocuments");
				this.lModel.setProperty("/navigqrtodocuments",$.merge(files,oData.results));
			}.bind(this),error:function(oError){
				
			},
			urlParameters:{
				"$filter":fltr
			}
				
		});
		
		oModel.read(vPath, {
			success: function(oData){
				this.lModel.setProperty('/qrItem',{});
				this.lModel.setProperty('/qrItem', oData);
			}.bind(this),
			error: function(oData){
				
			}
		})	
	},
	
	
	onDeleteDocItem:function(oEvent){
		
//		var navPath = this.sdelPath.slice(0,-1)
		var docItemPath = this.sdelPath[this.sdelPath.length-1]
		var dMdl = this.getModel();
		
		if(this.fdelObj.PreqItem == "00000"){
		var fltr = "Prno  eq '"+this.fdelObj.Prno+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
		var that = this;
		dMdl.read("/filelistSet",{success:function(oData){					
			/*var dItems = this.lModel.getProperty("/navigqrtodocuments");									
			dItems.splice(parseInt(docItemPath),1);
			this.lModel.setProperty(navPath,dItems);
			this.getView().setBusy(false);*/	
//			var dItems = this.lModel.getProperty("/navigqrtodocuments");	
			this.lModel.setProperty("/navigqrtodocuments",oData.results);
			this.getView().setBusy(false);	
			
			
			
		}.bind(this),error:function(oError){										
			this.getView().setBusy(false);
		}.bind(this),
		urlParameters:{
			"$filter":fltr
			
		}
		})
		
		}else{
			
			var dItems = this.lModel.getProperty("/navigqrtodocuments");
			dItems.splice(parseInt(docItemPath),1);
			this.lModel.setProperty("/navigqrtodocuments",dItems);
		}
	},
//Open File Download implemented in Quot.Comparision
//	onOpenFile:function(oParm){
//		var obj = oParm.getSource().getBindingContext().getObject();
//var sUrl = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" + obj.Doknr +"',lang='',ndavalue='"+obj.Serialno+"')/$value"
//		window.open(sUrl,true);
//		
//	},
	
	onFileUpload:function(oEvent){
		this.getView().setBusy(true);
		var tablObj        = {};
		var doknr          = this.byId("idCurrency").getBindingContext().getObject().Doknr;
    	var fragmentId     = this.getView().createId("itemsFragment");		 
		var matrnFile      = this.byId("matrnFile");
		var tblFileInputId = matrnFile .getId() +'-fu';
		var reader         = new FileReader();
		var tblFileInput   = $.sap.domById(tblFileInputId);
		var tblFile        = tblFileInput.files[0];
		tablObj.Docfile    = tblFile.name;
		tablObj.Mimetype   = tblFile.type;
		var base64marker   = 'data:' + tblFile.type + ';base64,';
		var dArr           = this.lModel.getProperty("/navigqrtodocuments");
		var that           = this;
		reader.onload      = (function(theFile) {
			  return function(evt) {
				  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
				  	var base64       = evt.target.result.substring(base64Index);
				  	tablObj.Filedata = base64; 
//				  	dArr.push(tablObj);
//				  	that.lModel.setProperty("/navigqrtodocuments",dArr);
				  	if(doknr != ""){
				  		tablObj.addordelete = "A";
						tablObj.Doknr       = doknr;
						tablObj.Prno        = that.sId;
				  		
				  		that.getModel().create("/filelistSet",tablObj,{success:function(oData){
//					  		var itemPath = this.cntxt.getPath()+"/navigitemstofile";
//					  		var itemFiles = this.cntxt.getProperty("navigitemstofile");
//					  		oData.Filedata = "";
//					  		itemFiles.push(oData);
//					  		this.lModel.setProperty(itemPath,itemFiles);
				  		  var dArr = this.lModel.getProperty("/navigqrtodocuments");
				  		oData.PreqItem = "00000";
				  		  	dArr.push(oData);
				  			that.lModel.setProperty("/navigqrtodocuments",dArr);
				  			this.getView().setBusy(false);
				  			
					  	}.bind(that),error:function(oError){
					  		
					  		this._handleError(oError);
					  		
					  	}.bind(that)})
				  		
				  		
				  	}else{
				  		
				  		
				  		
				  	}
				  	
				  	matrnFile.clear();
			  }
		  
		  })();
		  
		  reader.readAsDataURL(tblFile);
		
		
	},
	
	handleQuotComp:function(oEvent){
		 
		var sKey = oEvent.getParameter("selectedKey");
		if(sKey == "com"){
			 
			this.byId("prSave").setVisible(false);
			this.byId("qrSubmit").setVisible(true);
//			this.byId("prCancel").setVisible(false);
//			this.byId("prPrint").setVisible(true);
			
		}else{
			this.byId("prSave").setVisible(true);
			this.byId("qrSubmit").setVisible(false);
//			this.byId("prCancel").setVisible(false);
//			this.byId("prPrint").setVisible(false);
			
		}
		
		
	},
	
	
	
	onCloseQR:function(oEvent){
		
		
		this.qcReasnDialog.close();
		
		
	},
	

	onSubmitFnlQR : function(oEvent) {
		this.getView().setBusy(true);
		oEvent.getSource().getParent().close();
		var fnlObj ={};
		fnlObj.Ebeln = this.Ebeln;		
		fnlObj.Fixpo = "X";				
		this.FnlQr.Delivery   = this.byId("RB1-1").getSelected();
		this.FnlQr.Quality    = this.byId("RB1-2").getSelected();
		this.FnlQr.Price      = this.byId("RB1-3").getSelected();
		this.FnlQr.Experience = this.byId("RB1-4").getSelected();
		this.FnlQr.Techfd     = this.byId("RB1-5").getSelected();
		this.FnlQr.Othersbol  = this.byId("RB1-6").getSelected();
		this.FnlQr.Others = this.byId("qc_Others").getValue();
		this.FnlQr.Qrno = this.Ebeln;
		this.FnlQr.Prno = this.sId;
		fnlObj.navigprtoqrfinal = [this.FnlQr];
		fnlObj.navigtoqrsplapproval = this.lModel.getProperty("/lSet")
		
		var clFnlObj = $.extend(true, fnlObj);
		var arFnlObj
		/*try{
			 arFnlObj = this.lModel.getProperty("/fnlObj")||[];
		}catch(e){
			
			arFnlObj = [];
		}
		arFnlObj.push(fnlObj.Ebeln);
		this.lModel.setProperty("/fnlObj",arFnlObj);*/
		var that = this;
		/*var that = this;
		
		that.FnlQr = {};
		var tData = {
			 	"lSet": [
			 		{

			 				"Approvalid": "APP01",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP02",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP03",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP04",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}, {
			 				"Approvalid": "APP05",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			},
			 			{
			 				"Approvalid": "APP06",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			},
			 			{
			 				"Approvalid": "APP07",
			 				"Reason": "",
			 				"Banfn": "",
			 				"Boolean": false
			 			}
			 		]			 	
			 }
		this.qcReset();
		this.lModel.setProperty("/lSet",tData.lSet);*/
		
		var oModel = this.getOwnerComponent().getModel();
		oModel.create("/qrheaderSet",fnlObj,{
			success:function(oData){
				that.qcReset();
				that.qcReasnDialog.close();					
//				var shText = that.getResourceBundle().getText("qrSelected")+ oData.Banfn;
//				that.getOwnerComponent().getModel().refresh();
				that.getView().setBusy(false);
				that.FnlQr = {};
				var tData = {
					 	"lSet": [
					 		{

					 				"Approvalid": "APP01",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP02",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP03",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP04",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}, {
					 				"Approvalid": "APP05",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			},
					 			{
					 				"Approvalid": "APP06",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			},
					 			{
					 				"Approvalid": "APP07",
					 				"Reason": "",
					 				"Banfn": "",
					 				"Boolean": false
					 			}
					 		]			 	
					 }
//				that.lModel.setDate(tData);
				that.lModel.setProperty("/lSet",tData.lSet)
//				MessageBox.success(
//						shText, {
//							
//							title : that.getResourceBundle().getText("Success"),
//						});
				
			},
			error:function(oError){
				
				that.getView().setBusy(false);
				that._handleError(oError);
				that.qcReasnDialog.close();
				
			}
			
		});

		
		
		
		
	},
	
	onApproveClose:function(oEvent){
		this.qcReset();
	oEvent.getSource().getParent().close();
	
	},
	
	qcReset:function(oEvent){
		this.byId("RB1-1").setSelected(false);
		this.byId("RB1-2").setSelected(false);
		this.byId("RB1-3").setSelected(false);
		this.byId("RB1-4").setSelected(false);
		this.byId("RB1-5").setSelected(false)
		this.byId("RB1-6").setSelected(false)
		this.byId("qc_Others").setValue("");
		
		
	},
	
	handleApproveSave:function(oEvent){
		this.getView().setBusy(true);
		var fnlObj = {};
		fnlObj.Ebeln = this.Ebeln;
		fnlObj.Fixpo = "X";
		fnlObj.navigprtoqrfinal = [this.FnlQr];
		fnlObj.Mgtapproval = this.byId("l1usr_List").getSelectedKey()+"/"+this.byId("l2usr_List").getSelectedKey()+"/"+this.byId("l3usr_List").getSelectedKey()+"/"+this.byId("l4usr_List").getSelectedKey()+"/"+this.byId("l5usr_List").getSelectedKey();
		var that = this;
		var oModel = this.getOwnerComponent().getModel();
		oModel.create("/qrheaderSet",fnlObj,{
			success:function(oData){
				that.qcReset();
//				oEvent.getSource().getParent().close();
				that.qcLvlDialog.close();					
				var shText = this.getResourceBundle().getText("qrSelected")+ oData.Banfn;
				that.getOwnerComponent().getModel().refresh();
				that.getView().setBusy(false);
				that.lModel.setProperty();
				MessageBox.success(
						shText, {
							
							title : that.getResourceBundle().getText("Success"),
						});
				that.qcReset();
				
			},
			error:function(oError){
				that.qcReset();
				that.qcLvlDialog.close();				
				that.getView().setBusy(false);
				that._handleError(oError);
				
			}
			
		});
		
	},
	
	dynmTbl:function(dataSet){
		
		for(i=0;i<dataSet.length-1;i++){
			
		}
		
	},
	
	
//	handleIconTabBarSelect:function(oEvent){
//		var oModel = this.getView().getModel();
//		var icKey = oEvent.getParameter('selectedKey');
//		var sPRnumber;
//		if(icKey == "PR_IT_01"){
//			
////			sPRnumber = oModel.getProperty(this.sPath+'/Banfn');
//			this.getOwnerComponent().getRouter().navTo("orderQuotations", {id: this.sId});
//			
//		}else if(icKey == 'qr_req'){
////			sPRnumber = oModel.getProperty(this.sPath+'/Banfn');
//			this.getOwnerComponent().getRouter().navTo("Quotations", {id: this.sId});
//			
//			
//		}
//		
//		
//		
//	},
	
	
	
	onPrintQR:function(oEvent){
		var lang            = sap.ui.getCore().getConfiguration().getLanguage();
		var icoTb = this.byId("quotComp");
		if(icoTb.getSelectedKey() == "com" ){		
			sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='QC',appno='" +this.sId+"',lang='"+lang+"',ndavalue='')/$value";
		}else{
			sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='QR',appno='" +this.qId+"',lang='"+lang+"',ndavalue='')/$value";	
		}
		window.open(sPrintPath,true);
		
	},
	
	
/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf z_pr.app
*/
	
	onAfterRendering: function() {
//		var tbl = this.byId("tbl_Url");
//		tbl.bind
	
//		var oMdl = this.getOwnerComponent().getModel();
//		oMdl.read("");
	},
	
	celClick:function(oEvent){
		
	},
	
	onSaveQR:function(oEvent){
		this.getView().setBusy(true);		
		var qrVal            = this.getView().byId('vendorSet').getValue();
		var tt               = this.getView().byId('idtable').getItems();
		var selectedCurrency = this.getView().byId('idCurrency').getText();
		var qrData  =  qrVal.split("-");
		var qrNo    =  qrData[qrData.length - 1].trim();
		var qr      = { "Ebeln": qrNo, 'Currency': selectedCurrency};
		var items   = [];
		
//		$.each(tt,function(indx,Cntxt){
//			
//			if(Cntxt.getBindingContext()){
//				
//				var tObj         = {};
//				tObj.PreqItem    = Cntxt.getBindingContext().getObject().PreqItem;
//				tObj.ShortText   = Cntxt.getCells()[0].getText();
//				tObj.TargetQty   = Cntxt.getCells()[1].getValue(); 
//				tObj.Unit        = Cntxt.getCells()[2].getSelectedKey();
//				tObj.NetPrice    = Cntxt.getCells()[3].getValue();				
//				tObj.Discountval = Cntxt.getCells()[4].getValue();
//				tObj.Subtotal    = Cntxt.getCells()[6].getText();
//				tObj.Valvalue    = Cntxt.getCells()[7].getSelectedKey();
//				tObj.Finaltotal  = Cntxt.getCells()[8].getText();
//				
//				items.push(tObj)
//			}
//		});
		
		var aQrItem      = this.lModel.getProperty("/qrItem/results"),
			aDeletedItem = this.lModel.getProperty('/deletedItem'),
			i;
		var	items        = jQuery.extend(true, [], aQrItem);
		for (i=0; i < aDeletedItem.length; i++){
			items.push(aDeletedItem[i]);
		};
		var itemslength  = items.length;
		
		for(i = 0; i < itemslength; i++){
			delete items[i].__metadata;
			delete items[i].__proto__;
		};
		
		
		qr.qrnavig   = items;
		var i , len = qr.qrnavig.length, iDiscount, sItemDesc, sSave = true;
		for ( i = 0; i < len; i++){
			iDiscount = qr.qrnavig[i].Discountval;
			sItemDesc = qr.qrnavig[i].ShortText;
			iDiscount = parseFloat(iDiscount);
			if( iDiscount > 100){
				sSave     = false;
				this.getView().setBusy(false);
				var sTitle = this.getResourceBundle().getText("Error");
				var sText  = this.getResourceBundle().getText("DicountErrorMsg",[sItemDesc]);
				MessageBox.error(sText, {							
					title : sTitle
				});
			}
		}
		
		if( sSave === true){
			var files = this.lModel.getProperty("/navigqrtodocuments");
			var filArr = [];
			for(var i=0,j=files.length;i<j;i++){
				 if(files[i].PreqItem != "00000"){
					 filArr.push(files[i]);
				 }
			}
     		qr.navigqrtodocuments = filArr;
			var oMdl  = this.getOwnerComponent().getModel();
			var that = this;
			oMdl.create("/qrheaderSet",qr,{
				success:function(oEvent){
					var sText = that.getResourceBundle().getText("qrUpdated",[qr.Ebeln]);
					that.getView().setBusy(false);
					oMdl.refresh();
					MessageBox.success(sText, {							
						title : that.getResourceBundle().getText("Success")
					});	
					that.qId = qr.Ebeln;
//					that.onQrChange();
					that.getView().byId('vendor_detail').setText('');
					that.getView().byId('idCurrency').setText('');
					that._onRouteMatched();
				},
				error:function(oError){
					that._handleError(oError);
					this.getView().setBusy(false);
				}
				
			});
		}
	},
	
	onQRChangeDial : function(oEvent){	
		this._sQRpath = oEvent.getSource().getSelectedItem().getBindingContext('lModel').getPath();
		this.qId      = this.lModel.getProperty(this._sQRpath).Ebeln;
      		if (!this.qcWarDialog) {
      			this.qcWarDialog = new sap.m.Dialog({
				title : this.getResourceBundle().getText("warning"),
				type : 'Message',															
				content : new sap.m.Text({
							text : this.getResourceBundle().getText("clsWarning")
						}),
				beginButton : new sap.m.Button({
					text : this.getResourceBundle().getText("PCYes"),
					type : "Accept",
					press : function() {
//							sap.m.MessageToast.show("Submitted");							
						this.onQrChange();
						this.qcWarDialog.close();
					}.bind(this)
				}),
				endButton : new sap.m.Button({
					text : this.getResourceBundle().getText("PCNo"),
					type : "Reject",
					press : function() {
						this.qcWarDialog.close();
					}.bind(this)
				})
			});
	
			// to get access to the global model
			this.getView().addDependent(this.qcWarDialog);
		}
		
		this.qcWarDialog.open();
	},
	
	//	on Add on Item in Quotation Update Tab
		onItemAdd: function(oEvent){
			var sPath              = oEvent.getSource().getParent().getBindingContext('lModel').getPath(); // get the path of the pressed add button
			var aQrSelectedData    = this.lModel.getProperty(sPath);                                       // get the all the data of the selected line item
			var aItem              = jQuery.extend(true, {}, aQrSelectedData);
			aItem.AddInd           = 'X';                                                                  // set the flag for Add Indicator
			var aQrItemData        = this.lModel.getProperty('/qrItem/results');                           // get all the data of the model
			aQrItemData.push(aItem);                                                             // copy the data of the model as a new item in the model
			this.lModel.setProperty('/qrItem/results',aQrItemData);                                        // set the data to the path and the table
		},
	
	//	on Delete on Item in Quotation Update Tab
		onItemDelete: function(oEvent){
			var sPath           = oEvent.getSource().getParent().getBindingContext('lModel').getPath();
			var aQrSelectedData = this.lModel.getProperty(sPath);                                       // get the all the data of the selected line item
			var aItem           = jQuery.extend(true, {}, aQrSelectedData);
			if(aItem.AddInd === ''){
				aItem.DelInd        = 'X';                                                                  // set the flag for Delete Indicator
				var aDeleteItemData = this.lModel.getProperty('/deletedItem');
				aDeleteItemData.push(aItem); 
				this.lModel.setProperty('/deletedItem',aDeleteItemData);
			}
			var index           = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aQrItemData     = this.lModel.getProperty('/qrItem/results'); 
			aQrItemData.splice(index, 1);
			this.lModel.setProperty('/qrItem/results',aQrItemData); 
		},	
		
		_loadQuotations: function(sPrNumber){
			var oPrModel        = this.getOwnerComponent().getModel();
			oPrModel.read("/PR_HEADERSet('"+sPrNumber+"')/prtoqrnavig", {
				success : function(oData) {
					this.lModel.setProperty("/quotations",jQuery.extend(true, [], oData.results));
				}.bind(this),
				error : function(oError) {
					this.getView().setBusy(false);
					var err   = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
					var sErr  = err.getElementsByTagName("message")[0].innerHTML
					MessageBox.error(sErr, {
						title : "Error",
					});
				}.bind(this)
			});
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
		
		/*onDateChangeD: function(oEvent){
			var selectedDate = oEvent.getSource().getDateValue();
			var iDate        = selectedDate .getDate();
			var formatter    = new Intl.DateTimeFormat("en-us", { month: "long" });
			var sMonth       = formatter.format(new Date(selectedDate ));
			var iYear        = selectedDate.getFullYear();
			selectedDate     = new Date(sMonth + ' ' + iDate + ', ' + iYear +' 00:00:00 GMT+00:00');
			oEvent.getSource().setDateValue(selectedDate)
		}*/
	})
})
				
