sap.ui.define( [
		"jquery.sap.global",
		"poSettleApp/controller/BaseController", 
		"sap/ui/Device",
		"poSettleApp/model/formatter" ,
		'sap/m/MessageBox'
		
	], function (jQuery, Controller, Device, formatter, MessageBox) {
	"use strict";

	return Controller.extend("poSettleApp.controller.poSettle", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf z_pr.app
*/
	onInit: function() {
		
//		if (!jQuery.support.touch) {
//			this.getView().addStyleClass(
//					"sapUiSizeCompact");
//		}
		
		this.lModelNav = new sap.ui.model.json.JSONModel();
		this.getOwnerComponent().setModel(this.lModelNav, "lModelNav");
		var tbDataNav = {
				
				"checkvisible" : false,
				"oEvent1" : {}
				
				

			};

			this.lModelNav.setData(tbDataNav);
		this.lModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(this.lModel, "lModel");
		this.getOwnerComponent().getRouter().getRoute("PO").attachPatternMatched(this._onRouteMatched,this);

	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf z_pr.app
*/
//	onBeforeRendering: function() {
//
//	},
	
	
	_onRouteMatched:function(oEvent){
		
		
		this.getView().byId("idbtnSave").setVisible(false);
		this.getOwnerComponent().getModel("lModelNav").setProperty("/checkvisible", false);
		this.getView().byId("idbtnCV").setVisible(true);
		
		this.getView().setBusy(true);
		this.getView().byId("DP1").setDateValue(new Date());
		try{
		this.sId= oEvent.getParameter("arguments").id;
		}catch(oEr){
			this.sId  ;	
			
		}
		var tbData = {
	
				"mainSet" : {},
				"mainSet1" : {},
				

			};

			this.lModel.setData(tbData);
		
		this.sPath = "/POHEADSETTLESet('"+ this.sId + "')";
		
		var oMdl = this.getOwnerComponent().getModel("pom");
		oMdl.read(
						this.sPath,
						{
							success : function(oData) { debugger;
								
							
					
							var oData2 =  jQuery.extend(true, {}, oData);
								this.lModel.setProperty("/mainSet",oData);
								this.lModel.setProperty("/mainSet1",oData2);
								var splApprls = [
											 		{
										 				"Approvalid": "APP01",
										 				"Reason": "",
										 				"Banfn": "",
										 				"Boolean": false
										 			}, {
										 				"Approvalid": "APP02",
										 				"Reason": "",
										 				"Banfn": "",
										 				"Boolean": false
										 			}, {
										 				"Approvalid": "APP03",
										 				"Reason": "",
										 				"Banfn": "",
										 				"Boolean": false
										 			}, {
										 				"Approvalid": "APP04",
										 				"Reason": "",
										 				"Banfn": "",
										 				"Boolean": false
										 			}, {
										 				"Approvalid": "APP05",
										 				"Reason": "",
										 				"Banfn": "",
										 				"Boolean": false
										 			},
										 			{
										 				"Approvalid": "APP06",
										 				"Reason": "",
										 				"Banfn": "",
										 				"Boolean": false
										 			},
										 			{
										 				"Approvalid": "APP07",
										 				"Reason": "",
										 				"Banfn": "",
										 				"Boolean": false
										 			}
										 		];
								this.lModel.setProperty("/lSet",splApprls);								
								this.getView().setModel(this.lModel, "lModel");
								this.getView().byId("idItemTable").setModel(this.lModel);
								this.getView().byId("idItemTable1").setModel(this.lModel);
								this.conditionfill();
								
								//this.sId = this.lModel.getProperty("/mainSet/PoNumber");
								
								
								
								this.getView().setBusy(false);

							}.bind(this),
							error : function(oError) { debugger;
								this.getView().setBusy(false);
								var err = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
								
								var sErr = err.getElementsByTagName("message")[0].innerHTML
								
								
								MessageBox.error(
										sErr, {
											
											title : "Error",
										});
								

							
								
								
							}.bind(this),
							urlParameters : {
								"$expand" : "navtoposettleitem"

							}

						});


		
		
		

},




conditionfill: function(){
	
	
	debugger;
	// Start logic for filling  values 
	 var itemsData = [];
	 itemsData = this.lModel.getProperty('/mainSet/navtoposettleitem/results');

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
		


	this.getView().byId("idOCV1").setValue(Subtotal1.toFixed(3));
	// End logic for filling values 
},



onRAmendContract_can:function(oEvent){debugger;
	var oSwitch  = oEvent.getSource();
	var vState = oSwitch.getSelected();
	var rPanel = this.getView().byId('id_RAContract_can');

	if(vState){
		rPanel.setExpanded(true);
		this.getView().byId("idbtnCV").setVisible(true);
		
		
		
	}
	else{
	rPanel.setExpanded(false);
	this.getView().byId("idbtnCV").setVisible(false);

	}
	
	
	
},



// on press of PDF save button
onPDFSavePress: function(oEvent){ debugger;

//  /sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='AC',appno='0118TEO207',lang='E',ndavalue='')/$value
var lang="";
var lang = sap.ui.getCore().getConfiguration().getLanguage();
//if(oEvent.getParameters("id").id == "__xmlview3--idbtnArabic"){
//	lang = "A"
//} else {lang = "E"}
//
var first = "apptype='SC'";
var second = "appno='" + this.sId +  "'";
//var third = "lang='"+lang+"'";
var third = "lang=''";
var Path = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(" +first+ "," +second+ "," +third+ ",ndavalue='')/$value";		
window.open(Path,true);

},


onCheckValues: function(){
	
	

	var itemsData = [];
	 itemsData = this.lModel.getProperty('/mainSet1/navtoposettleitem/results');
	debugger;
	this.getView().setBusy(true);

			 var poModel = this.getOwnerComponent().getModel("pom"); 

			 var  headerData = {
		    		  PoNumber: this.lModel.getProperty('/mainSet/PoNumber'),
		    		  CreatDate: this.getView().byId("DP1").getDateValue(),
		    		  Vendor: this.lModel.getProperty('/mainSet/Vendor'),
		    		  Totalamt: this.lModel.getProperty('/mainSet/Totalamt'),
		    		  VendorName: this.lModel.getProperty('/mainSet/VendorName'),
		    		  Requestprice: this.lModel.getProperty('/mainSet/Requestprice'),
		    		  Paymentvalue:this.lModel.getProperty('/mainSet/Paymentvalue'),
		    		  Dueamt: this.lModel.getProperty('/mainSet/Dueamt'),
		    		  Supplementval: this.lModel.getProperty('/mainSet/Supplementval'),
		    		
		    		  Flag: "K",
		    		  navtoposettleitem: itemsData
					};
			  console.log(headerData);
			  poModel.create("/POHEADSETTLESet", headerData, { 
				  success : function( oData, response)
			  {debugger;
			  console.log(response);
			  
			  
			  this.getView().byId("idOCV").setValue(oData.Totalamt);
			  this.getView().byId("idOPV").setValue(oData.Paymentvalue);
			  this.getView().byId("idOAD").setValue(oData.Dueamt);
			  				  
			  if(response.statusText == "Created"){
				  
					var shText = this.getResourceBundle().getText("ValUPdPLschk");
					MessageBox.success(
							shText, {
								
								title : this.getResourceBundle().getText("Success"),
							});
			  }
			  
			  this.getView().setBusy(false);
				this.getView().byId("idbtnSave").setVisible(true);
				this.getOwnerComponent().getModel("lModelNav").setProperty("/checkvisible", true);
				this.getView().byId("idbtnCV").setVisible(false);
				
			  
			  }.bind(this), 
			  
			  
			  error : function(oError) {
			  
			  debugger;
			  
				var shText = oError.responseText;
				MessageBox.error(
						shText, {
							
							title : this.getResourceBundle().getText("Error"),
						});
			  
			  this.getView().setBusy(false);
			  
			  }.bind(this)
			  
			  });
	
	
	
	
	
	
},


onPOSettle: function(){
	
	

	
	
	var itemsData = [];
	 itemsData = this.lModel.getProperty('/mainSet1/navtoposettleitem/results');
	debugger;
	this.getView().setBusy(true); 
			 var poModel = this.getOwnerComponent().getModel("pom"); 

			 var  headerData = {
		    		  PoNumber: this.lModel.getProperty('/mainSet/PoNumber'),
		    		  CreatDate: this.getView().byId("DP1").getDateValue(),
		    		  Vendor: this.lModel.getProperty('/mainSet/Vendor'),
		    		  Totalamt: this.lModel.getProperty('/mainSet/Totalamt'),
		    		  VendorName: this.lModel.getProperty('/mainSet/VendorName'),
		    		  Requestprice: this.lModel.getProperty('/mainSet/Requestprice'),
		    		  Paymentvalue:this.lModel.getProperty('/mainSet/Paymentvalue'),
		    		  Dueamt: this.lModel.getProperty('/mainSet/Dueamt'),
		    		  Supplementval: this.lModel.getProperty('/mainSet/Supplementval'),
		    		  //Justification: this.getView().byId("idJ4Stlmnt").getValue(),
		    		
		    		  Flag: "S",
		    		  navtoposettleitem: itemsData
					};
			  console.log(headerData);
			  poModel.create("/POHEADSETTLESet", headerData, { 
				  success : function( oData, response)
			  {debugger;
			  console.log(response);
			  
			  
			  this.getView().byId("idOCV").setValue(oData.Totalamt);
			  this.getView().byId("idOPV").setValue(oData.Paymentvalue);
			  this.getView().byId("idOAD").setValue(oData.Dueamt);
			  				  
			  if(response.statusText == "Created"){
				  
					var shText = this.getResourceBundle().getText("R4POSetisSucess");
					MessageBox.success(
							shText, {
								
								title : this.getResourceBundle().getText("Success"),
							});
			  }
			  
			  
			  
			  this.getView().byId("idOCV").setValue("");
			  this.getView().byId("idOPV").setValue("");
			  this.getView().byId("idOAD").setValue("");
			  this.getView().byId("idJ4Stlmnt").setValue("");
	
			  
			  this.getView().setBusy(false);
				this.getView().byId("idbtnSave").setVisible(false);
				this.getOwnerComponent().getModel("lModelNav").setProperty("/checkvisible", false);
				this.getView().byId("idbtnCV").setVisible(true);
			
			  
			  }.bind(this), 
			  
			  
			  error : function(oError) {
			  
			  debugger;
			  
				var shText = oError.responseText;
				MessageBox.error(
						shText, {
							
							title : this.getResourceBundle().getText("Error"),
						});
			  
			  this.getView().setBusy(false);
			  
			  }.bind(this)
			  
			  });
	
	
	
	
	
	
	
	
	
},


getResourceBundle: function () {
	return this.getOwnerComponent().getModel("i18n").getResourceBundle();
},

confirmDialog: function(oEvent) {
	
	if (!this.apprDialog) {
		this.apprDialog = new sap.m.Dialog({
					title : this.getResourceBundle().getText("Confirm"),
					type : 'Message',
					draggable : true,
					content : new sap.m.Text({
								text : this.getResourceBundle().getText("AreYou") + " : " + this.sId
							}),
					beginButton : new sap.m.Button({
						text : this.getResourceBundle().getText("Yes") ,
						type : "Accept",
						press : function() {
//sap.m.MessageToast.show("Submitted");
							this.apprDialog.close();
							this.onPOSettle(oEvent);
						}.bind(this)
					}),
					endButton : new sap.m.Button({
						text : this.getResourceBundle().getText("No"),
						type : "Reject",
						press : function() {
							this.apprDialog.close();
						}.bind(this)
					})
				});

		// to get access to the global model
		this.getView().addDependent(this.apprDialog);
	}

	this.apprDialog.open();
	
	
},


checkValidation: function(){			
	if(this.getView().byId("idJ4Stlmnt").getValue() === ""){
		this.getView().byId("idJ4Stlmnt").setValueState("Error");
		var shText = this.getResourceBundle().getText("PEJ4S");
		MessageBox.error(
				shText, {
					
					title : this.getResourceBundle().getText("Error"),
				});
	  
		
	}else{ this.getView().byId("idJ4Stlmnt").setValueState("None");this.confirmDialog();}
		

},












/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf z_pr.app
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf z_pr.app
*/
//	onExit: function() {
//
//	}

});
	
})