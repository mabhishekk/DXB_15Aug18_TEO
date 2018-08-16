sap.ui.controller("z_vrandnda.controller.welcome", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf z_pr.app
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf z_pr.app
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf z_pr.app
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf z_pr.app
*/
//	onExit: function() {
//
//	}
	
	
		
	onShowPR: function () {
		this.getOwnerComponent().getRouter().navTo("master");
	},

	
	onVRcompany: function (oEvent) {
		this.byId("VR_GeneralInformation").setVisible(true);
		this.byId("VR_Address").setVisible(true);
		this.byId("VR_LicenseDetail").setVisible(true);
		this.byId("VR_Freelancer").setVisible(false);
	},
	
	onVRfreelancer: function (oEvent) {
		this.byId("VR_GeneralInformation").setVisible(false);
		this.byId("VR_Address").setVisible(false);
		this.byId("VR_LicenseDetail").setVisible(false);
		this.byId("VR_Freelancer").setVisible(true);
	},
	
	onVRgeneralPanel: function (oEvent) {
//		this.byId("VR_GeneralInformation").setExpanded(true);
//		this.byId("VR_Address").setExpanded(false);
//		this.byId("VR_LicenseDetail").setExpanded(false);
	},
//	
	onVRaddressPanel: function (oEvent) {
//		this.byId("VR_GeneralInformation").setExpanded(false);
//		this.byId("VR_Address").setExpanded(true);
//		this.byId("VR_LicenseDetail").setExpanded(false);
	},
//	
	onVRlicensePanel: function (oEvent) {
//		this.byId("VR_GeneralInformation").setExpanded(false);
//		this.byId("VR_Address").setExpanded(false);
//		this.byId("VR_LicenseDetail").setExpanded(true);
	},
	
	handleNDA: function (oEvent) {
		if (!this.draggableDialog) {
			this.draggableDialog = new sap.m.Dialog({
				title: 'Attach NDA',
				draggable: true,
				content: new sap.ui.unified.FileUploader({
							id:"NDAFileUploader",
							name:"myFileUpload",
							uploadUrl:"upload/",
							tooltip:"Upload your file to the local server",
							uploadComplete:"handleUploadComplete"
						}),
				beginButton: new sap.m.Button({
					text:"Upload File",
					icon:"sap-icon://upload",
					press: function () {
						this.draggableDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						this.draggableDialog.close();
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.draggableDialog);
		}

		this.draggableDialog.open();
	},
	
	
	handleVRsave: function (oEvent) {
		var msg = 'Saved';
		sap.m.MessageToast.show(msg);
	},
	
	handleVRsaveAndSubmit: function (oEvent) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.confirm("Are you sure you want to be a Vendor?",{
			icon: sap.m.MessageBox.Icon.INFORMATION,
			title: "Submit"
		});
	},
	
	handleVRCancel: function (oEvent){
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.confirm("Are you sure you want to Cancel?",{
			icon: sap.m.MessageBox.Icon.WARNING,
			title: "Cancel",
		});
	},
	
	handleLicense: function (oEvent) {
		if (!this.LdraggableDialog) {
			this.LdraggableDialog = new sap.m.Dialog({
				title: 'Attach License Copy',
				draggable: true,
				content: new sap.ui.unified.FileUploader({
							id:"LicenseFileUploader",
							name:"myFileUpload",
							uploadUrl:"upload/",
							tooltip:"Upload your file to the local server",
							uploadComplete:"handleUploadComplete"
						}),
				beginButton: new sap.m.Button({
					text:"Upload File",
					icon:"sap-icon://upload",
					press: function () {
						this.LdraggableDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						this.LdraggableDialog.close();
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.LdraggableDialog);
		}

		this.LdraggableDialog.open();
	},
	
	handleCompanyProfile: function (oEvent) {
		if (!this.CdraggableDialog) {
			this.CdraggableDialog = new sap.m.Dialog({
				title: 'Attach Company Profile',
				draggable: true,
				content: new sap.ui.unified.FileUploader({
							id:"CompanyProfileFileUploader",
							name:"myFileUpload",
							uploadUrl:"upload/",
							tooltip:"Upload your file to the local server",
							uploadComplete:"handleUploadComplete"
						}),
				beginButton: new sap.m.Button({
					text:"Upload File",
					icon:"sap-icon://upload",
					press: function () {
						this.CdraggableDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						this.CdraggableDialog.close();
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.CdraggableDialog);
		}

		this.CdraggableDialog.open();
	},
	
	handleVAT: function (oEvent) {
		if (!this.VdraggableDialog) {
			this.VdraggableDialog = new sap.m.Dialog({
				title: 'Attach VAT Copy',
				resizable: true,
				draggable: true,
				content: new sap.m.Panel({
					content:[
						new sap.ui.unified.FileUploader({
							id:"VATFileUploader",
							name:"myFileUpload",
							uploadUrl:"upload/",
							tooltip:"Upload your file to the local server",
							uploadComplete:"handleUploadComplete"
						})
					]
				}),
				beginButton: new sap.m.Button({
					text:"Upload File",
					icon:"sap-icon://upload",
					press: function () {
						this.VdraggableDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						this.VdraggableDialog.close();
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.VdraggableDialog);
		}

		this.VdraggableDialog.open();
	},
	
	handlePassport: function (oEvent) {
		if (!this.PdraggableDialog) {
			this.PdraggableDialog = new sap.m.Dialog({
				title: 'Attach Passport Copy',
				resizable: true,
				draggable: true,
				content: new sap.m.Panel({
					content:[
						new sap.ui.unified.FileUploader({
							id:"PassportFileUploader",
							name:"myFileUpload",
							uploadUrl:"upload/",
							tooltip:"Upload your file to the local server",
							uploadComplete:"handleUploadComplete"
						})
					]
				}),
				beginButton: new sap.m.Button({
					text:"Upload File",
					icon:"sap-icon://upload",
					press: function () {
						this.PdraggableDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						this.PdraggableDialog.close();
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.PdraggableDialog);
		}

		this.PdraggableDialog.open();
	},
	
	handleVisa: function (oEvent) {
		if (!this.VisadraggableDialog) {
			this.VisadraggableDialog = new sap.m.Dialog({
				title: 'Attach Visa Copy',
				resizable: true,
				draggable: true,
				content: new sap.m.Panel({
					content:[
						new sap.ui.unified.FileUploader({
							id:"VisaFileUploader",
							name:"myFileUpload",
							uploadUrl:"upload/",
							tooltip:"Upload your file to the local server",
							uploadComplete:"handleUploadComplete"
						})
					]
				}),
				beginButton: new sap.m.Button({
					text:"Upload File",
					icon:"sap-icon://upload",
					press: function () {
						this.VisadraggableDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						this.VisadraggableDialog.close();
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.VisadraggableDialog);
		}

		this.VisadraggableDialog.open();
	},
	
	handleEmiratesID: function (oEvent) {
		if (!this.EIDdraggableDialog) {
			this.EIDdraggableDialog = new sap.m.Dialog({
				title: 'Attach Emirates ID Copy',
				resizable: true,
				draggable: true,
				content: new sap.m.Panel({
					content:[
						new sap.ui.unified.FileUploader({
							id:"EIDFileUploader",
							name:"myFileUpload",
							uploadUrl:"upload/",
							tooltip:"Upload your file to the local server",
							uploadComplete:"handleUploadComplete"
						})
					]
				}),
				beginButton: new sap.m.Button({
					text:"Upload File",
					icon:"sap-icon://upload",
					press: function () {
						this.EIDdraggableDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						this.EIDdraggableDialog.close();
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.EIDdraggableDialog);
		}

		this.EIDdraggableDialog.open();
	}

});