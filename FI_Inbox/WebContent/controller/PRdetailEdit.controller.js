sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Label',
		'sap/m/MessageToast',
		'sap/m/Text',
		'sap/m/TextArea',
		"z_inbox/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device",
		'sap/m/MessageBox',
		"z_inbox/model/formatter" 
	],function(Button, Dialog, Label, MessageToast, Text, TextArea, Controller, History, Device, MessageBox, formatter) {

		return Controller.extend("z_inbox.controller.PRdetailEdit",	{
	formatter : formatter,
	onInit : function() {

		this.lModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(this.lModel, "lModel");
//											this.getView().setBusy(true);
		this.getView().byId("pr_cr_item").setModel(this.lModel);
		this.getView().byId("pr_cr_item").setModel(this.lModel);
		this.getView().byId("tbl_spl_apprvls").setModel(this.lModel);
		this.getView().byId("id_payment").setModel(this.lModel);
		this.getView().byId("id_addInfo").setModel(this.lModel);
		this.getView().byId("id_payTerms").setModel(this.lModel);


		this.getOwnerComponent().getRouter().getRoute("PurchaseReq").attachPatternMatched(this._onRouteMatched,this);
	},
	_onRouteMatched : function(oEvent) {
		this.getView().setBusy(true);
		this.sI18Text = this.getResourceBundle().getText("pfmf");
		try{
		this.sId= oEvent.getParameter("arguments").id;
		this.instId= oEvent.getParameter("arguments").instId;
		}catch(oEr){
			this.sId  ;	
			
		}
		var tbData = {
				"lSet" : {"editable":false,"editable2":false},
				"mainSet" : {},
				"dEditable": false,
				"tempDelData":[]
			};

			this.lModel.setData(tbData);
		
		this.sPath = "/EBAN_DATASet('"+ this.sId + "')";
		var iconTab = this.byId("id_iconTB");
//		iconTab.setSelectedKey("PR");
		
		// this.getView().bindElement(this.sPath);

		var oMdl = this.getOwnerComponent().getModel();
		oMdl.read(
						this.sPath,
						{
							success : function(oData) {
								
//																	if(oData.Zjusdelivery){
//																	var sJus = oData.Zjusdelivery.split(",");
//																	if(sJus.indexOf("othr") != -1){
//																		this.byId("L8").setVisible(true);
//																		
//																	}
//																	}
								
								
								
								this.lModel.setProperty("/mainSet",oData);
								this.onRequestType(oData.Zrequesttype);
//																	this.onRFOthers(oData.Zrequestoth);
								this.getView().byId("idIconTabBar").setSelectedKey("pr_edit")
								var wEdit = this.lModel.getProperty("/mainSet/Zrequestsrv");
								
								this.PRStatusTab();
								/*if(wEdit == "X"){
									this.byId("prEdit").setVisible(false)
									this.byId("prSaveSubmit").setVisible(false)
									this.byId("prCancel").setVisible(false)
									this.byId("prSave").setVisible(false)
									
								}else{
									this.byId("prEdit").setVisible(true)
									this.byId("prSaveSubmit").setVisible(true)
									this.byId("prCancel").setVisible(true)
									this.byId("prSave").setVisible(true)
									
								}*/
								this.getView().setBusy(false);

							}.bind(this),
							error : function(oError) {
								this.getView().setBusy(false);
								var err = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
								
								var sErr = err.getElementsByTagName("message")[0].innerHTML
								
								
								MessageBox.error(
										sErr, {
											
											title : "Error",
										});
								

							
								
								
							}.bind(this),
							urlParameters : {
								"$expand" : "navigtoitems,navigtoapproval,navigtopayment,navigtoterms,navigtoothers"

							}

						});

	},
	
	
	
	
	
	onPrintPR:function(oEvent){
		var sPrintPath;
		var lang    = sap.ui.getCore().getConfiguration().getLanguage();
		var reqType = this.lModel.getProperty("/mainSet/Zrequesttype");
		if(reqType == "0"){
		sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRU',appno='" +this.sId+"',lang='"+lang+"',ndavalue='')/$value";
		
		}else if(reqType == "2"){
			sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRE',appno='" +this.sId+"',lang='"+lang+"',ndavalue='')/$value";		
			
		}else if(reqType == "1"){
			
			sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRR',appno='" +this.sId+"',lang='"+lang+"',ndavalue='')/$value";	
			
		}
		
		window.open(sPrintPath,true);

	},
	
	

	// Item Detail Press
	onDetailItemPress : function(oEvent) {
		
		this.cntxt = oEvent.getSource().getBindingContext();
		if (!this.prItemDetailDialog) {
			this.prItemDetailDialog = sap.ui.xmlfragment(this.createId("itemDetail"),"z_inbox.view.fragments.PRItemDetailCommercial",this); 												
			this.getView().addDependent(this.prItemDetailDialog);
			
		}
		// this.prItemDetailDialog.bindElement(cntxt);
		this.prItemDetailDialog.setModel(this.lModel);
		this.prItemDetailDialog.setBindingContext(this.cntxt);
		this.prItemDetailDialog.open();

	
		
	},

	// Terms and Conditions
	onAddpayTerms : function(oEvent) {
		var othsArr = this.lModel.getProperty("/mainSet/navigtoterms/results");
		othsArr.push({
			"Reason" : ""

		});
		this.lModel.setProperty("/mainSet/navigtoterms/results",othsArr);

	},
	// Terms and Conditions
	onAddpayment : function(oEvent) {
		var othsArr = this.lModel
				.getProperty("/mainSet/navigtopayment/results");
		othsArr.push({
			"Reason" : ""

		});
		this.lModel.setProperty("/mainSet/navigtopayment/results",othsArr);

	},
	// Terms and Conditions
	onAddaddInfo : function(oEvent) {
		var othsArr = this.lModel.getProperty("/mainSet/navigtoothers/results");
		othsArr.push({"Reason" : ""});
		this.lModel.setProperty("/mainSet/navigtoothers/results",othsArr);
	},
	
	onRemoveTerms : function(oEvent) {

		var lst = oEvent.getSource().getParent().getParent();
		var dt = lst.getModel().getProperty("/mainSet/navigtoterms/results");
		var arr = dt.slice(0,-1);
		lst.getModel().setProperty("/mainSet/navigtoterms/results",arr);

	},
	
	onRemovepayment:function(oEvent){
		var lst = oEvent.getSource().getParent().getParent();
		var dt = lst.getModel().getProperty("/mainSet/navigtopayment/results");
		var arr = dt.slice(0,-1);
		lst.getModel().setProperty("/mainSet/navigtopayment/results",arr);
		
	},
	
	
	onRemoveAddInfo:function(oEvent){											
		var lst = oEvent.getSource().getParent().getParent();
		var dt = lst.getModel().getProperty("/mainSet/navigtoothers/results");
		var arr = dt.slice(0,-1);
		lst.getModel().setProperty("/mainSet/navigtoothers/results",arr);

	},
	
	onJustSelcFinish:function(oEvent){
		var mulCombo = oEvent.getSource();
		var indx = 	mulCombo.getSelectedKeys().indexOf("othr");
		if(indx != -1){
			this.byId("L8").setVisible(true);
			this.byId("L8Text").setVisible(true);
		}else{
				this.byId("L8").setVisible(false);
				this.byId("L8Text").setVisible(false);
		}
	},

	// Items Edit and display
	/*onEditDetailItem : function(oEvent) {
		this.lModel.setProperty("/lSet/editable", true);
		this.lModel.setProperty("/lSet/editable2", true);
//											this.lModel.setProperty(
//													"/dEditable", true);

	},*/
	
	onEditDetailItem : function(oEvent) {

		
		if(this.cntxt.getProperty("Requestmat") != 1){
			this.lModel.setProperty("/lSet/editable2", false);			
		}else{
			this.lModel.setProperty("/lSet/editable2", true);
			
		}
		
		this.lModel.setProperty("/lSet/editable", true);
		

	},

	// Item Detail Display

//										onSaveDetailItem : function() {
//											this.lModel.setProperty(
//													"/dEditable", false);
//										},

	// Item Reset in Dialogue
//										onItemReset : function(oEvent) {
//
//											var fragmentId = this.getView()
//													.createId("itemsFragment");
//
//											sap.ui.core.Fragment.byId(
//													fragmentId, "matrnNo")
//													.setValue("");
//											sap.ui.core.Fragment.byId(
//													fragmentId, "matrnDesc")
//													.setValue("");
//											sap.ui.core.Fragment.byId(
//													fragmentId, "matrnQuan")
//													.setValue("");
//
//											sap.ui.core.Fragment.byId(
//													fragmentId, "matrnVal")
//													.setValue("");
//
//											sap.ui.core.Fragment.byId(
//													fragmentId, "itmStartDate")
//													.setDateValue(new Date());
//											sap.ui.core.Fragment.byId(
//													fragmentId, "itmEndDate")
//													.setValue("");
//											sap.ui.core.Fragment.byId(
//													fragmentId, "itmStartDate")
//													.setValue("");
//											sap.ui.core.Fragment.byId(
//													fragmentId, "matrnDiscVal")
//													.setValue("");
//
//											sap.ui.core.Fragment.byId(
//													fragmentId, "matrnVAT")
//													.setValue("");
//
//											sap.ui.core.Fragment.byId(
//													fragmentId, "matrnBudExem")
//													.setSelected(false);
//
//										},

	onPRCItemDialogueClose : function(oEvent) {
		var fragmentId = this.getView().createId("itemDetail");
		var matrnBudExem = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem");
		this.lModel.setProperty("/lSet/editable", false);
		this.lModel.setProperty("/lSet/editable2", false);
		if (matrnBudExem.getSelected())
			this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'X';
		else
			this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'Y';

		oEvent.getSource().getParent().close();
	},

	// Items add From PR creation
	onPRaddPress : function(oEvent) {

		if (!this.prCommDialog) {
			this.prCommDialog = sap.ui.xmlfragment(this.createId("itemsFragment"),"z_inbox.view.fragments.PRCommercial",this);
			this.getView().addDependent(this.prCommDialog);
		}
		this.prCommDialog.open();

	},

	
	
// File Delete on create
	
	onDeleteDocItem:function(oEvent){
		
	if(!this.cntxt){	
		var dItems = this.lModel.getProperty("/lSet/navigprtodocs");
		var docItemPath = this.sdelPath[this.sdelPath.length-1];
		dItems.splice(parseInt(docItemPath),1);											
		this.lModel.setProperty("/lSet/navigprtodocs",dItems);
	}else{
		var navPath = this.sdelPath.slice(0,-1)
		var docItemPath = this.sdelPath[this.sdelPath.length-1]
		var dItems = this.lModel.getProperty(navPath);									
		dItems.splice(parseInt(docItemPath),1);
		this.lModel.setProperty(navPath,dItems);
		this.getView().setBusy(false);	
		
		
	}
		
	},
	

	onItemSave : function(oEvent) {

		var tablObj = {};

		var fragmentId = this.getView().createId("itemsFragment");

		tablObj.Material = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
		tablObj.ShortText = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
		tablObj.Quantity = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
		if (tablObj.Quantity) {
			tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);
		};
		tablObj.Unit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit").getSelectedKey();
		tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat").getSelectedKey();
		tablObj.PreqPrice = sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue();
//											tablObj.PreqPrice = "";
		if (tablObj.PreqPrice) {
			tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);
		} else {

			tablObj.PreqPrice = 0.01;
			tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);

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
			tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);
		} else {

			tablObj.Discountvalue = 0.00;

			tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);

		}
//											tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue();
		tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getSelectedKey();
		// tablObj.discountvalue =
		// sap.ui.core.Fragment.byId(fragmentId,"matrnDiscType").getValue();
		if (tablObj.Vatvalue) {
//												tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
		} else {
			tablObj.Vatvalue = 0;
//												tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
		}

		tablObj.Kostl = sap.ui.core.Fragment
				.byId(fragmentId, "matrnCC")
				.getSelectedKey();
		
		
		tablObj.Costtext = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText(); 

		tablObj.Glaccont = sap.ui.core.Fragment
				.byId(fragmentId,
						"matrnGLCode")
				.getSelectedKey();

		tablObj.Excemtion = sap.ui.core.Fragment
				.byId(fragmentId,
						"matrnBudExem")
				.getSelected();

		tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
		
		// if (tablObj.Excemtion) {
		tablObj.Excemtion = tablObj.Excemtion ? "X"
				: "Y";
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
			
			var errText = this.sI18Text
				sap.m.MessageBox.error(errText, {title : "Error"});
		}

	},
	
	handleReject: function () {
		var that = this;
		var dialog = new Dialog({
			title: this.getResourceBundle().getText("Reject"),
			type: 'Message',
			content: [
				new Label({ text: this.getResourceBundle().getText("RejectConformation"), labelFor: 'submitDialogTextarea'}),
				new TextArea('submitDialogTextarea', {
					liveChange: function(oEvent) {
						var sText = oEvent.getParameter('value');
						var parent = oEvent.getSource().getParent();

						parent.getBeginButton().setEnabled(sText.length > 0);
					},
					width: '100%',
					placeholder: this.getResourceBundle().getText("MandatoryNote")
				})
			],
			beginButton: new Button({
				text: this.getResourceBundle().getText("Submit"),
				enabled: false,
				press: function () {
					var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
					that._onPRReject(sText, that);
					dialog.close();
				}
			}),
			endButton: new Button({
				text: this.getResourceBundle().getText("Cancel"),
				press: function () {
					dialog.close();
				}
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});

		dialog.open();
	},
	
	_onPRReject:function(sText, that){
		var sPath = "/WF_UIAPPROVALSet";
		var oFilter = "WiAagent eq '' and Wiid eq '"+this.instId+"'and Decision eq 'R' and Rejectionreason eq '"+sText+"'";
		that.getOwnerComponent().getModel().read(sPath,{
			success:function(oData){
				that.getView().getModel().refresh();
//													MessageBox.success("PR has been Rejected", {title : "Success"});
				that.getOwnerComponent().getRouter().navTo("welcome");
			}.bind(this),
			urlParameters:{
				"$filter":oFilter
			}
		});
	},
	
//										handleReject : function(oEvent) {
//											if (!this.CancelDialog) {
//												this.CancelDialog = new sap.m.Dialog({
//															title : this.getResourceBundle().getText("Reject"),
//															type : 'Message',
//															draggable : true,
//															content : new sap.m.Text({
//																		text : this.getResourceBundle().getText("RejectMsg")
//																	}),
//															beginButton : new sap.m.Button({
//																text : this.getResourceBundle().getText("PCYes"),
//																type : "Accept",
//																press : function() {
////																	sap.m.MessageToast.show("Submitted");
//																	this.CancelDialog.close();
//																	this._CancelYes(oEvent);
//																}.bind(this)
//															}),
//															endButton : new sap.m.Button({
//																text : this.getResourceBundle().getText("PCNo"),
//																type : "Reject",
//																press : function() {
//																	this.CancelDialog.close();
//																}.bind(this)
//															})
//														});
//
//												// to get access to the global model
//												this.getView().addDependent(this.CancelDialog);
//											}
//
//											this.CancelDialog.open();
//										},
//										
//										
//										_CancelYes: function(oEvent) {
//											
//											var that = this;
//											
//											var sPath = "/WF_UIAPPROVALSet(WiAagent='',Wiid='"+this.instId+"',Decision='R')"
//											
//											this.getModel().read(sPath,{
//												success:function(oData){
//													var msg = that.getResourceBundle().getText("RejectSuccess");
//													jQuery.sap.require("sap.m.MessageBox");
//													sap.m.MessageBox.success(msg);
//													that.getOwnerComponent().getModel().refresh()
//													that.getOwnerComponent().getRouter().navTo("welcome",true);
//												}.bind(this),
//												error:function(oData){
//													var emsg= $(oData.responseText).find("message").first().text();
//													var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//													jQuery.sap.require("sap.m.MessageBox");
//													sap.m.MessageBox.error(emsg	);
//													
//												}
//												
//												
//											});
//											
//											
//											
//											
//										},	
	
	
	
	
	
	
	
	//Remove Items	
	
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
		
		
		

		// lstbl.removeItem(parseInt(arr[arr.length-1]));

	},
	
	
//	April 19

/*	onPRCDialogueClose : function(oEvent) {
		this.onItemReset();
		oEvent.getSource().getParent().close();

	},*/

	onNavBack : function() {
		/*var sPreviousHash = History
				.getInstance()
				.getPreviousHash();

		if (sPreviousHash !== undefined) {
			history.go(-1);
		} else {*/
			
		
		/*if(this.getModel("device").isPhone){
		
			this.getOwnerComponent().getRouter().navTo("master", {},true);
		}else{*/
			
			this.getOwnerComponent().getRouter().navTo("mobileMaster", {},true);
//											}
			
//											}
	},

	onAfterRendering : function() {

		this.getView().byId("idRequester").bindItems({
			path : "/USERLISTSet",
			template : new sap.ui.core.ListItem(
					{
						text : "{NameText}",
//						additionalText : "{NameLast}",
						key : "{Bname}"
					})

		});

		this.getView().byId("cc_com_currency").bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});

		this.getView().byId("cc_dscount_currency").bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});

		this.getView().byId("idUVRS").bindItems({
			path : "/VENDORSet",
			template : new sap.ui.core.ListItem({
						text : "{NameOrg1}",
						additionalText : "{Partner}",
						key : "{Partner}"

					})
		});

	},

	onPREditCancel : function(oEvent) {
		// this.getOwnerComponent().getRouter().navTo("master",
		// {},true);
		this.getOwnerComponent()
				.myNavBack();
	},
	
//Others Selected
	
	onRFOthers : function(oEvent) {

		
		try{
			isSelect = oEvent.getParameter('selected');
			this.onChangeMatrl(oEvent);
		}catch(oEr){
			
			isSelect = oEvent=="X" ? true: false;
			
			
		}
		

		this.byId("LRFO").setVisible(
				isSelect);
		this.byId("LRFOInputOthers")
				.setVisible(isSelect);
		
		

	},
	
	
	onPRBackPress : function(oEvent) {


		var prIcon = this.byId("idIconTabBar");
		var type = this.byId("L4").getSelectedIndex();
		var sKey = prIcon.getSelectedKey();

		if (sKey == "comm") {
			var sKey = prIcon.setSelectedKey("gnrl");

		} else if (sKey == "apprls") {
			var sKey = prIcon.setSelectedKey("comm");

		} else if (sKey == "TC"&& type != 1) {
			var sKey = prIcon.setSelectedKey("apprls");

		} else if (sKey == "TC"&& type == 1) {
			var sKey = prIcon.setSelectedKey("comm");

		}
		else {
			var sKey = prIcon.setSelectedKey("TC");

		}

	
	},

	onPRNextPress : function(oEvent) {
		var prIcon = this.byId("idIconTabBar");
		var type = this.byId("L4").getSelectedIndex();
		var sKey = prIcon.getSelectedKey();

		if (sKey == "TC") {
			var sKey = prIcon.setSelectedKey("gnrl");

		} else if (sKey == "apprls") {
			var sKey = prIcon.setSelectedKey("TC");

		} else if (sKey == "comm"&& type != 1) {
			var sKey = prIcon.setSelectedKey("apprls");

		} else if (sKey == "comm"&& type == 1) {
			var sKey = prIcon.setSelectedKey("TC");

		}

		else {
			var sKey = prIcon.setSelectedKey("comm");

		}

	},
	
	
/*	handleIconTabBarSelect:function(oEvent){
											var oModel = this.getView().getModel();
											var icKey = oEvent.getParameter('selectedKey');
											var sPRnumber;
											if(icKey == "PR"){
												
//												sPRnumber = oModel.getProperty(this.sPath+'/Banfn');
												this.getOwnerComponent().getRouter().navTo("orderQuotations", {id: this.sId});
												
											}else if(icKey == 'QR'){
//												sPRnumber = oModel.getProperty(this.sPath+'/Banfn');
												this.getOwnerComponent().getRouter().navTo("Quotations", {id: this.sId});
												
												
											}else if(icKey == 'QC'){
//												sPRnumber = oModel.getProperty(this.sPath+'/Banfn');
												this.getOwnerComponent().getRouter().navTo("QuotCompare", {id: this.sId});
												
												
											}else if(icKey == 'PO'){
												
												var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation"); 
												var hrefForProductDisplay = oCrossAppNav.toExternal({
													  target : { semanticObject : "ZPRFEEDBACK", action : "create" },
													  params : { id: this.sId }
													}); 
												
												
												
											}
											
											
											
										},*/
	
	onRequestType : function(oEvent) {
		
		var oSelectedIndex;
		var from = false;
		try{
			oSelectedIndex = 	oEvent.getParameter("selectedIndex");
		}catch(oEr){
			oSelectedIndex = oEvent;
			from = true
		}
//											
	if (oSelectedIndex == 1) {
		this.byId("apprls").setVisible(false);
		this.byId("idUVR").setVisible(false);
		this.byId("idUVRS").setVisible(false);

		this.byId("idUJ").setVisible(false);
		this.byId("idUJC").setVisible(false);

		this.byId("idCTV1").setVisible(false);

		this.byId("idCDV1").setVisible(false);
		this.byId("L8").setVisible(false);
		this.byId("L8Text").setVisible(false);
		this.byId("idUJText").setVisible(false);
//											this.byId("idUJC").removeAllSelectedItems();
		
		this.byId("idJText").setVisible(false);
		
		
		
	} else {
		this.byId("apprls").setVisible(true);
		this.byId("idUVR").setVisible(true);
		this.byId("idUVRS").setVisible(true);
	/*	this.byId("idUPM").setVisible(true);
		this.byId("idUPMC1").setVisible(true);
		this.byId("idUPMC2").setVisible(true);*/
//											this.byId("idUJ").setVisible(true);
		if(from)
		{
			this.byId("idUJText").setVisible(true);
			this.byId("idJText").setVisible(true);
			this.byId("idUJC").setVisible(false);
			this.byId("idUJ").setVisible(false);
		}else{
			this.byId("idUJC").setVisible(true);
			this.byId("idJText").setVisible(false);
			this.byId("idUJText").setVisible(false);
			this.byId("idUJ").setVisible(true);
		}
		this.byId("idCTV1").setVisible(true);
		var Zjusdelivery = this.lModel.getProperty("/mainSet/Zjusdelivery")
		if(Zjusdelivery){
			var sJus = Zjusdelivery.split(",");
			if(sJus.indexOf("othr") != -1){
				this.byId("L8").setVisible(true);
				this.byId("L8Text").setVisible(true);
				
			}else{
				
				this.byId("L8").setVisible(false);
				this.byId("L8Text").setVisible(false);
			}
		}
		
		
//											this.byId("L8").setVisible(true);

	}
		
		
	
		
		
	},
	
	
	onChangeMatrl:function(oEvent){
		var chgVal = oEvent.getParameter('selected');
		var chkBox = oEvent.getSource();
		var sPath = chkBox.getBindingPath('selected');
		
		chgVal?this.lModel.setProperty(sPath,"X"):this.lModel.setProperty(sPath,"Y")
		debugger;
	},
	
	
	onEditPr:function(oEvent){
		
		this.lModel.setProperty("/lSet/editable",true);
		this.lModel.setProperty("/lSet/editable2", true);
		if(this.lModel.getProperty("/mainSet/Zrequesttype") == 0){
		this.byId("idUJText").setVisible(false);
		this.byId("idUJC").setVisible(true);
		this.byId("idJText").setVisible(false);
		this.byId("idUJ").setVisible(true);
		}
		
	},
	
	
	onSavePrWorkFlow:function(oEvent){
		
		this.lModel.setProperty("/mainSet/Zrequestsrv","X")
		this.onSavePr();
		
		
		
	},
	
	onSavePr : function(oEvent) {
		
		this.getView().setBusy(true);
		var jusBox   = this.getView().byId("idUJC");
		var cKeys    = jusBox.getSelectedKeys().toString();
		var oDataMdl = this.getOwnerComponent().getModel();
		var ptData   = this.getView().getModel('lModel').getProperty("/mainSet");
		var poData   = $.extend(true,{},ptData);
//											var lSet = this.getView().getModel(
//													'lModel').getProperty(
//													"/lSet")
		var delItems           = this.lModel.getProperty("/tempDelData");
		poData.navigtoapproval = poData.navigtoapproval.results;
		poData.navigtoitems    = poData.navigtoitems.results;
		for(var i =0;i<delItems.length;i++){	
			poData.navigtoitems.push(delItems[i]);		
		}
		poData.navigtoothers  = poData.navigtoothers.results;
		poData.navigtopayment = poData.navigtopayment.results;
		poData.navigtoterms   = poData.navigtoterms.results;
		poData.Zjusdelivery   = cKeys;
		poData.Zprocurmethod  = this.getView().byId("idUPMC1").getSelected() ? "X": "Y";
		poData.Zprocurmethods = this.getView().byId("idUPMC2").getSelected() ? "X": "Y";
		// }
		// ;
		// if (poData.Zrequestmat) {
		poData.Zrequestmat    = poData.Zrequestmat ? "X": "Y";
		// }
		// if (poData.Zrequestoth) {
		poData.Zrequestoth = poData.Zrequestoth ? "X": "Y";
		// }
		// if (poData.Zrequestsrv) {
		poData.Zrequestsrv = poData.Zrequestsrv ? "X": "Y";
		

		poData.Zrequesttype = this.byId("L4").getSelectedIndex().toString()
		if (poData.Ztotalvalue) {
			poData.Ztotalvalue = parseFloat(poData.Ztotalvalue).toFixed(2);
		}
		if (poData.Ztotaldiscount) {
			poData.Ztotaldiscount = parseFloat(poData.Ztotaldiscount).toFixed(2);
		}
	
		if(this.validation(poData)){
			oDataMdl.create("/EBAN_DATASet",poData, {
							success : function(oData) {
								this.getView().setBusy(false);
								this.lModel.setProperty("/lSet/editable",false);
								this.lModel.setProperty("/lSet/editable2", true);
								/*this.byId("idUJText").setVisible(false);
								this.byId("idUJC").setVisible(false);
								
								this.byId("idJText").setVisible(false);
								this.byId("idUJ").setVisible(false);*/
								this._onRouteMatched();
								var shText = this.getResourceBundle().getText("prUpdated")+ oData.Banfn;
								this.getOwnerComponent().getModel().refresh();
								MessageBox.success(shText, {
											title : this.getResourceBundle().getText("Success"),
										});
								}.bind(this),
							error : function(oError) {
								/*this.getView().setBusy(false);
								var err = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
								
								var sErr = err.getElementsByTagName("message")[0].innerHTML
								
								
								MessageBox.error(
										sErr, {
											
											title : "Error",
										});*/
								
									this._handleError(oError);
							}.bind(this)

						});
		}else{
			
			this.getView().setBusy(false);
			MessageBox.error(
					this.sI18Text, {
						
						title : this.getResourceBundle().getText("Error")
					});
			
		}
	
		
		
		
	},
	
	
	handleApprove: function(oEvent) {
		if (!this.pressDialog) {
			this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
					"z_inbox.view.fragments.Approve",
					this);
			this.getView().addDependent(this.pressDialog);
//			this.getView().byId('l5approve').setVisible(false);
//			this.getView().byId('l5usr_List').setVisible(false);
		}
		this.pressDialog.open();				
	},
	
	onOpenApprove: function(oEvent) {
		var Level1Approver = this.getView().byId("l1usr_List");
		var Level2Approver = this.getView().byId("l2usr_List");
		var Level3Approver = this.getView().byId("l3usr_List");
		var Level4Approver = this.getView().byId("l4usr_List");
		var Level5Approver = this.getView().byId("l5usr_List");
		this.getView().byId('l5approve').setText("Procurement");
		var oModel         = this.getView().getModel();
		
		var aFilters = [];
		var bFilters = [];
		var cFilters = [];
		var dFilters = [];
		var eFilters = [];
		var oTemplate= new sap.ui.core.ListItem(
				{
					text : "{Fullname}",
					key : "{Defaultuser}"
				});
		
		aFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '1') );
		Level1Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(aFilters, true),
			template : oTemplate
		});
		
		bFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '2') );
		Level2Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(bFilters, true),
			template : oTemplate
		});
		
		cFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '3') );
		Level3Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(cFilters, true),
			template : oTemplate
		});
		
		dFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '4') );
		Level4Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(dFilters, true),
			template : oTemplate
		});
		
		eFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '7') );
		Level5Approver.bindItems({
			path : "/mgtapprovalSet",
			filters: new sap.ui.model.Filter(eFilters, true),
			template : oTemplate
		});
	},
	
	onApproveClose : function(oEvent) {
		oEvent.getSource().getParent().close();
	},
	
	handleApproveSave : function(oEvent) {
		var level5 = this.getView().byId("l5usr_List").getSelectedKey();
		
		if(level5 != "0"){
			this.onApproveClose(oEvent);
			var that   = this;
			var level1 = this.getView().byId("l1usr_List").getSelectedKey();
			var level2 = this.getView().byId("l2usr_List").getSelectedKey();
			var level3 = this.getView().byId("l3usr_List").getSelectedKey();
			var level4 = this.getView().byId("l4usr_List").getSelectedKey();
			var level5 = this.getView().byId("l5usr_List").getSelectedKey();
			
			var approver         = {};
			approver.Wiid        = this.instId;
			approver.Level1      = level1;
			approver.Level2      = level2;
			approver.Level3      = level3;
			approver.Level4      = level4;
			approver.Level7      = level5;
	//											approver.navigwitowiuser = [];
			var oModel = this.getOwnerComponent().getModel("fiService");
			oModel.create("/wfmgtuserselectSet", approver,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = "Request has been forwarded for approvals.";
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.getOwnerComponent().getModel().refresh()
					that.getOwnerComponent().getRouter().navTo("welcome",true);
					
				},
				error:function(oData){
					var emsg= $(oData.responseText).find("message").first().text();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.error(emsg	);
					debugger;	
				}
			})
		}else{
			sap.m.MessageBox.error(this.getResourceBundle().getText("pfmf"));
		}
	}

});

}, /* bExport= */true);
