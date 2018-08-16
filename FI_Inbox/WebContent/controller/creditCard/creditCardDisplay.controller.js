sap.ui.define([
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/ui/model/Filter',
		"z_inbox/model/formatter" 
	], function(Controller, History, Device, MessageBox, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("z_inbox.controller.creditCard.creditCardDisplay",{
			
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
				this.getOwnerComponent().getRouter().getRoute("CreditCard").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this.getOwnerComponent().getModel("fiService").refresh();
				this.getView().setModel(this.getView().getModel("fiService"));
				this._sWorkItemId= oEvent.getParameter("arguments").instId;
				this._ccCard      = oEvent.getParameter("arguments").id ;
				this._sId = "/CreditHeaderSet('"+  oEvent.getParameter("arguments").id +  "')";
				this.getView().bindElement(this._sId);
				this.getOwnerComponent().getModel().refresh();
				var sCreditCardNumber = this._ccCard;
				this._DocList(sCreditCardNumber);
			},
							
			onAfterRendering : function() {
				this.getView().getModel().refresh();
			},
			
			_DocList: function(sPettyCashNumber) {
				var oElement = this.getView().byId("idCreditCardDoc");
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
				var Level5Text     = this.getView().byId("l5approve").setText(this.getResourceBundle().getText("Finance"));
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
				
				eFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '6') );
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
				
				var level1 = this.getView().byId("l1usr_List").getSelectedKey();
				var level2 = this.getView().byId("l2usr_List").getSelectedKey();
				var level3 = this.getView().byId("l3usr_List").getSelectedKey();
				var level4 = this.getView().byId("l4usr_List").getSelectedKey();
				var level5 = this.getView().byId("l5usr_List").getSelectedKey();
				
				var approver         = {};
				approver.Wiid        = this._sWorkItemId;
				approver.Level1      = level1;
				approver.Level2      = level2;
				approver.Level3      = level3;
				approver.Level4      = level4;
				approver.Level5      = level5;
//				approver.navigwitowiuser = [];
				var that = this;
				var oModel = this.getOwnerComponent().getModel("fiService");
				oModel.create("/wfmgtuserselectSet", approver,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						that.pressDialog.close();
						var msg = that.getResourceBundle().getText("ApproveSuccess");
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh()
						that.getOwnerComponent().getRouter().navTo("welcome",true);
						
					},
					error:function(oData){
						that.pressDialog.close();
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
				
				
			},
			
			handleEdit: function (oEvent) {
				var sWiId          = this._sWorkItemId;
				var sBindingCntxt  = oEvent.getSource().getBindingContext();
				var sPostingNumber = this._ccCard;
				this.getOwnerComponent().getRouter().navTo("CreditCardEdit", {id: sPostingNumber, instId:sWiId },	!Device.system.phone);
			},
			
			handleCCPrint: function (oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPath           = sBindingContext.sPath;
				var sPostingNumber  = sBindingContext.getModel().getData(sPath).Postingnumber;
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='CC',appno='" +sPostingNumber+"',lang='"+lang+"',ndavalue='')/$value";
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
				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText("Reject"),
					type: 'Message',
					content: [
						new sap.m.Label({ text: this.getResourceBundle().getText("RejectConformation"), labelFor: 'submitDialogTextarea2'}),
						new sap.m.TextArea('submitDialogTextarea2', {
							liveChange: function(oEvent) {
								var sText = oEvent.getParameter('value');
								var parent = oEvent.getSource().getParent();

								parent.getBeginButton().setEnabled(sText.length > 0);
							},
							width: '100%',
							placeholder: this.getResourceBundle().getText("MandatoryNote")
						})
					],
					beginButton: new sap.m.Button({
						text: this.getResourceBundle().getText("Submit"),
						enabled: false,
						press: function () {
							var sText = sap.ui.getCore().byId('submitDialogTextarea2').getValue();
							that._onPRReject(sText, that);
							dialog.close();
						}
					}),
					endButton: new sap.m.Button({
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
						that.getView().getModel().refresh();
//						MessageBox.success("PR has been Rejected", {title : "Success"});
						that.getOwnerComponent().getRouter().navTo("welcome");
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