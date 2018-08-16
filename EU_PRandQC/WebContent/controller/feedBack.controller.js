sap.ui.controller("userPr.controller.feedBack", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf ratingform.app
*/
	onInit: function() {

		this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched,this);
		

	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf ratingform.app
*/
	onBeforeRendering: function() {
		
		

	},
	
	
	_onRouteMatched:function(oParm){
		this.sId= oEvent.getParameter("arguments").id;
		
		
		
		
		
	},
	
	
	onSubmitRating:function(oEvent ){
		
		
		
		this.Banfn ="100092";
//		var oData = this.lModel.getProperty("/rating");
//		oData.forEach(function(oItem){
//			oItem.Banfn = "10092";
//			
//		});
		
		var tData = this.byId("id_prdSrv").getValue()+"|"+
					this.byId("id_qualSrv").getValue()+"|"+					
					this.byId("id_delSrv").getValue()+"|"+
					this.byId("id_prCour").getValue()+"|"+
					this.byId("id_prGodSrv").getValue()+"|"+
					this.byId("id_techKnow").getValue()+"|"
					
			var oData = {
			"Banfn":"100092"+this.byId("id_qualSrv").getValue(),
			"Param1":tData
		}		
					
		
		var oMdl = this.getOwnerComponent().getModel();
		oMdl.create("/FeedbackSet",oData,{success:function(){
			
			
		},
		error:function(){
			
			
		}});
		
	}

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf ratingform.app
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf ratingform.app
*/
//	onExit: function() {
//
//	}

});