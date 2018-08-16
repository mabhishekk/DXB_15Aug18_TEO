/*global history*/

sap.ui.define([
	'z_settlement/controller/BaseController',
], function (BaseController) {
	"use strict";

	return BaseController.extend("z_settlement.controller.Worklist", {
		
		
		
		onORTermination_can:function(oEvent){
			var oSwitch  = oEvent.getSource();
			var vState = oSwitch.getState();
			var rPanel = this.getView().byId('id_ORTermination_can');
		
			if(vState){
				rPanel.setExpanded(true);
				
				
			}
			else{
			rPanel.setExpanded(false);
			}
			
			
			
		},
		
		onRAmendContract_can:function(oEvent){
			var oSwitch  = oEvent.getSource();
			var vState = oSwitch.getState();
			var rPanel = this.getView().byId('id_RAContract_can');
		
			if(vState){
				rPanel.setExpanded(true);
				
				
			}
			else{
			rPanel.setExpanded(false);
			}
			
			
			
		}
		
		
	});

});
