//sap.ui.controller("providentia.pr.controller.qr", 
sap.ui.define([ 
		"providentia/pr/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"providentia/pr/model/formatter",
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/Button'
	], function(Controller, History, Device, MessageBox, formatter, Dialog, Text, Button) {
	return Controller.extend("providentia.pr.controller.qr",{

	onInit: function() {
		
		this.getOwnerComponent().getRouter().getRoute("QR").attachPatternMatched(this._onRouteMatched,this);
		this.lModel =  new sap.ui.model.json.JSONModel();
		var tData = {
				"slctVendor"        :[],
				"QuotDate"          :new Date(),
				"navigqrtodocuments":[] 
		};
		this.lModel.setData(tData);
		this.getView().setModel(this.lModel,"lModel");
		this.getView().byId('vendr_items').setModel(this.lModel);
		this.getView().byId('id_docMnts').setModel(this.lModel);
//		this.byId("vendor_lst").setModel(this.getOwnerComponent().getModel());
	},

	_onRouteMatched:function(oEvent){
		
		this.sId = oEvent.getParameter("arguments").id;
		var iconTab = this.byId("id_iconTB");
		iconTab.setSelectedKey("QR");
		this.onItemsReset();
		this.sPath = "/EBAN_DATASet('" + this.sId + "')";
		this.getView().bindElement(this.sPath);
		
//		this.byId('vendor_lst').bindElement()
		
	},
	
	/**
	 * Icontab bar select methos 
	 */

	
	/*Date Validation*/
	
	onStartEndValidation:function(oEvent){
		
		var eDate = oEvent.getSource().getDateValue();
		
		
		 var sDate = this.byId("itmStartDate").getDateValue();
		 if(sDate > eDate){
			 oEvent.getSource().setValueState("Error");
			 
			 
		 }else{
			 
			 oEvent.getSource().setValueState("None");
			 
		 }
		 
		
		
	},
	
	
	qrValidation:function(oData){
		
		var quoDt = oData.QuotDate?true:false;
		
		var qrItem = oData.qrnavig.length == 0?false:true;
		
		var qrvendr = oData.qrvendornavig.length == 0?false:true;
		
		return (quoDt & qrItem & qrvendr) == 0?false:true;
		
		
	},
	
	/**
	 * 
	 * Submit QR
	 */
	onSubmitPress: function(oEvent){
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
								this.onSubmit(oEvent);
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
	onSubmit:function(oEvent){
		this.getView().setBusy(true);
		var tempData = {};
		var items = this.byId("qr_items").getSelectedItems();
//		var tempData = {};
		
		tempData.qrnavig = [];
		
		items.forEach(function(element) {
		    
			var cells = element.getCells();
			var tempObj ={};
			var dTempObj = $.extend( {}, element.getBindingContext().getObject());	
			/*
			 * Reference un comment when logic fails
			 * 
			 * tempObj.ShortText = cells[0].getText();
			if (cells[1].getValue()) {
				tempObj.TargetQty = parseFloat(cells[1].getValue()).toFixed(3);
				

				// tempObj.TARGET_QTY = cells[1].getValue();
			}
			
			tempObj.Unit  = cells[2].getSelectedKey();
			if(cells[3].getText())
			tempObj.Begda = cells[3].getText();
			if(cells[4].getText())
			tempObj.Endda =  cells[4].getText();
		
			tempData.qrnavig.push(tempObj);*/
			
			tempObj.ShortText = cells[0].getText();
			if (cells[1].getValue()) {
				tempObj.TargetQty = parseFloat(cells[1].getValue()).toFixed(2);
				// tempObj.TARGET_QTY = cells[1].getValue();
			}
			tempObj.Unit      = cells[2].getSelectedKey();
			if(cells[3].getDateValue())
				tempObj.Begda     = cells[3].getDateValue();
			if(cells[4].getDateValue())
				tempObj.Endda     =  cells[4].getDateValue();
			if(cells[5].getDateValue()){
				tempObj.DelDate   =  cells[5].getDateValue();
			}else{
				tempObj.DelDate   =  cells[4].getDateValue();
			}
			tempObj.Material  = dTempObj.Material	
			tempObj.Plant     = dTempObj.Plant
			tempObj.StoreLoc  = dTempObj.StoreLoc
			tempObj.MatGrp    = dTempObj.MatlGroup
			tempObj.NetPrice  = dTempObj.PreqPrice
			tempObj.PriceUnit = dTempObj.PriceUnit
//			tempObj.Glaccont� = dTempObj.Glaccont
			tempObj.PreqNo    = dTempObj.Banfn
			tempObj.PreqItem  = dTempObj.PreqItem
			
			tempData.qrnavig.push(tempObj);
			
			
			
		});
		
		
		tempData.qrvendornavig = this.lModel.getProperty("/slctVendor");
		tempData.PreqNo = this.sId;
		tempData.QuotDead = this.lModel.getProperty("/QuotDead");
		tempData.QuotDate = this.lModel.getProperty("/QuotDate");
		tempData.Attachment =  this.byId("id_chc_exmptEmail").getSelected().toString();
		
		tempData.navigqrtodocuments =  this.lModel.getProperty("/navigqrtodocuments");
		
		var vald = this.qrValidation(tempData);
		
		if(vald){
		var oModel = this.getOwnerComponent().getModel();
		var that = this;
				oModel.create("/qrheaderSet",tempData,{
					success:function(oEvent){
						var shText = that.getResourceBundle().getText("qrCreated")+ oEvent.Qrresult;
//						var shText = that.getResourceBundle().getText("qrCreated");
						that.onItemsReset();	
						that.getView().setBusy(false);
//						var sArr = oEvent.Qrresult.split(",");
//						for(var i=0,leng=sArr.length;i<leng;i++){
//							var sPrintPath   = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRU',appno='" +sArr[i]+"',lang='"+lang+"',ndavalue='')/$value";
//							window.open(sPrintPath,true);
//							that.onItemsReset();		
//						}
						
						MessageBox.success(shText, {
							title : that.getResourceBundle().getText("Success")
						});	
						
//						var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRU',appno='" +oEvent.Qrresult+"',lang='"+lang+"',ndavalue='')/$value";
//						window.open(sPrintPath,true);
//						that.onItemsReset();
						
					},
					error:function(oError){
						that._handleError(oError);
						
					}
					
				});
		
		}else{
			var shText = this.getResourceBundle().getText("pfmf");
			this.getView().setBusy(false);
			
			MessageBox.error(shText, {
				title : this.getResourceBundle().getText("Error"),
			});
		}
	},
	
	
	
	onItemsReset:function(oEvent){
		
		this.getOwnerComponent().getModel().resetChanges();
		
		this.lModel.setProperty("/slctVendor",[]);
		this.lModel.setProperty("/navigqrtodocuments",[]);
		this.byId("vendor_lst").removeAllSelectedItems();
		this.byId("qr_items").removeSelections();
		this.byId("id_chc_exmptEmail").setSelected(false);
		
	},
	
	handleSelectionChange:function(oEvent){
		if(oEvent.getParameter("selected")){
			
			var obj = oEvent.getParameter("changedItem").getBindingContext().getObject();
			var dTempObj = $.extend( {}, obj);	
			
			var tempArr = this.lModel.getProperty("/slctVendor");
			tempArr.push(dTempObj);
			this.lModel.setProperty("/slctVendor",tempArr);
			
		}else{
			
			var tPartner  = oEvent.getParameter("changedItem").getBindingContext().getObject().Partner;
			var dTemp = this.lModel.getProperty("/slctVendor");
			
			dTemp = dTemp.filter(function( obj ) {
			    return obj.Partner !== tPartner ;
			});
			this.lModel.setProperty("/slctVendor",dTemp);
			
		}
		
		
	},
	
	handleSelectionFinish:function(oEvent){
	var cItem = oEvent.getParameter("changedItem");
	if(cItem){
		var tPartner  = cItem.getBindingContext().getObject().Partner;
		var dTemp = this.lModel.getProperty("/slctVendor");
		
		dTemp = dTemp.filter(function( obj ) {
		    return obj.Partner !== tPartner ;
		});
		this.lModel.setProperty("/slctVendor",dTemp);
	}
		
	},
	
	/*
	 * 
	 * File Upload */
	
	onFileUpload:function(oEvent){
	
		var tablObj = {};
		
		  var fragmentId = this.getView().createId("itemsFragment");
		  
		  var matrnFile = oEvent.getSource().getParent().getContent()[1];
		  
		  var tblFileInputId = matrnFile .getId() +'-fu';
		  
		  var reader = new FileReader();
		  
		  var tblFileInput = $.sap.domById(tblFileInputId);
		  
		  var tblFile = tblFileInput.files[0];
		  
		  tablObj.Docfile = tblFile.name;
		  tablObj.Mimetype = tblFile.type;
		  var base64marker = 'data:' + tblFile.type + ';base64,';
		  var dArr = this.lModel.getProperty("/navigqrtodocuments");
		  var that = this;
		  
		  reader.onload =
		  (function(theFile) {
			  return function(evt) {
				  	var base64Index =evt.target.result.indexOf(base64marker) +base64marker.length; 
				  	var base64 = evt.target.result.substring(base64Index);
				  	tablObj.Filedata = base64; 
				  	dArr.push(tablObj);
				  	that.lModel.setProperty("/navigqrtodocuments",dArr);
				  	matrnFile.clear();
			  }
		  
		  })();
		  
		  reader.readAsDataURL(tblFile);
		 
	},
	
	
	
	
	
	// File Delete on create
	
	onDeleteDocItem:function(oEvent){
		
		
		var dItems = this.lModel.getProperty("/navigqrtodocuments");
		var docItemPath = this.sdelPath[this.sdelPath.length-1];
		dItems.splice(parseInt(docItemPath),1);											
		this.lModel.setProperty("/navigqrtodocuments",dItems);
	
		
	}
	
	
	


})});