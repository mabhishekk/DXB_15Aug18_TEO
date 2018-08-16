//PR  EDIT Controller

sap.ui.define([ "providentia/pr/controller/BaseController", "sap/ui/core/routing/History","sap/ui/Device", 'sap/m/MessageBox',"providentia/pr/model/formatter" ],
				function(Controller, History, Device, MessageBox, formatter) {
					return Controller.extend("providentia.pr.controller.DetailEdit",
									{
										formatter : formatter,
										onInit : function() {

											this.lModel = new sap.ui.model.json.JSONModel();
											this.getView().setModel(this.lModel, "lModel");
//											this.getView().setBusy(true);
//											this.imageLoading(this.getOwnerComponent().getMetadata().getComponentName());
											this.getView().byId("pr_cr_item").setModel(this.lModel);
											this.getView().byId("pr_cr_item").setModel(this.lModel);
											this.getView().byId("tbl_spl_apprvls").setModel(this.lModel);
											this.getView().byId("id_payment").setModel(this.lModel);
											this.getView().byId("id_addInfo").setModel(this.lModel);
											this.getView().byId("id_payTerms").setModel(this.lModel);


											this.getOwnerComponent().getRouter().getRoute("PR").attachPatternMatched(this._onRouteMatched,this);
										},
										_onRouteMatched : function(oEvent) {
											this.getView().setBusy(true);
											try{
											this.sId= oEvent.getParameter("arguments").id;
											}catch(oEr){
												this.sId  ;	
												
											}
											this.sI18Text = this.getResourceBundle().getText("pfmf");
											
											var tbData = {
													"lSet" : {"editable":false,"editable2":false,"navigprtodocs" : []},
													"mainSet" : {},
													"dEditable": false,
													"tempDelData":[]
												};

												this.lModel.setData(tbData);
											
											this.sPath = "/EBAN_DATASet('"+ this.sId + "')";
											var iconTab = this.byId("id_iconTB");
											iconTab.setSelectedKey("PR");
											
											// this.getView().bindElement(this.sPath);

											var oMdl = this.getOwnerComponent().getModel();
											oMdl.read(
															this.sPath,
															{
																success : function(oData) {
																	
																	this.lModel.setProperty("/mainSet",oData);
																	this.onRequestType(oData.Zrequesttype);
//																	
																	this.getView().byId("idIconTabBar").setSelectedKey("pr_edit")
																	var wEdit = this.lModel.getProperty("/mainSet/Zrequestsrv");
																	
																	this.PRStatusTab(oData.Zrequesttype);
																	
//																	var wEdit = this.lModel.getProperty("/mainSet/Zrequestsrv");
																	if(wEdit == "X"){
																		this.byId("prEdit").setVisible(false)
																		this.byId("prSaveSubmit").setVisible(false)
																		this.byId("prCancel").setVisible(false)
																		this.byId("prSave").setVisible(false)
																		
																	}else{
																		this.byId("prEdit").setVisible(true)
																		this.byId("prSaveSubmit").setVisible(true)
																		this.byId("prCancel").setVisible(true)
																		this.byId("prSave").setVisible(true)
																		
																	}
																	
																	
																	
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
											var lang            = sap.ui.getCore().getConfiguration().getLanguage();
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
												this.prItemDetailDialog = sap.ui.xmlfragment(this.createId("itemDetail"),"providentia.pr.view.fragments.PRItemDetailCommercial",this); 												
												this.getView().addDependent(this.prItemDetailDialog);
												jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.prItemDetailDialog);
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
											var othsArr = this.lModel
													.getProperty("/mainSet/navigtoothers/results");
											othsArr.push({
												"Reason" : ""

											});
											this.lModel.setProperty(
													"/mainSet/navigtoothers/results",
													othsArr);

										},
										
										onRemoveTerms : function(oEvent) {

											var lst = oEvent.getSource().getParent().getParent();

											var dt = lst.getModel().getProperty("/mainSet/navigtoterms/results");

											dt.shift();
											lst.getModel().setProperty("/mainSet/navigtoterms/results",dt);
										},
										
										onRemovepayment:function(oEvent){
											var lst = oEvent.getSource().getParent().getParent();

											var dt = lst.getModel().getProperty("/mainSet/navigtopayment/results");

											dt.shift();
											lst.getModel().setProperty("/mainSet/navigtopayment/results",dt);
											
											
										},
										
										
										onRemoveAddInfo:function(oEvent){
											
											var lst = oEvent.getSource().getParent().getParent();

											var dt = lst.getModel().getProperty("/mainSet/navigtoothers/results");

											dt.shift();
											lst.getModel().setProperty("/mainSet/navigtoothers/results",dt);
											
											
										},
										
										
										/*		
										 * 
										 * Justification Selection Finish
										 * 						
											*/
																
																onJustSelcFinish:function(oEvent){
																	
																	var mulCombo = oEvent.getSource();
																	
																var indx = 	mulCombo.getSelectedKeys().indexOf("othr");
																if(indx != -1)
																	{
																	this.byId("L8").setVisible(true);
																	this.byId("L8Text").setVisible(true);
																	}else{
																		
																		this.byId("L8").setVisible(false);
																		this.byId("L8Text").setVisible(false);
																	}
																},
																
										
										
										

										// Items Edit and display
//										onEditDetailItem : function(oEvent) {
//
//											this.lModel.setProperty("/lSet/editable", true);
//
//										},

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
												this.prCommDialog = sap.ui.xmlfragment(this.createId("itemsFragment"),"providentia.pr.view.fragments.PRCommercial",this);
												this.getView().addDependent(this.prCommDialog);
												jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.prCommDialog);
											}
											this.prCommDialog.open();

										},

										// Currency Dialogue Binding

//										onOpenDialItem : function(oEvent) {
//
//											var fragmentId = this.getView()
//													.createId("itemsFragment");
//
//											var valCurr = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnCurr");
//											valCurr
//													.bindItems({
//														path : "/currencySet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Waers}",
//																	key : "{Waers}",
//																	additionalText : "{Landx50}"
//																})
//													});
//
//											var matrnUnit = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnUnit");
//											matrnUnit
//													.bindItems({
//														path : "/unitsSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Txdim}",
//																	key : "{Msehi}"
//																})
//													});
//											
//											//Material Description
//											var matrnDesc = sap.ui.core.Fragment
//											.byId(fragmentId,
//													"matrnDesc");
//											matrnDesc.bindItems({
//												path : "/MAERIALLISTSet",
//												template : new sap.ui.core.ListItem(
//														{
//															text : "{Maktx}",
//															key : "{Maktx}"
//															
//														})
//											});
//											
//											
//											// Account Assignment Catogery
//
//											var matrnActAsignCat = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnActAsignCat");
//											matrnActAsignCat
//													.bindItems({
//														path : "/ACCATEGORYSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Knttx}",
//																	key : "{Knttp}"
//																})
//													});
//
//											var matrnCC = sap.ui.core.Fragment
//													.byId(fragmentId, "matrnCC");
//											matrnCC
//													.bindItems({
//														path : "/costcentrelistSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Ktext}",
//																	key : "{Kostl}"
//																})
//													});
//
//											var matrnGLCode = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnGLCode");
//											matrnGLCode
//													.bindItems({
//														path : "/glaccountSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Txt20}",
//																	key : "{GlAccount}"
//
//																})
//													});
//
//										},

//										onOpenDetailDialItem : function() {
//
//											var fragmentId = this.getView()
//													.createId("itemDetail");
//
//											var valCurr = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnCurr");
//											valCurr.setModel(this.getView()
//													.getModel());
//											valCurr.setModel(this.lModel,
//													"lModel");
//
//											valCurr
//													.bindItems({
//														path : "/currencySet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Waers}",
//																	key : "{Waers}",
//																	additionalText : "{Landx50}"
//																})
//													});
//
//											var currPath = "lModel>"
//													+ this.cntxt.getPath()
//													+ "/Currency";
//											valCurr.bindProperty("selectedKey",
//													currPath);
//
//										
//
//											var matrnUnit = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnUnit");
//
//											matrnUnit.setModel(this.getView()
//													.getModel());
//											matrnUnit.setModel(this.lModel,
//													"lModel");
//
//											matrnUnit
//													.bindItems({
//														path : "/unitsSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Txdim}",
//																	key : "{Msehi}"
//																})
//													});
//											// Account Assignment Catogery
//
//											var unitPath = "lModel>"
//													+ this.cntxt.getPath()
//													+ "/Unit";
//											matrnUnit.bindProperty(
//													"selectedKey", unitPath);
//
//											var matrnActAsignCat = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnActAsignCat");
//											matrnActAsignCat.setModel(this
//													.getView().getModel());
//											matrnActAsignCat.setModel(
//													this.lModel, "lModel");
//
//											matrnActAsignCat
//													.bindItems({
//														path : "/ACCATEGORYSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Knttx}",
//																	key : "{Knttp}"
//																})
//													});
//
//											var acPath = "lModel>"
//													+ this.cntxt.getPath()
//													+ "/Acctasscat";
//											matrnActAsignCat.bindProperty(
//													"selectedKey", acPath);
//
//											var matrnCC = sap.ui.core.Fragment
//													.byId(fragmentId, "matrnCC");
//
//											matrnCC.setModel(this.getView()
//													.getModel());
//											matrnCC.setModel(this.lModel,
//													"lModel");
//
//											matrnCC
//													.bindItems({
//														path : "/costcentrelistSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Ktext}",
//																	key : "{Kostl}"
//																})
//													});
//
//											var ccPath = "lModel>"
//													+ this.cntxt.getPath()
//													+ "/Kostl";
//											matrnCC.bindProperty("selectedKey",
//													ccPath);
//
//											var matrnGLCode = sap.ui.core.Fragment
//													.byId(fragmentId,
//															"matrnGLCode");
//
//											matrnGLCode.setModel(this.getView()
//													.getModel());
//											matrnGLCode.setModel(this.lModel,
//													"lModel");
//
//											matrnGLCode
//													.bindItems({
//														path : "/glaccountSet",
//														template : new sap.ui.core.ListItem(
//																{
//																	text : "{Txt20}",
//																	key : "{GlAccount}"
//
//																})
//													});
//
//											var glPath = "lModel>"
//													+ this.cntxt.getPath()
//													+ "/Glaccont";
//											matrnGLCode.bindProperty("selectedKey",
//													glPath);
//
//										},

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
														.toFixed(2);
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
//											if (tablObj.Vatvalue) {
//												tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
//											} else {
//												tablObj.Vatvalue = 0;
//												tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
//											}

											tablObj.Kostl = sap.ui.core.Fragment
													.byId(fragmentId, "matrnCC")
													.getSelectedKey();
											
											
											tablObj.Costtext = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText(); 

											tablObj.Glaccont = sap.ui.core.Fragment
													.byId(fragmentId,
															"matrnGLCode")
													.getSelectedKey();

											tablObj.Excemtion = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getSelected();

											tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
											
											// if (tablObj.Excemtion) {
											tablObj.Excemtion = tablObj.Excemtion ? "X": "Y";
											
											var lDocs          = this.lModel.getProperty("/lSet/navigprtodocs");
											tablObj.navigitemstofile = lDocs;
											var allFiles       = this.lModel.getProperty("/mainSet/navigprtodocs");
											if(typeof(allFiles) == "object"){
												allFiles  = [];
											}
//											allFiles.push();
											this.lModel.setProperty("/mainSet/navigprtodocs",allFiles.concat(lDocs));
											this.lModel.setProperty("/lSet/navigprtodocs",[])
											
											
											if(this.itemValidation(tablObj)){	
											
											var lTbl = this.lModel.getProperty("/mainSet/navigtoitems/results");

											lTbl.push(tablObj);
											this.lModel.setProperty("/mainSet/navigtoitems/results",lTbl);

											var dItemBox = sap.ui.core.Fragment.byId(fragmentId,"idPRCDialog");
											this.onItemReset();
											dItemBox.close()
											}else{
												
												var errText = "Please fill Mandatory fields"
													sap.m.MessageBox.error(this.sI18Text, {title : "Error"});
											}

										},
										
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
										
										
										

										
											onPRCDialogueClose : function(oEvent) {
												var tDial = oEvent.getSource().getParent();
												if (!this.apprDialog) {
													this.apprDialog = new sap.m.Dialog({
																title : this.getResourceBundle().getText("warning"),
																type : 'Message',															
																content : new sap.m.Text({
																			text : this.getResourceBundle().getText("clsWarning")
																		}),
																beginButton : new sap.m.Button({
																	text : this.getResourceBundle().getText("PCYes"),
																	type : "Accept",
																	press : function() {
//																		sap.m.MessageToast.show("Submitted");
																		this.apprDialog.close();
//																		this._apprvYes(oEvent);
																		this.onItemReset();
																		tDial.close();
																	}.bind(this)
																}),
																endButton : new sap.m.Button({
																	text : this.getResourceBundle().getText("PCNo"),
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
													template : new sap.ui.core.ListItem({
																text : "{NameText}",
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
											this.getOwnerComponent().myNavBack();
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
										
										
										intGnrlValidation:function(icKey){
											var ptData = this.getView().getModel('lModel').getProperty("/mainSet");
											var zDat = 	 ptData.Zrequestdate ? true: false;											
//											var zptDat = ptData.navigtoitems.length == 0 ? false:true;											
											var zreBrf = ptData.Zrequestbreif.length == 0 ?false:true;	
											return  (zDat & zreBrf)==1?true:false;
											
										},
										
										intDetlsValidation:function(icKey){
											var ptData = this.getView().getModel('lModel').getProperty("/mainSet");
//											var zDat = 	 ptData.Zrequestdate ? true: false;											
											var zptDat = ptData.navigtoitems.length == 0 ? false:true;											
//											var zreBrf = ptData.Zrequestbreif.length == 0 ?false:true;	
											return  zptDat?true:false;
											
											
											
										},
										
										onPRBackPress : function(oEvent) {


											var prIcon = this.byId("idIconTabBar");
											var type = this.byId("L4").getSelectedIndex();
											var sKey = prIcon.getSelectedKey();

											if (sKey == "comm") {
												var sKey = prIcon.setSelectedKey("gnrl");
												this.byId("arrRght").setVisible(true);
												this.byId("arrLeft").setVisible(false);

											} else if (sKey == "apprls") {
												var sKey = prIcon.setSelectedKey("comm");
												this.byId("arrRght").setVisible(false);
												this.byId("arrLeft").setVisible(true);

											} else if (sKey == "TC"&& type != 1) {
												var sKey = prIcon.setSelectedKey("apprls");
												this.byId("arrRght").setVisible(true);
												this.byId("arrLeft").setVisible(true);

											} else if (sKey == "TC"&& type == 1) {
												var sKey = prIcon.setSelectedKey("comm");
												this.byId("arrRght").setVisible(true);
												this.byId("arrLeft").setVisible(true);

											}
											else {
											var val = this.intGnrlValidation(sKey);
											var val1 = this.intDetlsValidation(sKey);
												if(!val ){
													MessageBox.alert(this.sI18Text,{onClose:this.navIconTab("gnrl")});
													
												}else if( !val1){
													MessageBox.alert(this.sI18Text,{onClose:this.navIconTab("comm")});
													
												}else{
													this.byId("arrLeft").setVisible(true);
													var sKey = prIcon.setSelectedKey("TC");
													this.byId("arrRght").setVisible(true);
													this.byId("arrLeft").setVisible(false);
													
												}
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
												
												var val1 = this.intDetlsValidation(sKey);
												if(!val1){
													MessageBox.alert(this.sI18Text,{onClose:this.navIconTab(sKey)});
												}else {
													var sKey = prIcon.setSelectedKey("apprls");
													
												}
												

											} else if (sKey == "comm"&& type == 1) {
												var val1 = this.intDetlsValidation(sKey);
												if(!val1){
													MessageBox.alert(this.sI18Text,{onClose:this.navIconTab(sKey)});
												}else {
													var sKey = prIcon.setSelectedKey("TC");
													this.byId("arrRght").setVisible(false);
													this.byId("arrLeft").setVisible(true);
													
												}
												
												

											}

											else {
												
												var val = this.intGnrlValidation(sKey);
												if(!val){
													MessageBox.alert(this.sI18Text,{onClose:this.navIconTab("gnrl")														})
													
												}else{
													this.byId("arrLeft").setVisible(true);
													var sKey = prIcon.setSelectedKey("comm");
													this.byId("arrRght").setVisible(true);
													this.byId("arrLeft").setVisible(true);
												}
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
											this.lModel.setProperty("/lSet/editable2",true);
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

											var jusBox = this.getView().byId(
													"idUJC");

											var cKeys = jusBox
													.getSelectedKeys()
													.toString();

											var oDataMdl = this
													.getOwnerComponent()
													.getModel();
											var ptData = this.getView()
													.getModel('lModel')
													.getProperty("/mainSet");
											
											var poData = $.extend(true,{},ptData);
											
											
											
											
//											var lSet = this.getView().getModel(
//													'lModel').getProperty(
//													"/lSet")
											var delItems = this.lModel.getProperty("/tempDelData");
											poData.navigtoapproval = poData.navigtoapproval.results;
											poData.navigtoitems = poData.navigtoitems.results;
											
											poData.navigprtodocs =[];
											
											for(var i =0,leng = poData.navigtoitems.length;i<leng;i++){
												
												for(var j=0,jLeng= poData.navigtoitems[i].navigitemstofile.length;j<jLeng;j++ ){
													if(poData.navigtoitems[i].navigitemstofile[j].Filedata)
													poData.navigprtodocs.push(poData.navigtoitems[i].navigitemstofile[j]);
													
												}
												
												delete poData.navigtoitems[i].navigitemstofile
												
											}
											
										//16th April 	
											
											for(var i =0;i<delItems.length;i++){	
												poData.navigtoitems.push(delItems[i]);		
											}
										
										//16th April
											
											poData.navigtoothers = poData.navigtoothers.results;
											poData.navigtopayment = poData.navigtopayment.results;
											poData.navigtoterms = poData.navigtoterms.results;
											
											poData.Zjusdelivery = cKeys;

										
											poData.Zprocurmethod = this.getView().byId("idUPMC1").getSelected() ? "X": "Y";
										
											poData.Zprocurmethods = this.getView().byId("idUPMC2").getSelected() ? "X": "Y";
											// }
											// ;
											// if (poData.Zrequestmat) {
											poData.Zrequestmat = poData.Zrequestmat ? "X": "Y";
											// }

											// if (poData.Zrequestoth) {
											poData.Zrequestoth = poData.Zrequestoth ? "X": "Y";
											// }
											// if (poData.Zrequestsrv) {
											poData.Zrequestsrv = poData.Zrequestsrv ? "X": "Y";
											

											poData.Zrequesttype = this.byId("L4").getSelectedIndex().toString();
											if (poData.Ztotalvalue) {
												poData.Ztotalvalue = parseFloat(poData.Ztotalvalue).toFixed(2);
											}
											if (poData.Ztotaldiscount) {
												poData.Ztotaldiscount = parseFloat(poData.Ztotaldiscount).toFixed(2);
											}
										
											if(this.validation(poData)){
										
											oDataMdl.create("/EBAN_DATASet",poData,
															{
																success : function(oData) {
																	this.getView().setBusy(false);
																	this.lModel.setProperty("/lSet/editable",false);
																	this.lModel.setProperty("/lSet/editable2",false);
																	this._onRouteMatched();
																	var shText = this.getResourceBundle().getText("prUpdated")+ oData.Banfn;
																	this.getOwnerComponent().getModel().refresh();
																	MessageBox.success(
																			shText, {
																				
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
										
											
											
											
										}
										
										
									// closing for adding vendor for
									// comparison

									});

				}, /* bExport= */true);
