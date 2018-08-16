sap.ui.define([
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/m/Text',
		'sap/m/ObjectIdentifier',
		'sap/ui/model/Filter',
		"z_usergr/model/formatter" 
	], function(Controller, History, Device, MessageBox, Text, ObjectIdentifier, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_usergr.controller.DetailDisplay",{
formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			onInit : function() {
				this.lModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.lModel, "lModel");
				
				this.getOwnerComponent().getRouter().getRoute("goodsReceiptDetailsDisplay").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
//				this.prNumber = this.getOwnerComponent().getComponentData().startupParameters.id[0];
				this._PoNumber = oEvent.getParameter("arguments").sId;
				this._sId      = "/GRHEADDISPSet('"+  oEvent.getParameter("arguments").sId +  "')";
				this.getView().bindElement(this._sId);
				var oMdl = this.getOwnerComponent().getModel();
				oMdl.read(this._sId,{
					urlParameters: {
				        "$expand": "grtoitemdisp"
				    },
					success : function(oData) {
						this.lModel.setData(oData);
						var sMatdocno    = oData.grtoitemdisp.results[0].Matdocno;
						var sDocType     = oData.DocType;
						var sGrAmaount   = oData.grtoitemdisp.results[0].ItemAmount;
						var sCurrency    = oData.grtoitemdisp.results[0].Currency;
						var sAmount      = sGrAmaount + ' ' + sCurrency;
						this.getView().byId('idGrAmt').setText(sAmount);
						this.sDocType    = sDocType;
						this._PrNumber   = oData.Preq_no;
						var sMatdocitem  = oData.grtoitemdisp.results[0].Matdocitem;
						this._SetTableContent(sDocType, sMatdocno, sMatdocitem);
					}.bind(this),
					error : function(oError) {
						console.log(oData);
					}.bind(this)
				});
				this.getOwnerComponent().getModel().refresh();
			},
							
			onAfterRendering: function() {
				
			},
			
			_SetTableContent: function(sDocType, sMatdocno, sMatdocitem){
				if(sDocType === "9"){
					this.getView().byId("id_GR_ServiceItems").setVisible(true);
					this.getView().byId("id_GR_ServiceOrder").setVisible(true);
					this.getView().byId("id_GR_displayItems").setVisible(false);
					this._BindServiceSheetTable(sMatdocno);
					this._BindServiceOrderTable(sMatdocno, sMatdocitem);
				} else {
					this.getView().byId("id_GR_ServiceItems").setVisible(false);
					this.getView().byId("id_GR_ServiceOrder").setVisible(false);
					this.getView().byId("id_GR_displayItems").setVisible(true);
					this._BindMaterialTable(sMatdocno);
				}
			},
			
			_BindServiceSheetTable: function(sMatdocno) {
				var oElement  = this.getView().byId("id_GR_ServiceItems");
				var oTemplate = new sap.m.ColumnListItem({
					cells:[
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{ItemAmount}"}),
						new ObjectIdentifier({ title:"{Costcenter}", text:"{CCDesc}"}),
						new ObjectIdentifier({ title:"{Glaccount}", text:"{GLDesc}"}),
					]
				});
				var aFilters = [];
				aFilters.push( new Filter("Matdocno", "EQ", sMatdocno) );
				oElement.bindItems({
					path : "/GRITEMDISPFINALSet",
					filters: new Filter(aFilters, true),
					template : oTemplate
				});
				
				this._setDate(sMatdocno);
			},			
			
			_BindServiceOrderTable: function(sMatdocno, sMatdocitem) {
				var oElement  = this.getView().byId("id_GR_ServiceOrder");
				var oTemplate = new sap.m.ColumnListItem({
					cells:[
						new Text({ text: "{Grktext1}"}),
						new Text({ text: "{Grossvalue}"}),
						new Text({ text: "{Grpercentage}"}),
						new Text({ text: "{Gruom}"}),
						new Text({ text: "{Currency}"})
					]
				});
				var aFilters = [];
				aFilters.push( new Filter("Pono"  , "EQ", sMatdocno  ));
				aFilters.push( new Filter("Poitem", "EQ", sMatdocitem));
				oElement.bindItems({
					path : "/GRINVSERVICESSet",
					filters: new Filter(aFilters, true),
					template : oTemplate
				});
			},	
			
			_BindMaterialTable: function(sMatdocno) {
				var oElement  = this.getView().byId("id_GR_displayItems");
				var oTemplate = new sap.m.ColumnListItem({
					cells:[
						new Text({ text: "{Matdocitem}"}),
						new Text({ text: "{ShortText}"}),
						new Text({ text: "{Quantity}"}),
						new Text({ text: "{Uom_Text}"}),
						new Text({ text: "{ItemAmount}"}),
						new Text({ text: "{Grqtydelivered}"}),
						new Text({ text: "{Poqtypending}"}),
						new ObjectIdentifier({ title:"{Costcenter}", text:"{CCDesc}"}),
						new ObjectIdentifier({ title:"{Glaccount}", text:"{GLDesc}"}),
					]
				});
				var aFilters = [];
				aFilters.push( new Filter("Matdocno", "EQ", sMatdocno) );
				oElement.bindItems({
					path : "/GRITEMDISPFINALSet",
					filters: new Filter(aFilters, true),
					template : oTemplate
				});
				this._setDate(sMatdocno);
			},
			
			_setDate: function(sMatdocno){
				var oModel = this.getView().getModel();
				var fltr = "Matdocno  eq '"+ sMatdocno +"'";
				var that = this;
				oModel.read("/GRITEMDISPFINALSet",{
					success:function(oData){
						var sDate = oData.results[0].Delvdate;
						var month = sDate.getMonth()+1;
						if(month < 10){
							month = '0' + month;
						}else{
							month = '' + month;
						}
						sDate     = sDate.getDate() + "-" + month + "-" + sDate.getFullYear();
						that.getView().byId('idBussCompDate').setText(sDate);
					}.bind(this),
					error:function(oError){
					},
					urlParameters:{
						"$filter":fltr
					}
				})
			},
			
			onGRselect: function(oEvent){
				debugger;
				var sMatdocno = oEvent.getSource().getSelectedItem().getProperty("text");
				var sDocType  = this.sDocType;
				var GRdata    = this.lModel.getProperty('/grtoitemdisp/results');
				var x, lgth;
				for( x = 0; x < GRdata.length; x++){
					var sDocNo  = GRdata[x].Matdocno
					if (sDocNo === sMatdocno){
						var sMatdocitem = GRdata[x].Matdocitem;
					}
				}
				this._SetTableContent(sDocType, sMatdocno, sMatdocitem);
			},
			
			handleCreate: function(oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPoNumber       = sBindingContext.getModel().getData(sBindingContext.sPath).PoNumber;
				this.getOwnerComponent().getRouter().navTo("goodsReceiptDetailsCreate",{sId: sPoNumber}, true);
			},
			
			handleDelete:  function(oEvent){
				if (!this.DeleteDialog) {
					this.DeleteDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Delete"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("DeleteMsg")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Yes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.DeleteDialog.close();
										this._DeleteYes(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("No"),
									type : "Reject",
									press : function() {
										this.DeleteDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.DeleteDialog);
				}

				this.DeleteDialog.open();
			},
			
			_DeleteYes: function(oEvent){
				var that           = this;
				var temObj         = {};
				var sGrSelected    = this.getView().byId('idGoodsReceiptNo').getSelectedKey()
				
				temObj.PoNumber    = this._PoNumber;
				temObj.Matdocyear  = sGrSelected.substr(sGrSelected.length - 4)
				temObj.Matdocno    = sGrSelected.slice(0,-5);
				temObj.Flag        = "R";
				
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/GRHEADDISPSet", temObj,{
					
					success:function(oData){
						var sMatdocno = oData.Matdocno;
						var msg = that.getResourceBundle().getText("DeleteSuccess", [sMatdocno]);;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
						
					},
					error:function(oData){
						var eMsg = JSON.parse(oData.responseText).error.message.value;
//						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
//						jQuery.sap.require("sap.m.MessageBox");
						MessageBox.error(eMsg);
						debugger;	
					}
				})
			},
			
			
		//Icon tab selection	
			
			handleIconTabBarSelect:function(oEvent){
				var oModel       = this.getView().getModel();
				var icKey        = oEvent.getParameter('selectedKey');
				var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
				if(icKey == "PR"){
					var shlHash = "ZUSER_PR-create&/PR-"+this._PrNumber+"/Edit"
					var hrefForProductDisplay  =  oCrossAppNav.toExternal({
						  target : { shellHash : shlHash }
					}); 
				}else if(icKey == "QR"){
					var shlHash = "ZUSER_PR-create&/PR-"+this._PrNumber+"/quotation"
					var hrefForProductDisplay  =  oCrossAppNav.toExternal({
						  target : { shellHash : shlHash }
					});
				}else if(icKey == "QC"){				
					var shlHash = "ZUSER_PR-create&/PR-"+this._PrNumber+"/quotComparision"
					var hrefForProductDisplay  =  oCrossAppNav.toExternal({
						  target : { shellHash : shlHash }
					});
				}else if(icKey == "PO"){
					var hrefForProductDisplay = oCrossAppNav.toExternal({
						  target : { semanticObject : "zpo_userapp", action : "create" },
						  params : { id: this._PrNumber}
						}); 
				}/*else if(icKey == "GR"){
					var hrefForProductDisplay = oCrossAppNav.toExternal({
						  target : { semanticObject : "z_usergr", action : "create" },
						  params : { id: this.sId}
						});
				}*/else if(icKey == "IN"){
					var hrefForProductDisplay = oCrossAppNav.toExternal({
						  target : { semanticObject : "z_user_invoice", action : "create" },
						  params : { id: this._PoNumber}
						});
				}
			},
			
			handlePrint: function (oEvent) {
				var sMatdocno       = this.getView().byId('idGoodsReceiptNo').getSelectedItem().getProperty("text");
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='GR',appno='" +sMatdocno+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true); 
			},
			
			onNavBack: function(oEvent){
				var sPreviousHash = History.getInstance().getPreviousHash();
				
				//The history contains a previous entry
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					// There is no history!
					// Naviate to master page
					this.getOwnerComponent().getRouter().navTo("master", {}, true);
				}
			}
		// onExit: function() {
		//
		// }
			
		});
		
		return PageController;
});