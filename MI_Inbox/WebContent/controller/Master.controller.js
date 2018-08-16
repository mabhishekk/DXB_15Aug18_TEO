sap.ui.define( [
		"jquery.sap.global",
		"z_manager_inbox/controller/BaseController", 
		"z_manager_inbox/model/formatter",
		"sap/ui/Device"
	], function (jQuery, Controller, formatter, Device) {
	"use strict";

	return Controller.extend("z_manager_inbox.controller.Master", {
		
		formatter : formatter,
		
		onInit : function () {
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
			/*var serviceUrl = srcUrlHelper("/sap/bc/ui2/start_up");
			var that = this;*/
			
		},
		_onRouteMatched: function(oEvent) {
			
			if(!Device.system.phone) {
				this.getOwnerComponent().getRouter()
					.navTo("welcome");				
			}
		},
		onWorkItemSelection:function(oEvent){/*
			
		var SAP__Origin =	oEvent.getSource().getBindingContext().getProperty("SAP__Origin");
		var workItem =	oEvent.getSource().getBindingContext().getProperty("InstanceID");
			
			this.getOwnerComponent().getRouter()
			.navTo("workFlow",{wfId: workItem,origin:SAP__Origin});	
			
		*/

			var uId  = oEvent.getSource().getBindingContext().getProperty("Instid");
			var wiid  = oEvent.getSource().getBindingContext().getProperty("Wiid");
			var appType  = oEvent.getSource().getBindingContext().getProperty("WfTask");
//			var uId = "PC41EADD25";
			
			if(appType == "PC"){
				this.getRouter().navTo("Pettycash",    {id : uId,instId : wiid});
			}else if(appType == "RE"){
				this.getRouter().navTo("RewardsApprn", {id : uId,instId : wiid});
			}else if(appType == "EC"){
				this.getRouter().navTo("ExpenseClaim", {id : uId,instId : wiid});
			}else if(appType == "PR"){
				this.getRouter().navTo("PurchaseReq",  {id : uId,instId : wiid});	
			}else if(appType == "CR"){
				this.getRouter().navTo("CreditCard",   {id : uId,instId : wiid});	
			}else if(appType == "QR"){
				this.getRouter().navTo("QR",           {id : uId,instId : wiid});	
			}else if(appType == "IV"){
				this.getRouter().navTo("Invoice",      {id : uId,instId : wiid});	
			}
			
			
//			var oModel = this.getView().getModel();
		
	/*	var sPath = "/WF_UIAPPROVALSet(WiAagent='"+this.userId+"',Wiid='"+wiid+"',Decision='Y')";
			oModel.read(sPath,{
				success:function(oData){
					 this.getView().getModel().refresh();
					
				}.bind(this)
				
			});*/
			
		
		},
		
		
	onBeforeRendering:function(){
	
		/*
			
		var inbx = this.getView().byId("inbox_app");
//		var oBinding = inbx.getBinding("items");
		
		var aFilters = [];

		
//	    aFilters.push( new sap.ui.model.Filter("WiAagent", "EQ", this.userId) );
//	    aFilters.push( new sap.ui.model.Filter("WiRhTask", "EQ", "TS00008267") );
//	    aFilters.push( new sap.ui.model.Filter("WfTask", "EQ", "WS90000007") );
		
		inbx.bindItems("/WORKITEMSSet",new sap.m.StandardListItem({text:"hello"}),aFilters);
		
		inbx.bindItems({
			path:"/WORKITEMSSet",
			   filters: new sap.ui.model.Filter(aFilters, true),
			   template : new sap.m.StandardListItem({

                   title : '{WfTask}',

                   type : sap.m.ListType.Active,

                   description : "{WiText}",

                   tap :[this.handleListItemPress,this]

         })
		});
		
		
		
//		oBinding.filter(aFilters,"Application"); 
		
//		inbx.bindItems("/WORKITEMSSet",);
		
			
			
		*/
		
	}
		
	});

}, /* bExport= */ true);