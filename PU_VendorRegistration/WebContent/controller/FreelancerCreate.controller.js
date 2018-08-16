sap.ui.define([ 
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/routing/History",
	"sap/ui/Device", 
	'sap/m/MessageBox',
	"z_vrandnda/model/formatter"
	], function(Controller, History, Device, MessageBox, formatter) {


		return Controller.extend("z_vrandnda.controller.FreelancerCreate",{
			formatter: formatter,
			onInit : function() {
				this.getOwnerComponent().getRouter().getRoute("masterFreelancr").attachPatternMatched(this._onRouteMatched,this);
			},
			_onRouteMatched : function(oEvent) {
				
				
				
			},
			
			
			
		

	}, /* bExport= */true
)});
