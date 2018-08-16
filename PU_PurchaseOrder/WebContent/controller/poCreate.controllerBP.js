sap.ui.define([ "jquery.sap.global", "poApp/controller/BaseController",
		"sap/ui/Device", "poApp/model/formatter",'sap/m/MessageBox'
], function(jQuery, Controller, Device, formatter, MessageBox) {
	"use strict";

	return Controller.extend("poApp.controller.poCreate", {
		formatter : formatter,
		onInit : function() {
			
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			this.getView().byId("idItemTable").setModel(this.lModel, "lModel");
			this.getOwnerComponent().getRouter().getRoute("master")
					.attachPatternMatched(this._onRouteMatched, this);
			// this.getOwnerComponent().getRouter().getRoute("").attachPatternMatched(this._onRouteMatched,this);
		},

		_onRouteMatched : function(oEvent) {
			this.conditionsCurrencyfill();
			var tbData = {
					"lSet" : {"editable":false},
					"mainSet" : {},
					"headerSet" : {},
					
					"dEditable": false,
					"tempDelData":[],
					"PlantSet": {},
					"PRNo": ""
				};
			this.lModel.setData(tbData);
			// this.sPath = "/EBAN_DATASet('"+ this.sId + "')";
			//this.sPath = "/EBAN_DATASet('1000000311')";
			
//			this.getView().setBusy(true);
//			try{
//			this.sId= oEvent.getParameter("arguments").id;
//			}catch(oEr){
//				this.sId  ;	
//				
//			}
//
			//this.prNumber = jQuery.sap.getUriParameters().get("id");
			try{
				this.prNumber = this.getOwnerComponent().getComponentData().startupParameters.id[0];
			}catch(oEr){
				this.prNumber = "1000000226" ;	
			}
					
			//this.prNumber = "1000000226";
			this.lModel.setProperty("/PRNo", this.prNumber);
			this.sPath = "/EBAN_DATASet('"+this.prNumber+"')";
			var oMdl = this.getOwnerComponent().getModel("prm");
			this.getView().setModel(oMdl);
	
			//var prData = new sap.ui.model.json.JSONModel();
			// Read on PR service for getting selected PR details
			oMdl.read(this.sPath, {
				success : function(oData) { 
					// setting results to local model
					this.lModel.setProperty("/mainSet",oData);
					console.log(oData);
					
					//prData.setData(oData);
					var prNo = "PR No.:  " + oData.Banfn;
					//var prNo = oData.Banfn;
					var totalAmount = oData.Ztotalvalue;
					var totCurr = oData.Ztotalcurrency;

					this.getView().byId("idObjh").setTitle(prNo);
					this.getView().byId("idObjh").setNumber(totalAmount);
					//this.getView().byId("idObjh").setNumberUnit(totCurr);
					this.getView().byId("idObjh").setNumberUnit("AED");

					var oTable1 = this.getView().byId("idItemTable");

					oTable1.setModel(this.lModel);
					
					this.conditionfill(); 

					this.getView().setBusy(false);

				}.bind(this),
				error : function(oError) {
					this.getView().setBusy(false);
					var err = new window.DOMParser().parseFromString(
							oError.responseText, "text/xml")

					var sErr = err.getElementsByTagName("message")[0].innerHTML

					MessageBox.error(sErr, {

						title : "Error",
					});

				}.bind(this),
				urlParameters : {
					"$expand" : "navigtoitems"

				}

			});

			//Paymen terms dropdown population
			var Payterms = this.getView().byId("idPayterms"); 
			Payterms.setModel(this.getOwnerComponent().getModel("pom"));
		

			Payterms.bindItems({
						path : "/PAYMENTTERMSSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Vtext}",
									key : "{Zterm}",
									
								})
					});
		
			
			// Read on PO service for setting default 6000 PLant Address
			var PlantData = new sap.ui.model.json.JSONModel();
			var oMdl1 = this.getOwnerComponent().getModel("pom");
			oMdl1.read("/PLANTSSet('6000')", {
				success : function(oData) { 
					PlantData.setData(oData);
					this.lModel.setProperty("/PlantSet",oData);

					var oSelect = this.getView().byId("idPlantSelect");

					oSelect.setModel(PlantData);
					console.log(PlantData);
					var COMPANY = "COMPANY";
					//var plantName = this.lModel.getProperty("/PlantSet").PLANTADD.results[0].Plantname;
					var plantName = this.lModel.getProperty("/PlantSet/PLANTADD/results/0/Plantname");
					var Plantpostal = this.lModel.getProperty("/PlantSet/PLANTADD/results/0/Plantpostal");
					var Plantcountry = this.lModel.getProperty("/PlantSet/PLANTADD/results/0/Plantcountry");
					var Plantregion = this.lModel.getProperty("/PlantSet/PLANTADD/results/0/Plantregion");
					var Plantstreet = this.lModel.getProperty("/PlantSet/PLANTADD/results/0/Plantstreet");
					//var Planttitle = this.lModel.getProperty("/PlantSet/PLANTADD/results/0/Planttitle");
					this.getView().byId("idTitle").setValue("COMPANY");
					this.getView().byId("idName").setValue(plantName);
					this.getView().byId("idStreet").setValue(Plantstreet);
					this.getView().byId("idRegion").setValue(Plantregion);
					this.getView().byId("idPin").setValue(Plantpostal);
					this.getView().byId("idCountry").setValue(Plantcountry);
					


					this.getView().setBusy(false);

				}.bind(this),
				error : function(oError) {
					this.getView().setBusy(false);
					var err = new window.DOMParser().parseFromString(
							oError.responseText, "text/xml")

					var sErr = err.getElementsByTagName("message")[0].innerHTML

					MessageBox.error(sErr, {

						title : "Error",
					});

				}.bind(this),
				urlParameters : {
					"$expand" : "PLANTADD"

				}

			});		
			
			
			
			
			
		
			// Read on PO service for getting PLant List
			var PlantData = new sap.ui.model.json.JSONModel();
			var oMdl1 = this.getOwnerComponent().getModel("pom");
			oMdl1.read("/PLANTSSet", {
				success : function(oData) { 
					PlantData.setData(oData);
					this.lModel.setProperty("/PlantSet",oData);

					var oSelect = this.getView().byId("idPlantSelect");

					oSelect.setModel(PlantData);
					oSelect.setSelectedKey("6000");
					console.log(PlantData);

					this.getView().setBusy(false);

				}.bind(this),
				error : function(oError) { 
					this.getView().setBusy(false);
					var err = new window.DOMParser().parseFromString(
							oError.responseText, "text/xml")

					var sErr = err.getElementsByTagName("message")[0].innerHTML

					MessageBox.error(sErr, {

						title : "Error",
					});

				}.bind(this),
				urlParameters : {
					"$expand" : "PLANTADD"

				}

			});		

		},

		
		// Item Detail Press
		onDetailItemPress : function(oEvent) {
			this.cntxt = oEvent.getSource().getBindingContext();
//			this.cntxt.getObject().PreqPrice ="0.00"
//			this.cntxt .PreqPrice = ""
			
			
			
			if (!this.prItemDetailDialog) {
				this.prItemDetailDialog = sap.ui.xmlfragment(this.createId("itemDetail"),"poApp.view.fragments.PRItemDetail",this); 
				
				// to

				this.getView().addDependent(this.prItemDetailDialog);
				
			}
			// this.prItemDetailDialog.bindElement(cntxt);
			this.prItemDetailDialog.setModel(this.lModel);
			this.prItemDetailDialog.setBindingContext(this.cntxt);
			this.prItemDetailDialog.open();

		},
		
		
		// Items Remove
		onItemRemove : function(oEvent) {

			oEvent.getSource().getParent().close();

			var arr = this.cntxt.getPath().split("/");
			var items = this.lModel.getProperty('/mainSet/navigtoitems/results');
			var pInt = parseInt(arr[arr.length - 1]);
		
			if(items[pInt].PreqItem){
				var tempDelData = this.lModel.getProperty("/tempDelData");
				var poData = $.extend(true, {},items[pInt]);
				var temp = {};
				temp.PreqItem = poData.PreqItem;
				temp.Banfn = poData.Banfn;												
				temp.Kostl = poData.Kostl;
				temp.Glaccount = poData.Glaccount;
				tempDelData.push(temp);
				
		
				this.lModel.setProperty("/tempDelData",tempDelData);
				
				
			}
																								
			items.splice(pInt, 1);
			this.lModel.setProperty('/mainSet/navigtoitems/results',items);
			
			
			this.conditionfill();

			// lstbl.removeItem(parseInt(arr[arr.length-1]));

		},
		
		// Items dialog close
		onPRCItemDialogueClose : function(
				oEvent) {
			var fragmentId = this.getView()
					.createId("itemDetail");
			var matrnBudExem = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnBudExem");
			if (matrnBudExem.getSelected())
				this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'X';
			else
				this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'Y';

			oEvent.getSource().getParent().close();
		},


		// Items Edit and display
		onEditDetailItem : function(oEvent) {

			this.lModel.setProperty(
					"/dEditable", true);

		},
		
		
		onChange : function(oEvent){
		
			var key = oEvent.getParameter("selectedItem").getKey();
			var oSelect = this.getView().byId("idPlantSelect");
			oSelect.setSelectedKey(key);
			
			var path = oEvent.getParameter("selectedItem").getBindingContext().getPath();
			
			var plantName = this.lModel.getProperty("/PlantSet" +path+ "/PLANTADD/results/0/Plantname");
			var Plantpostal = this.lModel.getProperty("/PlantSet" +path+ "/PLANTADD/results/0/Plantpostal");
			var Plantcountry = this.lModel.getProperty("/PlantSet" +path+ "/PLANTADD/results/0/Plantcountry");
			var Plantregion = this.lModel.getProperty("/PlantSet" +path+ "/PLANTADD/results/0/Plantregion");
			var Plantstreet = this.lModel.getProperty("/PlantSet" +path+ "/PLANTADD/results/0/Plantstreet");
			//var Planttitle = this.lModel.getProperty("/PlantSet/PLANTADD" +path+ "/PLANTADD/results/0/Planttitle");
			//this.getView().byId("idTitle").setValue("COMPANY");
			this.getView().byId("idName").setValue(plantName);
			this.getView().byId("idStreet").setValue(Plantstreet);
			this.getView().byId("idRegion").setValue(Plantregion);
			this.getView().byId("idPin").setValue(Plantpostal);
			this.getView().byId("idCountry").setValue(Plantcountry);
			
			this.getView().byId().setValue()
		},
	
		
		onPRItemaddPress : function(oEvent) {

			if (!this.prCommDialog) {
				this.prCommDialog = sap.ui.xmlfragment(this.createId("itemsFragment"),"poApp.view.fragments.PRItemAdd",this);
				this.getView().addDependent(this.prCommDialog);
			}
			this.prCommDialog.open();

		},
		
		onPRCDialogueClose : function(oEvent) {
			this.onItemReset();
			oEvent.getSource().getParent()
					.close();

		},
		
		onItemSave : function(oEvent) {

			var tablObj = {};

			var fragmentId = this.getView().createId("itemsFragment");

			tablObj.Material = sap.ui.core.Fragment
					.byId(fragmentId, "matrnNo")
					.getValue();
			tablObj.ShortText = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnDesc")
					.getValue();
			tablObj.Quantity = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnQuan")
					.getValue();
			if (tablObj.Quantity) {
				tablObj.Quantity = parseFloat(
						tablObj.Quantity)
						.toFixed(3);
			}
			;

			tablObj.Unit = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnUnit")
					.getSelectedKey();
			tablObj.Acctasscat = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnActAsignCat")
					.getSelectedKey();
			tablObj.PreqPrice = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnVal")
					.getValue();
//			tablObj.PreqPrice = "";
			if (tablObj.PreqPrice) {
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(3);
			} else {

				tablObj.PreqPrice = 0.01;
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(3);

			}


			tablObj.Currency = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnCurr")
					.getSelectedKey();
			tablObj.Begda = sap.ui.core.Fragment
					.byId(fragmentId,
							"itmStartDate")
					.getDateValue();
			tablObj.Endda = sap.ui.core.Fragment
					.byId(fragmentId,
							"itmEndDate")
					.getDateValue();
			tablObj.DelivDate = sap.ui.core.Fragment
					.byId(fragmentId,
							"DP1")
					.getDateValue();
			tablObj.Discountvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue();
			if (tablObj.Discountvalue) {
				tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(3);
			} else {

				tablObj.Discountvalue = 0.00;

				tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(3);

			}
			tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue();
			// tablObj.discountvalue =
			// sap.ui.core.Fragment.byId(fragmentId,"matrnDiscType").getValue();
			if (tablObj.Vatvalue) {
				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(3);
			} else {
				tablObj.Vatvalue = 0;
				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(3);
			}
			
			
			tablObj.Tax_Code = sap.ui.core.Fragment.byId(fragmentId, "matrnTaxcode").getSelectedKey();
			tablObj.Kostl = sap.ui.core.Fragment
					.byId(fragmentId, "matrnCC")
					.getSelectedKey();
			
			
			tablObj.Costtext = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText(); 

			tablObj.Glaccont = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnGLCode")
					.getSelectedKey();
			
			// adding plant to item hardcoded to 6000
			tablObj.Plant = "6000";
			tablObj.Excemtion = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnBudExem")
					.getSelected();

			tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
			
			// if (tablObj.Excemtion) {
			tablObj.Excemtion = tablObj.Excemtion ? "X"
					: "Y";

			
			if(this.itemValidation(tablObj)){	
			
			var lTbl = this.lModel
					.getProperty("/mainSet/navigtoitems/results");

			lTbl.push(tablObj);
			this.lModel.setProperty(
					"/mainSet/navigtoitems/results",
					lTbl);

			var dItemBox = sap.ui.core.Fragment
					.byId(fragmentId,
							"idPRCDialog");
			this.onItemReset();
			dItemBox.close()
			}else{
				
				var errText = "Please fill Mandatory fields"
					sap.m.MessageBox.error(errText, {title : "Error"});
			}


			
			this.conditionfill();
			
			
		},
		

		
		conditionfill: function(){
			// Start logic for filling condition tab values 
			 var itemsData = [];
			 itemsData = this.lModel.getProperty('/mainSet/navigtoitems/results');
			 var TotalPreqPrice = 0.00;
			 var TotalVatvalue = 0.00;
			 var TotalDiscountvalue = 0.00;
		
			for (var x = 0, len = itemsData.length; x < len; x++){
				
			TotalPreqPrice = TotalPreqPrice + Number(itemsData[x].PreqPrice);
			TotalVatvalue = TotalVatvalue + Number(itemsData[x].Vatvalue);
			TotalDiscountvalue = TotalDiscountvalue + Number(itemsData[x].Discountvalue);

				
			}
			
			var DiscountedPrice = ((TotalDiscountvalue*TotalPreqPrice)/100);
			var PriceAfterDiscount = TotalPreqPrice - DiscountedPrice;
			var TotalVatValue = ((PriceAfterDiscount*TotalVatvalue)/100);
			var Subtotal = PriceAfterDiscount + TotalVatValue;
			//var Subtotal = PriceAfterDiscount + ((PriceAfterDiscount*TotalVatvalue)/100);
			this.getView().byId("idTotalVal").setValue(TotalPreqPrice.toFixed(3));
			this.getView().byId("idTotalDisc").setValue(DiscountedPrice.toFixed(3));
			this.getView().byId("idSubTot").setValue(Subtotal.toFixed(3));
			this.getView().byId("idTotalVatVal").setValue(TotalVatValue.toFixed(3));
			this.getView().byId("idObjh").setNumber(Subtotal.toFixed(3));
	
			
			// End logic for filling condition tab values 
		},
		
		
		
		
	  onSavePress: function(){
		  this.getView().setBusy(true);
		  var poModel = this.getOwnerComponent().getModel("pom"); 

	 
//		var array = [];
//		for (var x = 0, len = array.length; x < 3; x++) {
//
//			array[x].ClassName = "";
//			array[x].Active = "X";
//			array[x].Variant = newvariant;
//			
//		}

//	 var ActuallitemsData = [];
//	 ActuallitemsData = this.lModel.getProperty('/mainSet/navigtoitems/results');
//	 var itemsData = ActuallitemsData;
//	 
//	 
	 var itemsData = [];
	 itemsData = this.lModel.getProperty('/mainSet/navigtoitems/results');
	
	//var itemsData = JSON.parse(JSON.stringify(itemsData1));
		
		for (var x = 0, len = itemsData.length; x < len; x++) {
			

			 itemsData[x].MatlGroup = "01";
			itemsData[x].PoNumber = "1217TEO152";
			//itemsData[x].PoItem = Number(x*10);
			itemsData[x].PoItem = "000"+((x+1)*10).toString();
		    itemsData[x].Short_Text = itemsData[x].ShortText;
		    delete itemsData[x].ShortText;			
		    itemsData[x].Preq_No = itemsData[x].Banfn;
		    delete itemsData[x].Banfn;
		    itemsData[x].Costcenter = itemsData[x].Kostl;
		    delete itemsData[x].Kostl;
		    itemsData[x].Delvdate = itemsData[x].DelivDate;
		    delete itemsData[x].DelivDate;		    
		    itemsData[x].Discountval = itemsData[x].Discountvalue;
		    delete itemsData[x].Discountvalue;		    
		    itemsData[x].Glaccount = itemsData[x].Glaccont;
		    delete itemsData[x].Glaccont;		    
		    itemsData[x].Preq_Item = itemsData[x].PreqItem;
		    delete itemsData[x].PreqItem;
		    itemsData[x].NetPrice = itemsData[x].PreqPrice;
		    delete itemsData[x].PreqPrice;
		    itemsData[x].Orderunit = itemsData[x].Unit;
		    delete itemsData[x].Unit;
		    
		   
		    
		    //delete itemsData[x].MatlGroup;
		    //delete itemsData[x].Acctasscat;
		    //delete itemsData[x].Assetcode;
		    //delete itemsData[x].Begda;
		    //delete itemsData[x].PriceUnit;
			//delete itemsData[x].Material;
		    //delete itemsData[x].Plant;
		    //delete itemsData[x].Endda;
		    delete itemsData[x].Currency;
		    delete itemsData[x].DesVendor;
		    delete itemsData[x].Doknr;
		    delete itemsData[x].EBAN_DATASet;
		    delete itemsData[x].Ematn;	
		    delete itemsData[x].Excemtion;
		    delete itemsData[x].Gltext;
		    delete itemsData[x].Costtext;
		    //delete itemsData[x].MatlGroup;
		    delete itemsData[x].PeriodIndExpirationDate;		  
		    delete itemsData[x].PreqPrice;
		    delete itemsData[x].PurGroup;
		    delete itemsData[x].PurchOrg;
		    //delete itemsData[x].Quantity;
		    //delete itemsData[x].Requestmat;
		    delete itemsData[x].Requestoth;
		    delete itemsData[x].Requestsrv;
		    delete itemsData[x].StoreLoc;
		    delete itemsData[x].Unit;
		    delete itemsData[x].Mimetype;
		    delete itemsData[x].Filename;
		    //delete itemsData[x].Vatvalue;
		    delete itemsData[x].navigitemstofile;
		    delete itemsData[x].__metadata;
		    delete itemsData[x].__proto__;
		    	
		}
		

	
	 
      var  headerData = {
    		  PoNumber: "1217TEO103",
    		  //Preq_No:this.getView().byId("idObjh").getTitle(),
    		  Preq_No: this.lModel.getProperty("/PRNo").toString(),
    		  QrNo:"",
    		  Vendor:"100015",
    		  Totalamt: this.getView().byId("idTotalVal").getValue(),
    		  //Totcurrency: this.getView().byId("idTotalValCurr").getSelectedItem().getText(),
    		  Totcurrency: "AED",
    		  //Vatvalue:"",
    		  Vatvaluecurr:"AED",
    		  Totdiscount: this.getView().byId("idTotalDisc").getValue(),
    		 // Discountcurr: this.getView().byId("idTotalDiscCurr").getSelectedItem().getText(),
    		  Discountcurr: "AED",
    		  Subtot: this.getView().byId("idSubTot").getValue(),
    		 // Subtotcurr: this.getView().byId("idSubTotCurr").getSelectedItem().getText(),
    		  Subtotcurr: "AED",
    		  Planttitle: this.getView().byId("idTitle").getValue(),
    		  Plantname: this.getView().byId("idName").getValue(),
    		  Plantstreet: this.getView().byId("idStreet").getValue(),
    		  Plantregion: this.getView().byId("idRegion").getValue(),
    		  Plantpostal: this.getView().byId("idPin").getValue(),
    		  Plantcountry: this.getView().byId("idCountry").getValue(),
    		  Splinstruct:this.getView().byId("idSplInstrc").getValue(),
    		  Pmnttrms: this.getView().byId("idPayterms").getSelectedKey(),
    		  Flag: "C",
    		  navtoitem: itemsData
			};
      		console.log(headerData);
      		poModel.create("/POHEADERSet", headerData, { 
      			success : function( oData, response) {
      				
      				
      				
      				console.log(response);
      				var shText =this.getResourceBundle().getText("poCreated") + response.data.PoNumber;
					MessageBox.success(
							shText, {
								
								title : this.getResourceBundle().getText("Success"),
							});
	  
					this.getView().setBusy(false);this._onRouteMatched();
	  
	  }.bind(this), 
	  
	  
	  error : function(oError) { 
		
		  
			var shText = oError.responseText;
			MessageBox.error(
					shText, {
						
						title : this.getResourceBundle().getText("Error"),
					});
		  
			this._onRouteMatched();this.getView().setBusy(false);
	  
	  }.bind(this)
	  
	  });
	  
	  
	  
	  },
	  

	});

}, /* bExport= */true);