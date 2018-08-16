sap.ui.controller("z_pettycash_fi.controller.welcome",{

	/**
	 * Called when a controller is instantiated and its View
	 * controls (if available) are already created. Can be used
	 * to modify the View before it is displayed, to bind event
	 * handlers and do other one-time initialization.
	 * 
	 * @memberOf z_pr.app
	 */
	onInit : function() {

		this.lModel = new sap.ui.model.json.JSONModel();
		var tbl = this.getView().byId("id_expTbl");
		tbl.setModel(this.lModel);
		var tbData = {
			"cashtoitems" : [
				
			]
		};
		this.lModel.setData(tbData);
	},
	
	onBeforeShow: function() {
		sap.ui.getCore().byId("ccDP").setSelectedKey('');
		sap.ui.getCore().byId("usr_List").setValue('');
		sap.ui.getCore().byId("eAmnt").setValue('');
		sap.ui.getCore().byId("curr").setValue('');
		sap.ui.getCore().byId("dtPick").setDateValue(new Date());
	},
	
	onAfterRendering : function() {
		var cmCC = this.getView().byId("ccDP");
		var aFilters = [];

		var lang = sap.ui.getCore().getConfiguration()
				.getLanguage();
		aFilters.push(new sap.ui.model.Filter("Spras",
				sap.ui.model.FilterOperator.EQ, lang));

		cmCC.bindItems("/costcentrelistSet?$filter=Spras eq '"+lang+"'",
				new sap.ui.core.ListItem({
					key : "{Kostl}",
					text : "{Ktext}",
					additionalText : "{Kostl}"
				}));
	},

	onPCitemsSave : function(oEvent) {

		var tablObj = {};

		tablObj.Glaccount = sap.ui.getCore().byId("id_expSet").getSelectedKey();
		tablObj.Positiontext = sap.ui.getCore().byId("id_desc").getValue();
		tablObj.Matnr = sap.ui.getCore().byId("id_eiRno").getValue();
		tablObj.Ppayments = sap.ui.getCore().byId("id_enAmnt").getValue();

		var lTbl = this.lModel.getProperty("/cashtoitems");
		lTbl.push(tablObj);
		this.lModel.setProperty("/cashtoitems", lTbl);
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

	onShowPR : function() {
		this.getOwnerComponent().getRouter().navTo("master");
	},

	onVendorTypeSelection : function(oEvent) {
		var oSelectedIndex = oEvent.getSource()
				.getSelectedIndex();
		if (oSelectedIndex === 1) {
			this.byId("VR_GeneralInformation").setVisible(false);
			this.byId("VR_LicenseDetail").setVisible(false);
			this.byId("VR_Freelancer").setVisible(true);
		} else {
			this.byId("VR_GeneralInformation").setVisible(true);
			this.byId("VR_LicenseDetail").setVisible(true);
			this.byId("VR_Freelancer").setVisible(false);
		}
	},

	handlePCaddButtonPressed : function(oEvent) {
		if (!this.pressDialog) {
			this.pressDialog = sap.ui.xmlfragment(
					"z_pettycash_fi.view.fragment.PCitems",
					this);
			// to get access to the global
			// model
			this.getView().addDependent(this.pressDialog);
		}
		this.pressDialog.open();
	},

	onPCitemsClose : function(oEvent) {
		oEvent.getSource().getParent().close();
	},

	handlePCsave : function(oEvent) {
//						this.getModel().submitChanges();
//						var msg = 'Saved';
		var that= this;
		var temObj = {};
		temObj.Kostl = 	this.getView().byId("ccDP").getSelectedKey()	;
		temObj.Accountant = 	this.getView().byId("usr_List").getValue();
//						temObj.PostingDate = 	this.getView().byId("ccDP");
		temObj.Hnetamount = 	this.getView().byId("eAmnt").getValue();
		temObj.Currency = 	this.getView().byId("curr").getValue();
		temObj.Postingdate = 	this.getView().byId("dtPick").getDateValue();
		temObj.cashtoitems = this.lModel.getProperty("/cashtoitems");
		
		var oModel = this.getOwnerComponent().getModel();
		oModel.create("/pcashheaderSet",temObj,{
			
			success:function(oData){
				var sPostingNumber = oData.Postingnumber;
				var msg = "Posting Number : " + sPostingNumber;
				sap.m.MessageToast.show(msg);
//				that.lModel.setData("");
				that.getOwnerComponent().getModel().refresh()
				that.getOwnerComponent().getRouter().navTo("pettyCashDetailsDisplay", {sId: sPostingNumber},true);
				
			},
			error:function(oData){
				var emsg= $(oData.responseText).find("message").first().text();
				var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.error(emsg	);
				debugger;	
				
			}
			
		})
		
		
//		sap.m.MessageToast.show(msg);
	},

	handlePCsaveAndSubmit : function(oEvent) {
		if (!this.IagreeDialog) {
			this.IagreeDialog = new sap.m.Dialog(
					{
						title : 'Aggrement',
						type : 'Message',
						draggable : true,
						content : new sap.m.Text(
								{
									text : "The above expenses have been incurred in the course of TEO’s business. No other claim in respect of the above is being or will be made to TEO, either by myself or by any other person."
								}),
						beginButton : new sap.m.Button({
							text : "I Agree",
							type : "Accept",
							press : function() {
								sap.m.MessageToast
										.show("Submitted");
								this.IagreeDialog.close();
							}.bind(this)
						}),
						endButton : new sap.m.Button({
							text : 'Cancel',
							type : "Reject",
							press : function() {
								this.IagreeDialog.close();
							}.bind(this)
						})
					});

			// to get access to the global model
			this.getView().addDependent(this.IagreeDialog);
		}

		this.IagreeDialog.open();
	},

	handlePCCancel : function(oEvent) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.confirm(
				"Are you sure you want to Cancel?", {
					icon : sap.m.MessageBox.Icon.WARNING,
					title : "Cancel",
				});
	},

});