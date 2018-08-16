sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Label',
		'sap/m/MessageToast',
		'sap/m/Text',
		'sap/m/TextArea',
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/ui/model/Filter',
		"z_inbox/model/formatter" 
	], function(Button, Dialog, Label, MessageToast, Text, TextArea, 
			Controller, History, Device, MessageBox, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_inbox.controller.pettyCash.pettyCashDisplay",{
			formatter : formatter,
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			/**
			 * Called when a controller is instantiated and its View
			 * controls (if available) are already created. Can be used
			 * to modify the View before it is displayed, to bind event
			 * handlers and do other one-time initialization.
			 * 
			 * @memberOf z_pr.app
			 */
			onInit : function() {
				this.getOwnerComponent().getRouter().getRoute("Pettycash").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this.getView().setModel(this.getView().getModel("fiService"));
				this._sWorkItemId= oEvent.getParameter("arguments").instId;
				this._postingId  = oEvent.getParameter("arguments").id;
				this._sId = "/pcashheaderSet('"+  oEvent.getParameter("arguments").id +  "')";
				this.getView().bindElement(this._sId);
				this.getOwnerComponent().getModel().refresh();
				
				var sPettyCashNumber = this._postingId;
				this._DocList(sPettyCashNumber);
			},
							
			onAfterRendering : function() {
//				this.getOwnerComponent().getModel().refresh();
//				var sUserName = this.getView().byId("idPRname");
//				sUserName.bindElement("/loginuserSet('')");
				this.getView().getModel().refresh();
			},
			
			_DocList: function(sPettyCashNumber) {
				var oElement = this.getView().byId("idPettyCashDoc");
				var oTemplate = new sap.m.StandardListItem({
					title: "{Docfile}"
				});
				var aFilter =[];
				aFilter.push(new Filter("Postingnumber", "EQ", sPettyCashNumber) );
				oElement.bindItems({
					path : "/FilelistSet",
					filters: new Filter(aFilter, true),
					template : oTemplate
				});
				
			},
			
		/**
		 * Called when the Controller is destroyed. Use this one to
		 * free resources and finalize activities.
		 * 
		 * @memberOf z_pr.app
		 */
		// onExit: function() {
		//
		// }
			
			handleApprove: function(oEvent) {
				if (!this.pressDialog) {
					this.pressDialog = sap.ui.xmlfragment(this.getView().getId(),
							"z_inbox.view.fragments.Approve",
							this);
					this.getView().addDependent(this.pressDialog);
				}
				this.pressDialog.open();				
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
				level5 = this.getView().byId("l5usr_List").getSelectedKey();
				
				var approver         = {};
				approver.Wiid        = this._sWorkItemId;
				approver.Level1      = level1;
				approver.Level2      = level2;
				approver.Level3      = level3;
				approver.Level4      = level4;
				approver.Level5      = level5;
//				approver.navigwitowiuser = [];
				var oModel = this.getOwnerComponent().getModel("fiService");
				oModel.create("/wfmgtuserselectSet", approver,{
					
					success:function(oData){
						var msg = that.getResourceBundle().getText("ApproveSuccess");
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
						that.getOwnerComponent().getRouter().navTo("welcome",true);
						
					},
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(emsg	);
							
					}
				})
			}else{
				
				sap.m.MessageBox.error(this.getResourceBundle().getText("pfmf"));
			}
			},
			
			handlePCEdit: function (oEvent) {
				var sWiId          = this._sWorkItemId;
				var sPostingNumber = this._postingId;
				this.getOwnerComponent().getRouter()
					.navTo("pettyCashDetailsEdit", 
						{id: sPostingNumber, instId:sWiId },
						!Device.system.phone);
			},
			
			handlePCPrint: function (oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPath           = sBindingContext.sPath;
				var sPostingNumber  = sBindingContext.getModel().getData(sPath).Postingnumber;
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PC',appno='" +sPostingNumber+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true); 
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
					this.getOwnerComponent().getRouter().navTo("master", {},true);
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
				var oFilter = "WiAagent eq '' and Wiid eq '"+this._sWorkItemId+"'and Decision eq 'R' and Rejectionreason eq '"+sText+"'";
				that.getOwnerComponent().getModel().read(sPath,{
					success:function(oData){
						this.getOwnerComponent().getModel().refresh();
//						MessageBox.success("PR has been Rejected", {title : "Success"});
						that.getOwnerComponent().getRouter().navTo("welcome");
					}.bind(this),
					urlParameters:{
						"$filter":oFilter
					}
				});
			},
			
			PRReject : function(oEvent) {
				if (!this.CancelDialog) {
					this.CancelDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Reject"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("RejectMsg")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("PCYes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.CancelDialog.close();
										this._CancelYes(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("PCNo"),
									type : "Reject",
									press : function() {
										this.CancelDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.CancelDialog);
				}

				this.CancelDialog.open();
			},
			
			_CancelYes: function(oEvent) {
				var that             = this;
				var approver         = {};
				approver.Wiid        = this._sWorkItemId;
				approver.Decision    = "N";
				var oModel = this.getOwnerComponent().getModel("fiService");
				oModel.create("/wf_uiapproval", approver,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("RejectSuccess");
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
			
			onDocSelectionChange: function (oEvent) {
				var oBindContext= oEvent.getSource().getSelectedItem().getBindingContext();
				var oModel      = oBindContext.getModel();
				var sPath       = oBindContext.getPath();
				var sDoknr      = oModel.getData(sPath).Doknr;
				var sSerialno   = oModel.getData(sPath).Serialno;
				var sDocPath    = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" +sDoknr+"',lang='',ndavalue='" +sSerialno+ "')/$value ";
				window.open(sDocPath,true); 
			},
		});
		return PageController;
});