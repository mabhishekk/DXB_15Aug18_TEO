sap.ui.define([ 
		"z_inbox/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_inbox/model/formatter",
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/Button'
  ], function(Controller, History, Device, MessageBox, formatter, Dialog, Text, Button) {
	return Controller.extend("z_inbox.controller.displayPRcycle.quotationComparision",{

		onInit: function() {
			
//			if (!jQuery.support.touch) {
//				this.getView().addStyleClass(
//						"sapUiSizeCompact");
//			}
			this.getOwnerComponent().getRouter().getRoute("QRdisplay").attachPatternMatched(this._onRouteMatched,this);
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel,"lModel");
//			lModel.setData(tempData);
			this.comTbl = this.byId("tbl_Url");
			
		},


		_onRouteMatched:function(oEvent){
			
//			this.sId = oEvent.getParameter("arguments").id;
			this.getView().setBusy(true);
			try{
				this.sId= oEvent.getParameter("arguments").id;
				}catch(oEr){
					this.sId  ;	
					
				}
			
//			this.byId("QCPage").setTitle(this.sId);
			var iconTab = this.byId("id_iconTB");
			iconTab.setSelectedKey("QC");
			var vPath = "/PR_HEADERSet('" + this.sId + "')/prtoqrnavig";
			this.sPath = "/EBAN_DATASet('" + this.sId + "')";
			this.FnlQr = {};
			this.FnlVndr = {};
			var tData = {
				 	"lSet": [
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
				 		]			 	
				 }
			this.lModel.setData(tData);
			this.lModel.setProperty("/Banfn",this.sId);
						
			var sPath = "/EBAN_DATASet('" + this.sId + "')/navigtoitems";
			var that = this;
			this.byId("idPR_IT_03").bindAggregation("content",{
				path:vPath,
				factory:function(sId, oContext){
					var oBndl = this.getResourceBundle();
					var oGrid = new sap.ui.layout.Grid({
						vSpacing :0,
						defaultSpan:"L5 M5 S12",
						content:[
							new sap.m.Text({text:oBndl.getText("Quotationno")}),
							new sap.m.Text({text:oContext.getObject().Ebeln}),
							new sap.m.Text({text:oBndl.getText("vendor")}),
							new sap.m.Text({text:oContext.getObject().Vendorname})]
					}).addStyleClass("sapUiSmallMarginTop");
					
					var Hbx = new sap.m.HBox({
						
						items:[new sap.m.CheckBox({
							selected:{
						          parts: [{path: 'Fixpo'}],
						            formatter: function(oValue) {
						              if(oValue === 'X') {
						                return true;
						              }
						              else {
						                return false;
						              }
						            }
						          },
				            editable: false,
							select:[this.SelectQR, this]
						}),oGrid],
						alignItems:"Center"
					});
					
					
					
				
					 var oTable = new sap.ui.table.Table({
						    visibleRowCount: 3,
						    SelectionBehavior:"Row",
						    columns:[
						    	 new sap.ui.table.Column({
								        label: oBndl.getText("Description"),
								        template: new sap.m.Text({text:"{ShortText}"})
								    }),
								    new sap.ui.table.Column({
								        label:  oBndl.getText("Quantity"),
								        template: new sap.m.Text({text:"{TargetQty}-{Unit}"})
								    }),
								    new sap.ui.table.Column({
								        label: oBndl.getText("Value"),
								        template: new sap.m.Text({text:"{NetPrice}"})
								    }),
								    new sap.ui.table.Column({
								        label: oBndl.getText("Disvalue"),
								        template: new sap.m.Text({text:"{Discountval} %"})
								    }),
								    new sap.ui.table.Column({
								        label: oBndl.getText("SubTotal"),
								        template: new sap.m.Text({text:"{Subtotal}"})
								    }),
								    new sap.ui.table.Column({
								        label: oBndl.getText("Vval"),
								        template: new sap.m.Text({text:"{Valvalue} %"})
								    }),
//								    new sap.ui.table.Column({
//								        label: oBndl.getText("Disvalue"),
//								        template: new sap.m.Text({text:"{Discountval}"})
//								    }),
								    new sap.ui.table.Column({
								        label: oBndl.getText("NetPrice"),
								        template: new sap.m.Text({text:"{Finaltotal}"})
								    })
								   
						    	
						    ]
						});
					 var sId = oContext.getObject().Ebeln;
					 var vPath = "/qrheaderSet('" + sId + "')/qrnavig"; 
					 oTable.bindRows(vPath)
					
					return new sap.m.VBox({
						items:[Hbx,oTable]
						
					});
				
				}.bind(this)
//				filters:[new sap.ui.model.Filter("Vendor",sap.ui.model.FilterOperator.StartsWith, "0000000000")]
				
			});
			
			this.getView().setBusy(false);
		},
		
		onOpenApprove: function(oEvent) {
			var Level1Approver = this.getView().byId("l1usr_List");
			var Level2Approver = this.getView().byId("l2usr_List");
			var Level3Approver = this.getView().byId("l3usr_List");
			var Level4Approver = this.getView().byId("l4usr_List");
			var Level5Approver = this.getView().byId("l5usr_List");
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
			
			eFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '5') );
			Level5Approver.bindItems({
				path : "/mgtapprovalSet",
				filters: new sap.ui.model.Filter(eFilters, true),
				template : oTemplate
			});
		},
		
		
		
		onRecOthersReason:function(oEvent){
			
			var isSelect = oEvent.getParameter('selected');
			if(isSelect){
				this.getView().byId("qc_Others").setVisible(true);	
				
			}else{
				this.getView().byId("qc_Others").setVisible(false);
				
			}
			
		},
		
		//Final QR's Submit
		onSFnlQR: function(oEvent){
			if (!this.ConfirmDialog) {
				this.ConfirmDialog = new Dialog({
							title     : this.getResourceBundle().getText("Confirm"),
							type      : 'Message',
							state     : 'Warning',
							draggable : true,
							content : new Text({
										text : this.getResourceBundle().getText("submitMsg")
									}),
							beginButton : new Button({
								text : this.getResourceBundle().getText("Yes"),
								type : "Accept",
								press : function() {
									this.ConfirmDialog.close();
									this.getView().setBusy(true);
									this._onSFnlQR(oEvent);
								}.bind(this)
							}),
							endButton : new Button({
								text : this.getResourceBundle().getText("No"),
								type : "Reject",
								press : function() {
									this.ConfirmDialog.close();
								}.bind(this)
							})
						});

				// to get access to the global model
				this.getView().addDependent(this.ConfirmDialog);
			}

			this.ConfirmDialog.open();
		},
		
		SelectQR:function(oEvent){
			
			var isSelectd = oEvent.getParameter("selected");
			this.Ebeln = oEvent.getSource().getBindingContext().getObject().Ebeln;
//			this.FnlQr.push(Ebeln);
			
			if(isSelectd){
			if (!this.qcReasnDialog) {
				
				
				
				this.qcReasnDialog = sap.ui.xmlfragment(this.getView().sId,"providentia.pr.view.fragments.confirmDialog",this); 
				this.getView().addDependent(this.qcReasnDialog);
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.qcReasnDialog);
				this.qcReasnDialog.setModel(this.lModel);
			}	
			try{
				 arFnlObj = this.lModel.getProperty("/fnlObj")||[];
			}catch(e){
				
				arFnlObj = [];
			}
			arFnlObj.push({Ebeln:this.Ebeln,Preqno:this.sId,Fixpo:"X"});
			this.lModel.setProperty("/fnlObj",arFnlObj);
			this.qcReasnDialog.open();
			}else{
				
				var arrFnlObj = this.lModel.getData().fnlObj;
				
				for(var i=0;i<arrFnlObj.length;i++){
					
					if(this.Ebeln == arrFnlObj[i].Ebeln){
						
						arrFnlObj.splice(i,1);
						this.lModel.setProperty("/fnlObj",arrFnlObj);
					}
					
				}
				
				
			}
			
		},
		
		//method for Netprice value calculation at item level
		
		subTotalCalc: function(oEvent){
			

//			var Value         = 
////			var Vatvalue      = 
//			var Vatvalue      = 
//			var Discountvalue = 
//			var Quantity      = 
			var rowCells =  oEvent.getSource().getParent().getCells();
				
			var TargetQty  =  rowCells[1].getValue();//Quantity from Row
			var perUnitPrice = rowCells[3].getValue();//Per Unit Price form Row
			var totalQuanVal = TargetQty * perUnitPrice;
			var discPerc = rowCells[4].getValue();
			var subTotal = totalQuanVal-((discPerc * totalQuanVal)/100);
			rowCells[5].setText(subTotal);
//			var PriceAfterDiscount = Value1 - DiscountedPrice;
			var TotalVatValue = ((subTotal*rowCells[6].getSelectedKey())/100);
			var gTotal = subTotal + TotalVatValue;
			
			rowCells[7].setText(gTotal);
			
			
			//this.getView().byId("matrnNetValue").setValue(Subtotal.toFixed(3));
			
		},
		
		//Open File Download implemented in Quot.Comparision
//		onOpenFile:function(oParm){
//			var obj = oParm.getSource().getBindingContext().getObject();
	//var sUrl = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" + obj.Doknr +"',lang='',ndavalue='"+obj.Serialno+"')/$value"
//			window.open(sUrl,true);
//			
//		},
		
		
		
		
		handleQuotComp:function(oEvent){
			var sKey = oEvent.getParameter("selectedKey");
		},
		
		
		
		onCloseQR:function(oEvent){
			this.qcReasnDialog.close();
		},

		
		onApproveClose:function(oEvent){
			this.qcReset();
		oEvent.getSource().getParent().close();
		
		},
		
		qcReset:function(oEvent){
			this.byId("RB1-1").setSelected(false);
			this.byId("RB1-2").setSelected(false);
			this.byId("RB1-3").setSelected(false);
			this.byId("RB1-4").setSelected(false);
			this.byId("RB1-5").setSelected(false)
			this.byId("RB1-6").setSelected(false)
			this.byId("qc_Others").setValue("");
			
			
		},
		
		dynmTbl:function(dataSet){
			for(i=0;i<dataSet.length-1;i++){
				
			}
			
		},
		
		onPrintQR:function(oEvent){
			var lang        = sap.ui.getCore().getConfiguration().getLanguage();
			var icoTb       = this.byId("quotComp");
			sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='QC',appno='" +this.sId+"',lang='"+lang+"',ndavalue='')/$value";
			window.open(sPrintPath,true);
			
		},
		
		onAfterRendering: function() {

		},
		
		celClick:function(oEvent){
			
		},
		
		handleQCIconTabBar: function(oEvent){
			this.getOwnerComponent().getRouter().navTo("PRdisplay", {id : this.sId, instId : 'Display'});
		}
		
		})
	})
					
