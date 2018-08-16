sap.ui.define([
		"providenta/fi/rewards/controller/BaseController", 
		"sap/ui/core/routing/History",
		"sap/ui/Device", 
		'sap/m/MessageBox',
		'sap/ui/model/Filter',
		"providenta/fi/rewards/model/formatter" 
	], function(Controller, History, Device, MessageBox, Filter, formatter){
		"use strict";
		
		var PageController = Controller.extend("providenta.fi.rewards.controller.DetailDisplay",{
			formatter : formatter,
			getResourceBundle: function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			/**
			 * Called when a controller is instantiated and its View
			 * controls (if available) are already created. Can be used
			 * to modify the View before it is displayed, to bind event
			 * handlers and do other one-time initialization.
			 * 
			 * @memberOf z_pr.app
			 */
			onInit : function() {
				this.lModel   = new sap.ui.model.json.JSONModel();
		        this.getView().setModel(this.lModel, "lModel");
				this.getOwnerComponent().getRouter().getRoute("RewardsAppreciationDetailsDisplay").attachPatternMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function(oEvent) {
				this._sPostingNumber = oEvent.getParameter("arguments").sId;
				this._sId            = "/RewardsSet('"+  oEvent.getParameter("arguments").sId +  "')";
				this.getView().bindElement(this._sId);
				this.getOwnerComponent().getModel().refresh();
				
				var oMdl = this.getOwnerComponent().getModel();
				oMdl.read(this._sId,{
					success : function(oData) {
						this._sDocumentnumber = oData.Documentnumber;
					}.bind(this),
					error : function(oError) {
						
					}.bind(this),
					urlParameters : {
						"$expand" : "navtoitem_rewards"
					}
				});
				
				var sRewardsNumber = this._sPostingNumber;
				this._DocList(sRewardsNumber);
			},
							
			onAfterRendering : function() {
				
			},
			
			_DocList: function(sRewardsNumber) {
				this.lModel.setProperty('/dms',[]);
		        var oModel  = this.getView().getModel();
		        var fltr = "Postingnumber  eq '"+ sRewardsNumber +"'";
		        var that = this;
		        oModel.read("/FilelistSet",{
		          success:function(oData){
		            var files = this.lModel.getProperty("/dms");
		            that.lModel.setProperty("/dms",$.merge(files,oData.results));
		          }.bind(this),
		          error:function(oError){
		          },
		          urlParameters:{
		            "$filter":fltr
		          }
		        })
//				var oElement = this.getView().byId("idRewardsDoc");
//				var oTemplate = new sap.m.StandardListItem({
//					title: "{Docfile}"
//				});
//				var aFilter =[];
//				aFilter.push(new Filter("Postingnumber", "EQ", sRewardsNumber) );
//				oElement.bindItems({
//					path : "/FilelistSet",
//					filters: new Filter(aFilter, true),
//					template : oTemplate
//				});
				
			},
		/**
		 * Called when the Controller is destroyed. Use this one to
		 * free resources and finalize activities.
		 * 
		 * @memberOf z_pr.app
		 */
		// onExit: function() {
		//
		// }
			
			handleRewardsEdit: function (oEvent) {
//				var sProductId = oEvent.getSource().getBindingContext().getProperty("productId");
//				this.getOwnerComponent().getRouter()
//					.navTo("detailEdit");
//				var sPostingNumber = oEvent.getSource().getBindingContext().getProperty("PostingNumber");
				var sPostingNumber = oEvent.getSource().getBindingContext().getModel().getData(oEvent.getSource().getBindingContext().sPath).Postingnumber;
				this.getOwnerComponent().getRouter()
					.navTo("RewardsAppreciationDetailsEdit", 
						{sId: sPostingNumber},
						!Device.system.phone);
			},
			
			
			onSelectionChange: function (oEvent) {
				if (!this.pressDialog) {
					this.pressDialog = sap.ui.xmlfragment(
							"z_pettycash_fi.view.fragment.PCitems",
							this);
					// to get access to the global
					// model
					this.getView().addDependent(this.pressDialog);
				}
				this.pressDialog.open();
			},
			
			onPCitemsClose : function(oEvent) {
				oEvent.getSource().getParent().close();
			},
			
			handleRAPrint: function (oEvent) {
				var sBindingContext = oEvent.getSource().getBindingContext();
				var sPath           = sBindingContext.sPath;
				var sPostingNumber  = sBindingContext.getModel().getData(sPath).Postingnumber;
				var lang            = sap.ui.getCore().getConfiguration().getLanguage();
				var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='RF',appno='" +sPostingNumber+"',lang='"+lang+"',ndavalue='')/$value";
				window.open(sPrintPath,true); 
			},
			
			onDocSelectionChange: function (oEvent) {
				var sDoknr      = this.lModel.getProperty(oEvent.getSource().getBindingContext('lModel').getPath()).Doknr;
				var sDocPath    = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" +sDoknr+"',lang='',ndavalue='2')/$value ";
				window.open(sDocPath,true); 
			},
			
			onNavBack:function(){
				var sPreviousHash = History.getInstance().getPreviousHash();
				// The history contains a previous
				// entry
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					// There is no history!
					// Naviate to master page
					this.getOwnerComponent().getRouter().navTo("master", {},true);
				}
			},
			
			handleWithdraw: function(oEvent) {
				if (!this.WithdrawDialog) {
					this.WithdrawDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Withdraw"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("WithdrawRequest")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Yes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.WithdrawDialog.close();
										this._handleWithdraw(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("No"),
									type : "Reject",
									press : function() {
										this.WithdrawDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.WithdrawDialog);
				}

				this.WithdrawDialog.open();
			},
			
			_handleWithdraw: function(oEvent) {
				var that   = this;
				var temObj = {};
				temObj.Postingnumber = this._sPostingNumber;
				temObj.Flag3         = "C";
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("RaWithdrawSuccess",[sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
					},
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(emsg	);
						debugger;	
						
					}
					
				})
			},
			
			handleDelete: function(oEvent) {
				if (!this.DeleteDialog) {
					this.DeleteDialog = new sap.m.Dialog({
								title : this.getResourceBundle().getText("Delete"),
								type : 'Message',
								draggable : true,
								content : new sap.m.Text({
											text : this.getResourceBundle().getText("DeleteRequest")
										}),
								beginButton : new sap.m.Button({
									text : this.getResourceBundle().getText("Yes"),
									type : "Accept",
									press : function() {
//										sap.m.MessageToast.show("Submitted");
										this.DeleteDialog.close();
										this._handleDelete(oEvent);
									}.bind(this)
								}),
								endButton : new sap.m.Button({
									text : this.getResourceBundle().getText("No"),
									type : "Reject",
									press : function() {
										this.DeleteDialog.close();
									}.bind(this)
								})
							});

					// to get access to the global model
					this.getView().addDependent(this.DeleteDialog);
				}

				this.DeleteDialog.open();
			},
			
			_handleDelete: function(oEvent) {
				var that   = this;
				var temObj = {};
				temObj.Postingnumber = this._sPostingNumber;
				temObj.Flag3         = "D";
				var oModel = this.getOwnerComponent().getModel();
				oModel.create("/pcashheaderSet",temObj,{
					
					success:function(oData){
						var sPostingNumber = oData.Postingnumber;
						var msg = that.getResourceBundle().getText("RaDeleteSuccess", [sPostingNumber]);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.success(msg);
						that.getOwnerComponent().getModel().refresh();
					},
					error:function(oData){
						var emsg= $(oData.responseText).find("message").first().text();
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.error(emsg	);
						debugger;	
						
					}
					
				})
			},
			
			onFileUpload:function(oEvent){
		        this.getView().setBusy(true);
		        var tablObj        = {};
		        var doknr          = this._sDocumentnumber;
		        var fragmentId     = this.getView().createId("itemsFragment");     
		        var matrnFile      = this.byId("matrnFile");
		        var tblFileInputId = matrnFile .getId() +'-fu';
		        var reader         = new FileReader();
		        var tblFileInput   = $.sap.domById(tblFileInputId);
		        var tblFile        = tblFileInput.files[0];
		        tablObj.Docfile    = tblFile.name;
		        tablObj.Mimetype   = tblFile.type;
		        var base64marker   = 'data:' + tblFile.type + ';base64,';
		        var dArr           = this.lModel.getProperty("/dms");
		        var that           = this;
		        reader.onload      = (function(theFile) {
		          return function(evt) {
		            var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
		            var base64       = evt.target.result.substring(base64Index);
		            tablObj.Filedata = base64; 
//		            if(doknr != ""){
		              tablObj.addordelete = "A";
		              tablObj.Doknr         = doknr;
		              tablObj.Postingnumber = that._sPostingNumber;
		                that.getView().getModel().create("/FilelistSet",tablObj,{
		                  success:function(oData){
		                    var dArr       = this.lModel.getProperty("/dms");
		                    dArr.push(oData);
		                    that.lModel.setProperty("/dms",dArr);
		                    that.getView().getModel().refresh();
		                    that._DocList(that._sPostingNumber);
		                    that.getView().setBusy(false);
		                  }.bind(that),
		                  error:function(oError){
		                    that.getView().setBusy(false);
		                    this._handleError(oError);
		                  }.bind(that)})
//		              }else{
//		                }
		              matrnFile.clear();
		          }
		          
		        })();
		          reader.readAsDataURL(tblFile);
		      },
		      
		      onFileDelete: function(oEvent){
		    	  var ofdelObj  = oEvent.getParameter('listItem').getBindingContext('lModel').getObject();
				  var sdelPath  = oEvent.getParameter('listItem').getBindingContext('lModel').getPath();
				  this._deleteFile(oEvent, ofdelObj, sdelPath, this._sPostingNumber);
		      }
		});
		
		return PageController;
});

//sap.ui.controller("z_pettycash_fi.controller.DetailDisplay", {
//
//	/**
//	 * Called when a controller is instantiated and its View
//	 * controls (if available) are already created. Can be used
//	 * to modify the View before it is displayed, to bind event
//	 * handlers and do other one-time initialization.
//	 * 
//	 * @memberOf z_pr.app
//	 */
//	onInit : function() {
//		this.getView().bindElement("/pcashheaderSet('9917000030')");
//	},
//
//					
//	onAfterRendering : function() {
//		
//	},
//
///**
// * Called when the Controller is destroyed. Use this one to
// * free resources and finalize activities.
// * 
// * @memberOf z_pr.app
// */
//// onExit: function() {
////
//// }
//	
//	handlePCEdit: function (oEvent) {
////		var sProductId = oEvent.getSource().getBindingContext().getProperty("productId");
////		this.getOwnerComponent().getRouter()
////			.navTo("detailEdit");
//		
//		sap.ui.core.UIComponent.getRouterFor(this).navTo("editData");
//	}
//	
//});