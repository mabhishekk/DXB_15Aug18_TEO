sap.ui.define( [
		"jquery.sap.global",
		"poAmendApp/controller/BaseController", 
		"sap/ui/Device",
		"poAmendApp/model/formatter" ,
		'sap/m/MessageBox'
  ], function (jQuery, Controller, Device, formatter, MessageBox) {
	"use strict";
	return Controller.extend("poAmendApp.controller.poAmend", {

		onInit: function() {
			this.lModel = new sap.ui.model.json.JSONModel();
			this.lModel1 = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			this.getOwnerComponent().getRouter().getRoute("PO").attachPatternMatched(this._onRouteMatched,this);
		},

	//	onBeforeRendering: function() {
	//
	//	},
	
	_onRouteMatched:function(oEvent){
		this.getView().setBusy(true);
		this.getView().byId("idVOD").setValue("");
		this.getView().byId("idVOI").setValue("");
		this.getView().byId("idTotAmt1").setValue("");
		this.getView().byId("idJ4AD").setValue("");
		this.getView().byId("idItemTable4").setVisible(false);
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
		
		var tbData1 = {
				"mainSet2" : {},
		};

		this.lModel.setData(tbData);
		this.lModel1.setData(tbData1);
		this.sPath = "/POHEADAMENDSet('"+ this.sId + "')";
		var oMdl = this.getOwnerComponent().getModel("pom");
		oMdl.read(this.sPath,{
			success : function(oData) { 
				var oData1 =  jQuery.extend(true, {}, oData);
				this.lModel.setProperty("/mainSet",oData1);
				this.byId("id_splAprl").setModel(this.lModel);
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
				var oData2 =  jQuery.extend(true, {}, oData);
				this.lModel1.setProperty("/mainSet2",oData2);
				console.log(this.lModel.getProperty("/mainSet"));
				this.getView().byId("idTotAmt").setValue(this.lModel.getProperty("/mainSet/Totalamt"));
				var oTable1 = this.getView().byId("idItemTable");
				oTable1.setModel(this.lModel);
				this.getView().byId("idItemTable1").setModel(this.lModel1);
				this.getView().byId("idItemTable3").setModel(this.lModel);
				this.getView().byId("idItemTable4").setModel(this.lModel);
				this.getView().setBusy(false);
				this.conditionfill1();
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
				"$expand" : "navtopoamenditem"
			}
		});
	},


/*onIncreasePress :function(oEvent){ debugger;
	
	var oSwitch  = oEvent.getSource();
	var vState = oSwitch.getState();
	//var rPanel = this.getView().byId('id_increase');
	//var rPanel = this.getView().byId('idItemTable1');
	

//	if(vState){
//		rPanel.setExpanded(true);
//		
//		
//	}
//	else{
//	rPanel.setExpanded(false);
//	}
//	
	
	if(vState){
		this.getView().byId('idItemTable1').setVisible(true);
		
		
	}
	else{
		this.getView().byId('idItemTable1').setVisible(false);
	}
	
	
},*/

	onDecreasePress:function(oEvent){
		var oSwitch  = oEvent.getSource();
		var vState = oSwitch.getState();
		var rPanel = this.getView().byId('id_decrease');
		if(vState){
			rPanel.setExpanded(true);
		}
		else{
		rPanel.setExpanded(false);
		}
	},
	onRAmendContract:function(oEvent){ 
		var oSwitch  = oEvent.getSource();
		var vState = oSwitch.getSelected();
		if(vState){
			this.getView().byId('idItemTable1').setVisible(true);
			this.getView().byId('idbtnCV').setVisible(true);
		}
		else{
		this.getView().byId('idItemTable1').setVisible(false);
		this.getView().byId('idbtnCV').setVisible(false);
		}
	},

	onRAmendService:function(oEvent){
		var oSwitch  = oEvent.getSource();
		var vState = oSwitch.getSelected();
		var rPanel = this.getView().byId('id_RAService');
		if(vState){
			this.getView().byId('idItemTable3').setVisible(true);
		}
		else{
		this.getView().byId('idItemTable3').setVisible(false);
		}
	},

	onOContract:function(oEvent){
		var oSwitch  = oEvent.getSource();
		//var vState = oSwitch.getState();
		var vState = oSwitch.getSelected();
		var rPanel = this.getView().byId('id_oContract');
		if(vState){
			rPanel.setExpanded(true);
			this.getView().byId('idbtnsave').setVisible(true);
		}
		else{
			rPanel.setExpanded(false);
			this.getView().byId('idbtnsave').setVisible(false);
		}
	},

// on press of PO Item ADD
	onPOItemaddPress : function(oEvent) {
		if (!this.prCommDialog) {
			this.prCommDialog = sap.ui.xmlfragment(this.createId("itemsFragment"),"poAmendApp.view.fragments.POItemAdd",this);
			this.getView().addDependent(this.prCommDialog);
		}
		this.prCommDialog.open();
	},

// on open of PO edit fragment
	onOpenDialItem : function(oEvent) {
		var fragmentId = this.getView().createId("itemsFragment");
		this.onSelectService();
		var NVCurr = sap.ui.core.Fragment.byId(fragmentId, "matrnNVCurr");
		NVCurr.setModel(this.getOwnerComponent().getModel("prm"));
		NVCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});
		var valCurr = sap.ui.core.Fragment.byId(fragmentId,	"matrnCurr");
		valCurr.setModel(this.getOwnerComponent().getModel("prm"));
		valCurr.bindItems({
					path : "/currencySet",
					template : new sap.ui.core.ListItem({
								text : "{Waers}",
								key : "{Waers}",
								additionalText : "{Landx50}"
							})
				});
	
		var matrnUnit = sap.ui.core.Fragment.byId(fragmentId, "matrnUnit");
		matrnUnit.setModel(this.getOwnerComponent().getModel("prm"));
		matrnUnit.bindItems({
					path : "/unitsSet",
					template : new sap.ui.core.ListItem({
								text : "{Msehl}",
								key : "{Msehi}"
							})
		});
		// Account Assignment Catogery
		var matrnActAsignCat = sap.ui.core.Fragment.byId(fragmentId, "matrnActAsignCat");
		matrnActAsignCat.setModel(this.getOwnerComponent().getModel("prm"));
		matrnActAsignCat.bindItems({
					path : "/ACCATEGORYSet",
					template : new sap.ui.core.ListItem({
								text : "{Knttx}",
								key : "{Knttp}"
							})
		});
		// tax code
		var matrnTaxCode = sap.ui.core.Fragment.byId(fragmentId, "matrnTaxcode");
		matrnTaxCode.setModel(this.getOwnerComponent().getModel("pom"));
		matrnTaxCode.bindItems({
					path : "/TAXCODESSet",
					template : new sap.ui.core.ListItem({
								text : "{Text1}",
								key : "{Mwskz}"
							})
		});
	//cost center
		var matrnCC = sap.ui.core.Fragment.byId(fragmentId, "matrnCC");
		matrnCC.setModel(this.getOwnerComponent().getModel("prm"));
		matrnCC.bindItems({
			path : "/costcentrelistSet",
			template : new sap.ui.core.ListItem({
						text : "{Ltext}",
						key : "{Kostl}"
					})
		});
	
		var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId,	"matrnGLCode");
		matrnGLCode.setModel(this.getOwnerComponent().getModel("pom"));
		matrnGLCode.bindItems({
			path : "/GLACCOUNTSSet",
			template : new sap.ui.core.ListItem(
					{
						text : "{Txt20}",
						key : "{Saknr}"

					})
		});
		oEvent.getSource().setBusy(false);
	},

//on before opening poedit fragment
	onBefDialOpen:function(oEvent){
		oEvent.getSource().setBusy(true);
	},

// on press of save button in poedit fragment
	onPOItemSave : function(oEvent) {
		var tablObj = {};
		var fragmentId = this.getView().createId("itemsFragment");
		tablObj.Material = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
		tablObj.ShortText = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
		tablObj.Quantity = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
		if (tablObj.Quantity) {
			tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);
		};
		tablObj.Orderunit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit").getSelectedKey();
		tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat").getSelectedKey();
		tablObj.NetPrice = sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue();
//		tablObj.PreqPrice = "";
		if (tablObj.NetPrice) {
			tablObj.NetPrice = parseFloat(tablObj.NetPrice).toFixed(2);
		} else {
			tablObj.NetPrice = 0.01;
			tablObj.NetPrice = parseFloat(tablObj.NetPrice).toFixed(2);

		}
		tablObj.Begda = sap.ui.core.Fragment.byId(fragmentId,"itmStartDate").getDateValue();
		tablObj.Endda = sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").getDateValue();
		tablObj.Delvdate = sap.ui.core.Fragment.byId(fragmentId,"DP1").getDateValue();
		tablObj.Discountval = sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue();
		if (tablObj.Discountval) {
			tablObj.Discountval = parseFloat(tablObj.Discountval).toFixed(2);
		} else {
			tablObj.Discountval = 0.00;
			tablObj.Discountval = parseFloat(tablObj.Discountval).toFixed(2);
		}
		tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue();
		if (tablObj.Vatvalue) {
			tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
		} else {
			tablObj.Vatvalue = 0;
			tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
		}
		tablObj.Costcenter = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedKey();
		tablObj.CCDesc = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText(); 
		tablObj.Reqforaddser = true;
		tablObj.TaxCode = sap.ui.core.Fragment.byId(fragmentId,	"matrnTaxcode").getSelectedKey();
		tablObj.Glaccount = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode").getSelectedKey();
		tablObj.Excemtion = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getSelected();
		tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
		// if (tablObj.Excemtion) {
		tablObj.Excemtion = tablObj.Excemtion ? "X"	: "Y";
		if(this.POitemValidation(tablObj)){	
			var lTbl = this.lModel.getProperty("/mainSet1");
			try{
				lTbl.push(tablObj);
				}catch(oEr){
					var lTbl =[] ;	
					lTbl.push(tablObj);
				}
			this.lModel.setProperty("/mainSet1", lTbl);
			var dItemBox = sap.ui.core.Fragment.byId(fragmentId,"idPRCDialog");
			this.onItemReset();
			dItemBox.close()
		}else{
			var errText = this.getResourceBundle().getText("PEAMF");
			sap.m.MessageBox.error(errText, {title : this.getResourceBundle().getText("Error")});
		}
		this.conditionfill2();
		this.getView().byId("idItemTable4").setVisible(true);
	},

// Po item validation on save press in Po edit fragment
	POitemValidation:function(oParm){ 
		var errMsg = "";
		if(oParm.Requestmat == "1")
		{		
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
	},

// on press of PO edit dialog close
	onPRCDialogueClose : function(oEvent) {
		this.onItemReset();
		oEvent.getSource().getParent().close();
	},



//// calculation for net price
//conditionfill: function(){
//	
//	
//	debugger;
//	// Start logic for filling condition tab values 
//	 var itemsData = [];
//	 itemsData = this.lModel.getProperty('/mainSet/navtopoamenditem/results');
//	 var TotalPreqPrice = 0.00;
//	 var TotalVatvalue = 0.00;
//	 var TotalDiscountvalue = 0.00;
//
//	for (var x = 0, len = itemsData.length; x < len; x++){
//		
//	TotalPreqPrice = TotalPreqPrice + Number(itemsData[x].NetPrice);
//	TotalVatvalue = TotalVatvalue + Number(itemsData[x].Vatvalue);
//	TotalDiscountvalue = TotalDiscountvalue + Number(itemsData[x].Discountval);
//
//		
//	}
//	
//	var DiscountedPrice = ((TotalDiscountvalue*TotalPreqPrice)/100);
//	var PriceAfterDiscount = TotalPreqPrice - DiscountedPrice;
//	var TotalVatValue = ((PriceAfterDiscount*TotalVatvalue)/100);
//	var Subtotal = PriceAfterDiscount + TotalVatValue;
//	//var Subtotal = PriceAfterDiscount + ((PriceAfterDiscount*TotalVatvalue)/100);
//	this.getView().byId("idTotalVal").setValue(TotalPreqPrice.toFixed(3));
//	this.getView().byId("idTotalDisc").setValue(DiscountedPrice.toFixed(3));
//	this.getView().byId("idSubTot").setValue(Subtotal.toFixed(3));
//	this.getView().byId("idTotalVatVal").setValue(TotalVatValue.toFixed(3));
//	this.getView().byId("idObjh").setNumber(Subtotal.toFixed(3));
//
//	
//	// End logic for filling condition tab values 
//},


// on PO Amend press
	onPOAmendPress: function(){
		var itemsData = [];
		var itemsData1 = [];
			if(this.getView().byId("idsw2").getSelected()){
			 itemsData = this.lModel1.getProperty('/mainSet2/navtopoamenditem/results');
			 itemsData1 = this.lModel.getProperty('/mainSet/navtopoamenditem/results');
				for (var x = 0, len = itemsData.length; x < len; x++){
					delete itemsData[x].POHEADAMEND;
					delete itemsData[x].__metadata;
					delete itemsData[x].__proto__;
					delete itemsData[x].Currency;
					delete itemsData[x].Excemtion;
					itemsData[x].Plant = "6000";
					itemsData[x].MatlGroup = "01";
					if(itemsData[x].Delvdate == null){itemsData[x].Delvdate = new Date()}
					itemsData[x].PoNumber = this.lModel.getProperty('/mainSet/PoNumber');
					itemsData[x].PoItem = "000"+((x+1)*10).toString();
					if( JSON.stringify(itemsData[x]) === JSON.stringify(itemsData1[x]) ){
				    	itemsData[x].Durreqforext = false;
					}else{
						itemsData[x].Durreqforext = true;
					}
				}
		}else{
			itemsData = this.lModel.getProperty('/mainSet/navtopoamenditem/results');
			for (var x = 0, len = itemsData.length; x < len; x++){
				delete itemsData[x].POHEADAMEND;
				delete itemsData[x].__metadata;
				delete itemsData[x].__proto__;
				delete itemsData[x].Currency;
				delete itemsData[x].Excemtion;
				itemsData[x].Plant = "6000";
				itemsData[x].MatlGroup = "01";
				if(itemsData[x].Delvdate == null){itemsData[x].Delvdate = new Date()}
				itemsData[x].PoNumber = this.lModel.getProperty('/mainSet/PoNumber');
				itemsData[x].PoItem = "000"+((x+1)*10).toString();
				}
		}
		this.getView().setBusy(true); 
		var poModel = this.getOwnerComponent().getModel("pom"); 
	
		var  headerData = {
			PoNumber: this.lModel.getProperty('/mainSet/PoNumber'),
			CreatDate: this.getView().byId("DP1").getDateValue(),
			Vendor: this.lModel.getProperty('/mainSet/Vendor'),
			Totalamt: this.lModel.getProperty('/mainSet/Totalamt'),
			VendorName: this.lModel.getProperty('/mainSet/VendorName'),
			Requestprice: this.lModel.getProperty('/mainSet/Requestprice'),
			Valueofincrease:this.lModel.getProperty('/mainSet/Valueofincrease'),
			Valueofreduce: this.lModel.getProperty('/mainSet/Valueofreduce'),
			//Justification: this.getView().byId("idJ4AD").getValue(),
			Flag: "A",
			navtopoamenditem: itemsData
		};
		  console.log(headerData);
		  poModel.create("/POHEADAMENDSet", headerData, { 
			  success : function( oData, response){
				  console.log(response);
				  if(response.statusText == "Created"){
						var shText = "PO : " +response.data.PoNumber + " - " +this.getResourceBundle().getText("poAmend");
						MessageBox.success(shText, {
									title : this.getResourceBundle().getText("Success"),
						});
				  }
				  this._onRouteMatched();
				  this.getView().setBusy(false);
			  }.bind(this), 
			  error : function(oError) {
				  var shText = oError.responseText;
				  MessageBox.error(shText, {
						title : this.getResourceBundle().getText("Error"),
					});
				  this._onRouteMatched();
				  this.getView().setBusy(false);
			  }.bind(this)
		  });
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		// on press of PDF save button
		onPDFSavePress: function(oEvent){ 
			var lang="";
			var lang = sap.ui.getCore().getConfiguration().getLanguage();
			var first = "apptype='AC'";
			var second = "appno='" + this.sId +  "'";
			var third = "lang=''";
			var Path = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(" +first+ "," +second+ "," +third+ ",ndavalue='')/$value";		
			window.open(Path,true);
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
//				sap.m.MessageToast.show("Submitted");
											this.apprDialog.close();
											this.onPOAmendPress(oEvent);
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
		if(this.getView().byId("idJ4AD").getValue() === ""){
			this.getView().byId("idJ4AD").setValueState("Error");
			var shText = this.getResourceBundle().getText("EJ4A");
			MessageBox.error(
					shText, {
						title : this.getResourceBundle().getText("Error"),
					});
		}else{ this.getView().byId("idJ4AD").setValueState("None");	this.confirmDialog();} 
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