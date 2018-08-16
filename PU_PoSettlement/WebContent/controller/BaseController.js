sap.ui.define(
	["sap/ui/core/mvc/Controller",'sap/m/MessageBox',
		'sap/m/MessageToast',"sap/ui/core/routing/History"],
	function (Controller, MessageBox, MessageToast,History) {
	"use strict";

	return Controller.extend("poSettleApp.controller.BaseController", {
		
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		
		onNavBack:function(){
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// Naviate to master page
				this.getOwnerComponent().getRouter().navTo("mobileMaster", {},true);
			}
			
			
		},
		
		
		onStartEndValidation:function(oEvent){
	           
	           var eDate = oEvent.getSource().getDateValue();
	           
	            var sId = oEvent.getSource().getId().split('--')[0]+"--"+oEvent.getSource().getId().split('--')[1];
	            var sDate = sap.ui.getCore().byId(sId +"--"+ "itmStartDate").getDateValue();
	            if(sDate > eDate){
	                oEvent.getSource().setValueState("Error");
	                
	                
	            }else{
	                
	                oEvent.getSource().setValueState("None");
	                
	            }
	            
	           
	           
	       },

			onNavigateAwayValidation:function(oEvent){debugger;
			
			var oEvent1=  jQuery.extend(true, {}, oEvent);

			this.getOwnerComponent().getModel("lModelNav").setProperty("/oEvent1", oEvent1);
			
		       var oVisible = this.getOwnerComponent().getModel("lModelNav").getProperty("/checkvisible");
		            if(oVisible){
		              
		          	this.confirmDialogNav(); 
		                
		            }else{
		                
		             	this.onSelectionChange(oEvent); 
		                
		            }
		            
		           
		           
		       },
	
		
		       confirmDialogNav: function(oEvent) {
		    		debugger
		    		if (!this.apprDialog) {
		    			this.apprDialog = new sap.m.Dialog({
		    						title : this.getResourceBundle().getText("Confirm"),
		    						type : 'Message',
		    						draggable : true,
		    						content : new sap.m.Text({
		    									text : this.getResourceBundle().getText("AreYouNav")
		    								}),
		    						beginButton : new sap.m.Button({
		    							text : this.getResourceBundle().getText("Yes") ,
		    							type : "Accept",
		    							press : function(oEvent) {
		    	//sap.m.MessageToast.show("Submitted");
		    								debugger;
		    								this.onSelectionChange();
		    								this.apprDialog.close();
		    								
		    							}.bind(this)
		    						}),
		    						endButton : new sap.m.Button({
		    							text : this.getResourceBundle().getText("No"),
		    							type : "Reject",
		    							press : function() {
		    								this.apprDialog.close();
		    							}.bind(this)
		    						})
		    					});

		    			// to get access to the global model
		    			this.getView().addDependent(this.apprDialog);
		    		}

		    		this.apprDialog.open(oEvent);
		    		
		    		
		    	},
		
		
	});
});