sap.ui.define([
	"z_inbox/controller/BaseController", 
	"sap/ui/core/routing/History",
	"sap/ui/Device", 
	'sap/m/MessageBox',
	"z_inbox/model/formatter"
  ], function(Controller, History, Device, MessageBox, formatter) {
	return Controller.extend("z_inbox.controller.quotation.QRedit",{
		formatter : formatter,
		onInit: function(){
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			this.getOwnerComponent().getRouter().getRoute("QRedit").attachPatternMatched(this._onRouteMatched,this);
		},
		_onRouteMatched: function(oEvent){
			this.sId       = oEvent.getParameter("arguments").id;
			this.instId    = oEvent.getParameter("arguments").instId;
			this.sPath     = "/qrheaderSet('" + this.sId + "')";
			var that       = this;
			var oMdl       = this.getOwnerComponent().getModel();
			oMdl.read(this.sPath,{
				success : function(oData) {
					that.lModel.setData(oData);
					that.lModel.setProperty('/deletedItem',[]);
					that.PRNO = oData.PreqNo;
					that.lModel.setProperty("/Banfn",that.sId);
				},
				error:function(oError){
					
				},
				urlParameters : {
						"$expand":"navigtoqrsplapproval,navigprtoqrfinal,qrnavig"
				}
			});
			var fltr = "Prno  eq '"+this.sId+"' and PreqItem eq ''";
			var that = this;
			oMdl.read("/filelistSet",{
				success:function(oData){
		    		this.lModel.setProperty("/navigqrtodocuments",oData.results);
				}.bind(this),
				error:function(oError){
					
				},
				urlParameters:{
					"$filter":fltr
				}
			});
		},
		onItemAdd: function(oEvent){
			var sPath              = oEvent.getSource().getParent().getBindingContext('lModel').getPath(); // get the path of the pressed add button
			var aQrSelectedData    = this.lModel.getProperty(sPath);                                       // get the all the data of the selected line item
			var aItem              = jQuery.extend(true, {}, aQrSelectedData);
			aItem.AddInd           = 'X';                                                                  // set the flag for Add Indicator
			var aQrItemData        = this.lModel.getProperty('/qrnavig/results');                          // get all the data of the model
			aQrItemData.push(aItem);                                                                       // copy the data of the model as a new item in the model
			this.lModel.setProperty('/qrnavig/results',aQrItemData); 
		},
		onItemDelete: function(oEvent){
			var sPath           = oEvent.getSource().getParent().getBindingContext('lModel').getPath();
			var aQrSelectedData = this.lModel.getProperty(sPath);                                       // get the all the data of the selected line item
			var aItem           = jQuery.extend(true, {}, aQrSelectedData);
			if(aItem.AddInd === ''){
				aItem.DelInd        = 'X';                                                              // set the flag for Delete Indicator
				var aDeleteItemData = this.lModel.getProperty('/deletedItem');
				aDeleteItemData.push(aItem); 
				this.lModel.setProperty('/deletedItem',aDeleteItemData);
			}
			var index           = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aQrItemData     = this.lModel.getProperty('/qrnavig/results'); 
			aQrItemData.splice(index, 1);
			this.lModel.setProperty('/qrnavig/results',aQrItemData); 
		},
		subTotalCalc: function(oEvent){
			var rowCells       = oEvent.getSource().getParent().getCells();
			var discPerc       = rowCells[4].getValue();
			var TargetQty      = rowCells[1].getValue();       //Quantity from Row
			var perUnitPrice   = rowCells[3].getValue();       //Per Unit Price form Row
			var totalQuanVal   = TargetQty * perUnitPrice;
			var iDiscountValue = (Number(perUnitPrice) * Number(discPerc)/100);
			var subTotal       = Number(TargetQty) * (Number(perUnitPrice) - iDiscountValue);
			var TotalVatValue  = ((subTotal*rowCells[7].getSelectedKey())/100);
			var gTotal         = subTotal + TotalVatValue;
			gTotal             = parseFloat(gTotal).toFixed(2);
			subTotal           = parseFloat(subTotal).toFixed(2);
			var sDiscountValue = parseFloat(iDiscountValue).toFixed(2);
			rowCells[6].setText(subTotal);
			rowCells[8].setText(gTotal);
			if (parseFloat(discPerc) > 100 ){
				rowCells[4].setValueState('Error');
			}else{
				rowCells[4].setValueState('None');
			}
		},
			
		liveDiscValChange: function(oEvent){
			var sDiscountValue = oEvent.getSource().getValue();
			var rowCells       = oEvent.getSource().getParent().getCells();
			var perUnitPrice   = rowCells[3].getValue();
			var sDiscountPer   = (Number(sDiscountValue) / Number(perUnitPrice) * 100 ).toFixed(2);
			rowCells[4].setValue(sDiscountPer);
			this.subTotalCalc(oEvent);
		},
		
		liveDiscPerChange: function(oEvent){
			var sDiscountValue = oEvent.getSource().getValue();
			var rowCells       = oEvent.getSource().getParent().getCells();
			var perUnitPrice   = rowCells[3].getValue();
			var sDiscountVal   = (Number(perUnitPrice) * Number(sDiscountValue)/100).toFixed(2);
			rowCells[5].setValue(sDiscountVal);
			this.subTotalCalc(oEvent);
		},
		
		liveValueChange: function(oEvent){
			var rowCells       = oEvent.getSource().getParent().getCells();
			var sValue         = rowCells[3].getValue();
			var sDiscPer       = rowCells[4].getValue();
			var sDiscountVal   = (Number(sValue) * Number(sDiscPer)/100).toFixed(2);
			rowCells[5].setValue(sDiscountVal);
			this.subTotalCalc(oEvent);
		},
		
		onSaveQR:function(oEvent){
			this.getView().setBusy(true);		
			var tt               = this.getView().byId('idtable').getItems();
			var selectedCurrency = this.getView().byId('idCurrency').getText();
			var qrNo             = this.sId;
			var qr               = { "Ebeln": qrNo, 'Currency': selectedCurrency};
			var items            = [];
			var aQrItem          = this.lModel.getProperty("/qrnavig/results"),
				aDeletedItem     = this.lModel.getProperty('/deletedItem'),
				i;
			var	items            = jQuery.extend(true, [], aQrItem);
			for (i=0; i < aDeletedItem.length; i++){
				items.push(aDeletedItem[i]);
			};
			var itemslength  = items.length;
			
			for(i = 0; i < itemslength; i++){
				delete items[i].__metadata;
				delete items[i].__proto__;
			};
			
			qr.qrnavig  = items;
			var i , len = qr.qrnavig.length, iDiscount, sItemDesc, sSave = true;
			for ( i = 0; i < len; i++){
				iDiscount = qr.qrnavig[i].Discountval;
				sItemDesc = qr.qrnavig[i].ShortText;
				iDiscount = parseFloat(iDiscount);
				if( iDiscount > 100){
					sSave     = false;
					this.getView().setBusy(false);
					var sTitle = this.getResourceBundle().getText("Error");
					var sText  = this.getResourceBundle().getText("DicountErrorMsg",[sItemDesc]);
					MessageBox.error(sText, {							
						title : sTitle
					});
				}
			}
			
			if( sSave === true){
				var files = this.lModel.getProperty("/navigqrtodocuments");
				var filArr = [];
				for(var i=0,j=files.length;i<j;i++){
					 if(files[i].PreqItem != "00000"){
						 filArr.push(files[i]);
					 }
				}
	     		qr.navigqrtodocuments = filArr;
				var oMdl  = this.getOwnerComponent().getModel();
				var that = this;
				oMdl.create("/qrheaderSet",qr,{
					success:function(oEvent){
						that.updateSpecialApproval(that);
					},
					error:function(oError){
						that.UpdateItems = false;
						that._handleError(oError);
					}
					
				});
			}
		},
		updateSpecialApproval : function(that) {
			var aRecommendData    = {};
			aRecommendData.Ebeln  = that.sId;		
			aRecommendData.Fixpo  = "X";				
			var aRecommendReason        = that.lModel.getProperty('/navigprtoqrfinal/results');
			var aReason                 = jQuery.extend(true, [], aRecommendReason);
			aReason[0].Prno             = that.lModel.getProperty('/PreqNo');
			aReason[0].Qrno             = that.sId;
			aReason[0].Others           = that.getView().byId('qc_Others').getValue();
			aRecommendData.navigprtoqrfinal     = aReason;
			aRecommendData.navigtoqrsplapproval = that.lModel.getProperty("/navigtoqrsplapproval/results")
			var that   = that;
			var oModel = that.getOwnerComponent().getModel();
			oModel.create("/qrheaderSet",aRecommendData,{
				success:function(oData){
					that.getView().setBusy(false);
					var msg = that.getResourceBundle().getText("QRSubmitSuccess", [that.sId]);
					sap.m.MessageBox.success(msg, {
						onClose: function(sAction) {
							that.getOwnerComponent().getRouter().navTo("QR",{id : that.sId,instId : that.instId},!Device.system.phone);
						}
					});
					that.getOwnerComponent().getModel().refresh();
				},
				error:function(oError){
					that.UpdateSpecialApproval = false;
					that._handleError(oError, that);
				}
			});
		},
		
		_handleError: function(oEvent, that){
			that.getView().setBusy(false);
			var emsg= $(oData.responseText).find("message").first().text();
			var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.error(emsg	);
		},
		
		onCancelQR : function(oEvent) {
			if (!this.CancelDialog) {
				this.CancelDialog = new sap.m.Dialog({
							title : this.getResourceBundle().getText("CCCancel"),
							type : 'Message',
							draggable : true,
							content : new sap.m.Text({
										text : this.getResourceBundle().getText("RACancelRequest")
									}),
							beginButton : new sap.m.Button({
								text : this.getResourceBundle().getText("CCYes"),
								type : "Accept",
								press : function() {
									this.CancelDialog.close();
									this._CancelYes(oEvent);
								}.bind(this)
							}),
							endButton : new sap.m.Button({
								text : this.getResourceBundle().getText("CCNo"),
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
		
		_CancelYes: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("QR",{id : this.sId, instId : this.instId},!Device.system.phone);
		},
		
		onFileUpload:function(oEvent){
			this.getView().setBusy(true);
			var tablObj        = {};
			var doknr          = this.lModel.getProperty('/Doknr');
	    	var fragmentId     = this.getView().createId("itemsFragment");		 
			var matrnFile      = this.byId("matrnFile");
			var tblFileInputId = matrnFile .getId() +'-fu';
			var reader         = new FileReader();
			var tblFileInput   = $.sap.domById(tblFileInputId);
			var tblFile        = tblFileInput.files[0];
			tablObj.Docfile    = tblFile.name;
			tablObj.Mimetype   = tblFile.type;
			var base64marker   = 'data:' + tblFile.type + ';base64,';
			var dArr           = this.lModel.getProperty("/navigqrtodocuments");
			var that           = this;
			reader.onload      = (function(theFile) {
				  return function(evt) {
					  	var base64Index  = evt.target.result.indexOf(base64marker) +base64marker.length; 
					  	var base64       = evt.target.result.substring(base64Index);
					  	tablObj.Filedata = base64; 
					  	if(doknr != ""){
					  		tablObj.addordelete = "A";
							tablObj.Doknr       = doknr;
							tablObj.Prno        = that.sId;
					  		
					  		that.getModel().create("/filelistSet",tablObj,{
					  			success:function(oData){
					  				var dArr = this.lModel.getProperty("/navigqrtodocuments");
					  				oData.PreqItem = "00000";
					  				dArr.push(oData);
					  			    that.lModel.setProperty("/navigqrtodocuments",dArr);
					  			    this.getView().setBusy(false);
					  			}.bind(that),error:function(oError){
					  				this._handleError(oError);
					  			}.bind(that)})
					  	}else{
					  		
					  	}
					  	matrnFile.clear();
				  }
			  })();
			  reader.readAsDataURL(tblFile);
		},
		
		onOpenFile:function(oParm){
			var obj  = oParm.getSource().getBindingContext('lModel').getObject();
			var sUrl = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" + obj.Doknr +"',lang='',ndavalue='"+obj.Serialno+"')/$value"
			window.open(sUrl,true);
		},
		
		onFileDelete:function(oEvent){
			var oEvent = oEvent;
			this.fdelObj  = oEvent.getParameter('listItem').getBindingContext('lModel').getObject();
			this.sdelPath = oEvent.getParameter('listItem').getBindingContext('lModel').getPath();
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
		
		handleLiveQRInput:function(oEvent){
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
//		new Promise(function(fulfill, reject){
//		    //do something for 5 seconds
//		    fulfill(result);
//		}).then(function(result){
//		    return new Promise(function(fulfill, reject){
//		        //do something for 5 seconds
//		        fulfill(result);
//		    });
//		}).then(function(result){
//		    return new Promise(function(fulfill, reject){
//		        //do something for 8 seconds
//		        fulfill(result);
//		    });
//		}).then(function(result){
//		    //do something with the result
//		});
	})
});