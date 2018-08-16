sap.ui.define([ 
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/routing/History",
	"sap/ui/Device", 
	'sap/m/MessageBox'
	], function(Controller, History, Device, MessageBox, formatter) {


		return Controller.extend("z_vrandnda.controller.CompanyDisplay",{
			
			onInit : function() {
				this.getOwnerComponent().getRouter().getRoute("VendorDisplay").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched:function(oEvent){		
				this.sId = oEvent.getParameter("arguments").id;
				
				var sPath = "/ZVENDOR_COMPANYSet('"+this.sId+"')";
				var vType = oEvent.getParameter("arguments").vType;
				if(vType == 'VF'){
					this.onVRfreelancer();
					this.byId("segmntBtn").setSelectedKey("VF")
				}else{
					this.byId("segmntBtn").setSelectedKey("VC")
					this.onVRcompany();
					
				}
				this.getView().bindElement(sPath);
			},
			
			
			onVRcompany: function (oEvent) {

				this.byId("VR_DisplayGeneralInformation").setVisible(true);
				this.byId("VR_DisplayAddress").setVisible(true);
				this.byId("VR_DisplayLicenseDetail").setVisible(true);
				this.byId("VR_DisplayFreelancer").setVisible(false);
		},
		
			
			onVRfreelancer: function (oEvent) {

				this.byId("VR_DisplayGeneralInformation").setVisible(false);
				this.byId("VR_DisplayAddress").setVisible(false);
				this.byId("VR_DisplayLicenseDetail").setVisible(false);
				this.byId("VR_DisplayFreelancer").setVisible(true);
		},
			
			handlePrint: function(oEvent) {
				var sNumber         = this.sId;
				var voc = this.byId("segmntBtn").getBindingContext().getObject().VendorOrCompany||"VC";
//				var voc    = this.getOwnerComponent().getModel().getProperty("/ZVENDOR_COMPANYSet('"+this.sId+"')/VendorOrCompany");					
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='"+voc+"',appno='"+sNumber+"',lang='EN',ndavalue='')/$value";
				window.open(sPrintPath,true); 
			}
		
		
		
		
	} 
)});
