sap.ui.define([ 
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/routing/History",
	"sap/ui/Device", 
	'sap/m/MessageBox',
	"z_vrandnda/model/formatter"
	], function(Controller, History, Device, MessageBox, formatter) {


		return Controller.extend("z_vrandnda.controller.CompanyCreate",{
			formatter: formatter,
			onInit : function() {
				this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched,this);
				this.lModel = new sap.ui.model.json.JSONModel();
			},
			_onRouteMatched : function(oEvent) {
				
				var tData = {
						"Zdate":new Date(),
						"ValidDateTo": new Date()
				}
				
				this.lModel.setData(tData)
				this.getView().setModel(this.lModel, "lModel");
			},
			
			onVRfreelancer: function (oEvent) {

					this.byId("VR_ChangeGeneralInformation").setVisible(false);
					this.byId("VR_ChangeAddress").setVisible(false);
					this.byId("VR_ChangeLicenseDetail").setVisible(false);
					this.byId("VR_ChangeFreelancer").setVisible(true);
			},
			
			
			onVRcompany: function (oEvent) {

					this.byId("VR_ChangeGeneralInformation").setVisible(true);
					this.byId("VR_ChangeAddress").setVisible(true);
					this.byId("VR_ChangeLicenseDetail").setVisible(true);
					this.byId("VR_ChangeFreelancer").setVisible(false);
			},
			
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			handleSavePress:function(oEvent){
				this.getView().setBusy(true);
				var mdl = this.getOwnerComponent().getModel();
				var pdata = this.lModel.getData();
				pdata.VendorOrCompany = this.byId("segmntBtn").getSelectedKey();
				var that = this;
				mdl.create("/ZVENDOR_COMPANYSet",pdata,{success:function(oEvnt){
					that.getView().setBusy(false);
					that.getView().getModel().refresh();
					var sText = that.getResourceBundle().getText("vendrCret")+ oEvnt.Partner;
					MessageBox.success(
							sText, {
								title : that.getResourceBundle().getText("Success")
							});
					var tData = {
							"Zdate":new Date(),
							"ValidDateTo": new Date()
							
					}
					that.lModel.setData(tData);
					
				},error:function(oEvnt){
					that.getView().setBusy(false);
					var sText = that.getResourceBundle().getText("vendrCret")
					MessageBox.error(
							sText, {
								
								title : that.getResourceBundle().getText("Error")
							});
					
					
				}
				})
				
				
			}
			
						});

	}, /* bExport= */true
);
