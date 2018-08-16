sap.ui.define([ 
	"z_inbox/controller/BaseController", 
	"sap/ui/core/routing/History",
	"sap/ui/Device", 
	'sap/m/MessageBox',
	"z_inbox/model/formatter" 
  ], function(Controller, History, Device, MessageBox, formatter) {
	return Controller.extend("z_inbox.controller.quotation.QR",{
		formatter : formatter,
		onInit: function() {
			
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel);
			this.getOwnerComponent().getRouter().getRoute("QR").attachPatternMatched(this._onRouteMatched,this);
		},
		
		_onRouteMatched:function(oEvent){
			
			try{
				this.sId= oEvent.getParameter("arguments").id;
				this.instId= oEvent.getParameter("arguments").instId;
				}catch(oEr){
					this.sId  ;	
					
				}
			
			this.sPath = "/qrheaderSet('" + this.sId + "')";
			var that = this;
			var oMdl = this.getOwnerComponent().getModel();
			oMdl.read(this.sPath,{
				success : function(oData) {
					that.lModel.setData(oData); 
					that.PRNO = oData.PreqNo;
					that.lModel.setProperty("/Banfn",that.sId);
				},
				error:function(oError){
				
				},
				urlParameters : {
						"$expand":"navigtoqrsplapproval,navigprtoqrfinal,qrnavig"
	
				}
			});
			
			 //Documents Get Request
			var fltr = "Prno  eq '"+this.sId+"' and PreqItem eq ''";
			var that = this;
			oMdl.read("/filelistSet",{
				success:function(oData){
		//			var files = this.lModel.getProperty("/navigqrtodocuments")||[];
		    		this.lModel.setProperty("/navigqrtodocuments",oData.results);
				}.bind(this),
				error:function(oError){
					
				},
				urlParameters:{
					"$filter":fltr
				}
				})
//			this.byId('vendor_lst').bindElement()
		},
		
//		Delete Documents
		onDeleteDocItem:function(oEvent){
			this.getView().setBusy(true);			
			var navPath = this.sdelPath.slice(0,-1)
			var docItemPath = this.sdelPath[this.sdelPath.length-1]
			var dMdl =  this.getOwnerComponent().getModel();		
			
			var fltr = "Prno  eq '"+this.fdelObj.Prno+"' and PreqItem eq '"+this.fdelObj.PreqItem+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
			 var that = this;
			dMdl.read("/filelistSet",{success:function(oData){					
//												var dItems = this.lModel.getProperty(navPath);									
//												dItems.splice(parseInt(docItemPath),1);
				this.lModel.setProperty("/navigqrtodocuments",oData.results);
				this.getView().setBusy(false);				
			}.bind(this),error:function(oError){										
				this.getView().setBusy(false);
			}.bind(this),
			urlParameters:{
				"$filter":fltr
				
			}
				
			})
			 
			
		},
		
		
	//File Upload	
		onFileUpload:function(oEvent){
			var tablObj = {};
			
//											var doknr = this.byId("vendor_detail").getBindingContext().getObject().Doknr;
			var doknr  = this.lModel.getProperty("/Doknr");
			
			
			  var fragmentId = this.getView().createId("itemsFragment");		 
			  var matrnFile = this.byId("matrnFile");
			  
			  var tblFileInputId = matrnFile .getId() +'-fu';
			  
			  var reader = new FileReader();
			  
			  var tblFileInput = $.sap.domById(tblFileInputId);
			  
			  var tblFile = tblFileInput.files[0];
			  
			  tablObj.Docfile = tblFile.name;
			  tablObj.Mimetype = tblFile.type;
			  var base64marker = 'data:' + tblFile.type + ';base64,';
			  var dArr = this.lModel.getProperty("/navigqrtodocuments");
			  var that = this;
			  
			  reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index =evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64 = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64; 
//													  	dArr.push(tablObj);
//													  	that.lModel.setProperty("/navigqrtodocuments",dArr);
					  	if(doknr != ""){
					  		tablObj.addordelete = "A";
							  tablObj.Doknr = doknr;
							  tablObj.Prno = that.sId;
					  		
					  		
							  that.getOwnerComponent().getModel().create("/filelistSet",tablObj,{success:function(oData){
//														  		var itemPath = this.cntxt.getPath()+"/navigitemstofile";
//														  		var itemFiles = this.cntxt.getProperty("navigitemstofile");
//														  		oData.Filedata = "";
//														  		itemFiles.push(oData);
//														  		this.lModel.setProperty(itemPath,itemFiles);
					  		  var dArr = this.lModel.getProperty("/navigqrtodocuments");
					  		oData.PreqItem = "00000";
					  		  	dArr.push(oData);
					  			that.lModel.setProperty("/navigqrtodocuments",dArr);
					  			
					  			
						  	}.bind(that),error:function(oError){
						  		
						  		this._handleError(oError);
						  		
						  	}.bind(that)})
					  		
					  		
					  	}else{
					  		var dArr;
					  		try {
					  			dArr = this.lModel.getProperty("/navigqrtodocuments");
							} catch (e) {
								dArr = [];
								
								// TODO: handle exception
							}
					  	  
					  		  	dArr.push(tablObj);
					  			that.lModel.setProperty("/navigqrtodocuments",dArr);
					  		
					  		
					  	}
					  	
					  	matrnFile.clear();
				  }
			  
			  })();
			  
			  reader.readAsDataURL(tblFile);
			
			
		},
		
		
		_CancelYes: function(oEvent) {
			
			var that = this;											
			var sPath = "/WF_UIAPPROVALSet(WiAagent='',Wiid='"+this.instId+"',Decision='R')"											
			this.getOwnerComponent().getModel().read(sPath,{
				success:function(oData){
					var msg = that.getResourceBundle().getText("RejectSuccess");
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.getOwnerComponent().getModel().refresh()
					that.getOwnerComponent().getRouter().navTo("welcome",true);
				}.bind(this),
				error:function(oData){
					var emsg= $(oData.responseText).find("message").first().text();
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					jQuery.sap.require("sap.m.MessageBox");
									sap.m.MessageBox.error(emsg	);
									
								}
								
								
							});
							
						},
						
		_apprvYes:function(oEvent){
			var that = this;											
			var sPath = "/WF_UIAPPROVALSet(WiAagent='',Wiid='"+this.instId+"',Decision='Y')"											
			this.getOwnerComponent().getModel().read(sPath,{
			success:function(oData){
				var msg = that.getResourceBundle().getText("Success");
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.success(msg);
				that.getOwnerComponent().getModel().refresh()
				that.getOwnerComponent().getRouter().navTo("welcome",true);
			}.bind(this),
			error:function(oData){
				var emsg= $(oData.responseText).find("message").first().text();
				var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
				jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.error(emsg	);
				}
			});
		},						
						
						
						handleReject : function(oEvent) {
							if (!this.CancelDialog) {
								this.CancelDialog = new sap.m.Dialog({
											title : this.getResourceBundle().getText("Reject"),
							type : 'Message',															
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("RejectMsg")
									}),
							beginButton : new sap.m.Button({
								text : this.getResourceBundle().getText("PCYes"),
								type : "Accept",
								press : function() {
//																	sap.m.MessageToast.show("Submitted");
									this.CancelDialog.close();
									this._CancelYes(oEvent);
								}.bind(this)
							}),
							endButton : new sap.m.Button({
								text : this.getResourceBundle().getText("PCNo"),
								type : "Reject",
								press : function() {
									this.CancelDialog.close();
								}.bind(this)
							})
						});

				// to get access to the global model
				this.getView().addDependent(this.CancelDialog);
			}

			this.CancelDialog.open();
		},
		
		
		
		handleApprove: function(oEvent) {
			
			if (!this.apprDialog) {
				this.apprDialog = new sap.m.Dialog({
							title : this.getResourceBundle().getText("Approve"),
							type : 'Message',
							draggable : true,
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("ApproveMsg")
									}),
							beginButton : new sap.m.Button({
								text : this.getResourceBundle().getText("PCYes"),
								type : "Accept",
								press : function() {
//																	sap.m.MessageToast.show("Submitted");
									this.apprDialog.close();
									this._apprvYes(oEvent);
								}.bind(this)
							}),
							endButton : new sap.m.Button({
								text : this.getResourceBundle().getText("PCNo"),
								type : "Reject",
								press : function() {
									this.apprDialog.close();
								}.bind(this)
							})
						});

				// to get access to the global model
				this.getView().addDependent(this.apprDialog);
			}

			this.apprDialog.open();
			
			
		},
		
		
		
		
		
		
		
		
		onOpenApprove: function(oEvent) {
			var Level1Approver = this.getView().byId("l1usr_List");
			var Level2Approver = this.getView().byId("l2usr_List");
			var Level3Approver = this.getView().byId("l3usr_List");
			var Level4Approver = this.getView().byId("l4usr_List");
			var Level5Approver = this.getView().byId("l5usr_List");
			var oModel         = this.getView().getModel();
			
			var aFilters = [];
			var bFilters = [];
			var cFilters = [];
			var dFilters = [];
			var eFilters = [];
			var oTemplate= new sap.ui.core.ListItem(
					{
						text : "{Fullname}",
						key : "{Defaultuser}"
					});
			
			aFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '1') );
			Level1Approver.bindItems({
				path : "/mgtapprovalSet",
				filters: new sap.ui.model.Filter(aFilters, true),
				template : oTemplate
			});
			
			bFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '2') );
			Level2Approver.bindItems({
				path : "/mgtapprovalSet",
				filters: new sap.ui.model.Filter(bFilters, true),
				template : oTemplate
			});
			
			cFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '3') );
			Level3Approver.bindItems({
				path : "/mgtapprovalSet",
				filters: new sap.ui.model.Filter(cFilters, true),
				template : oTemplate
			});
			
			dFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '4') );
			Level4Approver.bindItems({
				path : "/mgtapprovalSet",
				filters: new sap.ui.model.Filter(dFilters, true),
				template : oTemplate
			});
			
			eFilters.push( new sap.ui.model.Filter("Levelid", "EQ", '5') );
			Level5Approver.bindItems({
				path : "/mgtapprovalSet",
				filters: new sap.ui.model.Filter(eFilters, true),
				template : oTemplate
			});
		},
		
		onApproveClose : function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		
		onPrintQR:function(oEvent){
			var lang       = sap.ui.getCore().getConfiguration().getLanguage();
			sPrintPath     = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='QC',appno='" +this.PRNO+"',lang='"+lang+"',ndavalue='')/$value";
			window.open(sPrintPath,true);
		},
		
		handleApproveSave : function(oEvent) {
			this.onApproveClose(oEvent);
			var that   = this;
			var level1 = this.getView().byId("l1usr_List").getSelectedKey();
			var level2 = this.getView().byId("l2usr_List").getSelectedKey();
			var level3 = this.getView().byId("l3usr_List").getSelectedKey();
			var level4 = this.getView().byId("l4usr_List").getSelectedKey();
			var level5 = this.getView().byId("l5usr_List").getSelectedKey();
			
			var approver         = {};
			approver.Wiid        = this.instId;
			approver.Level1      = level1;
			approver.Level2      = level2;
			approver.Level3      = level3;
			approver.Level4      = level4;
			approver.Level5      = level5;
//											approver.navigwitowiuser = [];
			var oModel = this.getOwnerComponent().getModel("fiService");
			oModel.create("/wfmgtuserselectSet", approver,{
				
				success:function(oData){
					var sPostingNumber = oData.Postingnumber;
					var msg = "Request has been forwarded for approvals.";
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.success(msg);
					that.getOwnerComponent().getModel().refresh()
					that.getOwnerComponent().getRouter().navTo("welcome",true);
					
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
		
		onPRnumber: function(oEvent){
        	var lang            = sap.ui.getCore().getConfiguration().getLanguage();
			var sPrintPath;
			sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PRR',appno='" +this.PRNO+"',lang='"+lang+"',ndavalue='')/$value";
			window.open(sPrintPath,true);
        },
		
        onEditQR: function(oEvent){
        	this.getOwnerComponent().getRouter().navTo("QRedit", {instId: this.instId, id: this.sId}, !Device.system.phone);
        }
		
	
	})
})