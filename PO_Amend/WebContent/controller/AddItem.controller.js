sap.ui.define([
	'jquery.sap.global',
	'poChangeApp/controller/BaseController',
	'poChangeApp/model/formatter',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox'
], function ($, BaseController, formatter, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("poChangeApp.controller.AddItem", {
		formatter : formatter,
		
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("addItem").attachMatched(this._loadData, this);
		},
		
		_loadData: function(oEvent){
			this.getView().setBusy(true);
			var aParameters  = oEvent.getParameter("arguments");
			var sId          = aParameters.id;
			this.sPoNumber   = sId;
			var sIndex       = aParameters.index;
			var oGlobalModel = this.getOwnerComponent().getModel('globalModel');
			var aData        = oGlobalModel.getProperty('/editData');
			this.getView().setModel(oGlobalModel,'editModel')
			if (aData == undefined){
				this._loadMetadata(sId, sIndex);
			}else{
				this._bindItemForm(sIndex);
				this.getView().setBusy(false);
			}
		},
		
		_bindItemForm: function(sValue){
			var oModel   = this.getOwnerComponent().getModel('globalModel');
			var sPath    = '/editData/navtoitem/results/'+sValue;
			var itemData = oModel.getProperty(sPath);
			var aItem    = jQuery.extend(true, {}, itemData);
			var items    = oModel.getProperty('/editData/navtoitem/results/');
			var aEbelp   = [];
			var aPoItem  = [];
			for (var i = 0; i<items.length; i++){
				aEbelp.push(items[i].Ebelp);
				aPoItem.push(items[i].PoItem);
			}
			aItem.PoItem            = (Math.max.apply(null, aPoItem)+10).toString();
			aItem.Discount          = '0.00';                          		aItem.Discountval= '0.00';
			aItem.NetPrice          = '0.00';                       		aItem.NetValue   = '0.00';
			aItem.Packno            = '';                          			aItem.ValAfDis   = '0.00';
			aItem.Quantity          = '1.00';								aItem.Short_Text = '';
			aItem.Tax_Code          = 'V0';                         		aItem.ValAfDis   = '0.00';
			aItem.Valueorpercentage = 'V';                          		aItem.Vatvalue   = '0.00';
			aItem.DelCompInd        = false;
			if (aItem.Requestmat !== '1'){
				aItem.navServiceOrder   = [{
					'BaseUom'   : 'GRO',				'DeleteInd' : '',
					'FormVal1'  : '0.00',				'Formula'   : 'VOL01',
					'GrPrice'   : '0.00',				'Grselect'  : false,
					'LimitLine' : '0000000000',			'LineNo'    : '0000000010',
					'Netvalue'  : '0.00',				'OutlInd'   : 'X',
					'OvfTol'    : '0.0',				'PckgNo'    : '0000000000',
					'Polineitem': aItem.PoItem,			'Pono'      : '',
					'PriceUnit' : '1',			    	'Prlineitem': '00000',
					'Prno'      : '',				    'Qrlineitem': '00000',
					'Qrno'      : '',   				'Quantity'  : '1.00',
					'ShortText' : '',   				'SubpckgNo' : '0000000000',
					'TaxCode'   : '',   				'Vatamount' : '0.00'
				}]
			}
			items.push(aItem); 
			oModel.setProperty('/editData/navtoitem/results/', items);  
			sPath = 'editModel>/editData/navtoitem/results/'+(items.length - 1);
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
		
		onAfterRendering : function(){
			var CostCenter = this.getView().byId('idAddItemCC').getSelectedKey();
			this._fetchGl(CostCenter);
		},
		
		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},
		
		onPreview: function(oEvent){
//			var sPath   = this.getView().byId('idItemsForm').getObjectBinding('editModel').getPath();
//			var sPoNum  = this.getOwnerComponent().getModel('globalModel').getProperty(sPath).Ebeln;
			var sPoNum  = this.sPoNumber;
			this._router.navTo("preview", {id: sPoNum}, false);
		},
		
		onCostCenterChg:function(oEvent){
			var CostCenter = oEvent.getSource().getSelectedKey();
			this._fetchGl(CostCenter);
		},
		
		_fetchGl: function(CostCenter){
			var aFilters = [];
			aFilters.push( new sap.ui.model.Filter("Kostl", "EQ",CostCenter) );
			var glSelect =  this.getView().byId('idAddItemGl');
			glSelect.bindItems({path : "prm>/glaccountSet",
				filters: new sap.ui.model.Filter(aFilters, true),
				template : new sap.ui.core.ListItem({
							text : "{prm>Txt50}",
							key : "{prm>GlAccount}"
						})
			});
		}
	});
});