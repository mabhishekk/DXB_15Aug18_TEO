//PR  Create controller 

sap.ui.define([ "providentia/pr/controller/BaseController", "sap/ui/core/routing/History",
						"sap/ui/Device", 'sap/m/MessageBox',
						'sap/m/MessageToast', "providentia/pr/model/formatter" ],
				function(Controller, History, Device, MessageBox, MessageToast,formatter) {

					return Controller.extend("providentia.pr.controller.DetailCreate",
									{
										formatter : formatter,
										onInit : function() {
											this.getView().setBusy(true);
											this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched,this);
											this.lModel = new sap.ui.model.json.JSONModel();
											this.getView().setModel(this.lModel, "lModel");
	
										},
										// Items Details
										onDetailItemPress : function(oEvent) {
											this.cntxt = oEvent.getSource().getBindingContext();

											if (!this.prItemDetailDialog) {
												this.prItemDetailDialog = sap.ui.xmlfragment(this.createId("itemDetail"),"providentia.pr.view.fragments.PRItemDetailCommercial",this); // to

												this.getView().addDependent(this.prItemDetailDialog);
												jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.prItemDetailDialog);
												
											}
											this.prItemDetailDialog.setModel(this.lModel);
											this.prItemDetailDialog.setBindingContext(this.cntxt);
											this.prItemDetailDialog.open();

										},

										onBeforeRendering : function() {
											this.getView().byId("idRequester").bindItems(
															{
																path : "/USERLISTSet",
																template : new sap.ui.core.ListItem(
																		{
																			text : "{NameText}",																			
																			key : "{Bname}"
																		})
																
															});
										
											this.getView().byId("cc_com_currency").bindItems(
															{
																path : "/currencySet",
																template : new sap.ui.core.ListItem(
																		{
																			text : "{Waers}",
																			key : "{Waers}",
																			additionalText : "{Landx50}"
																		})
															});

											this.getView().byId("cc_dscount_currency").bindItems(
															{
																path : "/currencySet",
																template : new sap.ui.core.ListItem(
																		{
																			text : "{Waers}",
																			key : "{Waers}",
																			additionalText : "{Landx50}"
																		})
															});

											this.getView().byId("idUVRS").bindItems(
															{
																path : "/VENDORSet",
																template : new sap.ui.core.ListItem(
																		{
																			text : "{Fullname}",
																			additionalText : "{Partner}",
																			key : "{Partner}"

																		})
															});


										},

										/*
										 * onAddTerms : function(oEvent) {
										 * 
										 * var panel = oEvent.getSource()
										 * .getParent().getParent();
										 * 
										 * panel.addContent(
										 * 
										 * new sap.m.Input({ width : "100%",
										 * placeholder : "Description"
										 * 
										 * })); },
										 */

										onAfterRendering:function(){
											
											
											jQuery.sap.delayedCall(0, this, function () {
												this.getView().setBusy(false);
											});
											
										},
										
										onAddpayTerms : function(oEvent) {
											var othsArr = this.lModel.getProperty("/mainSet/navigtoterms");
											othsArr.push({
												"Reason" : ""

											});
											this.lModel.setProperty("/mainSet/navigtoterms",othsArr);

										},

										onAddpayment : function(oEvent) {
											var othsArr = this.lModel.getProperty("/mainSet/navigtopayment");
											othsArr.push({
												"Reason" : ""

											});
											this.lModel.setProperty("/mainSet/navigtopayment",othsArr);

										},

										onAddaddInfo : function(oEvent) {
											var othsArr = this.lModel.getProperty("/mainSet/navigtoothers");
											othsArr.push({
												"Reason" : ""

											});
											this.lModel.setProperty("/mainSet/navigtoothers",othsArr);

										},

										// Items Edit and display
										onEditDetailItem : function(oEvent) {

											this.lModel.setProperty("/dEditable", true);

											if(this.cntxt.getProperty("Requestmat") != 1){
												this.lModel.setProperty("/lSet/editable2", false);				
											}else{
												this.lModel.setProperty("/lSet/editable2", true);
												
											}
											
											this.lModel.setProperty("/lSet/editable", true);
											

										},

										// Item Detail Display
//
//										onSaveDetailItem : function() {
//											this.lModel.setProperty("/dEditable", false);
//										},

//										// Item Reset in Dialogue
//										onItemReset : function(oEvent) {
//
//											var fragmentId = this.getView().createId("itemsFragment");
//
//											sap.ui.core.Fragment.byId(fragmentId, "matrnNo").setValue("");
//											sap.ui.core.Fragment.byId(fragmentId, "matrnDesc").setValue("");
//											sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue("");
//
//											sap.ui.core.Fragment.byId(fragmentId, "matrnVal").setValue("");
//
//											sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setDateValue(new Date());
//											sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setValue("");
//											sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setValue("");
//											sap.ui.core.Fragment.byId(fragmentId, "matrnDiscVal").setValue("");
//
//											sap.ui.core.Fragment.byId(fragmentId, "matrnVAT").setValue("");
//
//											sap.ui.core.Fragment.byId(fragmentId, "matrnBudExem").setSelected(false);
//											sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
//											
//											
//											this.lModel.setProperty("/mainSet/Zrequesttype",1);
//											this.byId("L8").setVisible(false);
//
//										},

										// Items add to table create

//										onItemSave : function(oEvent) {
//
//											var tablObj = {};
//
//											var fragmentId = this.getView().createId("itemsFragment");
//
//											tablObj.Material = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
//											tablObj.ShortText = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
//											tablObj.Quantity = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
//											if (tablObj.Quantity) {
//												tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(3);
//											} else {
//												tablObj.Quantity = 0;
//												tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(3);
//
//											}
//
//											tablObj.Unit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit").getSelectedKey();
//											tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat").getSelectedKey();
//											tablObj.PreqPrice = sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue();
//
//											if (tablObj.PreqPrice) {
//												tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(3);
//											} else {
//
//												tablObj.PreqPrice = 0.001;
//												tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(3);
//
//											}
//
//											tablObj.Currency = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").getSelectedKey();
//											tablObj.Begda = sap.ui.core.Fragment.byId(fragmentId,"itmStartDate").getDateValue();
//											tablObj.Endda = sap.ui.core.Fragment.byId(fragmentId,"itmEndDate").getDateValue();
//											tablObj.DelivDate = sap.ui.core.Fragment.byId(fragmentId,"DP1").getDateValue();
//											tablObj.Discountvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue();
//											if (tablObj.Discountvalue) {
//												tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(3);
//											} else {
//
//												tablObj.Discountvalue = 0.00;
//
//												tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(3);
//
//											}
//											tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue();
//											// tablObj.discountvalue =
//											// sap.ui.core.Fragment.byId(fragmentId,"matrnDiscType").getValue();
//											if (tablObj.Vatvalue) {
//												tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(3);
//											} else {
//												tablObj.Vatvalue = 0;
//												tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(3);
//											}
//
//											tablObj.Kostl = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedKey();
//
//											tablObj.Glaccont = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode").getSelectedKey();
//
//											tablObj.Excemtion = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getSelected();
//
//											tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
//											
//											// if (tablObj.Excemtion) {
//											tablObj.Excemtion = tablObj.Excemtion ? "X": "Y";
//											// }
//											// ;
//
//											/*
//											 * tablObj.matrnCC =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId, "matrnCC")
//											 * .getValue(); tablObj.matrnGLCode =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId, "matrnGLCode")
//											 * .getValue(); tablObj.matrnBudOvr =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId, "matrnGLCode")
//											 * .getValue();
//											 * tablObj.matrnDiscType =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId,
//											 * "matrnDiscType")
//											 * .getSelectedKey();
//											 * tablObj.valCurr =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId, "matrnCurr")
//											 * .getSelectedKey();
//											 * tablObj.matrnUnit =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId, "matrnUnit")
//											 * .getSelectedKey(); tablObj.Begda =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId, "itmStartDate")
//											 * .getValue();
//											 */
//
//											// tablObj.matrnBudExem =
//											// sap.ui.core.Fragment
//											// .byId(fragmentId,
//											// "matrnBudExem")
//											// .getValue();
//											// File Upload
//											/*
//											 * tablObj.matrnFile =
//											 * sap.ui.core.Fragment
//											 * .byId(fragmentId, "matrnFile");
//											 * 
//											 * var tblFileInputId =
//											 * tablObj.matrnFile .getId() +
//											 * '-fu';
//											 * 
//											 * var reader = new FileReader();
//											 * 
//											 * var tblFileInput = $.sap
//											 * .domById(tblFileInputId);
//											 * 
//											 * var tblFile =
//											 * tblFileInput.files[0]; var
//											 * base64marker = 'data:' +
//											 * tblFile.type + ';base64,';
//											 * 
//											 * var that = this;
//											 * 
//											 * reader.onload =
//											 * (function(theFile) { return
//											 * function(evt) {
//											 * 
//											 * var base64Index =
//											 * evt.target.result
//											 * .indexOf(base64marker) +
//											 * base64marker.length; var base64 =
//											 * evt.target.result
//											 * .substring(base64Index);
//											 * tablObj.fileBase64 = base64; }
//											 * 
//											 * })();
//											 * 
//											 * reader.readAsDataURL(tblFile);
//											 */
//											var lTbl = this.lModel.getProperty("/mainSet/navigtoitems");
//											lTbl.push(tablObj);
//											this.lModel.setProperty("/mainSet/navigtoitems",lTbl);
//
//											var dItemBox = sap.ui.core.Fragment.byId(fragmentId,"idPRCDialog");
//											this.onItemReset();
//											dItemBox.close()
//
//										},

										onRemoveTerms : function(oEvent) {

											var lst = oEvent.getSource().getParent().getParent();

											var dt = lst.getModel().getProperty("/mainSet/navigtoterms");

											var arr = dt.slice(0,-1);

											lst.getModel().setProperty("/mainSet/navigtoterms",arr);

										},
										
										onRemovepayment:function(oEvent){
											var lst = oEvent.getSource().getParent().getParent();

											var dt = lst.getModel().getProperty("/mainSet/navigtopayment");

											var arr = dt.slice(0,-1);

											lst.getModel().setProperty("/mainSet/navigtopayment",arr);

											
											
										},
										
										
										onRemoveAddInfo:function(oEvent){
											
											var lst = oEvent.getSource().getParent().getParent();

											var dt = lst.getModel().getProperty("/mainSet/navigtoothers");
											
											var arr = dt.slice(0,-1);

											lst.getModel().setProperty("/mainSet/navigtoothers",arr);
											
											
										},
										

//										_apprvYes:function(oEvent){
//											this.onItemReset();
//											oEvent.getSource().getParent().close();
//	
//										},
										
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
//																	sap.m.MessageToast.show("Submitted");
																	this.apprDialog.close();
//																	this._apprvYes(oEvent);
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

										onRFOthers : function(oEvent) {

											var isSelect = oEvent.getParameter('selected');

											this.byId("LRFO").setVisible(isSelect);
											this.byId("LRFOInputOthers").setVisible(isSelect);

										},

										onPRaddPress : function(oEvent) {

											if (!this.prCommDialog) {
												this.prCommDialog = sap.ui.xmlfragment(this.createId("itemsFragment"),"providentia.pr.view.fragments.PRCommercial",this);
												this.getView().addDependent(this.prCommDialog);
												jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.prCommDialog);
											}
											this.prCommDialog.open();

										},

										_onRouteMatched : function(oEvent) {
											this.byId("idUJC").removeAllSelectedItems();
											this.sI18Text = this.getResourceBundle().getText("pfmf");
											var tbData = {
												"lSet" : {
													"editable":false,
													"editable2":false,
													"navigprtodocs" : []
												},
												"dEditable" : false,
												"mainSet" : {
													"Zrequesttype" : 1,
													"Zrequestdate" : new Date(),
													"Zrequestbreif":"",
													"navigtoitems" : [],
													"navigprtodocs" : [],
													"navigtoterms" : [ {
														"Reason" : ""
													} ],
													"navigtopayment" : [ {
														"Reason" : ""
													} ],
													"navigtoothers" : [ {
														"Reason" : ""
													} ],
													"navigtoapproval" : [ {
														"Approvalid" : "APP01",
														"Reason" : "",
														"Banfn" : "",
														"Boolean":false
													}, {
														"Approvalid" : "APP02",
														"Reason" : "",
														"Banfn" : "",
														"Boolean":false
													}, {
														"Approvalid" : "APP03",
														"Reason" : "",
														"Banfn" : "",
														"Boolean":false
													}, {
														"Approvalid" : "APP04",
														"Reason" : "",
														"Banfn" : "",
														"Boolean":false
													}, {
														"Approvalid" : "APP05",
														"Reason" : "",
														"Banfn" : "",
														"Boolean":false
													},
													{
														"Approvalid" : "APP06",
														"Reason" : "",
														"Banfn" : "",
														"Boolean":false
													},
													{
														"Approvalid" : "APP07",
														"Reason" : "",
														"Banfn" : "",
														"Boolean":false
													}

													]
												}
											};

											this.onRequestType(1);
											
											this.lModel.setData(tbData);
											this.byId("idIconTabBar").setSelectedKey("gnrl");
											
											if(this.getOwnerComponent().getModel('device').isNoPhone){
											this.byId("arrRght").setVisible(true);
											this.byId("arrLeft").setVisible(false);
											}
											
											var tbl = this.getView().byId(
													"pr_cr_item");
											var tblPT = this.getView().byId(
													"id_payTerms");
											var id_addInfo = this.getView()
													.byId("id_addInfo");
											var id_payment = this.getView()
													.byId("id_payment");
											tbl.setModel(this.lModel);
											tblPT.setModel(this.lModel);
											id_addInfo.setModel(this.lModel);
											id_payment.setModel(this.lModel);

										},

//										onItemRemove : function(oEvent) {
//
//											oEvent.getSource().getParent().close();
//
//											var arr = this.cntxt.getPath().split("/");
//											var items = this.lModel.getProperty('/mainSet/navigtoitems');
//											var pInt = parseInt(arr[arr.length - 1]);
//											items.splice(pInt, 1);
//											this.lModel.setProperty('/mainSet/navigtoitems',items);
//
//											// lstbl.removeItem(parseInt(arr[arr.length-1]));
//
//										},

							/*			onNavBack : function() {
											var sPreviousHash = History.getInstance().getPreviousHash();

											// The history contains a previous
											// entry
											if (sPreviousHash !== undefined) {
												history.go(-1);
											} else {
												// There is no history!
												// Naviate to master page
												this.getOwnerComponent().getRouter().navTo("master", {},true);
											}
										
										this.getRouter().navTo("mobileMaster");	
										
										},*/

										onPRDetailCancel : function(oEvent) {
//											this.getOwnerComponent().myNavBack();
											
											this.onRequestType(1);
											this._onRouteMatched();
											var jusBox = this.getView().byId("idUJC");
											jusBox.clearSelection();
											this.lModel.setProperty("/mainSet/Zrequesttype",1);
											this.byId("L8").setVisible(false);
											this.byId("L8Text").setVisible(false);
											
										},

//										validation : function(oEvent) {
//											var ptData = this.getView().getModel('lModel').getProperty("/mainSet");
//
//											ptData.Zrequestdate ? true: MessageToast.show("Please enter Request Date");
//											ptData.Zrequestor ? true: MessageToast.show("Please enter Requestor");
//
//											ptData.Zrequestmat| ptData.Zrequestsrv| ptData.Zrequestoth ? true: MessageToast.show("Please select atleast one Request");
//
//											/*
//											 * ptData.Zrequestdate
//											 * ptData.Zrequestor
//											 * ptData.Zrequestmat
//											 * ptData.Zrequestsrv
//											 * ptData.Zrequestoth
//											 * ptData.Zrequesttype ptData.Lifnr
//											 */
//
//										},
										
										
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

											} else if (sKey == "tc"&& type != 1) {
												var sKey = prIcon.setSelectedKey("apprls");
												this.byId("arrRght").setVisible(true);
												this.byId("arrLeft").setVisible(true);

											} else if (sKey == "tc"&& type == 1) {
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
													var sKey = prIcon.setSelectedKey("tc");
													this.byId("arrRght").setVisible(true);
													this.byId("arrLeft").setVisible(false);
													
												}
											}

										
										},

										onPRNextPress : function(oEvent) {
											var prIcon = this.byId("idIconTabBar");
											var type = this.byId("L4").getSelectedIndex();
											var sKey = prIcon.getSelectedKey();

											if (sKey == "tc") {
												var sKey = prIcon.setSelectedKey("gnrl");
												

											} else if (sKey == "apprls") {
												var sKey = prIcon.setSelectedKey("tc");

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
													var sKey = prIcon.setSelectedKey("tc");
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

										onSavePr : function(oEvent) {

//											this.validation();
											this.getView().setBusy(true);
											var jusBox = this.getView().byId("idUJC");

											// jusBox.clearSelection();
											var cKeys = jusBox.getSelectedKeys().toString();

											var oDataMdl = this.getOwnerComponent().getModel();
											var ptData = this.getView().getModel('lModel').getProperty("/mainSet");
											var lSet = this.getView().getModel('lModel').getProperty("/lSet")

											var poData = $.extend(true, {},ptData);

											poData.Banfn = "";
											poData.Zjusdelivery = cKeys;

											poData.Zprocurmethod = poData.Zprocurmethod ? "X": "Y";

											poData.Zprocurmethods = poData.Zprocurmethods ? "X": "Y";

											poData.Zrequestmat = poData.Zrequestmat ? "X": "Y";

											poData.Zrequestoth = poData.Zrequestoth ? "X": "Y";
											// 
											poData.Zrequestsrv = poData.Zrequestsrv ? "X": "Y";

											poData.Zrequesttype = poData.Zrequesttype.toString();
											
											poData.navigprtodocs =[];
											
											for(var i =0,leng = poData.navigtoitems.length;i<leng;i++){
												
												for(var j=0,jLeng= poData.navigtoitems[i].navigitemstofile.length;j<jLeng;j++ ){
													poData.navigprtodocs.push(poData.navigtoitems[i].navigitemstofile[j]);													
												}
												
												delete poData.navigtoitems[i].navigitemstofile
												
											}
											

											if (poData.Ztotalvalue) {
												poData.Ztotalvalue = parseFloat(poData.Ztotalvalue).toFixed(2);
											}
											if (poData.Ztotaldiscount) {
												poData.Ztotaldiscount = parseFloat(poData.Ztotaldiscount).toFixed(2);
											}
											if (lSet.appRs1) {
												poData.navigtoapproval[0].Reason = lSet.appRs1;
											}
											if (lSet.appRs2) {
												poData.navigtoapproval[1].Reason = lSet.appRs2;
											}
											if (lSet.appRs3) {
												poData.navigtoapproval[2].Reason = lSet.appRs3;
											}
											if (lSet.appRs4) {
												poData.navigtoapproval[3].Reason = lSet.appRs4;
											}
											if (lSet.appRs5) {
												poData.navigtoapproval[4].Reason = lSet.appRs5;
											}
											if (lSet.appRs6) {
												poData.navigtoapproval[5].Reason = lSet.appRs5;
											}
											if (lSet.appRs7) {
												poData.navigtoapproval[6].Reason = lSet.appRs6;
											}
											
											if(this.validation(poData)){
											

											oDataMdl.create("/EBAN_DATASet",poData,
															{
																success : function(
																		oData) {
																	this.getView().setBusy(false);
																	var shText =this.getResourceBundle().getText("prCreated") + oData.Banfn;
																	this.getOwnerComponent().getModel().refresh();
																	
																	
																	if(this.lModel.getProperty("/mainSet/Zrequestsrv") == 'X'){
																		var shText = this.getResourceBundle().getText("prSubmited")+ oData.Banfn;
																		this.getOwnerComponent().getModel().refresh();
																		MessageBox.success(
																				shText, {
																					
																					title : this.getResourceBundle().getText("Success"),
																				});
																		this.lModel.setProperty("/mainSet/Zrequestsrv","")
																		}else{
																			var shText = this.getResourceBundle().getText("prCreated")+ oData.Banfn;
																			this.getOwnerComponent().getModel().refresh();
																			MessageBox.success(
																					shText, {
																						
																						title : this.getResourceBundle().getText("Success"),
																					});	
																			
																			
																			
																		}
																	
																	this.onRequestType(1);
																	this._onRouteMatched();
																	jusBox.clearSelection();
																	this.lModel.setProperty("/mainSet/Zrequesttype",1);
																	this.byId("L8").setVisible(false);
																	this.byId("L8Text").setVisible(false);

																}.bind(this),
																error : function(oError) {
//																	
																	
																	this._handleError(oError);
																}.bind(this)

															});
											
											}else{
												var shText = this.getResourceBundle().getText("pfmf");
												this.getView().setBusy(false);
												MessageBox.error(
														shText, {
															
															title : this.getResourceBundle().getText("Error"),
														});
												
												
											}

										},
										
										
										
					/*				
					 * 
					 * 	Justificaiton Select changes 
					 * 
					 */			
										
										onJustificationSelection:function(oEvent){
											
											
											
											
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
										
										
										
										
										/*// Detail Item on After loading
										onOpenDetailDialItem : function() {

											var fragmentId = this.getView().createId("itemDetail");

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
																	text : "{Ktext}",
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

										},*/

										
										//before opening Dialogue
										
//										onBefDialOpen:function(oEvent){
//											
//											oEvent.getSource().setBusy(true);
//											
//											
//										},
										
										
										// Currency after  Dialogue open Binding

										/*onOpenDialItem : function(oEvent) {

											var fragmentId = this.getView()
													.createId("itemsFragment");

											var valCurr = sap.ui.core.Fragment
													.byId(fragmentId,
															"matrnCurr");
											valCurr
													.bindItems({
														path : "/currencySet",
														template : new sap.ui.core.ListItem(
																{
																	text : "{Waers}",
																	key : "{Waers}",
																	additionalText : "{Landx50}"
																})
													});

											var matrnDesc = sap.ui.core.Fragment
													.byId(fragmentId,
															"matrnDesc");
											matrnDesc
													.bindItems({
														path : "/MAERIALLISTSet",
														template : new sap.ui.core.ListItem(
																{
																	text : "{Maktx}",
																	key : "{Maktx}"

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
																	text : "{Ktext}",
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

										},*/
										
										
										//Item Segmented Button
										
									/*	onMaterialSelect:function(){
											
											var fragmentId = this.getView().createId("itemsFragment");

											
											sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText("Material Description");
											sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(false);											
											sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(false);
											sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(false);
											sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(false);
											sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setValue("");
											sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setValue("");
											sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setValue("");
											sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setValue("");
										},
										onSelectOthers:function(){
											var fragmentId = this.getView().createId("itemsFragment");
											
											sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText("Description");
											sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
//											sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setValue("");
											sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
											
										},
										
										onSelectService:function(){
											var fragmentId = this.getView().createId("itemsFragment");
											
											sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText("Service Description");
											sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(false);
											sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(false);
											sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
											sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
//											sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setValue("");
											sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
											
											
										},
*/										
										onSavePrWorkFlow:function(oEvent){
											
											this.lModel.setProperty("/mainSet/Zrequestsrv","X")
											this.onSavePr();
											
											
											
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
										
										
										
										navIconTab:function(oparm){
											
											this.byId("idIconTabBar").setSelectedKey(oparm)
											
										},
										
										handlePRCrtTab:function(oEvent){
											var arr = ["gnrl","comm","apprls","tc"];
											var oModel = this.getView().getModel();
											var icKey = oEvent.getParameter('selectedKey');
											var sPRnumber;
											if(icKey == "gnrl"){
												
											
											}else if(icKey == "comm"){
												var val = this.intGnrlValidation(icKey);
												if(!val){
													MessageBox.alert(this.sI18Text,{
														onClose:this.navIconTab("gnrl")
														
													})
													
												}
												
												
												
												
											}else if(icKey == "apprls"){
												var val = this.intGnrlValidation(icKey);
												var val1 = this.intDetlsValidation(icKey);
												if(!val){
													MessageBox.alert(this.sI18Text,{
														onClose:this.navIconTab("gnrl")
														
													})
													
												}else if(!val1){
													MessageBox.alert(this.sI18Text,{
														onClose:this.navIconTab("comm")
														
													})
													
													
												}
												
												
											
											}else if(icKey == "tc"){
												
												
												var val = this.intGnrlValidation(icKey);
												var val1 = this.intDetlsValidation(icKey);
												if(!val){
													MessageBox.alert(this.sI18Text,{
														onClose:this.navIconTab("gnrl")
														
													})
													
												}else if(!val1){
													MessageBox.alert(this.sI18Text,{
														onClose:this.navIconTab("comm")
														
													})
													
													
												}
												
												
											}
											
											
											
										},
										
										

										onRequestType : function(oEvent) {
											
											var oSelectedIndex;
											var from = false;
											try{
												oSelectedIndex = 	oEvent.getParameter("selectedIndex");
											}catch(oEr){
												oSelectedIndex = oEvent;
												from = true
											}
											
//											var oSelectedIndex = oEvent.getSource().getSelectedIndex();
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
//												this.byId("idUJC").removeAllSelectedItems();
												
											} else {
												this.byId("apprls").setVisible(true);
												this.byId("idUVR").setVisible(true);
												this.byId("idUVRS").setVisible(true);
											/*	this.byId("idUPM").setVisible(true);
												this.byId("idUPMC1").setVisible(true);
												this.byId("idUPMC2").setVisible(true);*/
												this.byId("idUJ").setVisible(true);
												this.byId("idUJC").setVisible(true);
												this.byId("idCTV1").setVisible(true);
//												this.byId("L8").setVisible(true);

											}
										}

									// closing for adding vendor for
									// comparison

									});

				}, /* bExport= */true);
