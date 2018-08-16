sap.ui.define([ 
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Label',
		'sap/m/MessageToast',
		'sap/m/Text',
		'sap/m/TextArea',
		"z_manager_inbox/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		"z_manager_inbox/model/formatter" 
	],function(Button, Dialog, Label, MessageToast, Text, TextArea, 
			Controller, History, Device, MessageBox, formatter) {
		return Controller.extend("z_manager_inbox.controller.QR",{
			formatter: formatter,
			onInit: function() {
				
				this.lModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.lModel);
				this.getOwnerComponent().getRouter().getRoute("QR").attachPatternMatched(this._onRouteMatched,this);
			},
			
			_onRouteMatched:function(oEvent){
				
				try{
					this.sId= oEvent.getParameter("arguments").id;
					this.instId= oEvent.getParameter("arguments").instId;
					}catch(oEr){
						this.sId  ;	
						
					}
				
				this.sPath = "/qrheaderSet('" + this.sId + "')";
				var that = this;
				var oMdl = this.getOwnerComponent().getModel();
				oMdl.read(this.sPath,
								{
									success : function(oData) {
										that.lModel.setData(oData); 
										that.PRNO = oData.PreqNo;
										that.lModel.setProperty("/Banfn",that.sId);
										
		//																	that.getView().setTitle();
									},
									error:function(oError){
										
									
									},
									urlParameters : {
											"$expand":"navigtoqrsplapproval,navigprtoqrfinal,qrnavig"
		
									}
									});
				
				
				//Documents Get Request
				var fltr = "Prno  eq '"+this.sId+"' and PreqItem eq ''";
				 var that = this;
				 oMdl.read("/filelistSet",{success:function(oData){
		//		     var files = this.lModel.getProperty("/navigqrtodocuments")||[];
					 this.lModel.setProperty("/navigqrtodocuments",oData.results);
				}.bind(this),error:function(oError){
					
				},
				urlParameters:{
					"$filter":fltr
					
				}
					
				})	
				
				
		//											this.byId('vendor_lst').bindElement()
				
			},
			
		//										handleApprove: function(oEvent) {
		//											if (!this.pressDialog) {
		//												this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
		//														"z_mgmt_inbox.view.fragments.Approve",
		//														this);												
		//												this.getView().addDependent(this.pressDialog);
		//												this.pressDialog.setModel(this.getOwnerComponent().getModel())
		//											}
		//											this.pressDialog.open();				
		//										},
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
			
			
			
		//										Delete Documents
			onDeleteDocItem:function(oEvent){
				this.getView().setBusy(true);			
				var navPath = this.sdelPath.slice(0,-1)
				var docItemPath = this.sdelPath[this.sdelPath.length-1]
				var dMdl =  this.getOwnerComponent().getModel();		
				
				var fltr = "Prno  eq '"+this.fdelObj.Prno+"' and PreqItem eq '"+this.fdelObj.PreqItem+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
				 var that = this;
				dMdl.read("/filelistSet",{success:function(oData){					
		//												var dItems = this.lModel.getProperty(navPath);									
		//												dItems.splice(parseInt(docItemPath),1);
					this.lModel.setProperty("/navigqrtodocuments",oData.results);
					this.getView().setBusy(false);				
				}.bind(this),error:function(oError){										
					this.getView().setBusy(false);
				}.bind(this),
				urlParameters:{
					"$filter":fltr
				}
			})
		},
											
		onApproveClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
											
											
		_CancelYes: function(sText, that) {
												
			var sPath = "/WF_UIAPPROVALSet";
			var oFilter = "WiAagent eq '' and Wiid eq '"+this.instId+"'and Decision eq 'R' and Rejectionreason eq '"+sText+"'";
			that.getOwnerComponent().getModel().read(sPath,{
				success:function(oData){
					that.getView().getModel().refresh();
			//				MessageBox.success("PR has been Rejected", {title : "Success"});
			that.getRouter().navTo("welcome");
			}.bind(this),
			urlParameters:{
				"$filter":oFilter
				}
			});
			
		},
										
				_apprvYes:function(oEvent){
					
					var that = this;											
					var sPath = "/WF_UIAPPROVALSet(WiAagent='',Wiid='"+this.instId+"',Decision='Y')"											
					this.getOwnerComponent().getModel().read(sPath,{
						success:function(oData){
							var msg = that.getResourceBundle().getText("Success");
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.getOwnerComponent().getModel().refresh()
					that.getOwnerComponent().getRouter().navTo("welcome",true);
					}.bind(this),
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.error(emsg	);
					
				}
			});
		},						
								
								
		handleReject : function(oEvent) {
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
						that._CancelYes(sText, that);
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
			
			
			
			handleApprove: function(oEvent) {
				
				if (!this.apprDialog) {
					this.apprDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Success"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("ApproveManagerSuccess")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("PCYes"),
									type : "Accept",
									press : function() {
		//																	sap.m.MessageToast.show("Submitted");
										this.apprDialog.close();
										this._apprvYes(oEvent);
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
			
		//Print QC for QR 
			onPrintQR:function(oEvent){
				var lang       = sap.ui.getCore().getConfiguration().getLanguage();
				sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='QC',appno='" +this.PRNO+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true);
			},
		
			
			
			handleApproveSave : function(oEvent) {
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
				approver.Level5      = level5;
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
			},
			
			onPRnumber: function(oEvent){
	        	var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath;
				sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRR',appno='" +this.PRNO+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true);
	        },
})})