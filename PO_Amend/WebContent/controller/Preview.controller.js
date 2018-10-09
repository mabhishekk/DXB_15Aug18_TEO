sap.ui.define([
	'jquery.sap.global',
	'poChangeApp/controller/BaseController',
	'poChangeApp/model/formatter',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/m/MessageBox'
  ], function ($, BaseController, formatter, JSONModel, Device, MessageBox) {
	"use strict";

	return BaseController.extend("poChangeApp.controller.Preview", {
		formatter : formatter,
		
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("preview").attachMatched(this._loadEditDetail, this);
		},
		
		_loadEditDetail: function(oEvent){
			this.getView().setBusy(true);
			var aParameters  = oEvent.getParameter("arguments");
			var sId          = aParameters.id;
			this.PoNumber    = sId;
			var oGlobalModel = this.getOwnerComponent().getModel('globalModel');
			var aData        = oGlobalModel.getProperty('/editData');
			var lset         = [
		 		{"Approvalid": "APP01", 	"Reason": "",	"Ebeln": "",	"Boolean": false}, 
		 		{"Approvalid": "APP02",		"Reason": "",	"Ebeln": "",	"Boolean": false},
		 		{"Approvalid": "APP03",		"Reason": "",	"Ebeln": "",	"Boolean": false}, 
		 		{"Approvalid": "APP04",		"Reason": "",	"Ebeln": "",	"Boolean": false}, 
		 		{"Approvalid": "APP05",		"Reason": "",	"Ebeln": "",	"Boolean": false},
	 			{"Approvalid": "APP06",		"Reason": "",	"Ebeln": "",	"Boolean": false},
	 			{"Approvalid": "APP07",		"Reason": "",	"Ebeln": "",	"Boolean": false}
	 		];
			oGlobalModel.setProperty('/lSet', lset);
			oGlobalModel.setProperty('/documents',[]);
			if (aData == undefined){
				this._router.navTo("poDetail", {id: sId}, !Device.system.phone);
			}else{
				this.getView().setBusy(false);
			}
			this.getView().setModel(oGlobalModel,'editModel')
		},
		
		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},
		
		
		onFileUpload:function(oEvent){
			var tablObj = {};
			var oDocuments       = this.getView().getModel('editModel').getProperty("/documents");
			var fragmentId       = this.getView().createId("itemsFragment");
			tablObj.Serialno     = (oDocuments.length+1).toString();
			var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
			var tblFileInputId   = matrnFile .getId() +'-fu';
			var reader           = new FileReader();
			var tblFileInput     = $.sap.domById(tblFileInputId);
			var tblFile          = tblFileInput.files[0];
			tablObj.Docfile      = tblFile.name;
			tablObj.Mimetype     = tblFile.type;
			var base64marker     = 'data:' + tblFile.type + ';base64,';
			var dArr             = oDocuments;
			var that             = this;
			  
			reader.onload =	(function(theFile) {
				return function(evt) {
				  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
				  	var base64       = evt.target.result.substring(base64Index);
				  	tablObj.Filedata = base64.toString(); 
				  	dArr.push(tablObj);
				  	that.getView().getModel('editModel').setProperty("/documents",dArr);
				  	matrnFile.clear();
				}
		  })();
		  reader.readAsDataURL(tblFile);
		},
		
		onFileDelete: function(oEvent) {
			var sPath      = oEvent.getParameter('listItem').getBindingContext('editModel').getPath();
			var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aItems     = this.getView().getModel('editModel').getProperty("/documents");
			aItems.splice(index, 1);
			this.getView().getModel('editModel').setProperty("/documents", aItems);
		},
		
		onSave: function(oEvent){
			debugger;
			this.getView().setBusy(true); 
			var oModel         = this.getOwnerComponent().getModel(); 
			var aSubmitData    = this.getView().getModel('editModel');
			var headerData     = aSubmitData.getProperty('/editData');
			var saveHeaderData = jQuery.extend(true, {}, headerData);
			var saveItemData   = saveHeaderData.navtoitem.results, i;
			var saveInstalment = [];
			for (i=0; i<saveItemData.length; i++){
				if(saveItemData[i].Vatvalue === '5.00'){
					saveItemData[i].Tax_Code = 'V2'
				}else if(saveItemData[i].Vatvalue === '0.00'){
					saveItemData[i].Tax_Code = 'V0'
				}
				delete saveItemData[i].ValAfDis;
				delete saveItemData[i].Discount;
				delete saveItemData[i].NetValue;
				if ( saveItemData[i].Requestmat !== '1'){
					var serviceOrder = saveItemData[i].navServiceOrder, x;
					for(x=0; x<serviceOrder.length; x++){
						serviceOrder[x].GrPrice = serviceOrder[x].costPrice;
						delete serviceOrder[x].costPrice;
						delete serviceOrder[x].DelCompInd;
						saveInstalment.push(serviceOrder[x]);
					}
				}
				delete saveItemData[i].navServiceOrder;
				delete saveItemData[i].navigpotoservices;
			};
			delete saveHeaderData.navigpoheadtoservices;
			delete saveHeaderData.navigpotodms;
			delete saveHeaderData.navtoitem;
			delete saveHeaderData.Type;
			saveHeaderData.Flag      = 'A';
			saveHeaderData.Posubmit  = 'S';
			saveHeaderData.navtoitem = saveItemData;
			saveHeaderData.navigpoheadtoservices = saveInstalment;
			oModel.create("/POHEADERSet", saveHeaderData, { 
				  success : function( oData, response){
					  var that = this;
					  if(response.statusText == "Created"){
						  var shText = "PO :  " +response.data.PoNumber +"  " + this.getResourceBundle().getText("poUpdated");
						  MessageBox.success(shText, {
								title : this.getResourceBundle().getText("Success"),
								onClose: function(){
									that.getView().getModel().refresh();
									that._router.navTo("poDetail", {id: that.PoNumber}, !Device.system.phone);
								}
						  });
					  }
					  this.getView().setBusy(false);
			  }.bind(this), 
			  error : function(oError) {
				  var shText = oError.responseText;
				  MessageBox.error(shText, {
					  title : this.getResourceBundle().getText("Error"),
				  });
			      this.getView().setBusy(false);
		      }.bind(this)
		  });
		},
		
		onPreviewBackPress: function(oEvent){
			var oModel  =  this.getView().getModel('editModel');
			var sPoNum  = oModel.getProperty('/editData/PoNumber');
			var sPOItem = oModel.getProperty('/editData/navtoitem/results')[0].PoItem;
			this._router.navTo("editItem", {id: sPoNum, index: 0, item: sPOItem}, false);
		}
	});
});