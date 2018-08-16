sap.ui.define(
	["sap/ui/core/mvc/Controller",'sap/m/MessageBox',
		'sap/m/MessageToast',"sap/ui/core/routing/History"],
	function (Controller, MessageBox, MessageToast,History) {
	"use strict";

	return Controller.extend("poApp.controller.BaseController", {

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
			//return this.getOwnerComponent().getModel("prm");
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

			
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText("Material Description");
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
			
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText("Description");
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
			
			
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			
//			var fragmentId = this.getView().createId("itemsFragment");
			
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText("Service Description");
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
//			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setValue("");
//			sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
			
			
		},
		
		
		
		onOpenDialItem : function(oEvent) {

			var fragmentId = this.getView()
					.createId("itemsFragment");

			var valCurr = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnCurr");
			valCurr
					.bindItems({
						path : "oMdl>currencySet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Waers}",
									key : "{Waers}",
									additionalText : "{Landx50}"
								})
					});

		

			var matrnUnit = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnUnit");
			matrnUnit
					.bindItems({
						path : "/unitsSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Msehl}",
									key : "{Msehi}"
								})
					});
			// Account Assignment Catogery

			var matrnActAsignCat = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnActAsignCat");
			matrnActAsignCat
					.bindItems({
						path : "/ACCATEGORYSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Knttx}",
									key : "{Knttp}"
								})
					});

			var matrnCC = sap.ui.core.Fragment
					.byId(fragmentId, "matrnCC");
			matrnCC
					.bindItems({
						path : "/costcentrelistSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Ltext}",
									key : "{Kostl}"
								})
					});

			var matrnGLCode = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnGLCode");
			matrnGLCode
					.bindItems({
						path : "/glaccountSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Txt20}",
									key : "{GlAccount}"

								})
					});
			
			
			oEvent.getSource().setBusy(false);

		},

		// Detail Dialogue Item on After loading
		onOpenDetailDialItem : function(oEvent) {

			var fragmentId = this.getView().createId("itemDetail");
			
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
				
			}else if(rType == "2"){
				segBtns.setSelectedKey(rType);
				srvBtn.firePress();
				matBtn.setEnabled(false);
				othBtn.setEnabled(false);
				
			}else{
				
				segBtns.setSelectedKey(rType);
				othBtn.firePress();
				matBtn.setEnabled(false);
				srvBtn.setEnabled(false);
				
			}
			

			var valCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr");
			valCurr.setModel(this.getView().getModel());
			valCurr.setModel(this.lModel,"lModel");

			valCurr.bindItems({
						path : "/currencySet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Waers}",
									key : "{Waers}",
									additionalText : "{Landx50}"
								})
					});

			var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
			valCurr.bindProperty("selectedKey",currPath);

			var matrnUnit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit");

			matrnUnit.setModel(this.getView().getModel());
			matrnUnit.setModel(this.lModel,"lModel");

			matrnUnit.bindItems({
						path : "/unitsSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Msehl}",
									key : "{Msehi}"
								})
					});
			// Account Assignment Catogery

			var unitPath = "lModel>"+ this.cntxt.getPath()+ "/Unit";
			matrnUnit.bindProperty("selectedKey", unitPath);

			var matrnActAsignCat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat");
			matrnActAsignCat.setModel(this.getView().getModel());
			matrnActAsignCat.setModel(this.lModel, "lModel");

			matrnActAsignCat.bindItems({
						path : "/ACCATEGORYSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Knttx}",
									key : "{Knttp}"
								})
					});

			var acPath = "lModel>"+ this.cntxt.getPath()+ "/Acctasscat";
			matrnActAsignCat.bindProperty("selectedKey", acPath);

			var matrnCC = sap.ui.core.Fragment.byId(fragmentId, "matrnCC");

			matrnCC.setModel(this.getView().getModel());
			matrnCC.setModel(this.lModel,"lModel");

			matrnCC.bindItems({
						path : "/costcentrelistSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Ltext}",
									key : "{Kostl}"
								})
					});

			var ccPath = "lModel>"+ this.cntxt.getPath()+ "/Kostl";
			matrnCC.bindProperty("selectedKey",
					ccPath);

			var matrnGLCode = sap.ui.core.Fragment
					.byId(fragmentId,
							"matrnGLCode");

			matrnGLCode.setModel(this.getView()
					.getModel());
			matrnGLCode.setModel(this.lModel,
					"lModel");

			matrnGLCode
					.bindItems({
						path : "/glaccountSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Txt20}",
									key : "{GlAccount}"

								})
					});

			var glPath = "lModel>"
					+ this.cntxt.getPath()
					+ "/Glaccont";
			matrnGLCode.bindProperty(
					"selectedKey", glPath);

		},
		
		
		//Save Detail Items

		onSaveDetailItem : function(oEvent) {
			this.lModel.setProperty("/dEditable", false);
			this.onPRCItemDialogueClose(oEvent);
			
		},
		
		
		//Save Item while Creating PR
		
		
		onItemSave : function(oEvent) {

			var tablObj = {};

			var fragmentId = this.getView().createId("itemsFragment");

			tablObj.Material = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
			tablObj.ShortText = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
			tablObj.Quantity = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
			if (tablObj.Quantity) {
				tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(3);
			} else {
				tablObj.Quantity = 0;
				tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(3);

			}

			tablObj.Unit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit").getSelectedKey();
			tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat").getSelectedKey();
			tablObj.PreqPrice = sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue();

			if (tablObj.PreqPrice) {
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(3);
			} else {

				tablObj.PreqPrice = 0.01;
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(3);

			}

			tablObj.Currency = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").getSelectedKey();
			tablObj.Begda = sap.ui.core.Fragment.byId(fragmentId,"itmStartDate").getDateValue();
			tablObj.Endda = sap.ui.core.Fragment.byId(fragmentId,"itmEndDate").getDateValue();
			tablObj.DelivDate = sap.ui.core.Fragment.byId(fragmentId,"DP1").getDateValue();
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

			tablObj.Kostl = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedKey();
			tablObj.Costtext = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText();
			tablObj.Glaccont = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode").getSelectedKey();

			tablObj.Excemtion = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getSelected();

			tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
			
			// if (tablObj.Excemtion) {
			tablObj.Excemtion = tablObj.Excemtion ? "X": "Y";
			// }
			// ;

			/*
			 * tablObj.matrnCC =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId, "matrnCC")
			 * .getValue(); tablObj.matrnGLCode =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId, "matrnGLCode")
			 * .getValue(); tablObj.matrnBudOvr =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId, "matrnGLCode")
			 * .getValue();
			 * tablObj.matrnDiscType =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId,
			 * "matrnDiscType")
			 * .getSelectedKey();
			 * tablObj.valCurr =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId, "matrnCurr")
			 * .getSelectedKey();
			 * tablObj.matrnUnit =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId, "matrnUnit")
			 * .getSelectedKey(); tablObj.Begda =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId, "itmStartDate")
			 * .getValue();
			 */

			// tablObj.matrnBudExem =
			// sap.ui.core.Fragment
			// .byId(fragmentId,
			// "matrnBudExem")
			// .getValue();
			// File Upload
			/*
			 * tablObj.matrnFile =
			 * sap.ui.core.Fragment
			 * .byId(fragmentId, "matrnFile");
			 * 
			 * var tblFileInputId =
			 * tablObj.matrnFile .getId() +
			 * '-fu';
			 * 
			 * var reader = new FileReader();
			 * 
			 * var tblFileInput = $.sap
			 * .domById(tblFileInputId);
			 * 
			 * var tblFile =
			 * tblFileInput.files[0]; var
			 * base64marker = 'data:' +
			 * tblFile.type + ';base64,';
			 * 
			 * var that = this;
			 * 
			 * reader.onload =
			 * (function(theFile) { return
			 * function(evt) {
			 * 
			 * var base64Index =
			 * evt.target.result
			 * .indexOf(base64marker) +
			 * base64marker.length; var base64 =
			 * evt.target.result
			 * .substring(base64Index);
			 * tablObj.fileBase64 = base64; }
			 * 
			 * })();
			 * 
			 * reader.readAsDataURL(tblFile);
			 */
			
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
		
		
		itemValidation:function(oParm){
			
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
		
		
		onBefDialOpen:function(oEvent){
			
			oEvent.getSource().setBusy(true);
			
			
		},
		
		_handleError : function(oError){
			
			this.getView().setBusy(false);
			
			try{
				
				var oJson = JSON.parse( oError.responseText);
				/*MessageBox({
					 type: sap.ca.ui.message.Type.INFO,
					    message:  decodeURIComponent(oJson.error.message.value)
					},null);*/
				
				
				MessageBox.error(
						decodeURIComponent(oJson.error.message.value), {
							
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
		}

	});
});