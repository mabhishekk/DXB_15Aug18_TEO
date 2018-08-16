sap.ui.define([
		"sap/ui/core/mvc/Controller",
		'sap/m/MessageBox',
		'sap/m/MessageToast',
		"sap/ui/core/routing/History"
	], function (Controller, MessageBox, MessageToast,History) {
		"use strict";

	return Controller.extend("zpo_userapp.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		  onNavButtonPress: function () {
				var oHistory = sap.ui.core.routing.History.getInstance();
				var oPrevHash = oHistory.getPreviousHash();
				if (oPrevHash !== undefined) {
					window.history.go(-1);
				} else {
					this._oRouter.navTo("home", {}, true);
				}
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
		
		//event for setting net price/value currency on change of value currency
		onValueCurrecyChange: function(oEvent){debugger;
		
			//var fragmentId = this.getView().createId("itemsFragment");
			
			var viewID      = this.getView().getId();
			var fragmentId1 = oEvent.getParameter("id").split("--")[1];
			var fragmentId  = viewID + "--" +fragmentId1;
			var sCurrency   = sap.ui.core.Fragment.byId(fragmentId,	"matrnCurr").getSelectedKey();
			sap.ui.core.Fragment.byId(fragmentId,	"matrnNVCurr").setSelectedKey(sCurrency);
			sap.ui.core.Fragment.byId(fragmentId,	"idSubTotalCurr").setSelectedKey(sCurrency);
		},
		
		//method for Netprice value calculation at item level
		
		netPriceCalc: function(oEvent){
			debugger;
			var viewID      = this.getView().getId();
			var fragmentId1 = oEvent.getParameter("id").split("--")[1];
			var fragmentId  = viewID + "--" +fragmentId1;

			var Value         = Number(sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue());
//			var Vatvalue      = Number(sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue());
			var Vatvalue      = Number(sap.ui.core.Fragment.byId(fragmentId,"POitemAddVAT").getSelectedKey());
			var Discountvalue = Number(sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue());
			var Quantity      = Number(sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue());

			var Value1             = Quantity * Value;
			var DiscountedPrice    = ((Discountvalue*Value1)/100);
			var PriceAfterDiscount = Value1 - DiscountedPrice;
			var TotalVatValue      = ((PriceAfterDiscount*Vatvalue)/100);
			var Subtotal           = PriceAfterDiscount + TotalVatValue;
			
			sap.ui.core.Fragment.byId(fragmentId, "idSubTotal"   ).setValue(PriceAfterDiscount.toFixed(2));
			sap.ui.core.Fragment.byId(fragmentId, "matrnNetValue").setValue(Subtotal.toFixed(2));
			var itemAddTaxCode = sap.ui.core.Fragment.byId(fragmentId, "POitemAddTaxCode");
			if(Vatvalue == 0){
				itemAddTaxCode.setValue('V0');
			}else if(Vatvalue == 5){
				itemAddTaxCode.setValue('V2');
			}
			//this.getView().byId("matrnNetValue").setValue(Subtotal.toFixed(3));
			
		},
		
		// method for filling currency drop down for conditions tab
		conditionsCurrencyfill: function(){
			
		var TotalValCurr = this.getView().byId("idTotalValCurr");
		TotalValCurr.setModel(this.getOwnerComponent().getModel("prm"));
		//valCurr.setModel(this.lModel,"lModel");

		TotalValCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
			})
		});

		//var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
		//valCurr.bindProperty("selectedKey",currPath);
		
		
		var TotalDiscCurr = this.getView().byId("idTotalDiscCurr");
		TotalDiscCurr.setModel(this.getOwnerComponent().getModel("prm"));
		//valCurr.setModel(this.lModel,"lModel");

		TotalDiscCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});

		//var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
		//valCurr.bindProperty("selectedKey",currPath);
		
		
		var TotalVatValCurr = this.getView().byId("idTotalVatValCurr");
		TotalVatValCurr.setModel(this.getOwnerComponent().getModel("prm"));
		//valCurr.setModel(this.lModel,"lModel");

		TotalVatValCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});

		//var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
		//valCurr.bindProperty("selectedKey",currPath);
		
		
		
		var SubTotCurr = this.getView().byId("idSubTotCurr");
		SubTotCurr.setModel(this.getOwnerComponent().getModel("prm"));
		//valCurr.setModel(this.lModel,"lModel");

		SubTotCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});

		//var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
		//valCurr.bindProperty("selectedKey",currPath);
		
		},
		
	//Remove Items	
		
		onItemRemove : function(oEvent) {

			oEvent.getSource().getParent().close();

			var arr = this.cntxt.getPath().split("/");
			var items = this.lModel.getProperty('/mainSet/navigtoitems');
			var pInt = parseInt(arr[arr.length - 1]);
			items.splice(pInt, 1);
			this.lModel.setProperty('/mainSet/navigtoitems',items);

			// lstbl.removeItem(parseInt(arr[arr.length-1]));

		},
		
		onMaterialSelect:function(oEvent){
			
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			
//			var fragmentId = this.getView().createId("itemsFragment");

			var matText = this.getResourceBundle().getText("MatDesc")
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText(matText);
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(false);											
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(false);
//			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setValue("");
		},
		onSelectOthers:function(oEvent){
			
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			
//			var fragmentId = this.getView().createId("itemsFragment");
			var desc = this.getResourceBundle().getText("Description")
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText(desc);
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue("1");
			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("AU");
//			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
			
		},
		
		onSelectService:function(oEvent){
			
			
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			
//			var fragmentId = this.getView().createId("itemsFragment");
			var SerText = this.getResourceBundle().getText("ServiceDesc")
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText(SerText);
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue("1");
			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("AU");
//			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
			
			
		},
		
		
		
		onOpenDialItem : function(oEvent) {
			debugger;
			
			var fragmentId = this.getView().createId("itemsFragment");
			var SegBut     = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader");
			var matBtn     = sap.ui.core.Fragment.byId(fragmentId,"mtrl");
			var srvBtn     = sap.ui.core.Fragment.byId(fragmentId,"srv");
			var othBtn     = sap.ui.core.Fragment.byId(fragmentId,"othrs");
			 // Select PO Item Type
			var POitems    = [];
//			POitems        = this.lModel.getProperty('/mainSet/navigtoitems/results');
			POitems        = this.lModel.getProperty('/mainSet/navtoitem/results');
			var POtype, POtype1, POtype2, POtype3, POtype4, x, lgth = POitems.length;
			if(lgth > 0){
				POtype      = POitems[0].Requestmat;
				sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").setSelectedKey(POtype);
				if(POtype === "1"){
					SegBut.setSelectedKey('1');
					matBtn.setEnabled(true);
					srvBtn.setEnabled(false);
					othBtn.setEnabled(false);
					matBtn.firePress();
					sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(true);
					sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(true);
//					sap.ui.core.Fragment.byId(fragmentId,"id_startDt" ).setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"itmStartDate" ).setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"id_endDt" ).setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"itmEndDate" ).setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"id_DelvDt" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"DP1" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"idServiceOrderTable" ).setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"idNewInstallmentForm").setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"idAddInstalmentBtn"  ).setVisible(false);
				}else if(POtype === "2"){
					SegBut.setSelectedKey('2');
					matBtn.setEnabled(false);
					srvBtn.setEnabled(true);
					othBtn.setEnabled(false);
					srvBtn.firePress();
					sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(false);
					sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(false);
//					sap.ui.core.Fragment.byId(fragmentId,"id_startDt" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"itmStartDate" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"id_endDt" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"itmEndDate" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"id_DelvDt" ).setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"DP1" ).setVisible(false);
//					sap.ui.core.Fragment.byId(fragmentId,"idServiceOrderTable" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"idNewInstallmentForm").setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"idAddInstalmentBtn"  ).setVisible(true);
				} else if(POtype === "3"){
					SegBut.setSelectedKey('3');
					matBtn.setEnabled(false);
					srvBtn.setEnabled(false);
					othBtn.setEnabled(true);
					othBtn.firePress();
					sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(false);
					sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(false);
//					sap.ui.core.Fragment.byId(fragmentId,"id_startDt" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"itmStartDate" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"id_endDt" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"itmEndDate" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"id_DelvDt" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"DP1" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"idServiceOrderTable" ).setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"idNewInstallmentForm").setVisible(true);
//					sap.ui.core.Fragment.byId(fragmentId,"idAddInstalmentBtn"  ).setVisible(true);
				} else {
					matBtn.setEnabled(true);
					srvBtn.setEnabled(true);
					othBtn.setEnabled(true);
				}
			} else {
				matBtn.setEnabled(true);
				srvBtn.setEnabled(true);
				othBtn.setEnabled(true);
			};
			this._onOpenDialItem(oEvent);
		},
		
		_onOpenDialItem : function(oEvent){
			debugger;
			var fragmentId = this.getView().createId("itemsFragment");
			var NVCurr     = sap.ui.core.Fragment.byId(fragmentId,"matrnNVCurr");
			NVCurr.setModel(this.getOwnerComponent().getModel("prm"));
			NVCurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
					text : "{Waers}",
					key : "{Waers}",
					additionalText : "{Landx50}"
				})
			});
			
			var valCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr");
			valCurr.setModel(this.getOwnerComponent().getModel("prm"));
			valCurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
							text : "{Waers}",
							key : "{Waers}",
							additionalText : "{Landx50}"
						})
			});
			
			// currency for Sub Total
			var sSubTotalCurr = sap.ui.core.Fragment.byId(fragmentId,"idSubTotalCurr");
			sSubTotalCurr.setModel(this.getOwnerComponent().getModel("prm"));
			sSubTotalCurr.setModel(this.lModel,"lModel");

			sSubTotalCurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
							text : "{Waers}",
							key : "{Waers}",
							additionalText : "{Landx50}"
				})
			});
			
			var matrnUnit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit");
			matrnUnit.setModel(this.getOwnerComponent().getModel("prm"));
			matrnUnit.bindItems({
				path : "/unitsSet",
				template : new sap.ui.core.ListItem({
							text : "{Msehl}",
							key : "{Msehi}"
						})
			});
			// Account Assignment Catogery
			var matrnActAsignCat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat");
			matrnActAsignCat.setModel(this.getOwnerComponent().getModel("prm"));
			matrnActAsignCat.bindItems({
				path : "/ACCATEGORYSet",
				template : new sap.ui.core.ListItem({
							text : "{Knttx}",
							key : "{Knttp}"
						})
			});
			
			// tax code
			var matrnTaxCode = sap.ui.core.Fragment.byId(fragmentId,"matrnTaxcode");
			matrnTaxCode.setModel(this.getOwnerComponent().getModel("pom"));
//			matrnTaxCode.bindItems({
//					path : "/TAXCODESSet",
//					template : new sap.ui.core.ListItem({
//								text : "{Text1}",
//								key : "{Mwskz}"
//							})
//			});
		
			
// cost center
			var matrnCC = sap.ui.core.Fragment.byId(fragmentId, "matrnCC");
			matrnCC.setModel(this.getOwnerComponent().getModel("prm"));
			matrnCC.bindItems({
				path : "/costcentrelistSet",
				template : new sap.ui.core.ListItem({
							text : "{Ltext}",
							key : "{Kostl}"
						})
			});

			var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode");
			matrnGLCode.setModel(this.getOwnerComponent().getModel("pom"));
			matrnGLCode.bindItems({
				path : "/GLACCOUNTSSet",
				template : new sap.ui.core.ListItem({
							text : "{Txt20}",
							key : "{Saknr}"
						})
			});
			oEvent.getSource().setBusy(false);
		},
		/*
		 * 
		 * 
		 * PR Status of the application */
		
		PRStatusTab:function(oParm){
			var oParm = "PO";
			var arr = ["PO","GR","IN"];
			var oPath= "/"+oParm;
			var that = this;
			var vArr,rArr ;
			if(oParm){
				vArr = arr.slice(0,arr.indexOf(oParm)+1);							
				for (var i = 0, len = vArr.length; i < len; i++) {
						var oPath = "/"+vArr[i];						
						this.lModel.setProperty(oPath,true);					
					}
				rArr = arr.slice(arr.indexOf(oParm)+1);	
				for (var i = 0, len = rArr.length; i < len; i++) {
					var oPath = "/"+rArr[i];					
					this.lModel.setProperty(oPath,false);				
				}
			
			}		
		},
		
		
		/*PO Create Page status according to PR urgent 
		 * 
		 * */
		
	prUrgentStatus:function(oParm){
		
		if(oParm != "1"){
			this.lModel.setProperty("/QR",false);
			this.lModel.setProperty("/QC",false);
		}else{
			this.lModel.setProperty("/QR",true);
			this.lModel.setProperty("/QC",true);
		}
	},

		/*
		 * 
		 * 
		 * Icon tab bar selection */
		
		handleIconTabBarSelect:function(oEvent){
			var oModel = this.getView().getModel();
			var icKey = oEvent.getParameter('selectedKey');
			var sPRnumber;
			var extArr = ["PR","QR","QC"];
			sPRnumber = oModel.getProperty(this.sPath+'/Banfn');
			if(sPRnumber === undefined){
				sPRnumber = this.lModel.getProperty('/mainSet/Preq_No');
			}
			var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			if(icKey == "PR"){
//				this.getOwnerComponent().getRouter().navTo(icKey, {id: this.sId});
				var shlHash = "ZUSER_PR-create&/PR-"+sPRnumber+"/Edit"
				var hrefForProductDisplay  =  oCrossAppNav.toExternal({
					  target : { shellHash : shlHash }
				}); 
			}else if(icKey == "QR"){
				var shlHash = "ZUSER_PR-create&/PR-"+sPRnumber+"/quotation"
				var hrefForProductDisplay  =  oCrossAppNav.toExternal({
					  target : { shellHash : shlHash }
				});
			}else if(icKey == "QC"){				
				var shlHash = "ZUSER_PR-create&/PR-"+sPRnumber+"/quotComparision"
				var hrefForProductDisplay  =  oCrossAppNav.toExternal({
					  target : { shellHash : shlHash }
				});
			}else if(icKey == "GR"){
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "z_usergr", action : "create" },
					  params : { id: this.sId}
					});
			}else if(icKey == "IN"){
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "z_user_invoice", action : "create" },
					  params : { id: this.sId}
					});
			}
		},

		// Detail Dialogue Item on After loading
		onOpenDetailDialItem : function(oEvent) { debugger;

			var fragmentId = this.getView().createId("itemDetail");
			
			// start for Net price calculation
			
			var Quanity  = Number(sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue());
			var Value    = Number(sap.ui.core.Fragment.byId(fragmentId,	"matrnVal").getValue());
			var Vatvalue = Number(sap.ui.core.Fragment.byId(fragmentId,	"matrnVAT").getValue());
			var Discountvalue = Number(sap.ui.core.Fragment.byId(fragmentId,	"matrnDiscVal").getValue());
			var sCurrency     = sap.ui.core.Fragment.byId(fragmentId,	"matrnCurr").getSelectedKey();
			Value			  = Value*Quanity;
			var DiscountedPrice = ((Discountvalue*Value)/100);
			var PriceAfterDiscount = Value - DiscountedPrice;
			var TotalVatValue = ((PriceAfterDiscount*Vatvalue)/100);
			var Subtotal = PriceAfterDiscount + TotalVatValue;
			sap.ui.core.Fragment.byId(fragmentId, "idSubTotal"   ).setValue(PriceAfterDiscount.toFixed(2));			
			sap.ui.core.Fragment.byId(fragmentId, "matrnNetValue").setValue(Subtotal.toFixed(2));
			//this.getView().byId("matrnNetValue").setValue(Subtotal.toFixed(3));
			sap.ui.core.Fragment.byId(fragmentId,"idSubTotalCurr").setSelectedKey(sCurrency);
			sap.ui.core.Fragment.byId(fragmentId,	"matrnNVCurr").setSelectedKey(sCurrency);			
			
			// end for Net price calculation
			
			var rType = this.cntxt.getProperty("Requestmat");
			var segBtns = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader");
			var matBtn =  sap.ui.core.Fragment.byId(fragmentId,"mtrl");
			var srvBtn =  sap.ui.core.Fragment.byId(fragmentId,"srv");
			var othBtn =  sap.ui.core.Fragment.byId(fragmentId,"othrs");
			
			if(rType == "1"){
				
//				 sBtn =  sap.ui.core.Fragment.byId(fragmentId,"mtrl");
				segBtns.setSelectedKey(rType);
				matBtn.firePress();
				srvBtn.setEnabled(false);
				othBtn.setEnabled(false);
				sap.ui.core.Fragment.byId(fragmentId,"idServiceOrderTable" ).setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"idNewInstallmentForm").setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"idAddInstalmentBtn"  ).setVisible(false);
				
			}else if(rType == "2"){
				segBtns.setSelectedKey(rType);
				srvBtn.firePress();
				matBtn.setEnabled(false);
				othBtn.setEnabled(false);
				sap.ui.core.Fragment.byId(fragmentId,"idServiceOrderTable" ).setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"idNewInstallmentForm").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"idAddInstalmentBtn"  ).setVisible(true);
				
			}else{
				
				segBtns.setSelectedKey(rType);
				othBtn.firePress();
				matBtn.setEnabled(false);
				srvBtn.setEnabled(false);
				sap.ui.core.Fragment.byId(fragmentId,"idServiceOrderTable").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"idNewInstallmentForm").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"idAddInstalmentBtn").setVisible(true);
			}
			
			// currency for value
			var valCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr");
			valCurr.setModel(this.getOwnerComponent().getModel("prm"));
			valCurr.setModel(this.lModel,"lModel");

			valCurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
							text : "{Waers}",
							key : "{Waers}",
							additionalText : "{Landx50}"
				})
			});

			var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
			valCurr.bindProperty("selectedKey",currPath);
			// currency for Sub Total
			var sSubTotalCurr = sap.ui.core.Fragment.byId(fragmentId,"idSubTotalCurr");
			sSubTotalCurr.setModel(this.getOwnerComponent().getModel("prm"));
			sSubTotalCurr.setModel(this.lModel,"lModel");

			sSubTotalCurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
							text : "{Waers}",
							key : "{Waers}",
							additionalText : "{Landx50}"
				})
			});
			// currency for net value
			var valNVCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnNVCurr");
			valNVCurr.setModel(this.getOwnerComponent().getModel("prm"));
			valNVCurr.setModel(this.lModel,"lModel");

			valNVCurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
							text : "{Waers}",
							key : "{Waers}",
							additionalText : "{Landx50}"
				})
			});	

			var matrnUnit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit");

			matrnUnit.setModel(this.getOwnerComponent().getModel("prm"));
			matrnUnit.setModel(this.lModel,"lModel");

			matrnUnit.bindItems({
				path : "/unitsSet",
				template : new sap.ui.core.ListItem({
							text : "{Msehl}",
							key : "{Msehi}"
				})
			});
			
			// tax code
			
			var matrnTaxCode = sap.ui.core.Fragment.byId(fragmentId,"matrnTaxcode");
			matrnTaxCode.setModel(this.getOwnerComponent().getModel("pom"));
			matrnTaxCode.bindItems({
				path : "/TAXCODESSet",
				template : new sap.ui.core.ListItem({
							text : "{Text1}",
							key : "{Mwskz}"
				})
			});
			var tcPath = "lModel>"+ this.cntxt.getPath()+ "/Tax_Code";
			matrnTaxCode.bindProperty("selectedKey", tcPath);
			
			// Account Assignment Catogery

			var unitPath = "lModel>"+ this.cntxt.getPath()+ "/Unit";
			matrnUnit.bindProperty("selectedKey", unitPath);

			var matrnActAsignCat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat");
			matrnActAsignCat.setModel(this.getOwnerComponent().getModel("prm"));
			matrnActAsignCat.setModel(this.lModel, "lModel");

			matrnActAsignCat.bindItems({
				path : "/ACCATEGORYSet",
				template : new sap.ui.core.ListItem({
							text : "{Knttx}",
							key : "{Knttp}"
				})
			});

			var acPath = "lModel>"+ this.cntxt.getPath()+ "/Acctasscat";
			matrnActAsignCat.bindProperty("selectedKey", acPath);

			var matrnCC = sap.ui.core.Fragment.byId(fragmentId, "matrnCC");

			matrnCC.setModel(this.getOwnerComponent().getModel("prm"));
			matrnCC.setModel(this.lModel,"lModel");

			matrnCC.bindItems({
				path : "/costcentrelistSet",
				template : new sap.ui.core.ListItem({
							text : "{Ltext}",
							key : "{Kostl}"
				})
			});

			var ccPath = "lModel>"+ this.cntxt.getPath()+ "/Kostl";
			matrnCC.bindProperty("selectedKey",	ccPath);

			var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode");

			matrnGLCode.setModel(this.getOwnerComponent().getModel("pom"));
			matrnGLCode.setModel(this.lModel,"lModel");

			matrnGLCode.bindItems({
				path : "/GLACCOUNTSSet",
				template : new sap.ui.core.ListItem({
							text : "{Txt20}",
							key : "{Saknr}"

				})
			});

			var glPath = "lModel>"+ this.cntxt.getPath() + "/Glaccont";
			matrnGLCode.bindProperty("selectedKey", glPath);
			debugger;
			//Service Order Table Data binding
			var serviceTable  = sap.ui.core.Fragment.byId(fragmentId,"idServiceOrderTable");
			var serviceOrderPath = "lModel>"+ this.cntxt.getPath() + "/navServiceOrder";
			serviceTable.setModel(this.lModel,"lModel");
			
//			var oTemplate = new sap.m.ColumnListItem({
//				cells:[
//					new sap.m.Text({ text: "{navServiceOrder/0/ShortText}"}),
//					new sap.m.Text({ text: "{navServiceOrder/0/GrPrice}"}),
//					new sap.m.Text({ text: "{navServiceOrder/0/FormVal1}"})
//				]
//			});
			
//			serviceTable.bindItems({
//				path : serviceOrderPath,
////				template : oTemplate
//			});
			
		},
		
		//Save Detail Items

		onSaveDetailItem : function(oEvent) {
			var PoType          = this.cntxt.getProperty("Requestmat");
			if (PoType === '1'){
				this._CheckOnSave(oEvent);
			}else{
				var netValue        = sap.ui.core.Fragment.byId(this.getView().createId("itemDetail"),"idSubTotal").getValue(); 
				var sCurrency       = sap.ui.core.Fragment.byId(this.getView().createId("itemDetail"),"matrnCurr").getSelectedKey();
				var installmentItem = this.lModel.getProperty(this.cntxt.getPath()+'/navServiceOrder');
				var x, remainingInstallment, installmentAmount = 0;
				if( installmentItem != null ){
					for ( x = 0; x < installmentItem.length; x++){
						installmentAmount += Number(installmentItem[x].GrPrice);
					}
				}
				remainingInstallment = Number(netValue) - installmentAmount;
				
				var noOfInstallment = this.lModel.getProperty("/poServices").length;
				  if (noOfInstallment > 0){
					  if ( remainingInstallment !== 0){
						  if(remainingInstallment > 0){
							  var sAlert = this.getResourceBundle().getText("ValExcInst", [Math.abs(remainingInstallment), sCurrency]);
							  MessageBox.error(sAlert, {
				  					title : this.getResourceBundle().getText("Error"),
				  				});
						  }else if(remainingInstallment < 0){
							  var sAlert = this.getResourceBundle().getText("instExcVal", [Math.abs(remainingInstallment), sCurrency])
							  MessageBox.error(sAlert, {
				  					title : this.getResourceBundle().getText("Error"),
				  				});
						  }else {
							  var sAlert = this.getResourceBundle().getText("InstRemng", [Math.abs(remainingInstallment), sCurrency])
							  MessageBox.error(sAlert, {
				  					title : this.getResourceBundle().getText("Error"),
				  				});
						  }
					  }else {
						  this._CheckOnSave(oEvent);  
					  }
				  }else{
					  this._CheckOnSave(oEvent);
				  }
			}
			
		},
		
		_CheckOnSave: function(oEvent){
//			this.lModel.setProperty("/dEditable", false);
			this.onPRCItemDialogueClose(oEvent);
			this.conditionfill(); 
		},
		
		//Save Item while Creating PR
		
		
		onItemSave : function(oEvent) { 

			var tablObj = {};

			var fragmentId = this.getView().createId("itemsFragment");

			tablObj.Material = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
			tablObj.ShortText = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
			tablObj.Quantity = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
			if (tablObj.Quantity) {
				tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);
			} else {
				tablObj.Quantity = 0;
				tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);

			}

			tablObj.Unit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit").getSelectedKey();
			tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat").getSelectedKey();
			tablObj.PreqPrice = sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue();

			if (tablObj.PreqPrice) {
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);
			} else {

				tablObj.PreqPrice = 0.01;
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);

			}

			tablObj.Currency = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").getSelectedKey();
			tablObj.Begda = sap.ui.core.Fragment.byId(fragmentId,"itmStartDate").getDateValue();
			tablObj.Endda = sap.ui.core.Fragment.byId(fragmentId,"itmEndDate").getDateValue();
			tablObj.DelivDate = sap.ui.core.Fragment.byId(fragmentId,"DP1").getDateValue();
			tablObj.Discountvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue();
			if (tablObj.Discountvalue) {
				tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);
			} else {

				tablObj.Discountvalue = 0.00;

				tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);

			}
//			tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue();
//			// tablObj.discountvalue =
//			// sap.ui.core.Fragment.byId(fragmentId,"matrnDiscType").getValue();
//			if (tablObj.Vatvalue) {
//				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(3);
//			} else {
//				tablObj.Vatvalue = 0;
//				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(3);
//			}
//			tablObj.Tax_Code = sap.ui.core.Fragment.byId(fragmentId, "matrnTaxcode").getSelectedKey();
			
			tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"POitemAddVAT").getSelectedKey();
			tablObj.Tax_Code = sap.ui.core.Fragment.byId(fragmentId,"POitemAddTaxCode").getValue();
			tablObj.Kostl    = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedKey();
			tablObj.Costtext = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText();
			tablObj.Glaccont = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode").getSelectedKey();

			tablObj.Excemtion = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getSelected();

			tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
			
			// if (tablObj.Excemtion) {
			tablObj.Excemtion = tablObj.Excemtion ? "X": "Y";
			// }
			// ;

			this.enableButton(true);
			
			if(this.itemValidation(tablObj)){
				var lTbl = this.lModel.getProperty("/mainSet/navigtoitems");
				lTbl.push(tablObj);
				this.lModel.setProperty("/mainSet/navigtoitems",lTbl);
	
				var dItemBox = sap.ui.core.Fragment.byId(fragmentId,"idPRCDialog");
				this.onItemReset();
				
				dItemBox.close();
				this.byId("idIconTabBar").setSelectedKey("icon_Commercials");
			}else{
				var errText = this.getResourceBundle().getText("pfmf"); 
					sap.m.MessageBox.error(errText, {title : "Error"});
			}
		},
		enableButton:function(){
			this.byId("prSave").setVisible(true);
			this.byId("prSaveSubmit").setVisible(true);
			this.byId("prCancel").setVisible(true);
			
		},

		//Create item before dialouge open
		onBefDialOpen:function(oEvent){
			oEvent.getSource().setBusy(true);
		},
		
		// Item Reset in Dialogue
		onItemReset : function(oEvent) {

			var fragmentId = this.getView().createId("itemsFragment");

			sap.ui.core.Fragment.byId(fragmentId, "matrnNo").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "matrnDesc").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "matrnVal").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setDateValue(new Date());
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "matrnDiscVal").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "matrnVAT").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "matrnBudExem").setSelected(false);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
			
//			this.lModel.setProperty("/mainSet/Zrequesttype",1);
//			this.byId("L8").setVisible(false);

		},
	/*
	 * 	
		validation while create
	 */		
		validation : function(ptData) {
			var zDat = 	 ptData.Zrequestdate ? true: false;
	//		try{
			var zptDat = ptData.navigtoitems.length == 0 ? false:true;
		    return  (zDat & zptDat)==1?true:false;
			/*}catch(oErr){
				var zptDat = ptData.navigtoitems.length == 0 ? false:true;
				 return  (zDat & zptDat)==1?true:false;
			}*/

		},
		
		/*
		 * 	
			validation while item create
		 */
		
		
		POitemValidation:function(oParm){ 
			debugger;
			var errMsg = "";
			if(oParm.Requestmat == "1"){		
				var stErrMsg = oParm.Short_Text ? true:false;
				var qUErrMsg = parseInt(oParm.Quantity) == 0 ? false:true;
				errMsg = stErrMsg & qUErrMsg;
			}else if(oParm.Requestmat == "2" || oParm.Requestmat == "3" ){
				var stErrMsg = oParm.Short_Text  ? true:false;
				var qUErrMsg = parseInt(oParm.Quantity) == 0 ? false:true;				
				var sDtErrMsg  = oParm.Begda ? true:false;
				var eDtErrMsg  = oParm.Endda? true:false;
				errMsg = stErrMsg & qUErrMsg & sDtErrMsg & eDtErrMsg;
			}else{
				errMsg = 0
			}
			return errMsg == 0?false:true;
		},
		
		
		itemValidation:function(oParm){ debugger;
			var errMsg = "";
			if(oParm.Requestmat == "1"){		
				var stErrMsg = oParm.ShortText ? true:false;
				var qUErrMsg = parseInt(oParm.Quantity) == 0 ? false:true;
				errMsg = stErrMsg & qUErrMsg;
			}else if(oParm.Requestmat == "2" || oParm.Requestmat == "3" ){
				var stErrMsg = oParm.ShortText  ? true:false;
				var qUErrMsg = parseInt(oParm.Quantity) == 0 ? false:true;				
				var sDtErrMsg  = oParm.Begda ? true:false;
				var eDtErrMsg  = oParm.Endda? true:false;
				errMsg = stErrMsg & qUErrMsg & sDtErrMsg & eDtErrMsg;
			}else{
				errMsg = 0
			}
			return errMsg == 0?false:true;
		},
		
		_handleError : function(oError){
			this.getView().setBusy(false);
			try{
				var oJson = JSON.parse( oError.responseText);
				/*MessageBox({
					 type: sap.ca.ui.message.Type.INFO,
					    message:  decodeURIComponent(oJson.error.message.value)
					},null);*/
				MessageBox.error(decodeURIComponent(oJson.error.message.value), {
					title : this.getResourceBundle().getText("Error"),
				});
			} catch(e){
				MessageBox.error(
						decodeURIComponent(oError.response.body), {
							title : this.getResourceBundle().getText("Error"),
						});
			};
		},
		
		onNavBack:function(){
			var sPreviousHash = History.getInstance().getPreviousHash();

			// The history contains a previous
			// entry
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				// There is no history!
				// Naviate to master page
				this.getRouter().navTo("mobileMaster", {},true);
			}
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
		
		onFileUpload:function(oEvent){ debugger;
		
	      var oTable1 = this.getView().byId("id_docMnts");
		  oTable1.setModel(this.lModel);
		  var tablObj = {};
		  var matrnFile = this.getView().byId("matrnFile");
		  var tblFileInputId = matrnFile .getId() +'-fu';
		  var reader = new FileReader();
		  var tblFileInput = $.sap.domById(tblFileInputId);
		  var tblFile = tblFileInput.files[0];
		  tablObj.Docfile = tblFile.name;
		  tablObj.Mimetype = tblFile.type;
		  var base64marker = 'data:' + tblFile.type + ';base64,';
		  var dArr = [];
		  dArr.push(tablObj);
		  this.lModel.setProperty("/lSet1",dArr);
		  
		  // below the jagadish's code for actual implementation
		  
		// tablObj.matrnBudExem =sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getValue();
			// File Upload
//			var tablObj = {};
//			  var fragmentId = this.getView().createId("itemsFragment");
//			  tablObj.PreqItem = (this.lModel.getProperty("/mainSet/navigtoitems").length+1).toString();
//			  tablObj.Serialno = (this.lModel.getProperty("/lSet/navigprtodocs").length+1).toString();
//			  var matrnFile =sap.ui.core.Fragment.byId(fragmentId, "matrnFile");
//			  
//			  var tblFileInputId = matrnFile .getId() +'-fu';
//			  
//			  var reader = new FileReader();
//			  
//			  var tblFileInput = $.sap.domById(tblFileInputId);
//			  
//			  var tblFile = tblFileInput.files[0];
//			  
//			  tablObj.Docfile = tblFile.name;
//			  tablObj.Mimetype = tblFile.type;
//			  var base64marker = 'data:' + tblFile.type + ';base64,';
//			  var dArr = this.lModel.getProperty("/lSet/navigprtodocs");
//			  var that = this;
//			  
//			  reader.onload =
//			  (function(theFile) {
//			  return function(evt) {
//			  var base64Index =evt.target.result.indexOf(base64marker) +base64marker.length; 
//			  var base64 = evt.target.result.substring(base64Index);
//			  tablObj.Filedata = base64.toString(); 
//			  dArr.push(tablObj);
//			  that.lModel.setProperty("/lSet/navigprtodocs",dArr);
//			  matrnFile.clear();
//			  }
//			  
//			  })();
//			  
//			  reader.readAsDataURL(tblFile);
			 
			},
			onFileDelete: function(oEvent){
			 var oTable = this.getView().byId("id_docMnts");
			 oTable.removeItem(oEvent.getParameter('listItem'));
			},
	});
});