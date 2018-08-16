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
		'sap/ui/model/Filter',
		"z_manager_inbox/model/formatter" 
	], function(Button, Dialog, Label, MessageToast, Text, TextArea, 
			Controller, History, Device, MessageBox, Filter,formatter){
		"use strict";
		
		var PageController = Controller.extend("z_manager_inbox.controller.expenseClaimDisplay",{
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
				this.getOwnerComponent().getRouter().getRoute("ExpenseClaim").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this.getView().setModel(this.getView().getModel("fiService"));
				this._sWorkItemId= oEvent.getParameter("arguments").instId;
				this.instId      = oEvent.getParameter("arguments").instId;
				this._postingId  = oEvent.getParameter("arguments").id;
				this._sId = "/claimHeaderSet('"+  oEvent.getParameter("arguments").id +  "')";
				this.getView().bindElement(this._sId);
				this.getOwnerComponent().getModel().refresh();
				
				var sPettyCashNumber = this._postingId;
				this._DocList(sPettyCashNumber);
			},
							
			onAfterRendering : function() {
				this.getView().getModel().refresh();
			},
			
			_DocList: function(sPettyCashNumber) {
				var oElement = this.getView().byId("idExpenseClaimDoc");
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
			
			handleECprint: function (oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPath           = sBindingContext.sPath;
				var sPostingNumber  = sBindingContext.getModel().getData(sPath).Postingnumber;
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='EC',appno='" +sPostingNumber+"',lang='"+lang+"',ndavalue='')/$value";
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
			
			//Handle Approve 	
			onECApprove: function(oEvent) {
				if (!this.apprDialog) {
					this.apprDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Success"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("approveConformation")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("PCYes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
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
			//Approve 
			_apprvYes:function(oEvent){
				var that = this;											
				var sPath = "/WF_UIAPPROVALSet(WiAagent='',Wiid='"+this.instId+"',Decision='Y')"											
				this.getOwnerComponent().getModel().read(sPath,{
					success:function(oData){
						var msg    = that.getResourceBundle().getText("SuccessPrint");
						var sPrint = that.getResourceBundle().getText("Print")
						jQuery.sap.require("sap.m.MessageBox");
						MessageBox.success(msg,{
							actions: [sPrint, sap.m.MessageBox.Action.CLOSE],
							onClose: function(sAction) {
								if(sAction === sPrint){
									var lang            = sap.ui.getCore().getConfiguration().getLanguage();
									var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='EC',appno='" +that._postingId+"',lang='"+lang+"',ndavalue='')/$value";
									window.open(sPrintPath,true); 
									that.getOwnerComponent().getModel().refresh()
									that.getOwnerComponent().getRouter().navTo("welcome",true);
								}else{
									that.getOwnerComponent().getModel().refresh()
									that.getOwnerComponent().getRouter().navTo("welcome",true);
								}
							}
						});
//						that.getOwnerComponent().getModel().refresh()
//						that.getOwnerComponent().getRouter().navTo("welcome",true);
					}.bind(this),
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(emsg	);
					}
				});
			},	
			
			onECReject: function () {
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
//						MessageBox.success("PR has been Rejected", {title : "Success"});
						that.getRouter().navTo("welcome");
					}.bind(this),
					urlParameters:{
						"$filter":oFilter
					}
				});
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