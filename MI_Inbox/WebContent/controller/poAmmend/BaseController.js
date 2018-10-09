sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel'
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("z_manager_inbox.controller.poAmmend.BaseController", {

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Handler for the Avatar button press event
		 * @public
		 */
		onAvatarPress: function () {
			var msg = this.getResourceBundle().getText("avatarButtonMessageToastText");
			MessageToast.show(msg);
		},
		
		_loadMetadata: function(sPoNumber, sIndex){
			var sPath       = "/POHEADERSet('"+ sPoNumber + "')";
			var oModel      = this.getOwnerComponent().getModel('poService');
			this.tempModel  = new JSONModel();
			this.getView().setModel(this.tempModel,'tempModel');
			oModel.read(sPath,{
				success : function(oData) {
					this.tempModel.setProperty('/headerData', oData);
					this._calculateValue(sPoNumber, oModel, sIndex);
//					this._bindItemForm(sIndex);
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
		
		_calculateValue: function(sPoNumber, oModel, sIndex){
			var	i=0;
			this._loadSO(i, sPoNumber, sIndex);
		},
		
		_loadSO: function(sValue, sPoNumber, sIndex){
			this.line         = sValue;
			var i             = sValue;
			this.tempIndex    = sIndex;
			var oItemData     = this.tempModel.getProperty('/headerData/navtoitem/results');
			this.tempModel.setProperty('/headerData/Type', oItemData[i].Requestmat);
			var oModel        = this.getOwnerComponent().getModel('poService');
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
			var ServiceOrderPath  = "/POITEMSSet(PoNumber='"+sPoNumber+"',PoItem='"+oItemData[i].PoItem+"')/navigpotoservices";
			oModel.read(ServiceOrderPath,{
				success:function(oData, response){
					if (response.statusText === "OK"){
						var vPath = '/headerData/navtoitem/results/'+this.line+"/navServiceOrder";
						var aSOItems = oData.results;
						for(var s=0; s<aSOItems.length; s++ ){
							aSOItems[s].costPrice = ((aSOItems[s].GrPrice * 100)/(100 - this.tempItemDis)).toFixed(2); 
						}
						this.tempModel.setProperty(vPath, aSOItems);
						this.line = this.line + 1;
						if(this.line <  this.oItemLength){
							this._loadSO(this.line, this.sPO);
							this.getView().setBusy(false);
						}else{
							var originalData = this.tempModel.getProperty('/headerData');
							var copyData     = jQuery.extend(true, {}, originalData);
							var editData     = jQuery.extend(true, {}, originalData);
							var globalModel  = this.getOwnerComponent().getModel('globalModel');
							globalModel.setProperty('/originalData', copyData);
							globalModel.setProperty('/editData', editData);
							this._bindItemForm(this.tempIndex);
							this.getView().setBusy(false);
						}
					}
				}.bind(this),
				error:function(oError){
				
				}
			});
		},
		
		onSoAdd: function(oEvent){
			var sPath       = this.getView().byId('idItemsForm').getObjectBinding('editModel').getPath();
			var sPoItemNum  = this.getOwnerComponent().getModel('globalModel').getProperty(sPath).PoItem;
			var sSoPath = oEvent.getSource().getParent().getParent().getBindingPath("items");
			var oModel  = this.getView().getModel('globalModel');
			var aSoData = oModel.getProperty(sSoPath);
			var pData   = {
					"BaseUom":"GRO",					"DeleteInd":"",
					"FormVal1":"0.00",					"Formula":"VOL01",
					"GrPrice":"0.00",				    "Grselect":false,
					"LimitLine":"0",					"LineNo":"",
					"Netvalue":"0.00",   				"OutlInd":"X",
					"OvfTol":"0",   					"PckgNo":"",
					"Polineitem":sPoItemNum,			"Pono":"",
					"PriceUnit":"1",					"Prlineitem":"0",
					"Prno":"",      					"Qrlineitem":"0",
					"Qrno":"",      					"Quantity":"1",
					"ShortText":"",  					"SubpckgNo":"0",
					"TaxCode":"",   					"Vatamount":"0.00",
			};
			aSoData.push(pData);  
			oModel.setProperty(sSoPath, aSoData);
		},
		
		onItemQuan: function(oEvent){
			var aItemValues = this._getFields();
			aItemValues[4] = (aItemValues[0] * (aItemValues[1]  -  aItemValues[3]));
			aItemValues[6]     = (aItemValues[4] * (1 + aItemValues[5] / 100));
			this._setFields(aItemValues);
		},
		
		onItemVal: function(oEvent){
			var aItemValues = this._getFields();
			aItemValues[2]     = Number(aItemValues[2].toFixed(2));
			aItemValues[3]     = (aItemValues[1] * aItemValues[2] / 100 );
			aItemValues[4]     = (aItemValues[0] * (aItemValues[1]  -  aItemValues[3]));
			aItemValues[6]     = (aItemValues[4] * (1 + aItemValues[5] / 100));		
			this._setFields(aItemValues);
		},
		
		onItemDisPer: function(oEvent){
			oEvent.getSource().setValueState('None');
			this.getView().getModel('editModel').setProperty('/DiscountPercentage', false);
			this.onItemVal(oEvent);
		},
		
		onItemDisVal: function(oEvent){
			oEvent.getSource().setValueState('None');
			this.getView().getModel('editModel').setProperty('/DiscountValue', false);
			var aItemValues = this._getFields();
			aItemValues[3]     = Number(aItemValues[3].toFixed(2));
			aItemValues[2]     = (aItemValues[3] * 100 / aItemValues[1]);
			aItemValues[4]     = (aItemValues[0] * (aItemValues[1]  -  aItemValues[3]));
			aItemValues[6]     = (aItemValues[4] * (1 + aItemValues[5] / 100));		
			this._setFields(aItemValues);
		},
		
		onItemVat: function(oEvent){
			var aItemValues = this._getFields();
			aItemValues[6]     = (aItemValues[4] * (1 + aItemValues[5] / 100));		
			this._setFields(aItemValues);
		},
		
		_getFields: function(){
			var Quantity       = Number(this.getView().byId('idItemQuantity').getValue());
			var unitPrice      = Number(this.getView().byId('idUnitPrice').getValue());
			var DiscPer        = Number(this.getView().byId('idDiscPer').getValue());
			var DiscVal        = Number(this.getView().byId('idDiscVal').getValue());
			var PriceAfterDisc = Number(this.getView().byId('idPriceAfterDisc').getValue());
			var vat            = Number(this.getView().byId('idVAT').getSelectedKey());
			var FinalPrice     = Number(this.getView().byId('idFinalPrice').getValue());
			return [Quantity, unitPrice, DiscPer, DiscVal, PriceAfterDisc, vat, FinalPrice];
		},
		
		_setFields: function(aItemValues){
			this.getView().byId('idItemQuantity').setValue(aItemValues[0].toFixed(2));
			this.getView().byId('idUnitPrice').setValue(aItemValues[1].toFixed(2));
			this.getView().byId('idDiscPer').setValue(aItemValues[2].toFixed(2));
			this.getView().byId('idDiscVal').setValue(aItemValues[3].toFixed(2));
			this.getView().byId('idPriceAfterDisc').setValue(aItemValues[4].toFixed(2));
			this.getView().byId('idVAT').setSelectedKey(aItemValues[5].toFixed(2));
			this.getView().byId('idFinalPrice').setValue(aItemValues[6].toFixed(2));
			var oItems = this.getView().getModel('editModel').getProperty('/editData/navtoitem/results');
			var i=0, GV=0, DV=0, VV=0, FV=0;
			for(i; i<oItems.length; i++){
				var quantity      = Number(oItems[i].Quantity);
				var originalValue = Number(oItems[i].NetPrice);
				var discountValue = Number(oItems[i].Discountval);
				var vat           = Number(oItems[i].Vatvalue);
				GV               += quantity * originalValue;
				DV               += quantity * originalValue * discountValue / 100; 
				VV               += (1 - (discountValue / 100)) * quantity * originalValue * vat / 100;
				FV               += (quantity * originalValue) * (1 - (discountValue / 100)) * ( 1 + (vat / 100));
			}
			this.getView().byId('idGV').setValue(GV.toFixed(2));
			this.getView().byId('idDV').setValue(DV.toFixed(2));
			this.getView().byId('idVV').setValue(VV.toFixed(2));
			this.getView().byId('idFV').setValue(FV.toFixed(2));
			this._calculateInstalment();
		},
		
		_calculateInstalment: function(){
			var oModel    = this.getView().getModel('editModel');
			var aItemData = oModel.getProperty('/editData/navtoitem/results');
			for (var i=0; i<aItemData.length; i++){
				if ( aItemData[i].Requestmat !== '1'){
					var serviceOrder = aItemData[i].navServiceOrder, x;
					for(x=0; x<serviceOrder.length; x++){
						serviceOrder[x].GrPrice   = (Number(serviceOrder[x].costPrice * (1 - (aItemData[i].Discountval / 100)))).toFixed(2);
						serviceOrder[x].Vatamount = (Number(serviceOrder[x].GrPrice * (aItemData[i].Vatvalue / 100))).toFixed(2);
						serviceOrder[x].Netvalue  = (Number(serviceOrder[x].GrPrice) + Number(serviceOrder[x].Vatamount)).toFixed(2);
					}
					aItemData[i].navServiceOrder = serviceOrder;
				}
			};
			oModel.setProperty('/editData/navtoitem/results', aItemData);
		},
		
		onInstalCp: function(oEvent){
			if (this._validateInstalmentValue() > 0  || this._validateInstalmentValue() == 0 ){
				var itemPath = this.getView().byId('idItemsForm').getBindingContext('editModel').getPath();
				var itemData = this.getView().getModel('editModel').getProperty(itemPath);
				var disPer   = itemData.Discountval;
				var vatPer   = itemData.Vatvalue;
				var cell     = oEvent.getSource().getParent().getCells();
				var costPrice   = cell[1].getValue();
				var GrPrice     = (Number(costPrice * (1 - (disPer / 100)))).toFixed(2);
				var Vatamount   = (Number(GrPrice * (vatPer / 100))).toFixed(2);
				var Netvalue    = (Number(GrPrice) + Number(Vatamount)).toFixed(2);
				cell[2].setText(GrPrice);
				cell[3].setText(Vatamount);
				cell[4].setText(Netvalue);
				oEvent.getSource().setValueState('None');
			}else{
				oEvent.getSource().setValueState('Error');
			}
		},
		
		_validateInstalmentValue: function(){
			var itemPath = this.getView().byId('idItemsForm').getBindingContext('editModel').getPath();
			var itemData = this.getView().getModel('editModel').getProperty(itemPath), difference=0;
			if (itemData.Requestmat !== '1'){
				var aInstalment = itemData.navServiceOrder, i, value=0;
				for (i=0; i<aInstalment.length; i++){
					value += Number(aInstalment[i].costPrice);
				}
				if(value !== Number(itemData.NetPrice)){
					difference = Number(itemData.NetPrice) - value;
					return difference;
				}else{
					return difference;
				}
			}else{
				return difference;
			}
		},
		
		onLiveDisPer: function(oEvent){
			var sValue  = Number(oEvent.getSource().getValue());
			var sMax    = 100;
			var oModel  = this.getView().getModel('editModel');
			oModel.setProperty('/DiscountPercentage', true);
			oModel.setProperty('/DiscountValue', false);
			this._DiscountInput(oEvent, sValue, sMax);
		},
		
		onLiveDisVal: function(oEvent){
			var sValue  = Number(oEvent.getSource().getValue());
			var sMax    = Number(this.getView().byId('idUnitPrice').getValue());
			var oModel  = this.getView().getModel('editModel');
			oModel.setProperty('/DiscountPercentage', false);
			oModel.setProperty('/DiscountValue', true);
			this._DiscountInput(oEvent, sValue, sMax);
		},
		
		_DiscountInput: function(oEvent, sValue, sMax){
			if(sValue > sMax){
				oEvent.getSource().setValueState('Error');
			}else{
				oEvent.getSource().setValueState('None');
			}
		}
	});
});