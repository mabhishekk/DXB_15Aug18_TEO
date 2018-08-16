sap.ui.define([
	'zpo_userapp/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox',
  ], function(Controller, JSONModel, MessageBox){
	'use strict';
	
	return Controller.extend('zpo_userapp.controller.welcome',{
		onInit : function(){
			this.lModel = new JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched : function(oEvent){
			this.prNumber = this.getOwnerComponent().getComponentData().startupParameters.id[0];
			var tbData    = { };
			this.lModel.setData(tbData);
			this.sPath    = "/EBAN_DATASet('"+this.prNumber+"')";
			var oMdl = this.getOwnerComponent().getModel("prm");
			this.getView().setModel(oMdl);
			oMdl.read(this.sPath, {
				success : function(oData) { 
					this.prUrgentStatus(oData.Zrequesttype);
				}.bind(this),
				error : function(oError) {debugger;
					this.getView().setBusy(false);
					var err = new window.DOMParser().parseFromString(oError.responseText, "text/xml")
					var sErr = err.getElementsByTagName("message")[0].innerHTML
					MessageBox.error(sErr, {
						title : "Error",
					});

				}.bind(this),
				urlParameters : {
					"$expand" : "navigtoitems"
				}
			});
		} 
	})
});