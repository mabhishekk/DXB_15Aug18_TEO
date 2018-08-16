sap.ui.define(
	["sap/ui/core/mvc/Controller",'sap/m/MessageBox',
		'sap/m/MessageToast',"sap/ui/core/routing/History"],
	function (Controller, MessageBox, MessageToast,History) {
	"use strict";

	return Controller.extend("poAmendApp.controller.BaseController", {
		

		conditionfill: function(){
			
			

			
			// Start logic for filling  values 
			 var itemsData = [];
			 itemsData = this.lModel1.getProperty('/mainSet2/navtopoamenditem/results');

			 var Subtotal1 = 0.00;
			 var OCV = 0.00;
			 var CCV = 0.00;
			 var DCV = 0.00;
		
			for (var x = 0, len = itemsData.length; x < len; x++){
			
				 var TotalPreqPrice = 0.00;
				 var TotalVatvalue = 0.00;
				 var TotalDiscountvalue = 0.00;
				 var DiscountedPrice = 0.00;
				 var PriceAfterDiscount = 0.00;
				 var TotalVatValue = 0.00;
				 var Subtotal = 0.00;
			

				TotalPreqPrice = Number(itemsData[x].NetPrice) * Number(itemsData[x].Quantity);
				DiscountedPrice = ((Number(itemsData[x].Discountval)*TotalPreqPrice)/100);
				PriceAfterDiscount = TotalPreqPrice - DiscountedPrice;
				TotalVatValue = ((PriceAfterDiscount*Number(itemsData[x].Vatvalue))/100);
				Subtotal = PriceAfterDiscount + TotalVatValue;
				Subtotal1 = Subtotal1 + Subtotal;
				

				
			}

			this.getView().byId("idTotAmt1").setValue(Subtotal1.toFixed(3));
			OCV = this.getView().byId("idTotAmt").getValue();
			CCV = Subtotal.toFixed(3);
			DCV = CCV-OCV;
				if(DCV > 0 )
				{
					this.getView().byId("idVOI").setValue(Math.abs(DCV.toFixed(3)));
					this.getView().byId("idVOD").setValue("0.000");
				}else{
					
					this.getView().byId("idVOD").setValue(Math.abs(DCV.toFixed(3)));
					this.getView().byId("idVOI").setValue("0.000");
				}
			
				var shText = this.getResourceBundle().getText("ValUPdPLschk");
				MessageBox.success(
						shText, {
							
							title : this.getResourceBundle().getText("Success"),
						});
				
				
			// End logic for filling  values 
		},
			
		conditionfill1: function(){
			
			
			
			// Start logic for filling  values 
			 var itemsData = [];
			 itemsData = this.lModel.getProperty('/mainSet/navtopoamenditem/results');

			 
			 
			 var Subtotal1 = 0.00;
			for (var x = 0, len = itemsData.length; x < len; x++){
			
				
				
				 var TotalPreqPrice = 0.00;
				 var TotalVatvalue = 0.00;
				 var TotalDiscountvalue = 0.00;
				 var DiscountedPrice = 0.00;
				 var PriceAfterDiscount = 0.00;
				 var TotalVatValue = 0.00;
				 var Subtotal = 0.00;
			

				TotalPreqPrice = Number(itemsData[x].NetPrice) * Number(itemsData[x].Quantity);
				DiscountedPrice = ((Number(itemsData[x].Discountval)*TotalPreqPrice)/100);
				PriceAfterDiscount = TotalPreqPrice - DiscountedPrice;
				TotalVatValue = ((PriceAfterDiscount*Number(itemsData[x].Vatvalue))/100);
				Subtotal = PriceAfterDiscount + TotalVatValue;
				Subtotal1 = Subtotal1 + Subtotal;
				
				

					
				}
				

			this.getView().byId("idTotAmt").setValue(Subtotal1.toFixed(3));  
			// End logic for filling condition tab values 
		},
		
		
		conditionfill2: function(){
			
			 var itemsData = [];
			 var Subtotal1 = 0.00;
			 var OCV = 0.00;
			 var CCV = 0.00;
			 var DCV = 0.00;


			if(this.getView().byId("idsw2").getSelected())
			{
				
				 itemsData = this.lModel1.getProperty('/mainSet2/navtopoamenditem/results');
				 console.log(itemsData);
			}else{				
				
					itemsData = this.lModel.getProperty('/mainSet/navtopoamenditem/results');
				  }
			
			
			if(this.getView().byId("idsw3").getSelected())
			{
			
				var addiItems = this.lModel.getProperty('/mainSet1');
				
				if(jQuery.isEmptyObject( addiItems )){}
					else{
						for (var x = 0, len = addiItems.length; x < len; x++)
					{ 	
					
								itemsData.push(addiItems[x]);
					}
						}

				
			}
			
			

			for (var x = 0, len = itemsData.length; x < len; x++){
			
				 var TotalPreqPrice = 0.00;
				 var TotalVatvalue = 0.00;
				 var TotalDiscountvalue = 0.00;
				 var DiscountedPrice = 0.00;
				 var PriceAfterDiscount = 0.00;
				 var TotalVatValue = 0.00;
				 var Subtotal = 0.00;
			

				TotalPreqPrice = Number(itemsData[x].NetPrice) * Number(itemsData[x].Quantity);
				DiscountedPrice = ((Number(itemsData[x].Discountval)*TotalPreqPrice)/100);
				PriceAfterDiscount = TotalPreqPrice - DiscountedPrice;
				TotalVatValue = ((PriceAfterDiscount*Number(itemsData[x].Vatvalue))/100);
				Subtotal = PriceAfterDiscount + TotalVatValue;
				Subtotal1 = Subtotal1 + Subtotal;
				

					
				}
				


				this.getView().byId("idTotAmt1").setValue(Subtotal1.toFixed(3));
			OCV = this.getView().byId("idTotAmt").getValue();
			CCV = Subtotal1.toFixed(3);
			DCV = CCV-OCV;
				if(DCV > 0 )
				{
					this.getView().byId("idVOI").setValue(Math.abs(DCV.toFixed(3)));
					this.getView().byId("idVOD").setValue("0.000");
				}else{
					
					this.getView().byId("idVOD").setValue(Math.abs(DCV.toFixed(3)));
					this.getView().byId("idVOI").setValue("0.000");
				}
			
			
			
			
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
//			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
			
		},
		
		onSelectService:function(oEvent){
			
			try{
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			}
			catch(oEr){var fragmentId = this.getView().createId("itemsFragment");}
			
			
//			var fragmentId = this.getView().createId("itemsFragment");
			var SerText = this.getResourceBundle().getText("ServiceDesc")
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText(SerText);
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
//			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
			
			
		},
		
		onNavBack:function(){
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// Naviate to master page
				this.getOwnerComponent().getRouter().navTo("mobileMaster", {},true);
			}
			
			
		},
		
		
		
		
	});
});