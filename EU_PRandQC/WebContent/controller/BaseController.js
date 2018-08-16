sap.ui.define([
		"sap/ui/core/mvc/Controller",
		'sap/m/MessageBox',
		'sap/m/MessageToast',
		"sap/ui/core/routing/History"
	], function (Controller, MessageBox, MessageToast,History) {
		"use strict"; 

	return Controller.extend("userPr.controller.BaseController", {

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		imageLoading:function(oParm){
			var lftSrc = jQuery.sap.getModulePath("userPr")+"/images/Arrows-left-transp.gif";
			var rgtSrc = jQuery.sap.getModulePath("userPr")+"/images/Arrows-right-transp.gif"
			this.byId("arrLeft").setSrc(lftSrc);
			this.byId("arrRght").setSrc(rgtSrc);
		},
		
		/*
		 * 
		 * 
		 * Icon tab bar selection */
		
		handleIconTabBarSelect:function(oEvent){
			var oModel = this.getView().getModel();
			var icKey = oEvent.getParameter('selectedKey');
			var sPRnumber;
			
			sPRnumber = oModel.getProperty(this.sPath+'/Banfn');
			
			if(icKey == "PO"){
			
				var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");	 
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "zpo_userapp", action : "create" },
					  params : { id: this.sId}
					}); 
				
				 
				
				
			}else if(icKey == "GR"){
				var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
				 
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "z_usergr", action : "create" },
					  params : { id: this.sId}
					});
				
			}else if(icKey == "IN"){
				var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
				 
				var hrefForProductDisplay = oCrossAppNav.toExternal({
					  target : { semanticObject : "z_user_invoice", action : "create" },
					  params : { id: this.sId}
					});
				
			}	else{
			
				
				this.getOwnerComponent().getRouter().navTo(icKey, {id: this.sId});
				
			}
			
		},
		
		
		/*
		 * 
		 * 
		 * PR Status of the application */
		
		PRStatusTab:function(oType,oParm){
			var oParm = "IN"
			var arr = ["PR","QR","QC","PO","GR","IN"];
			var oPath= "/"+oParm;
			var that = this;
			var vArr,rArr ;
			if(oType != "1"){
				for (var i = 1, len = arr.length; i < len; i++) {
					var oPath = "/"+arr[i];
					if((arr[i] == "QR")||(arr[i] == "QC"))
					this.lModel.setProperty(oPath,false);
					else
					this.lModel.setProperty(oPath,true);
					
				}
				
				
			}else{
			
			if(oParm){
				vArr = arr.slice(0,arr.indexOf(oParm)+1);							
				for (var i = 0, len = vArr.length; i < len; i++) {
						var oPath = "/"+vArr[i];
						
						this.lModel.setProperty(oPath,true);
					
					}
				rArr = arr.slice(arr.indexOf(oParm)+1);	
				for (var i = 0, len = rArr.length; i < len; i++) {
					var oPath = "/"+rArr[i];
					
					this.lModel.setProperty(oPath,false);
				
				}
			
			}
			}
		},
		
		
		handleTypeMissmatch: function(oEvent) {
				var aFileTypes = oEvent.getSource().getFileType();
				jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value;});
				var sSupportedFileTypes = aFileTypes.join(", ");
				MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
										" is not supported. Choose one of the following types: " +
										sSupportedFileTypes);
			},
		
		
		/*
		 * 
		 * File Upload */
		
		onFileUpload:function(oEvent){
			
			var tablObj = {};
			
			  var fragmentId = this.getView().createId("itemsFragment");
			  
			  if(this.sId)
				  tablObj.PreqItem = (this.lModel.getProperty("/mainSet/navigtoitems/results").length+1).toString();
			  else
				  tablObj.PreqItem = (this.lModel.getProperty("/mainSet/navigtoitems").length+1).toString();
			  
			  
			  tablObj.Serialno = (this.lModel.getProperty("/lSet/navigprtodocs").length+1).toString();
//			  var matrnFile =sap.ui.core.Fragment.byId(fragmentId, "matrnFile");
			  var matrnFile =  oEvent.getSource().getParent().getContent()[1];
			  
			  var tblFileInputId = matrnFile .getId() +'-fu';
			  
			  var reader = new FileReader();
			  
			  var tblFileInput = $.sap.domById(tblFileInputId);
			  
			  var tblFile = tblFileInput.files[0];
			  
			  tablObj.Docfile = tblFile.name;
			  tablObj.Mimetype = tblFile.type;
			  var base64marker = 'data:' + tblFile.type + ';base64,';
			  var dArr = this.lModel.getProperty("/lSet/navigprtodocs");
			  var that = this;
			  
			  reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index =evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64 = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64.toString(); 
					  	dArr.push(tablObj);
					  	that.lModel.setProperty("/lSet/navigprtodocs",dArr);
					  	matrnFile.clear();
				  }
			  
			  })();
			  
			  reader.readAsDataURL(tblFile);
			 
		},
		
		/*
		 * 
		 * Detail File Upload */
		
		onDetailFileUpload:function(oEvent){
		
			var tablObj = {};
			
			  var fragmentId = this.getView().createId("itemsFragment");
			  tablObj.PreqItem = this.cntxt.getObject().PreqItem;
			  tablObj.Serialno = (this.lModel.getProperty("/lSet/navigprtodocs").length+1).toString();
//			  var matrnFile =sap.ui.core.Fragment.byId(fragmentId, "matrnFile");
			  var matrnFile =  oEvent.getSource().getParent().getContent()[1];
			  
			  var tblFileInputId = matrnFile .getId() +'-fu';
			  
			  var reader = new FileReader();
			  
			  var tblFileInput = $.sap.domById(tblFileInputId);
			  
			  var tblFile = tblFileInput.files[0];
			  
			  tablObj.Docfile = tblFile.name;
			  tablObj.Mimetype = tblFile.type;
			  var base64marker = 'data:' + tblFile.type + ';base64,';
//			  var dArr = this.lModel.getProperty("/lSet/navigprtodocs");			  
			  var dArr  = this.lModel.getProperty(this.cntxt.getPath()+"/navigitemstofile");
			  
			  var that = this;
			  
			  reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index =evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64 = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64.toString(); 
					  	dArr.push(tablObj);
					  	that.lModel.setProperty(that.cntxt.getPath()+"/navigitemstofile",dArr);
					  	matrnFile.clear();
				  }
			  
			  })();
			  
			  reader.readAsDataURL(tblFile);
			
		},
		/*
		 * 
		 * File Upload On Edit*/
		
		onEditUpload:function(oEvent){
			
			if(this.sId && this.cntxt.getObject().PurGroup){						
			var tablObj = {};			
			var matrnFile =  oEvent.getSource().getParent().getContent()[1];
			var tblFileInputId = matrnFile.getId() +'-fu';
			 var reader = new FileReader();
			 var itmCntxt = this.cntxt.getObject();
			  var tblFileInput = $.sap.domById(tblFileInputId);
			  
			  var tblFile = tblFileInput.files[0];
			  
			  tablObj.Docfile = tblFile.name;
			  tablObj.Mimetype = tblFile.type;
			  tablObj.addordelete = "A";
			  tablObj.Doknr = itmCntxt.Doknr;
			  tablObj.Prno = this.sId;
			  tablObj.PreqItem = itmCntxt.PreqItem;
			  var base64marker = 'data:' + tblFile.type + ';base64,';
//			  var dArr = this.lModel.getProperty("/lSet/navigprtodocs");
			  var that = this;
			  
			  reader.onload =
			  (function(theFile) {
				  return function(evt) {
					  	var base64Index =evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64 = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64.toString(); 					  						  	
					  	matrnFile.clear();					  	
					  	that.getModel().create("/filelistSet",tablObj,{success:function(oData){
					  		var itemPath = this.cntxt.getPath()+"/navigitemstofile";
					  		var itemFiles = this.cntxt.getProperty("navigitemstofile");
					  		oData.Filedata = "";
					  		itemFiles.push(oData);
					  		this.lModel.setProperty(itemPath,itemFiles);
					  	}.bind(that),error:function(oError){
					  		this._handleError(oError);
					  	}.bind(that)})
				  }
			  
			  })();
			  
			  reader.readAsDataURL(tblFile);			
			
			}else{
				
					this.onDetailFileUpload(oEvent);
			}
			
			
		},
		
		
		onCostCenterChg:function(oEvent){
			var CostCenter = oEvent.getSource().getSelectedKey();
			
			var fragmentId = this.getView().createId("itemsFragment");
			var aFilters = [];
			aFilters.push( new sap.ui.model.Filter("Kostl", "EQ",CostCenter) );
			var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode");

			matrnGLCode.setModel(this.getView().getModel());
			matrnGLCode.setModel(this.lModel,"lModel");

			matrnGLCode.bindItems({path : "/glaccountSet",
				filters: new sap.ui.model.Filter(aFilters, true),
				template : new sap.ui.core.ListItem({
							text : "{Txt20}",
							key : "{GlAccount}"
						})
			});
			
			matrnGLCode.setValue("");
			
			
		},
		
		
		onCostCenterDetailChg:function(oEvent){
			var CostCenter = oEvent.getSource().getSelectedKey();
			
			var fragmentId = this.getView().createId("itemDetail");
			var aFilters = [];
			aFilters.push( new sap.ui.model.Filter("Kostl", "EQ",CostCenter) );
			var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode");

			matrnGLCode.setModel(this.getView().getModel());
			matrnGLCode.setModel(this.lModel,"lModel");

			matrnGLCode.bindItems({path : "/glaccountSet",
				filters: new sap.ui.model.Filter(aFilters, true),
				template : new sap.ui.core.ListItem({
							text : "{Txt20}",
							key : "{GlAccount}"
						})
			});
			matrnGLCode.setValue("");
		},

		onCharLiveChange:function(oEvent){
			
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
		
		onFileDelete:function(oEvent){
	
		var oEvent = oEvent;
//		this.navItmPath   = this.cntxt.getPath()+"/navigitemstofile";
		this.fdelObj = oEvent.getParameter('listItem').getBindingContext().getObject();
		this.sdelPath = oEvent.getParameter('listItem').getBindingContext().getPath();
		if (!this.delItemDialog) {
			this.delItemDialog = new sap.m.Dialog({
						title : this.getResourceBundle().getText("warning"),
						type : 'Message',															
						content : new sap.m.Text({
									text : this.getResourceBundle().getText("delMsg")
								}),
						beginButton : new sap.m.Button({
							text : this.getResourceBundle().getText("PCYes"),
							type : "Accept",
							press : function(oEvt) {
//								sap.m.MessageToast.show("Submitted");								
								this.onDeleteDocItem(oEvent);
								this.delItemDialog.close();
								
							}.bind(this)
						}),
						endButton : new sap.m.Button({
							text : this.getResourceBundle().getText("PCNo"),
							type : "Reject",
							press : function() {
								this.delItemDialog.close();
							}.bind(this)
						})
					});

			// to get access to the global model
			this.getView().addDependent(this.delItemDialog);
		}

		this.delItemDialog.open();
		
	},
		
		onDeleteDocItem:function(oEvent){
			this.getView().setBusy(true);			
			var navPath = this.sdelPath.slice(0,-1)
			var docItemPath = this.sdelPath[this.sdelPath.length-1]
			var dMdl = this.getModel();			
			if(this.sId){
			var fltr = "Prno  eq '"+this.fdelObj.Prno+"' and PreqItem eq '"+this.fdelObj.PreqItem+"' and Doknr eq '"+this.fdelObj.Doknr+"' and Serialno eq '"+this.fdelObj.Serialno+"' and addordelete eq 'D'";
			 var that = this;
			dMdl.read("/filelistSet",{success:function(oData){
				
				var dItems = this.lModel.getProperty(navPath);
								
				dItems.splice(parseInt(docItemPath),1);
				this.lModel.setProperty(navPath,dItems);
				this.getView().setBusy(false);
			}.bind(this),error:function(oError){
				this.getView().setBusy(false);
			}.bind(this),
			urlParameters:{
				"$filter":fltr
				
			}
				
			})
			 
			}
		
		},
		
		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		
		onLiveChgNum:function(oEvent){
			 var mLnth = oEvent.getSource().getMaxLength();
			 var value = oEvent.getParameter('value');
			 var sOld = value.slice(0,value.length-1);
			 if(value.length > mLnth-1){
				 oEvent.getSource().setValue(sOld);
			 }
            
		},
		
//		onLiveChgQuanNum:function(oEvent){
//			
//			
//			 var value = oEvent.getSource().getValue();
//             var bNotnumber = isNaN(value);
//             if(bNotnumber == false)this.quan = value;	
//             else oEvent.getSource().setValue(this.quan);			    
//			
//		},
		
	//Remove Items	
		
		onItemRemove : function(oEvent) {

			oEvent.getSource().getParent().close();

			var arr = this.cntxt.getPath().split("/");
			var items = this.lModel.getProperty('/mainSet/navigtoitems');
			var pInt = parseInt(arr[arr.length - 1]);
			items.splice(pInt, 1);
			this.lModel.setProperty('/mainSet/navigtoitems',items);

			// lstbl.removeItem(parseInt(arr[arr.length-1]));

		},
		
		
		onMaterialSelect:function(oEvent){
			
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText(this.getResourceBundle().getText("MatDesc"));
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(false);											
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(false);
			
			//Material Unit and currency
//			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("EA");
			
	if(dId == "itemsFragment"){
				
				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("EA");
				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(true);
				sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(true);
			}
			
			
		

		},
		onSelectOthers:function(oEvent){
			
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText(this.getResourceBundle().getText("Description"));
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
			//Material Unit and currency	
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue(1);
//			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("AU");
			if(dId == "itemsFragment"){
				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("AU");
				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(false);
				sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(false);
			}else{
				var oMdl = this.cntxt.getModel();				
				oMdl.setProperty(this.cntxt.getPath()+"/Unit","AU");
			}
		},
		
		onSelectService:function(oEvent){
			var dId = oEvent.getSource().getParent().getParent().getParent().getId().split("--")[1];
			var fragmentId = this.getView().createId(dId);
			sap.ui.core.Fragment.byId(fragmentId, "matSrvDesc").setText(this.getResourceBundle().getText("srvDesc"));
			sap.ui.core.Fragment.byId(fragmentId, "id_startDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "id_DelvDt").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "id_endDt").setVisible(true);
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
//			Material Unit and currency
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue(1);
//			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("AU");
			if(dId == "itemsFragment"){
				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("AU");
			}else{
				var oMdl = this.cntxt.getModel();				
				oMdl.setProperty(this.cntxt.getPath()+"/Unit","AU");
			}
			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(false);
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(false);
			
		},
		
		onOpenDialItem : function(oEvent) {
			var sfragmentId =oEvent.getSource().getId().split("--")[1];
			var fragmentId = this.getView().createId(sfragmentId);
			
			var matBtn =  sap.ui.core.Fragment.byId(fragmentId,"mtrl");
			var segBtns = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader");
			matBtn.firePress();
			segBtns.setSelectedKey("1")
//			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setVisible(true);
			var docMnts = sap.ui.core.Fragment.byId(fragmentId,"id_docMnts");
			docMnts.setModel(this.lModel);
			var valCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr");
			valCurr.bindItems({
				path : "/currencySet",
				template : new sap.ui.core.ListItem({
							text : "{Waers}",
							key : "{Waers}",
							additionalText : "{Landx50}"
						})
			});

		

			var matrnUnit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit");
			matrnUnit.bindItems({path : "/unitsSet",
				template : new sap.ui.core.ListItem({
							text : "{Msehl}",
							key : "{Msehi}"
						})
			});
			// Account Assignment Catogery

			var matrnActAsignCat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat");
			matrnActAsignCat.bindItems({path : "/ACCATEGORYSet",
				template : new sap.ui.core.ListItem({
							text : "{Knttx}",
							key : "{Knttp}"
						})
			});
			
//		    aFilters.push( new sap.ui.model.Filter("Kostl", "EQ", ) );
			
			var matrnCC = sap.ui.core.Fragment.byId(fragmentId, "matrnCC");
			matrnCC.bindItems({
				path : "/costcentrelistSet",
				template : new sap.ui.core.ListItem({
							text : "{Ltext}",
							key : "{Kostl}"
						})
			});

			var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode");
			var aFilters = [];
			aFilters.push( new sap.ui.model.Filter("Kostl", "EQ","60001120"));
			
			matrnGLCode.bindItems({
				path : "/glaccountSet",
				filters: new sap.ui.model.Filter(aFilters),
				template : new sap.ui.core.ListItem({
							text : "{Txt20}",
							key : "{GlAccount}"
						})
			});
			
			if(this.getView().byId("L4").getSelectedIndex() == "1" ){
				sap.ui.core.Fragment.byId(fragmentId,"matrnValLbl").setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVal").setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").setVisible(false);
				
				sap.ui.core.Fragment.byId(fragmentId,"matrnVATLbl").setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").setVisible(false);	
//				sap.ui.core.Fragment.byId(fragmentId,"matrnVATPerc").setVisible(false);	
			}else{
				sap.ui.core.Fragment.byId(fragmentId,"matrnValLbl").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVal").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").setVisible(true);
				
				sap.ui.core.Fragment.byId(fragmentId,"matrnVATLbl").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVATLbl").setRequired(true);
//				sap.ui.core.Fragment.byId(fragmentId,"matrnVATPerc").setVisible(true);	
			}
			oEvent.getSource().setBusy(false);
		},

		// Detail Dialogue Item on After loading
		onOpenDetailDialItem : function(oEvent) {
			var fragmentId = this.getView().createId("itemDetail");
			if(this.sId && this.cntxt.getObject().PurGroup){	
//			var fragmentId = this.getView().createId("itemDetail");
			var dMdl = this.getModel();
			if(this.sId){
				var itemNum = oEvent.getSource().getBindingContext().getProperty("PreqItem");
				var fltr = "Prno  eq '"+this.sId+"' and PreqItem eq '"+itemNum+"'";
	//			/?$filter=Prno  eq '"+this.sId+"' and PreqItem eq '20'"
				 var that = this;
				dMdl.read("/filelistSet",{
					success:function(oData){
						var vPath = this.cntxt.getPath()+"/navigitemstofile";
						this.lModel.setProperty(vPath,oData.results);
					}.bind(this),
					error:function(oError){
					
					},
					urlParameters:{
						"$filter":fltr
					}
				})
			}
			}else{
			
			}	
			
			var rType = this.cntxt.getProperty("Requestmat");
			var segBtns = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader");
			var matBtn =  sap.ui.core.Fragment.byId(fragmentId,"mtrl");
			var srvBtn =  sap.ui.core.Fragment.byId(fragmentId,"srv");
			var othBtn =  sap.ui.core.Fragment.byId(fragmentId,"othrs");
			
			if(rType == "1"){
				
//				 sBtn =  sap.ui.core.Fragment.byId(fragmentId,"mtrl");
				segBtns.setSelectedKey(rType);
				matBtn.firePress();
				srvBtn.setEnabled(false);
				othBtn.setEnabled(false);
				//Material Unit and currency
				
//				sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue(1);
//				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("EA");
				
//				April 16th
				
//				if(dId == "itemsFragment"){
//					
//					sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(true);
//					sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(true);
//				}
				
				
			}else if(rType == "2"){
				segBtns.setSelectedKey(rType);
				srvBtn.firePress();
				matBtn.setEnabled(false);
				othBtn.setEnabled(false);
				//Material Unit and currency
				
				sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue(1);
				var oMdl = this.cntxt.getModel();				
				oMdl.setProperty(this.cntxt.getPath()+"/Unit","AU");
				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(false);
				sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(false);
				
			}else{
				
				segBtns.setSelectedKey(rType);
				othBtn.firePress();
				matBtn.setEnabled(false);
				srvBtn.setEnabled(false);
				//Material Unit and currency
				
				sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue(1);
//				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setSelectedKey("AU");
				var oMdl = this.cntxt.getModel();				
				oMdl.setProperty(this.cntxt.getPath()+"/Unit","AU");
				sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setEnabled(false);
				sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setEnabled(false);
				
			}
			
			
			if(this.getView().byId("L4").getSelectedIndex() == "1" ){
				
				
				sap.ui.core.Fragment.byId(fragmentId,"matrnValLbl").setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVal").setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").setVisible(false);
				
				sap.ui.core.Fragment.byId(fragmentId,"matrnVATLbl").setVisible(false);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").setVisible(false);	
//				sap.ui.core.Fragment.byId(fragmentId,"matrnVATPerc").setVisible(false);	
				
				
			}else{
				sap.ui.core.Fragment.byId(fragmentId,"matrnValLbl").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVal").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").setVisible(true);
				
				sap.ui.core.Fragment.byId(fragmentId,"matrnVATLbl").setVisible(true);
				sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").setVisible(true);
//				sap.ui.core.Fragment.byId(fragmentId,"matrnVATPerc").setVisible(true);	
				
				
			}
			
			

			var valCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr");
			valCurr.setModel(this.getView().getModel());
			valCurr.setModel(this.lModel,"lModel");

			valCurr.bindItems({path : "/currencySet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Waers}",
									key : "{Waers}",
									additionalText : "{Landx50}"
								})
					});

			var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
			valCurr.bindProperty("selectedKey",currPath);

			var matrnUnit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit");

			matrnUnit.setModel(this.getView().getModel());
			matrnUnit.setModel(this.lModel,"lModel");

			matrnUnit.bindItems({path : "/unitsSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Msehl}",
									key : "{Msehi}"
								})
					});
			// Account Assignment Catogery

			var unitPath = "lModel>"+ this.cntxt.getPath()+ "/Unit";
			matrnUnit.bindProperty("selectedKey", unitPath);

			var matrnActAsignCat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat");
			matrnActAsignCat.setModel(this.getView().getModel());
			matrnActAsignCat.setModel(this.lModel, "lModel");

			matrnActAsignCat.bindItems({path : "/ACCATEGORYSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Knttx}",
									key : "{Knttp}"
								})
					});

			var acPath = "lModel>"+ this.cntxt.getPath()+ "/Acctasscat";
			matrnActAsignCat.bindProperty("selectedKey", acPath);

			var matrnCC = sap.ui.core.Fragment.byId(fragmentId, "matrnCC");

			matrnCC.setModel(this.getView().getModel());
			matrnCC.setModel(this.lModel,"lModel");

			matrnCC.bindItems({path : "/costcentrelistSet",
						template : new sap.ui.core.ListItem(
								{
									text : "{Ltext}",
									key : "{Kostl}"
								})
					});

			var ccPath = "lModel>"+ this.cntxt.getPath()+ "/Kostl";
			matrnCC.bindProperty("selectedKey",ccPath);
			
			var aFilters = [];
			aFilters.push( new sap.ui.model.Filter("Kostl", "EQ",this.lModel.getProperty( this.cntxt.getPath()+ "/Kostl") ) );
			var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode");

			matrnGLCode.setModel(this.getView().getModel());
			matrnGLCode.setModel(this.lModel,"lModel");

			matrnGLCode.bindItems({path : "/glaccountSet",
						filters: new sap.ui.model.Filter(aFilters, true),
						template : new sap.ui.core.ListItem(
								{
									text : "{Txt20}",
									key : "{GlAccount}"

								})
					});

			var glPath = "lModel>"+ this.cntxt.getPath()+ "/Glaccont";
			matrnGLCode.bindProperty("selectedKey", glPath);

		},
		
		//Open File Download
		onOpenFile:function(oParm){
			var obj = oParm.getSource().getBindingContext().getObject();
	var sUrl = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" + obj.Doknr +"',lang='',ndavalue='"+obj.Serialno+"')/$value"
			window.open(sUrl,true);
			
		},
		
		
		//Save Detail Items

		onSaveDetailItem : function(oEvent) {
			
			if(this.itemValidation(this.cntxt.getObject())){
			
			this.lModel.setProperty("/lSet/editable", false);
			this.lModel.setProperty("/lSet/editable2", false);
			this.onPRCItemDialogueClose(oEvent);
			}else{
				
				var errText = this.getResourceBundle().getText("pfmf"); 				
				sap.m.MessageBox.error(errText, {title : this.getResourceBundle().getText("Error")});
				
			}
			
		},
		
		
		onEditDetailItem : function(oEvent) {

			
			if(this.cntxt.getProperty("Requestmat") != 1){
				this.lModel.setProperty("/lSet/editable2", false);				
			}else{
				this.lModel.setProperty("/lSet/editable2", true);
				
			}
			
			this.lModel.setProperty("/lSet/editable", true);
			

		},
		
		
		//Save Item while Creating PR
		
		
		onItemSave : function(oEvent) {

			var tablObj = {};

			var fragmentId = this.getView().createId("itemsFragment");

			tablObj.Material = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
			tablObj.ShortText = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
			tablObj.Quantity = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
			if (tablObj.Quantity) {
				tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);
			} else {
				tablObj.Quantity = 0;
				tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);

			}

			tablObj.Unit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit").getSelectedKey();
			tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat").getSelectedKey();
			tablObj.PreqPrice = sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue();

			if (tablObj.PreqPrice) {
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);
			} else {

				tablObj.PreqPrice = 0.01;
				tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);

			}
			
			tablObj.PreqItem = (this.lModel.getProperty("/mainSet/navigtoitems").length+1).toString();

			tablObj.Currency = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").getSelectedKey();
			tablObj.Begda = sap.ui.core.Fragment.byId(fragmentId,"itmStartDate").getDateValue();
			tablObj.Endda = sap.ui.core.Fragment.byId(fragmentId,"itmEndDate").getDateValue();
			tablObj.DelivDate = sap.ui.core.Fragment.byId(fragmentId,"DP1").getDateValue();
			tablObj.Discountvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue();
			if (tablObj.Discountvalue) {
				tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);
			} else {

				tablObj.Discountvalue = 0.00;

				tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);

			}
			tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getSelectedKey();
			// tablObj.discountvalue =
			// sap.ui.core.Fragment.byId(fragmentId,"matrnDiscType").getValue();
			if (tablObj.Vatvalue) {
//				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
			} else {
				tablObj.Vatvalue = "0";
//				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
			}

			tablObj.Kostl = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedKey();
			tablObj.Costtext = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText();
			tablObj.Glaccont = sap.ui.core.Fragment.byId(fragmentId,"matrnGLCode").getSelectedKey();

			tablObj.Excemtion = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem").getSelected();

			tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();

			tablObj.Excemtion = tablObj.Excemtion ? "X": "Y";

			var lDocs = this.lModel.getProperty("/lSet/navigprtodocs");
			tablObj.navigitemstofile = lDocs;
			var allFiles  = this.lModel.getProperty("/mainSet/navigprtodocs"); 
//			allFiles.push();
			this.lModel.setProperty("/mainSet/navigprtodocs",allFiles.concat(lDocs));
			this.lModel.setProperty("/lSet/navigprtodocs",[])
			this.enableButton(true);
			
			if(this.itemValidation(tablObj)){
			
			var lTbl = this.lModel.getProperty("/mainSet/navigtoitems");
			lTbl.push(tablObj);
			this.lModel.setProperty("/mainSet/navigtoitems",lTbl);

			var dItemBox = sap.ui.core.Fragment.byId(fragmentId,"idPRCDialog");
			this.onItemReset();
			
			dItemBox.close();
//			this.byId("idIconTabBar").setSelectedKey("icon_Commercials");
			
			}else{
				
				var errText = this.getResourceBundle().getText("pfmf"); 				
					sap.m.MessageBox.error(errText, {title : this.getResourceBundle().getText("Error")});
				
				
			}
			

		},
		enableButton:function(){
			this.byId("prSave").setVisible(true);
			this.byId("prSaveSubmit").setVisible(true);
			this.byId("prCancel").setVisible(true);
			
		},
		

		
		//Create item before dialouge open
		onBefDialOpen:function(oEvent){
			
			oEvent.getSource().setBusy(true);
			
			
		},
		
		// Item Reset in Dialogue
		onItemReset : function(oEvent) {

			var fragmentId = this.getView().createId("itemsFragment");

			sap.ui.core.Fragment.byId(fragmentId, "matrnNo").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "matrnDesc").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "matrnVal").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setDateValue(new Date());
			sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").setValue("");
			sap.ui.core.Fragment.byId(fragmentId, "matrnDiscVal").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "matrnVAT").setValue("");

			sap.ui.core.Fragment.byId(fragmentId, "matrnBudExem").setSelected(false);
			sap.ui.core.Fragment.byId(fragmentId, "DP1").setValue("");
	
		},
		
		
		
		
	/*
	 * 	
		validation while create
	 */		
		validation : function(ptData) {
			var zDat     = ptData.Zrequestdate ? true: false;
			var zptDat   = ptData.navigtoitems.length == 0 ? false:true;
			var zreBrf   = ptData.Zrequestbreif.length == 0 ?false:true;
			var zLifnr   = true;
			if (ptData.Zrequesttype !== '1'){
				zLifnr   = ptData.Lifnr?true:false;
			}
		    return  (zDat & zptDat & zreBrf & zLifnr )==1?true:false;
		},
		
		
		/*
		 * 	
			validation while item create
		 */
		
		
		itemValidation:function(oParm){
			
			var errMsg = "";
			if(oParm.Requestmat == "1")
			{		
				var stErrMsg = oParm.ShortText ? true:false;
				var qUErrMsg = (parseInt(oParm.Quantity) == 0 || oParm.Quantity == "") ? false:true;
				
				
				errMsg = stErrMsg & qUErrMsg;
				
			
			
			}else if(oParm.Requestmat == "2" || oParm.Requestmat == "3" ){
				var stErrMsg = oParm.ShortText  ? true:false;
				var qUErrMsg = (parseInt(oParm.Quantity) == 0 || oParm.Quantity == "")? false:true;				
				var sDtErrMsg  = oParm.Begda ? true:false;
				var eDtErrMsg  = oParm.Endda? true:false;				
				var cDtErrMsg;
				if(oParm.Begda > oParm.Endda){
					cDtErrMsg = false;
					 
					 
				 }else{
					 
					 cDtErrMsg = true;
					 
				 }
				
				
				errMsg = stErrMsg & qUErrMsg & sDtErrMsg & eDtErrMsg&cDtErrMsg;
				
			}else{
				errMsg = 0
				
			}
			
//			if((this.getView().byId("L4").getSelectedIndex() != "1") && (errMsg != 0)){
//				
//				errMsg = oParm.Vatvalue != "0.00"?1:0;
//				
//				
//			}
			
			
			return errMsg == 0?false:true;
			
		},
		
		
		onBefDialOpen:function(oEvent){
			
			oEvent.getSource().setBusy(true);
			
			
		},
		
		
//		_apprvYes:function(oEvent){
//			this.onItemReset();
//			oEvent.getSource().getParent().close();
//
//		},
		
		onPRCDialogueClose : function(oEvent) {
			var tDial = oEvent.getSource().getParent();
			if (!this.apprDialog) {
				this.apprDialog = new sap.m.Dialog({
							title : this.getResourceBundle().getText("Approve"),
							type : 'Message',															
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("ApproveSuccess")
									}),
							beginButton : new sap.m.Button({
								text : this.getResourceBundle().getText("PCYes"),
								type : "Accept",
								press : function() {
//									sap.m.MessageToast.show("Submitted");
									this.apprDialog.close();
									this.onItemReset();
									tDial.close();
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
		
		
		
		_handleError : function(oError){
			
			this.getView().setBusy(false);
			
			try{
				
				var oJson = JSON.parse( oError.responseText);
				
				
				MessageBox.error(
						decodeURIComponent(oJson.error.message.value), {
							
							title : this.getResourceBundle().getText("Error"),
						});
				
				
				} catch(e){
					
					MessageBox.error(
							decodeURIComponent(oError.response.body), {
								
								title : this.getResourceBundle().getText("Error"),
							});
					
					
					
				};
			
			
			
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
				this.getRouter().navTo("mobileMaster", {},true);
			}
			
			
		},
		

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		handleLiveChange: function(oEvent){
			var oInput           = oEvent.getSource(),
				iValueLength     = oInput.getValue().length,
				iMaxLength       = oInput.getMaxLength(),
				iWarningLength   = iMaxLength - 10,
				iRemainingLength = iMaxLength - iValueLength,
				sStateText       = this.getResourceBundle().getText("CharactersLeft",[iRemainingLength]),
				sState;
			if (iValueLength > iWarningLength && iValueLength < iMaxLength){
				sState = 'Warning';
			}else if (iValueLength == iMaxLength){
				sState = 'Error';
			}else{
				sState = 'None';
			}
		    
		    oInput.setValueState(sState);
		    oInput.setValueStateText(sStateText);
		}
	});
});