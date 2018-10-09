sap.ui.define([
	'jquery.sap.global',
	'poChangeApp/controller/BaseController',
	'poChangeApp/model/formatter',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox'
], function ($, BaseController, formatter, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("poChangeApp.controller.PoDetail", {
		formatter : formatter,
		
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("poDetail").attachMatched(this._loadPoDetail, this);
		},
		
		_loadPoDetail: function (oEvent) {
			this.getView().setBusy(true);
			var sId    = oEvent.getParameter("arguments").id;
			var sPath  = "/POHEADERSet('"+ sId + "')";
			var oModel = this.getOwnerComponent().getModel();
//			oModel.refresh();
//			this.getOwnerComponent().getModel('globalModel').refresh();
			this.tempModel = new JSONModel();
			this.getView().setModel(this.tempModel,'tempModel');
			oModel.read(sPath,{
				success : function(oData) {
					this.tempModel.setProperty('/headerData', oData);
					this._TotalCalculation(oData);
					this.getView().setBusy(false);
				}.bind(this),
				error : function(oError) {
					this.getView().setBusy(false);
					var err = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
					var sErr = err.getElementsByTagName("message")[0].innerHTML
					MessageBox.error(sErr, {
						title : "Error",
					});
				}.bind(this),
				urlParameters : {
					"$expand" : "navtoitem"
				}
			});
		},
		
		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},
		
		onSelection: function(oEvent){
			var oBindContext = oEvent.getSource().getBindingContext('tempModel');
			var oModel  = oBindContext.getModel('tempModel');
			var sPath   = oBindContext.getPath();
			var sPoId   = oModel.getData(sPath).headerData.PoNumber;
			var sPoItem = oBindContext.getObject().PoItem;
			var sItemIndex = sPath.split("/")[4];
			this._router.navTo("poItem", {id: sPoId, index: sItemIndex, item: sPoItem}, false);
		},
		
		onItemAdd: function(oEvent){
			var oBindContext = oEvent.getSource().getBindingContext('tempModel');
			var oModel       = oBindContext.getModel('tempModel');
			var sPath        = oBindContext.getPath();
			var sItemIndex   = sPath.split("/")[4];
			var sPoId        = oModel.getProperty('/headerData/PoNumber');
			this._router.navTo("addItem", {id: sPoId, index: sItemIndex}, false);
		},
		
		onPRnumber: function(oEvent){
			var sType;
        	var oViewModel     = this.getView().getModel('tempModel');
			var sNumber        = oViewModel.getProperty('/headerData/Preq_No');
			var sPrType        = oViewModel.getProperty('/headerData/Zrequesttype');
			if (sPrType === '1'){
				sType = 'PRR';
			}else{
				sType = 'PRU';
			}
			this._print(sType, sNumber);
        },
		
        onOriginalPO: function(oEvent){
        	var oViewModel   = this.getView().getModel('tempModel');
			var sNumber      = oViewModel.getProperty('/headerData/PoNumber'); 
			var sType        = 'PO';
			this._print(sType, sNumber);
        },
        
        onAmendedPO: function(oEvent){
        	var oViewModel   = this.getView().getModel('tempModel');
			var sNumber      = oViewModel.getProperty('/headerData/PoNumber');
			var sType        = 'AC';
			this._print(sType, sNumber);
        },
        
        _print: function(sType, sNumber){
        	var lang        = sap.ui.getCore().getConfiguration().getLanguage();
        	var sPrintPath  = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='"+sType+"',appno='" +sNumber+"',lang='"+lang+"',ndavalue='')/$value";
			window.open(sPrintPath,true);
        }
	});
});