sap.ui.define([ 
		"jquery.sap.global", 
		"poApp/controller/BaseController",
		"sap/ui/Device", 
		"poApp/model/formatter",
		'sap/m/MessageBox',
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/Button'
	], function(jQuery, Controller, Device, formatter, MessageBox, Dialog, Text, Button) {
	"use strict";

	return Controller.extend("poApp.controller.poCreate", {
		// get the formatter
		formatter : formatter,
		//get the text from Internationalization
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		onInit: function() {
//			this.getView().setBusy(true);
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent){
			this.byId("idIconTabBar").setSelectedKey("PO");
			try{
				this._prNumber = this.getOwnerComponent().getComponentData().startupParameters.id[0];
			}catch(oEr){
				this._prNumber = "1000001076" ;	
			}
			var CreateData      = {
					"PrDetail"        : [],		"Quotations"      : {},
					"PoLineItem"      : {}, 	"PlantDetail"     : {},
					"poServices"      : [],		"navigdms"        : [],
					"tempDelData"     : [],     "QC"              : true,
					"dEditable"       : false
			};
			this.lModel.setData(CreateData);
			
			var oPrModel        = this.getOwnerComponent().getModel('prm');
			var oPoModel        = this.getOwnerComponent().getModel();
			var sPRPath         = "/EBAN_DATASet('"+this._prNumber+"')";
			this.sPath          = sPRPath;                                       // to be used for navigation in Base controller
			oPrModel.read(sPRPath, {
				success : function(oData) {
					this.lModel.setProperty("/PrDetail",oData);
					this._PrRequestType = oData.Zrequesttype;
					this._getQuotationData(this._prNumber);
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
			this._getPlantData(oPoModel);
		},
		
		onAfterRendering : function() {
//			var sPath1       = "PreqNo";
//			var sOperator1   = "EQ";
//			var sValue1      = this._prNumber;
//			var oFilter1     = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
//			var oQuotBinding = this.getView().byId("idSelectQuotation").getBinding("items");
//			oQuotBinding.filter(oFilter1);
		},
		
		_bindItemTablePR: function(sPRnumber){
			var oPrModel        = this.getOwnerComponent().getModel();
			var sPRItemPath     = "/PR_TO_PO_ITEMSet";
			var sFilter         = new sap.ui.model.Filter('Banfn', 'EQ', sPRnumber);
			oPrModel.read(sPRItemPath, {
				success : function(oData) {
					this.lModel.setProperty("/PoLineItem",{});
					this.lModel.setProperty("/PoLineItem",jQuery.extend(true, [], oData.results));
					this._CalculateValue();
				}.bind(this),
				error : function(oError) {
					this.getView().setBusy(false);
					var err   = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
					var sErr  = err.getElementsByTagName("message")[0].innerHTML
					MessageBox.error(sErr, {
						title : "Error",
					});
				}.bind(this),
				filters: [sFilter]
			});
		},
		
		_getQuotationData: function(sPRnumber){
			var sQuotationPath  = "/PRTOQRSet";
			var sFilter         = new sap.ui.model.Filter('PreqNo', 'EQ', this._prNumber);
			var oPoModel        = this.getOwnerComponent().getModel();
			oPoModel.read(sQuotationPath, {
				success : function(oData) {
					this.lModel.setProperty("/Quotations",jQuery.extend(true, [], oData.results));
					var aQuotations      = this.lModel.getProperty("/Quotations");
					var noOfQuotations   = aQuotations.length;
					if(noOfQuotations > 0){
						this._Quotation  = aQuotations[0].Qrno;
						this._Vendor     = aQuotations[0].Vendor;
						var sVendor      = aQuotations[0].Vendor +' '+aQuotations[0].Vendorname
						this.getView().byId('idVendor').setText(sVendor);
						if(this._PrRequestType !== '1'){
							this.lModel.setProperty('/QC', false);
							this.getView().byId('idLabelQuotation').setVisible(false);
							this.getView().byId('idSelectQuotation').setVisible(false);
							this._bindItemTablePR(sPRnumber);
						}else{
							this._bindItemTableQR(this._Quotation);
						}
					}
				}.bind(this),
				error : function(oError) {
					this.getView().setBusy(false);
					var err   = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
					var sErr  = err.getElementsByTagName("message")[0].innerHTML
					MessageBox.error(sErr, {
						title : "Error",
					});
				}.bind(this),
				filters: [sFilter]
			});
		},
		
		_bindItemTableQR: function(sQuotation){
			var oPoModel        = this.getOwnerComponent().getModel();
			var sQuotItemPath   = "/PO_ITEM_CREATESet";
			var sFilter         = new sap.ui.model.Filter('Ebeln', 'EQ', sQuotation);
			oPoModel.read(sQuotItemPath, {
				success : function(oData) {
					this.lModel.setProperty("/PoLineItem",{});
					this.lModel.setProperty("/PoLineItem",jQuery.extend(true, [], oData.results));
					this._CalculateValue();
				}.bind(this),
				error : function(oError) {
					this.getView().setBusy(false);
					var err   = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
					var sErr  = err.getElementsByTagName("message")[0].innerHTML
					MessageBox.error(sErr, {
						title : "Error",
					});
				}.bind(this),
				filters: [sFilter]
			});
		},
		
		_CalculateValue: function(){
			var oItems      = this.lModel.getProperty("/PoLineItem");
			var iItemLength = oItems.length,
				i=0, iQuantity=0, iGrossValue=0, iDiscountValue=0, iVatValue=0, sCurrency, 
				iDiscountPer=0, iVatPer=0, iNetValue=0, iFinalGross=0, iSubTotal=0, iCostPrice=0;
			for (i; i<iItemLength; i++){
				iQuantity      = Number(oItems[i].Quantity);
				iDiscountPer   = Number(oItems[i].Discountvalue);
				iGrossValue    = Number(oItems[i].PreqPrice);
				iVatPer        = Number(oItems[i].Vatvalue);
				sCurrency      = oItems[i].Currency;
				iFinalGross    = iQuantity*iGrossValue;
				iCostPrice     += iQuantity*iGrossValue;
				iDiscountValue += iFinalGross * iDiscountPer / 100;
				iSubTotal      = iFinalGross * (1 - iDiscountPer / 100)
				iVatValue      += iSubTotal * iVatPer /100;
				iNetValue      += iFinalGross * (1 - iDiscountPer / 100) * (1 + iVatPer / 100)
				
			}
			this._Subtotal     = (iCostPrice - iDiscountValue).toFixed(2);
			this._Currency     = sCurrency;
			this._TotalAmount  = iCostPrice.toFixed(2);
			this._TotalDiscount= iDiscountValue.toFixed(2);
			this.getView().byId('idGrossValue').setText(iCostPrice.toFixed(2) + ' '+ sCurrency ); 
			this.getView().byId('idDiscount').setText(iDiscountValue.toFixed(2) + ' '+ sCurrency );
			this.getView().byId('idVatValue').setText(iVatValue.toFixed(2) + ' '+ sCurrency );
			this.getView().byId('idNetValue').setText(iNetValue.toFixed(2) + ' '+ sCurrency );
			
		},
		
		_getPlantData: function(oModel){
			oModel.read("/PLANTSSet('6000')", {
				success : function(oData) {
					this.lModel.setProperty("/PlantDetail",jQuery.extend(true, [], oData.PLANTADD.results[0]));
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
					"$expand" : "PLANTADD"
				}
			});
		},
		
		onQuotationChange: function(oEvent){
			this._Quotation = oEvent.getSource().getSelectedKey();
			var sPath       = oEvent.oSource.getSelectedItem().getBindingContext('lModel').getPath();
			var aData       = this.lModel.getProperty(sPath);
			this._Vendor    = aData.Vendor;
			var sVendor     = aData.Vendor +' '+ aData.Vendorname;
			this.getView().byId('idVendor').setText(sVendor);
			this._bindItemTableQR(this._Quotation);
		},
		
		// Items dialog close
		onPRCItemDialogueClose : function(oEvent) {
			var fragmentId   = this.getView().createId("itemDetail");
			var matrnBudExem = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem");
			if (matrnBudExem.getSelected())
				this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'X';
			else
				this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'Y';
			oEvent.getSource().getParent().close();
		},
		// Item Detail Press
		onDetailItemPress : function(oEvent) {
			this.cntxt = oEvent.getSource().getBindingContext('lModel');
			if (!this.prItemDetailDialog) {
				this.prItemDetailDialog = sap.ui.xmlfragment(this.createId("itemDetail"),"poApp.view.fragments.PRItemDetail",this); 
				this.getView().addDependent(this.prItemDetailDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.prItemDetailDialog);
			}
			// this.prItemDetailDialog.bindElement(cntxt);
			this.prItemDetailDialog.setModel(this.lModel);
			this.prItemDetailDialog.setBindingContext(this.cntxt);
			this.prItemDetailDialog.open();
			
			// get Selected Path
			var aSelectedData  = this.lModel.getProperty(this.cntxt.getPath());
			var selectedItemNo = aSelectedData.Ebelp;
			if (selectedItemNo === '00000'){
				selectedItemNo = aSelectedData.PreqItem;
			}else{
				
			}
			this.selectedItemPONumber = selectedItemNo;
		},
		
		// Items Edit and display
		onEditDetailItem : function(oEvent) {
			this.lModel.setProperty("/dEditable", true);
		},
		
		conditionfill: function(){
			this._CalculateValue();
		},
		
		onSavePress :function(){
			  var POitems = [];
			  POitems     = this.lModel.getProperty('/PoLineItem');
			  var POtype, POtype1, POtype2, POtype3, POtype4, x, lgth = POitems.length;
			  if (lgth == 0){
				  MessageBox.error("Please add PO Item");
				  POtype2 = 'equal';
			  } else {
				  POtype      = POitems[0].Requestmat;
				  if (POtype === '1'){
					  POtype3 = 'Material';
				  } else if (POtype === '2'){
					  POtype3 = 'Service';
				  } else if (POtype === '3'){
					  POtype3 = 'Service';
				  }
				  POtype2     = 'equal';
				  if (lgth >1){
					  for (x = 1; x < lgth; x++ ){
						  POtype1     = POitems[x].Requestmat
						  if (POtype1 === '1'){
							  POtype4 = 'Material';
						  } else if (POtype1 === '2'){
							  POtype4 = 'Service';
						  } else if (POtype1 === '3'){
							  POtype4 = 'Service';
						  }
						  if (POtype3 != POtype4){
							  POtype2 = 'unequal';
						  }
					  }
				  };
				  if (POtype2 === 'equal'){
					this._onSavePress("");
				  } else {
					MessageBox.error("Inconsistent Purchase Order Items: \n\ Material and Service are present.");
				  }
			  } 
		  },
		  
		  _onSavePress: function(oParm){
				if ( this.checkheadvalues() === 0){
					var errText = "Please fill Mandatory fields"
					sap.m.MessageBox.error(errText, {title : "Error"});
				} else {
				  this.getView().setBusy(true);
				  var poModel   = this.getOwnerComponent().getModel(); 
				  var aItem     = this.lModel.getProperty('/PoLineItem');
				  var itemsData = [];
			      itemsData     = jQuery.extend(true, [], aItem);
			      var vatAmount = 0;
			      for (var x = 0, len = itemsData.length; x < len; x++) {
					itemsData[x].MatlGroup = "01";
					itemsData[x].PoNumber = "1217TEO152";
					itemsData[x].PoItem = ((x+1)*10).toString();
//					itemsData[x].PoItem = "000"+((x+1)*10).toString();
				    itemsData[x].Short_Text = itemsData[x].ShortText;      delete itemsData[x].ShortText;			
				    itemsData[x].Preq_No = itemsData[x].Banfn;             delete itemsData[x].Banfn;
				    itemsData[x].Costcenter = itemsData[x].Kostl;          delete itemsData[x].Kostl;
				    itemsData[x].Delvdate = itemsData[x].DelivDate;        delete itemsData[x].DelivDate;		    
				    itemsData[x].Discountval = itemsData[x].Discountvalue; delete itemsData[x].Discountvalue;		    
				    itemsData[x].Glaccount = itemsData[x].Glaccont;        delete itemsData[x].Glaccont;		    
				    itemsData[x].Preq_Item = itemsData[x].PreqItem;        delete itemsData[x].PreqItem;
				    itemsData[x].NetPrice = itemsData[x].PreqPrice;        delete itemsData[x].PreqPrice;
				    itemsData[x].Orderunit = itemsData[x].Unit;            delete itemsData[x].Unit;
				    vatAmount = Number(itemsData[x].Vatvalue);
				    if(vatAmount >0){
				    	itemsData[x].Tax_Code='V2';
				    }else{
				    	itemsData[x].Tax_Code='V0';
				    }
				    delete itemsData[x].Currency;           			    delete itemsData[x].DesVendor;
				    delete itemsData[x].Doknr;          				    delete itemsData[x].EBAN_DATASet;
				    delete itemsData[x].Ematn;	        				    delete itemsData[x].Excemtion;
				    delete itemsData[x].Gltext;         				    delete itemsData[x].Costtext;
				    //delete itemsData[x].MatlGroup;
				    delete itemsData[x].PeriodIndExpirationDate;		    delete itemsData[x].PreqPrice;
				    delete itemsData[x].PurGroup;           			    delete itemsData[x].PurchOrg;
				    //delete itemsData[x].Quantity; 				    //delete itemsData[x].Requestmat;
				    delete itemsData[x].Requestoth;     				    delete itemsData[x].Requestsrv;
				    delete itemsData[x].StoreLoc;       				    delete itemsData[x].Unit;
				    delete itemsData[x].Mimetype;       				    delete itemsData[x].Filename;
				    //delete itemsData[x].Vatvalue;
				    delete itemsData[x].navigitemstofile;   			    delete itemsData[x].__metadata;
				    delete itemsData[x].__proto__;      				    delete itemsData[x].navServiceOrder;
				    delete itemsData[x].Filedata;
				};
				
			      var POservicesData = [];
			      POservicesData = this.lModel.getProperty("/poServices");
			      for (var x = 0, len = POservicesData.length; x < len; x++) {
			    	  delete POservicesData[x].VatAmount;
			    	  delete POservicesData[x].NetValue;
			      };
			      var aPlantData = this.lModel.getProperty('/PlantDetail');
			      var aPrDetail  = this.lModel.getProperty('/PrDetail');
			      var InstallmentData = this.lModel.getProperty("/poServices");
			      var saveInstallData = jQuery.extend(true, [], InstallmentData);
			      for(x=0; x<saveInstallData.length; x++){
						delete saveInstallData[x].PrAfteDis;
			      }
			      var  headerData = {
			    	  PoNumber     : "1217TEO103",
			    	  Flag         : "C",
	    			  Plantcountry : aPlantData.Plantcountry,
	    			  Plantname    : aPlantData.Plantname,
	    			  Plantpostal  : aPlantData.Plantpostal,
	    			  Plantregion  : aPlantData.Plantregion,
	    			  Plantstreet  : aPlantData.Plantstreet,
	    			  Planttitle   : this.getView().byId('idTitle').getValue(),
	    			  Pmnttrms     : "0001",
	    			  PoDesc       : aPrDetail.Zrequestbreif,
	    			  Posubmit     : "",
	    			  Preq_No      : aPrDetail.Banfn,
	    			  QrNo         : this._Quotation,
	    			  Splinstruct  : "",
	    			  Subtot       : this._Subtotal,
	    			  Subtotcurr   : this._Currency,
	    			  Totalamt     : this._TotalAmount,
	    			  Totcurrency  : this._Currency,
	    			  Totdiscount  : this._TotalDiscount,
	    			  Discountcurr : this._Currency,
	    			  Vatvaluecurr : this._Currency,
	    			  Vendor       : this._Vendor,
	    			  Zrequesttype : this._PrRequestType,
			    	  navtoitem            : itemsData,
		    		  navigpoheadtoservices: saveInstallData,
		    		  navigpotodms         : this.lModel.getProperty("/navigdms")//get data of Service Order Payment
					};
			      	var that             = this;
		      		poModel.create("/POHEADERSet", headerData, { 
		      			success : function( oData, response) {
		      				var sPOnumber = response.data.PoNumber;
		      				var shText    = this.getResourceBundle().getText("poCreated", [sPOnumber]);
							MessageBox.success(shText, {
								title : this.getResourceBundle().getText("Success"),
								onClose: function(){
									that.getOwnerComponent().getRouter().navTo("PO", {id: sPOnumber}, true);
								}
							});
							this.getOwnerComponent().getModel().refresh();
							this.getView().setBusy(false);this._onRouteMatched();
		      			}.bind(this), 
		      			error : function(oError) { 
		      				var shText = oError.responseText;
		      				MessageBox.error(shText, {
		      					title : this.getResourceBundle().getText("Error"),
		      				});
				  		  this.getView().setBusy(false);
//				  		  this._onRouteMatched();
		      			}.bind(this)
		      		});
			  }
			  },
			  checkheadvalues: function(){
					var PODErrMsg = this.getView().byId("idPoDescription").getValue() ? true:false;
					var errMsg = PODErrMsg;
					return errMsg;
			  },
			  
			  // Items Remove
			  onItemRemove : function(oEvent) {
				  oEvent.getSource().getParent().close();
				  var arr   = this.cntxt.getPath().split("/");
				  var items = this.lModel.getProperty('/PoLineItem');
				  var pInt  = parseInt(arr[arr.length - 1]);
				  if(items[pInt].PreqItem){
					  var tempDelData = this.lModel.getProperty("/tempDelData");
					  var poData      = $.extend(true, {},items[pInt]);
					  var temp        = {};
					  temp.PreqItem   = poData.PreqItem;
					  temp.Banfn      = poData.Banfn;												
					  temp.Kostl      = poData.Kostl;
					  temp.Glaccount  = poData.Glaccount;
					  tempDelData.push(temp);
					  this.lModel.setProperty("/tempDelData",tempDelData);
				  }
				  items.splice(pInt, 1);
				  this.lModel.setProperty('/PoLineItem',items);
				  this.conditionfill();
			  },
			  
			// Items Edit and display
			  onEditDetailItem : function(oEvent) {
				  this.lModel.setProperty("/dEditable", true);
			  },
			  
			// Add the service order to the model and Table
			  onAddInstalment: function(oEvent){
				  var fragmentId   = this.getView().createId("itemDetail");
				  var sDescription = sap.ui.core.Fragment.byId(fragmentId, "idAddInstalDesc").getValue();
				  var sValue       = sap.ui.core.Fragment.byId(fragmentId, "idAddInstalValue").getValue();
				  var sServiceType = sap.ui.core.Fragment.byId(fragmentId, "idServiceType").getSelectedKey();
				  var sNetValue    = sap.ui.core.Fragment.byId(fragmentId, "matrnNetValue").getValue();
				  var sCurrency    = sap.ui.core.Fragment.byId(fragmentId, "matrnCurr").getSelectedKey();
				  var sPoItemNo    = this.selectedItemPONumber;
				  var oValue       = sap.ui.core.Fragment.byId(fragmentId, "matrnVal");
				  var oSubValue    = sap.ui.core.Fragment.byId(fragmentId, "idSubTotal");
				  var oDiscount    = sap.ui.core.Fragment.byId(fragmentId, "matrnDiscVal").getValue();
				  var oVat         = sap.ui.core.Fragment.byId(fragmentId, "matrnVAT").getValue();
				  var oNetValue    = sap.ui.core.Fragment.byId(fragmentId, "matrnNetValue");
				  var oVatPercent  = sap.ui.core.Fragment.byId(fragmentId, "POitemAddVAT").getSelectedKey();
				  var currentValue = Number(oValue.getValue());
				  var currentNet   = currentValue;
				  if (currentValue < 1){
					  oValue.setValueState(sap.ui.core.ValueState.Error);
				  }else{
					  var tablObj = {};
					  
					  if(sServiceType === 'V'){
						  tablObj.PrAfteDis = (sValue * (1 - oDiscount/100)).toFixed(2);
						  tablObj.GrPrice   = sValue;
						  tablObj.BaseUom   = "GRO";
						  tablObj.Formula   = "VOL01";
						  tablObj.FormVal1  = "0";
						  tablObj.VatAmount = ((sValue * (1 - oDiscount/100))*oVatPercent/100).toFixed(2);
						  tablObj.NetValue  = ((sValue * (1 - oDiscount/100)) + ((sValue * (1 - oDiscount/100))*oVatPercent/100)).toFixed(2);
					  }else if(sServiceType === 'P'){
						  tablObj.PrAfteDis = ((currentValue*sValue/100) * (1 - oDiscount/100)).toFixed(2);
						  tablObj.GrPrice   = (currentValue*sValue/100).toFixed(2);
						  tablObj.BaseUom   ="%";
						  tablObj.Formula   ="PERCENT";
						  tablObj.FormVal1  =sValue;
						  tablObj.VatAmount = (((currentValue*sValue/100) * (1 - oDiscount/100))*oVatPercent/100).toFixed(2);
						  tablObj.NetValue  = (((currentValue*sValue/100) * (1 - oDiscount/100))*(1 + oVatPercent/100)).toFixed(2) ;
					  }
					  tablObj.Quantity  = "1";
					  tablObj.ShortText = sDescription;
					  tablObj.Polineitem= sPoItemNo;
					  tablObj.Qrno      = this.lModel.getProperty(this.cntxt.getPath()).Ebeln;
					  tablObj.Qrlineitem= this.lModel.getProperty(this.cntxt.getPath()).Ebelp;
				  	var lTbl                 = this.lModel.getProperty("/poServices");
				  	var navServiceOrder      = this.lModel.getProperty(this.cntxt.getPath()+"/navServiceOrder");
				  	var serviceOrderLength;
				  	if ( navServiceOrder == undefined){
				  		serviceOrderLength = 0
				  	}else{
				  		serviceOrderLength = navServiceOrder.length;
				  	}
					// Calculate the remaining Amount from Installment
					if( serviceOrderLength === 0 ) {
						this.remainingInstalment = Number((currentNet - Number(tablObj.GrPrice)).toFixed(2));
						this.totalInstallment    = Number(tablObj.GrPrice);
					}else{
						this.remainingInstalment = Number((Math.abs(this.remainingInstalment) - Number(tablObj.GrPrice)).toFixed(2));
						this.totalInstallment   += Number(tablObj.GrPrice);
						
					}
					// if remaining Installment is negative
					if(this.remainingInstalment < 0){
						var sAlert = this.getResourceBundle().getText("instExcVal", [Math.abs(this.remainingInstalment), sCurrency]);
						MessageBox.error(sAlert, {
		  					title : this.getResourceBundle().getText("Error"),
		  				});
						sap.ui.core.Fragment.byId(fragmentId,	"idAddInstalValue").setValueState(sap.ui.core.ValueState.Error);
						this.remainingInstalment += Number(tablObj.GrPrice);
						this.totalInstallment    -= Number(tablObj.GrPrice);
					} else {
						lTbl.push(tablObj);
						this.lModel.setProperty("/poServices", lTbl);
						
						var localItemSOTable = this.lModel.getProperty(this.cntxt.getPath()+"/navServiceOrder");
						var localItemTable   = this.lModel.getProperty(this.cntxt.getPath());
						if (localItemSOTable == undefined){
							localItemTable.navServiceOrder=[];
							localItemTable.navServiceOrder.push(tablObj);
							this.lModel.setProperty(this.cntxt.getPath(), localItemTable);
						}else{
							localItemSOTable.push(tablObj);
							this.lModel.setProperty(this.cntxt.getPath()+"/navServiceOrder", localItemSOTable);
						}
						
						// clear the field Description and Value
						sap.ui.core.Fragment.byId(fragmentId,	"idAddInstalDesc").setValue('');
						sap.ui.core.Fragment.byId(fragmentId,	"idAddInstalValue").setValue('');
						sap.ui.core.Fragment.byId(fragmentId,	"idAddInstalValue").setValueState(sap.ui.core.ValueState.None);
					}
					oValue.setValueState(sap.ui.core.ValueState.None);
				  }
			  },
			  
			  handleInstalmentDelete: function(oEvent){
				  var sPath      = oEvent.getParameter('listItem').getBindingContext().getPath();
				  var index      = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
				  var aItems     = this.lModel.getProperty('/poServices');
				  var dItems     = this.lModel.getProperty(this.cntxt.getPath()+'/navServiceOrder');
				  var bItems     = this.lModel.getProperty(sPath);
				  var alength    = aItems.length;
				  var x, cItems;
				  for(x = 0; x < alength; x++){
					  cItems = aItems[x]; 
					  if(JSON.stringify(bItems) === JSON.stringify(cItems)){
						  aItems.splice(x,1);
						  this.lModel.setProperty('/poServices', aItems);
						  dItems.splice(index,1);
						  this.lModel.setProperty(this.cntxt.getPath()+"/navServiceOrder", dItems);
					  }else{
						  
					  }
				  }
				  
				  var GrossPrice = bItems.GrPrice;
			   	  this.remainingInstalment += Number(GrossPrice);
			   	  this.totalInstallment    -= Number(GrossPrice);
			  },
			  
			  onFileUpload:function(oEvent){
				  var tablObj = {};
				  var fragmentId       = this.getView().createId("itemsFragment");
				  tablObj.Serialno     = (this.lModel.getProperty("/navigdms").length+1).toString();
				  var matrnFile        =  oEvent.getSource().getParent().getContent()[2];
				  var tblFileInputId   = matrnFile .getId() +'-fu';
				  var reader           = new FileReader();
				  var tblFileInput     = $.sap.domById(tblFileInputId);
				  var tblFile          = tblFileInput.files[0];
				  tablObj.Docfile      = tblFile.name;
				  tablObj.Mimetype     = tblFile.type;
				  var base64marker     = 'data:' + tblFile.type + ';base64,';
				  var dArr             = this.lModel.getProperty("/navigdms");
				  var that             = this;
					  
				  reader.onload = (function(theFile) {
					  return function(evt) {
						  var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
						  var base64       = evt.target.result.substring(base64Index);
						  tablObj.Filedata = base64.toString(); 
						  dArr.push(tablObj);
						  that.lModel.setProperty("/navigdms",dArr);
						  matrnFile.clear();
					  }
				  })();
				  reader.readAsDataURL(tblFile);
			  },
			  
			  onServiceOrderType: function(oEvent){
				  var sKey         = oEvent.getSource().getSelectedKey();
				  var fragmentId   = this.getView().createId("itemDetail");
				  var sValueLabel  = sap.ui.core.Fragment.byId(fragmentId,	"idServiceOrderValue");
				  var sValueUnit   = sap.ui.core.Fragment.byId(fragmentId,	"idAddInstalTxt");
				  
				  if(sKey === 'P'){
					  sValueLabel.setText("Percentage");
					  sValueUnit.setText("%");
				  }else if(sKey === 'V'){
					  sValueLabel.setText("Value");
					  sValueUnit.setText("");
				  }
			  },
	});

}, /* bExport= */true);