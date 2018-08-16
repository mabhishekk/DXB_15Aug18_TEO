sap.ui.define([ 
		"jquery.sap.global", 
		"z_manager_inbox/controller/BaseController",
		"sap/ui/Device" 
	], function(jQuery, Controller, Device) {
	"use strict";

	return Controller.extend("z_manager_inbox.controller.Detail1", {
		onInit : function() {
			
//			/sap/opu/odata/sap/ZPR_APPL_SRV/WF_UIAPPROVALSet(WiAagent='FIORI_001',Wiid='407383',Decision='Y')
			
			
//			this.oApproveMdl = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPR_APPL_SRV");
			
			this.getOwnerComponent().getRouter().getRoute("workFlow")
					.attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched : function(oEvent) {
			/*
			 * Navigate to the first item by default only on desktop and tablet
			 * (but not phone). Note that item selection is not handled as it is
			 * out of scope of this sample
			 */
			// if(!Device.system.phone) {
			// this.getOwnerComponent().getRouter()
			// .navTo("orderDetails", {orderId: 0}, true);
			// }

			// TaskCollection(SAP__Origin='FIORI_PGW',InstanceID='000000407321')
			this.instanceId = oEvent.getParameter("arguments").wfId;
			this.sap_origin = oEvent.getParameter("arguments").origin;
			var sPath = "/WORKITEMSSet(SAP__Origin='"
					+ oEvent.getParameter("arguments").origin
					+ "',InstanceID='" + oEvent.getParameter("arguments").wfId
					+ "')";
			this.getView().bindElement(sPath);

		},

		onApprove : function(oEvent) {
//			var oDataModel1 = this.getOwnerComponent().getModel();

//			oDataModel1.callFunction("Decision",
//"POST",
//			{
//				"SAP__Origin" : this.sap_origin,
//				"InstanceID" : this.instanceId,
//				"DecisionKey" : '0001',
//				"Comments" : 'Approve'
//			});
			
			
			var sPath = "/WF_UIAPPROVALSet(WiAagent='FIORI_001',Wiid='"+this.instanceId+"',Decision='Y')"
			
			this.oApproveMdl.read(sPath,{
				success:function(oData){
					this.getView().getModel().refresh();
					
				}.bind(this)
				
				
			});
			
			

		}

	});

}, /* bExport= */true);