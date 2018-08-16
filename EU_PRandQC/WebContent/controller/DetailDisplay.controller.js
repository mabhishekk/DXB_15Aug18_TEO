sap.ui.define([ 
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/routing/History",
	"sap/ui/Device", 
	'sap/m/MessageBox',
	"providentia/pr/model/formatter"
	], function(Controller, History, Device, MessageBox, formatter) {
		"use strict";

		return Controller.extend("providentia.pr.controller.DetailDisplay",{
			formatter: formatter,
			onInit : function() {
				this.getOwnerComponent().getRouter().getRoute("orderQuotations").attachPatternMatched(this._onRouteMatched,this);
			},
			_onRouteMatched : function(oEvent) {
				var sId = oEvent.getParameter("arguments").id;
				var sPath = "/EBAN_DATASet('" + sId + "')";
				this.getView().byId("idPRgeneralDisplayForm").bindElement(sPath);
//				this.getView().byId("idPRDeatilDisplay").setTitle("Purchase Requisition No.:"  + sPath);
			},
			onSelectionChange : function(oEvent) {
				var sProductId = oEvent.getSource().getBindingContext().getProperty("productId");
				this.getOwnerComponent().getRouter().navTo("productDetails",{
					orderId : this._orderId,
					productId : sProductId
				});
			},
			
			procMethodSS:function(oValue){
				
			if(oValue){
				if(oValue.indexOf("1") != -1){
					return true;
					
					
				}
			}	
			},
			procMethodAgency:function(oValue){
				
				if(oValue){
				if(oValue.indexOf("2") != -1){
					return true;
					
					
				}
				}
				
			},
			
			
			
			onNavBack : function() {
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
			},

			onOthers : function(oEvent) {
				var oSelected = oEvent.getSource().getSelected();
				if (oSelected == true) {
					this.byId("L8").setVisible(true);
				} else {
					this.byId("L8").setVisible(false);
				}
			},

//			onRequestType : function(oEvent) {
//				var oSelectedIndex = oEvent.getSource().getSelectedIndex();
//				if (oSelectedIndex === 1) {
//					this.byId("idApproval").setVisible(false);
//					this.byId("idUVR").setVisible(false);
//					this.byId("idUVRS").setVisible(false);
//					this.byId("idUPM").setVisible(false);
//					this.byId("idUPMC1").setVisible(false);
//					this.byId("idUPMC2").setVisible(false);
//					this.byId("idUJ").setVisible(false);
//					this.byId("idUJC").setVisible(false);
//					/*
//					 * this.byId("idUJ1").setVisible(false);
//					 * this.byId("idUJ2").setVisible(false);
//					 * this.byId("idUJ3").setVisible(false);
//					 * this.byId("idUJ4").setVisible(false);
//					 * this.byId("idUJ5").setVisible(false);
//					 * this.byId("idUJ6").setVisible(false);
//					 */
//					this.byId("idCTV").setVisible(false);
//					this.byId("idCTV1").setVisible(false);
//					this.byId("idCTV2").setVisible(false);
//					this.byId("idCDV").setVisible(false);
//					this.byId("idCDV1").setVisible(false);
//					this.byId("idCDV2").setVisible(false);
//				} else {
//					this.byId("idApproval").setVisible(true);
//					this.byId("idUVR").setVisible(true);
//					this.byId("idUVRS").setVisible(true);
//					this.byId("idUPM").setVisible(true);
//					this.byId("idUPMC1").setVisible(true);
//					this.byId("idUPMC2").setVisible(true);
//					this.byId("idUJ").setVisible(true);
//					this.byId("idUJC").setVisible(true);
//					/*
//					 * this.byId("idUJ1").setVisible(true);
//					 * this.byId("idUJ2").setVisible(true);
//					 * this.byId("idUJ3").setVisible(true);
//					 * this.byId("idUJ4").setVisible(true);
//					 * this.byId("idUJ5").setVisible(true);
//					 * this.byId("idUJ6").setVisible(true);
//					 */
//					this.byId("idCTV").setVisible(true);
//					this.byId("idCTV1").setVisible(true);
//					this.byId("idCTV2").setVisible(true);
//					this.byId("idCDV").setVisible(true);
//					this.byId("idCDV1").setVisible(true);
//					this.byId("idCDV2").setVisible(true);
//				}
//			},
			onPRaddPress : function(oEvent) {
				if (!this.pressDialog) {
					this.pressDialog = sap.ui.xmlfragment("providentia.pr.view.fragments.PRCommercial",this);
					// to get access to the global
					// model
					this.getView().addDependent(this.pressDialog);
				}
				this.pressDialog.open();
			},
			onPRCDialogueClose : function(oEvent) {
				oEvent.getSource().getParent().close();
			},
			onPressRecommend : function() {
				this.getView().byId("slctd_vendor").setVisible(true);
				sap.m.MessageToast.show("ABC Corp has been selected");

			},

			onVendorInformaiton : function(oEvent) {
				if (!this._oInfoVendorPopover) {
					this._oInfoVendorPopover = sap.ui.xmlfragment("com.providentia.pr.routingApp.view.vendorDetail_popover",this);
					this.getView().addDependent(this._oInfoVendorPopover);
					this._oInfoVendorPopover.openBy(oEvent.getSource())
					// this._oPopover.bindElement("/ProductCollection/0");
				}
				this._oInfoVendorPopover.openBy(oEvent.getSource())
	
			},
			
			onGeneralNext : function(oEvent) {
				alert("Hello");
			},
			onRecOthersReason : function() {
	
				sap.ui.getCore().byId("r_Others").setVisible(true);
	
			},
			onRAmendContract : function(oEvent) {
				var oSwitch = oEvent.getSource();
				var vState = oSwitch.getState();
				var rPanel = this.getView().byId('id_RAContract');

				if (vState) {
					rPanel.setExpanded(true);
				} else {
					rPanel.setExpanded(false);
				}
			},

			onRAmendService : function(oEvent) {
				var oSwitch = oEvent.getSource();
				var vState = oSwitch.getState();
				var rPanel = this.getView().byId('id_RAService');

				if (vState) {
					rPanel.setExpanded(true);
				} else {
					rPanel.setExpanded(false);
				}
			},

			onOContract : function(oEvent) {
				var oSwitch = oEvent.getSource();
				var vState = oSwitch.getState();
				var rPanel = this.getView().byId('id_oContract');

				if (vState) {
					rPanel.setExpanded(true);
				} else {
					rPanel.setExpanded(false);
				}
			},

			onORTermination_can : function(oEvent) {
				var oSwitch = oEvent.getSource();
				var vState = oSwitch.getState();
				var rPanel = this.getView().byId('id_ORTermination_can');

				if (vState) {
					rPanel.setExpanded(true);
				} else {
					rPanel.setExpanded(false);
				}
			},

			onRAmendContract_can : function(oEvent) {
				var oSwitch = oEvent.getSource();
				var vState = oSwitch.getState();
				var rPanel = this.getView().byId('id_RAContract_can');

				if (vState) {
					rPanel.setExpanded(true);
				} else {
					rPanel.setExpanded(false);
				}

			},

			// onDialogueClose:function(oEvent){
			//			
			// this._qrVendorSelect.close();
			//			
			// },
			onVendorSearch : function(oEvent) {
				var searchTerm = oEvent.getParameter('value');
			},

			onToggleSetting : function() {
				var sGrid = sap.ui.getCore().byId("id_qrReq_grid");
				if (sGrid.getVisible())
					sGrid.setVisible(false)
				else
					sGrid.setVisible(true)
			},

			onVndrDscen : function() {
				alert("Descending");
			},

			onVndrascen : function() {
				alert("Ascending");
			},

			onQRSelectVendor : function(oEvent) {
				if (!this._qrVendorSelect) {
					this._qrVendorSelect = sap.ui.xmlfragment("com.providentia.pr.routingApp.view.qrVendorSelection",this);
					this.getView().addDependent(this._qrVendorSelect);
					this._qrVendorSelect.open();
					// this._oPopover.bindElement("/ProductCollection/0");
				}
				this._qrVendorSelect.open();
			},
			onSelectionChange : function(oEvent) {
				var oList = oEvent.getParameters('listItem');
				oList.get

			},

			onNavBack : function() {
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
			},
			onExternalVendor : function(oEvent) {
				if (!this._oVendorPopover) {
					this._oVendorPopover = sap.ui.xmlfragment("com.providentia.pr.routingApp.view.externalVendor",this);
					this.getView().addDependent(this._oVendorPopover);
					this._oVendorPopover.openBy(oEvent.getSource())
					// this._oPopover.bindElement("/ProductCollection/0");
				}
				this._oVendorPopover.openBy(oEvent.getSource())
			},
			onVendorRecomendClose : function() {
				this._oConfirmPopover.close();
				this.onPressRecommend();
			},

			onRecommend : function(oEvent) {
				if (!this._oConfirmPopover) {
					this._oConfirmPopover = sap.ui.xmlfragment("com.providentia.pr.routingApp.view.confirmDialog",this);
					this.getView().addDependent(this._oConfirmPopover);
					this._oConfirmPopover.open();
					// this._oPopover.bindElement("/ProductCollection/0");
				}
				this._oConfirmPopover.open();
			},

			onSubmitCompareQtn : function() {
				sap.m.MessageToast.show("Vendor ");
			},

			// closing for adding vendor for
			// comparison
			onVendorDialogueClose : function(oEvent) {
				var that = this;
				MessageBox.confirm("Are you sure you want to leave this page",{
					actions : [
							sap.m.MessageBox.Action.OK,
							sap.m.MessageBox.Action.CANCEL ],
					onClose : function(
							oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that._oAddVendorPopover.close();
						}
					}
				});

				// this._oAddVendorPopover.close();

			},
			handleaddButtonPressed : function(
					oEvent) {
				if (!this._oAddVendorPopover) {
					this._oAddVendorPopover = sap.ui
							.xmlfragment(
									"com.providentia.pr.routingApp.view.addVComparision",
									this);
					this
							.getView()
							.addDependent(
									this._oAddVendorPopover);
					this._oAddVendorPopover.open();
					// this._oPopover.bindElement("/ProductCollection/0");
				}
				this._oAddVendorPopover.open();

			},

			handleDelete : function() {

				sap.m.MessageToast
						.show("Vendor Deleted from selection List ");

			},
			onAddTerms : function(oEvent) {

				var panel = oEvent.getSource()
						.getParent().getParent();

				panel
						.addContent(

						new sap.m.Input(
								{
									width : "100%",
									placeholder : "Description"
								})
								);

			},

			onRemoveTerms : function(oEvent) {
				var panel = oEvent.getSource()
						.getParent().getParent();

				panel.removeContent(0);
			},
			onRFOthers : function(oEvent) {
				var oSelected = oEvent.getSource()
						.getSelected();
				if (oSelected == true) {
					this.byId("LRFO").setVisible(
							true);
				} else {
					this.byId("LRFO").setVisible(
							false);
				}
			},
			
			
			handleAnalytics:function(oEvent){
				if (!this._oDialogGraph) {
					this._oDialogGraph = sap.ui
							.xmlfragment(
									"com.providentia.pr.routingApp.view.graph",
									this);
					this
							.getView()
							.addDependent(
									this._oDialogGraph);
					this._oDialogGraph.open();
					// this._oPopover.bindElement("/ProductCollection/0");
				}
				this._oDialogGraph.open();
				
				
				
				
			},
			
			onGraphDialogueOpen:function(){
			
			if(!this.oVizFrame ){
				
			
				
				this.oVizFrame = sap.ui.getCore().byId("idcolumn");
				var oVizFrame = this.oVizFrame;
				var oModel = new sap.ui.model.json.JSONModel();
				var data = {
						'Population' : [
				            {"Price": "2010","Vendor": "158626687","DiscountValue":"10"},
				            {"Price": "1000","Vendor": "531160986","DiscountValue":"20"},
				            {"Price": "3000","Vendor": "915105168","DiscountValue":"20"},
				            {"Price": "4500","Vendor": "1093786762","DiscountValue":"10"},
				            {"Price": "2014","Vendor": "1274018495","DiscountValue":"50"}
				           ]};
				oModel.setData(data);
				
				
				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					 measures: [{
						name : 'Price',
						value : "{Price}"
					}
						],
					               
						dimensions : [{
						name : 'Vendor',
						value : '{Vendor}'} ],
					             
					data : {
						path : "/Population"
					}
				});		
				oVizFrame.setDataset(oDataset);
				oVizFrame.setModel(oModel);	
				oVizFrame.setVizType('column');
				
				oVizFrame.setVizProperties({
		            plotArea: {
		            	colorPalette : d3.scale.category20().range()
		                },
		                title:{
		                	visible:false
		                }        
				
				});
				
				var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				      'uid': "categoryAxis",
				      'type': "Dimension",
				      'values': ["Vendor"]
				    }), 
				    feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				      'uid': "valueAxis",
				      'type': "Measure",
				      'values': ["Price"]
				    });
				
				oVizFrame.addFeed(feedCategoryAxis);
				oVizFrame.addFeed(feedValueAxis);
//											oVizFrame.addFeed(feedCategoryAxis1);
				
			}
		},
		handleIconTabBarSelect: function(oEvent) {
			var sKey =  oEvent.getParameters().key;
			if (sKey === "PR_IT_02"){
				alert("Load");
			}
		},
		onRequesterHelp: function(oEvent) {
			alert("Help Pressed");
		},
		
		onAfterRendering: function() {
			this.getView().byId("idRequester").bindItems({
				path: "/USERLISTSet",
				template: new sap.ui.core.ListItem({
			    	text: "{Bname}",
			    	additionalText : "{NameLast}",
			    	key: "{Bname}"
			    }),
			    growingThreshold: 500
			});
			/*this.getView().byId("idDeptProject").bindItems({
				path: "/DEPARTMENTSet",
				template: new sap.ui.core.ListItem({
			    	text: "{Department}",
			    	additionalText : "{Dpflag}",
			    	key : "{Deptid}",
			    })
			});
			this.getView().byId("idPRGtotalValue").bindItems({
				path: "/currencySet",
				template: new sap.ui.core.ListItem({
			    	text: "{Waers}",
			    	sorter: { path: 'Waers' },
			    	additionalText : "{Landx50}"
			    })
			});
//			this.getView().byId("idPRGvendorList").bindItems({
//				path: "/VENDORSet",
//				template: new sap.ui.core.ListItem({
//			    	text: "{NameOrg1}"
//			    })
//			});
			this.getView().byId("idPRGDiscountValue").bindItems({
				path: "/currencySet",
				template: new sap.ui.core.ListItem({
			    	text: "{Waers}",
			    	sorter: { path: 'Waers' },
			    	additionalText : "{Landx50}"
			    })
			});*/
//			this.getView().byId("L4").setSelectedIndex("{Zrequesttype}");
			
		 },
		 onPREdit: function(oEvent) {
//			 var sBanfn = oEvent.getSource().getBindingContext().getProperty("Banfn");
			 var sBanfn = this.getView().byId("idPRgeneralDisplayForm").getBindingContext().getProperty("Banfn");
			 this.getOwnerComponent().getRouter()
				.navTo("PRDetailEdit", {id: sBanfn});
			 this.byId("idPRgeneralEditForm").bindElement(sPath);
		 }
							

						});

	}, /* bExport= */true
);
