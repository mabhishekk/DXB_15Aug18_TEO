sap.ui.define([
	'jquery.sap.global',
	'poChangeApp/controller/BaseController',
	'poChangeApp/model/formatter',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox'
], function ($, BaseController, formatter, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("poChangeApp.controller.EditItem", {
		formatter : formatter,
		
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("editItem").attachMatched(this._loadEditDetail, this);
		},
		
		_loadEditDetail: function(oEvent){
			this.getView().setBusy(true);
			var aParameters  = oEvent.getParameter("arguments");
			var sId          = aParameters.id;
			this.sPo         = sId;
			var sItem        = aParameters.item;
			var sIndex       = aParameters.index;
			var oGlobalModel = this.getOwnerComponent().getModel('globalModel');
			var aData        = oGlobalModel.getProperty('/editData');
			if (aData == undefined){
				this._loadMetadata(sId, sIndex);
			}else{
				this._bindItemForm(sIndex);
				this.getView().setBusy(false);
			}
			this.getView().byId('idPoItem').setSelectedKey(sItem);
			this.getView().setModel(oGlobalModel,'editModel')
		},
		
		onItemSelect: function (oEvent) {
			var sSelectedPath = oEvent.oSource.getSelectedItem().getBindingContext('editModel').getPath()
			var sPath         = 'editModel>'+sSelectedPath;
			var ShortClose    = this.getView().getModel('editModel').getProperty(sSelectedPath + '/DelCompInd');
			if(ShortClose === true){
				this.getView().byId('idSoAdd').setVisible(false);
			}else{
				this.getView().byId('idSoAdd').setVisible(true);
			}
			this._bindServiceOrder(sPath);
		},
		
		_bindItemForm: function(sValue){
			var sPath        = 'editModel>/editData/navtoitem/results/'+sValue;
			var ShortClose   = this.getView().getModel('globalModel').getProperty('/editData/navtoitem/results/'+sValue + '/DelCompInd');
			if(ShortClose === true){
				this.getView().byId('idSoAdd').setVisible(false);
			}else{
				this.getView().byId('idSoAdd').setVisible(true);
			}
			this._bindServiceOrder(sPath);
		},
		
		_bindServiceOrder : function(sPath){
			this.getView().byId('idPoItemDelete').bindElement(sPath);
			this.getView().byId("idItemsForm").bindElement(sPath);
			var oTable = this.getView().byId('idSOtable');
			oTable.bindItems({
				path: sPath+'/navServiceOrder',
		        template: oTable.getBindingInfo("items").template
			})
		},
		
		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},
		
		onPreview: function(oEvent){
			if (this._validateInstalmentValue() > 0){
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error(
					"Total Instalment Value is less than the Item Value by " + this._validateInstalmentValue(),
					{
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
			}else if(this._validateInstalmentValue() < 0){
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error(
						"Total Instalment Value is more than the Item Value by " + Math.abs(this._validateInstalmentValue()),
					{
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
			}else{
				var sPath = this.getView().byId('idItemsForm').getObjectBinding('editModel').getPath();
				var sPoNum  = this.getOwnerComponent().getModel('globalModel').getProperty(sPath).Ebeln;
				sPoNum      = this.sPo;
				this._router.navTo("preview", {id: sPoNum}, false);
			}
		},
		
		onAdd: function(oEvent){
			var oBindContext = this.getView().byId('idItemsForm').getBindingContext('editModel');
			var sPath        = oBindContext.getPath();
			var sItemIndex   = sPath.split("/")[4];
			var sPoId        = this.sPo;
			this._router.navTo("addItem", {id: sPoId, index: sItemIndex}, false);
		},
		
		onResetPress: function(oEvent){
			var that     = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				"Do you want to CANCEL changes made to the Purchase Order. " +
				"\n The data will reset to Original Purchase Order Data.", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						if (sAction === 'OK'){
							that.getOwnerComponent().getModel('globalModel').setData({});
							that._router.navTo("poDetail", {id: that.sPo}, false);
						}
					}
				}
			);
		}
	});
});