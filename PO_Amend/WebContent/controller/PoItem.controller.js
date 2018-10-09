sap.ui.define([
	'jquery.sap.global',
	'poChangeApp/controller/BaseController',
	'poChangeApp/model/formatter',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox'
], function ($, BaseController, formatter, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("poChangeApp.controller.PoItem", {
		formatter : formatter,
		
		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("poItem").attachMatched(this._loadPoDetail, this);
		},
		
		_loadPoDetail: function (oEvent) {
			this.getView().setBusy(true);
			var aParameters = oEvent.getParameter("arguments");
			var sId         = aParameters.id;
			this.sPoNum     = sId;
			var sItem       = aParameters.item;
			var sIndex      = aParameters.index;
			var sPath       = "/POHEADERSet('"+ sId + "')";
			var oModel      = this.getOwnerComponent().getModel();
			this.tempModel  = new JSONModel();
			this.getView().setModel(this.tempModel,'tempModel');
			oModel.read(sPath,{
				success : function(oData) {
					this.tempModel.setProperty('/headerData', oData);
					this.getView().byId('idPoItem').setSelectedKey(sItem);
					this._TotalCalculation(oData);
					this._calculateValue(sId, oModel);
					this._bindItemForm(sIndex);
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
		
		_calculateValue: function(sPoNumber, oModel){
			var	i=0;
			this._loadSO(i, sPoNumber);
		},
		
		_loadSO: function(sValue, sPoNumber){
			this.line = sValue;
			var i = sValue;
			var oItemData = this.tempModel.getProperty('/headerData/navtoitem/results');
			this.tempModel.setProperty('/headerData/Type', oItemData[i].Requestmat);
			var oModel      = this.getOwnerComponent().getModel();
			this.oItemLength  = oItemData.length;
			this.sPO          = sPoNumber;
			var quantity      = Number(oItemData[i].Quantity);
			var originalValue = Number(oItemData[i].NetPrice);
			var discountValue = Number(oItemData[i].Discountval);
			this.tempItemDis  = discountValue;
			var vat           = Number(oItemData[i].Vatvalue);
			oItemData[i].Discount = (originalValue * discountValue / 100).toFixed(2);
			oItemData[i].ValAfDis = (quantity * ( originalValue - oItemData[i].Discount)).toFixed(2);
			oItemData[i].NetValue = (oItemData[i].ValAfDis * (1 + vat / 100)).toFixed(2);	
			this.DelCompInd       = oItemData[i].DelCompInd;
			var ServiceOrderPath  = "/POITEMSSet(PoNumber='"+sPoNumber+"',PoItem='"+oItemData[i].PoItem+"')/navigpotoservices";
			oModel.read(ServiceOrderPath,{
				success:function(oData, response){
					if (response.statusText === "OK"){
						var vPath = '/headerData/navtoitem/results/'+this.line+"/navServiceOrder";
						var aSOItems = oData.results;
						for(var s=0; s<aSOItems.length; s++ ){
							aSOItems[s].costPrice = ((aSOItems[s].GrPrice * 100)/(100 - this.tempItemDis)).toFixed(2);
							aSOItems[s].DelCompInd = this.DelCompInd;
						}
						this.tempModel.setProperty(vPath, aSOItems);
						this.line = this.line + 1;
						if(this.line <  this.oItemLength){
							this._loadSO(this.line, this.sPO);
						}
						this.getView().setBusy(false);
					}
				}.bind(this),
				error:function(oError){
				
				},
				urlParameters:{
//					"$expand": "navigpotoservices"
				}
			});
		},
		
		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},
		
		onItemSelect: function (oEvent) {
			var sSelectedPath = oEvent.oSource.getSelectedItem().getBindingContext('tempModel').getPath()
			var sPath        = 'tempModel>'+sSelectedPath;
			this._bindServiceOrder(sPath);
		},
		
		_bindItemForm: function(sValue){
			var sPath        = 'tempModel>/headerData/navtoitem/results/'+sValue;
			this._bindServiceOrder(sPath);
		},
		
		_bindServiceOrder : function(sPath){
			this.getView().byId("idItemsForm").bindElement(sPath);
			var oTable = this.getView().byId('idSOtable');
			oTable.bindItems({
				path: sPath+'/navServiceOrder',
		        template: oTable.getBindingInfo("items").template
			})
		},
		
		onEdit: function(oEvent){
//			Copy the data to prevent service call
			var originalData = this.tempModel.getProperty('/headerData');
			var copyData     = jQuery.extend(true, {}, originalData);
			var editData     = jQuery.extend(true, {}, originalData);
			var globalModel  = this.getOwnerComponent().getModel('globalModel');
			globalModel.setProperty('/originalData', copyData);
			globalModel.setProperty('/editData', editData);
//			Handle navigation
			var sPath = this.getView().byId('idItemsForm').getObjectBinding('tempModel').getPath();
			var index = sPath.substring(sPath.lastIndexOf('/') +1);
			var sPOItem = this.tempModel.getProperty(sPath).PoItem;
			var sPoNum  = this.sPoNum;
			this._router.navTo("editItem", {id: sPoNum, index: index, item: sPOItem}, false);
		}
	});
});