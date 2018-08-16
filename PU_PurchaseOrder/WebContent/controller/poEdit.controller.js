sap.ui.define( [
		"jquery.sap.global",
		"poApp/controller/BaseController", 
		"sap/ui/Device",
		"poApp/model/formatter" ,
		'sap/m/MessageBox',
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/Button'
	], function (jQuery, Controller, Device, formatter, MessageBox, Dialog, Text, Button) {
	"use strict";

	return Controller.extend("poApp.controller.poEdit", {
		formatter: formatter,
		onInit: function() {
//			if (!jQuery.support.touch) { this.getView().addStyleClass("sapUiSizeCompact");
			this.lModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.lModel, "lModel");
			var docTbl    = this.getView().byId("id_docMnts");
	        docTbl.setModel(this.lModel);
			this.getOwnerComponent().getRouter().getRoute("PO").attachPatternMatched(this._onRouteMatched,this);

		},

//	onBeforeRendering: function() {
//
//	},
	
	_onRouteMatched:function(oEvent){
		this.getView().setBusy(true);
		this.conditionsCurrencyfill();
		try{
			this.sId= oEvent.getParameter("arguments").id;
		}catch(oEr){
			this.sId  ;	
		}
		var tbData = {
				"lSet"           : {"editable":false},
				"mainSet"        : {},
				"dEditable"      : false,
				"tempDelData"    : [],
				"POEdit"         : false,
				"lSet1"          : [],
				"tempDelInstData": [],
				"poServices"     : [],
				"poInstallment"  : [],
				"tempPoItemNo"   : []
			};
		this.lModel.setData(tbData);
		this.sPath  = "/POHEADERSet('"+ this.sId + "')";
		var iconTab = this.byId("id_iconTB");
		iconTab.setSelectedKey("PO");
		var oMdl    = this.getOwnerComponent().getModel("pom");
		oMdl.read(this.sPath,{
			success : function(oData) {
				this.lModel.setProperty("/mainSet",oData);
				console.log(this.lModel.getProperty("/mainSet"));
				this.getView().byId("idTotalValCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Totcurrency"));
				this.getView().byId("idSubTotCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Subtotcurr"));
				this.getView().byId("idTotalVatValCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Vatvaluecurr"));
				this.getView().byId("idTotalDiscCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Discountcurr"));
				this.getView().byId("idPayterms").setSelectedKey(this.lModel.getProperty("/mainSet/Pmnttrms"));
				//this.getView().byId("idPayterms").setSelectedKey(this.lModel.getProperty("/mainSet/Pmnttrms"));
				var oTable1 = this.getView().byId("idItemTable");
				oTable1.setModel(this.lModel);
				this.getView().setBusy(false);
				this.conditionfill(); 
			}.bind(this),
			error : function(oError) {
				this.getView().setBusy(false);
				var err = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
				var sErr = err.getElementsByTagName("message")[0].innerHTML
				MessageBox.error(sErr, {
					title : "Error",
				});
			}.bind(this),
			urlParameters : {
				"$expand" : "navtoitem"
			}
		});

		//Paymen terms dropdown population
		var Payterms = this.getView().byId("idPayterms"); 
		Payterms.setModel(this.getOwnerComponent().getModel("pom"));
		Payterms.bindItems({
			path : "/PAYMENTTERMSSet",
			template : new sap.ui.core.ListItem({
				text : "{Vtext}",
				key : "{Zterm}",
				
			})
		});
		
		var oModel  = this.getOwnerComponent().getModel("pom");
        var fltr = "pogrinvnumber  eq '"+ this.sId +"'";
        var that = this;
        oModel.read("/FilelistSet",{
          success:function(oData){
            var files = this.lModel.getProperty("/lSet1");
            this.lModel.setProperty("/lSet1",$.merge(files,oData.results));
          }.bind(this),
          error:function(oError){
          },
          urlParameters:{
            "$filter":fltr
          }
        })
		// use this to set the Payment terms ket returned from PO service
		//this.getView().byId("idPayterms").setSelectedKey(this.lModel.getProperty("/mainSet/Discountcurr"));
	},
	
	// on press of PDF save button
	onPDFSavePress1: function(oEvent){
		
		this.getView().setBusy(true);
//		/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PO',appno='0118TEO161',lang='E',ndavalue='')/$value
//		/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PO',appno='0118TEO161',lang='A',ndavalue='')/$value
//		/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='PO',appno='0118TEO173',lang='A',ndavalue='')/$value
//		var lang="";
//		if(oEvent.getParameters("id").id == "__xmlview3--idbtnArabic"){
//			lang = "A"
//		} else {lang = "E"}
		var lang            = sap.ui.getCore().getConfiguration().getLanguage();
		var first = "apptype='PO'";
		var second = "appno='" + this.sId +  "'";
		var third = "lang='"+lang+"'";
		this.sPath = "/FORM_TO_PDFSet(" +first+ "," +second+ "," +third+ ",ndavalue='')";
		
		console.log(this.sPath);
		var oMdl = this.getOwnerComponent().getModel("prm");
		oMdl.read(
				this.sPath,
				{
					success : function(oData) {
						this.getView().setBusy(false);
	                     var pdfURL = oData.pdfstring;    
	                    // var html = this.getView().byId("pdfContainer");
	                    // html.setContent("<iframe src=" + pdfURL + " width='700' height='700'></iframe>");
	                     window.open("<iframe src=" + pdfURL + " width='700' height='700'></iframe>",true);
					}.bind(this),
					error : function(oError) {
							var shText = oError.responseText;
							MessageBox.error(shText, {
										title : this.getResourceBundle().getText("Error"),
									});
						  this.getView().setBusy(false);
					}.bind(this),
					urlParameters : {
						"$value" : ""
					}
				});
	},
	
	onPDFSavePress: function(oEvent){
		var lang="";
		var lang = sap.ui.getCore().getConfiguration().getLanguage();
//		if(oEvent.getParameters("id").id == "__xmlview3--idbtnArabic"){
//			lang = "A"
//		} else {lang = "E"}
//		
		var first = "apptype='PO'";
		var second = "appno='" + this.sId +  "'";
		//var third = "lang='"+lang+"'";
		var third = "lang='"+lang+"'";
		var Path = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(" +first+ "," +second+ "," +third+ ",ndavalue='')/$value";		
		window.open(Path,true);
	},
	
	// On press of PO Edit button
	onPOEdit: function(){
		this.lModel.setProperty('/POEdit', true);
		this.onEditDetailItem();
		this.getView().byId("idEditBtn").setVisible(false);
		this.getView().byId("idPrintBtn").setVisible(false);
	},
	
	// On press of PO Edit Cancle button
	onPOEditCancle: function(){
		this.lModel.setProperty('/POEdit', false);
		this.lModel.setProperty('/dEditable', false);
		var oMdl    = this.getOwnerComponent().getModel("pom");
		oMdl.read(this.sPath,{
			success : function(oData) {
				this.lModel.setProperty("/mainSet",oData);
				console.log(this.lModel.getProperty("/mainSet"));
				this.getView().byId("idTotalValCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Totcurrency"));
				this.getView().byId("idSubTotCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Subtotcurr"));
				this.getView().byId("idTotalVatValCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Vatvaluecurr"));
				this.getView().byId("idTotalDiscCurr").setSelectedKey(this.lModel.getProperty("/mainSet/Discountcurr"));
				this.getView().byId("idPayterms").setSelectedKey(this.lModel.getProperty("/mainSet/Pmnttrms"));
				//this.getView().byId("idPayterms").setSelectedKey(this.lModel.getProperty("/mainSet/Pmnttrms"));
				var oTable1 = this.getView().byId("idItemTable");
				oTable1.setModel(this.lModel);
				this.getView().setBusy(false);
				this.conditionfill(); 
			}.bind(this),
			error : function(oError) {
				this.getView().setBusy(false);
				var err = new window.DOMParser().parseFromString( oError.responseText, "text/xml")
				var sErr = err.getElementsByTagName("message")[0].innerHTML
				MessageBox.error(sErr, {
					title : "Error",
				});
			}.bind(this),
			urlParameters : {
				"$expand" : "navtoitem"
			}
		});
		this.lModel.setProperty('/tempDelData', []);
		this.lModel.setProperty('/lSet1', []);
		this.lModel.setProperty('/tempDelInstData', []);
		this.lModel.setProperty('/poServices', []);
		this.lModel.setProperty('/poInstallment', []);
		this.lModel.setProperty('/tempPoItemNo', []);
		this.getView().byId("idEditBtn").setVisible(true);
		this.getView().byId("idPrintBtn").setVisible(true);
		
	},
	
	// On press of PO Edit Save button
	onPOEditSave: function(){
		this.getView().setBusy(true); 
		var poModel = this.getOwnerComponent().getModel("pom"); 
		var itemsData = [];
		itemsData = this.lModel.getProperty('/mainSet/navtoitem/results');
		for (var x = 0, len = itemsData.length; x < len; x++) {
		    delete itemsData[x].Excemtion;
		    delete itemsData[x].Costtext; 
		    delete itemsData[x].navServiceOrder;
		    var PoItem = itemsData[x].PoItem;
		    if(itemsData[x].PoItem == undefined){
		    	itemsData[x].PoItem = "000"+((x+1)*10).toString();
		    	itemsData[x].Plant = "6000";
    	    	itemsData[x].MatlGroup = "01";
		    }
		}
		
		var delInstalItems    = this.lModel.getProperty("/tempDelInstData");
		var Instalmentdata    = this.lModel.getProperty("/poServices");
		var InstDataLength    = Instalmentdata.length;
		for(var i =0;i<delInstalItems.length;i++){	
			delInstalItems[i].DeleteInd = 'X';
			Instalmentdata.push(delInstalItems[i]);		
		}
		var  headerData = {
			  PoNumber             : this.lModel.getProperty("/mainSet/PoNumber"),
			  Preq_No              : this.lModel.getProperty("/PRNo"),
			  QrNo                 : "",
			  Vendor               : this.lModel.getProperty("/mainSet/Vendor"),
			  Totalamt             : this.getView().byId("idTotalVal").getValue(),
			  //Totcurrency        : this.getView().byId("idTotalValCurr").getSelectedKey(),
			  Totcurrency          : "AED",
			  Vatvalue             : this.getView().byId("idTotalVatVal").getValue(),
			  //Vatvaluecurr       : this.getView().byId("idTotalVatValCurr").getSelectedKey(),
			  Vatvaluecurr         : "AED",
			  Totdiscount          : this.getView().byId("idTotalDisc").getValue(),
			 // Discountcurr       : this.getView().byId("idTotalDiscCurr").getSelectedKey(),
			  Discountcurr         : "AED",
			  Subtot               : this.getView().byId("idSubTot").getValue(),
			 // Subtotcurr         : this.getView().byId("idSubTotCurr").getSelectedKey(),
			  Subtotcurr           : "AED",
			  Planttitle           : this.getView().byId("idTitle").getValue(),
			  Plantname            : this.getView().byId("idName").getValue(),
			  Plantstreet          : this.getView().byId("idStreet").getValue(),
			  Plantregion          : this.getView().byId("idRegion").getValue(),
			  Plantpostal          : this.getView().byId("idPin").getValue(),
			  Plantcountry         : this.getView().byId("idCountry").getValue(),
			  Splinstruct          : this.getView().byId("idSplInstrc").getValue(),
			  Pmnttrms             : this.getView().byId("idPayterms").getSelectedKey(),
			  Flag                 : "U",
			  Posubmit             : this.lModel.getProperty("/mainSet/Posubmit"),
			  navtoitem            : itemsData,
			  navigpoheadtoservices: Instalmentdata  //get data of Service Order Payment
		};
	    console.log(headerData);
		poModel.create("/POHEADERSet", headerData, { 
			  success : function( oData, response){
				  console.log(response);
				  this.lModel.setProperty('/POEdit', false);
				  this.getView().byId("idEditBtn").setVisible(true);
				  this.getView().byId("idPrintBtn").setVisible(true);
				  if(response.statusText == "Created"){
					  var shText = "PO :  " +response.data.PoNumber +"  " + this.getResourceBundle().getText("poUpdated");
					  MessageBox.success(shText, {
							title : this.getResourceBundle().getText("Success"),
					  });
				  }
		  this.getView().setBusy(false);
		  }.bind(this), 
		  error : function(oError) {
			var shText = oError.responseText;
			MessageBox.error(shText, {
				title : this.getResourceBundle().getText("Error"),
			});
		    this.getView().setBusy(false);
		  }.bind(this)
	  });
	},
	//conditions tab values fill 
	
	conditionfill: function(){
		
		// Start logic for filling condition tab values 
		var itemsData = [];
//		itemsData = this.lModel.getProperty('/mainSet/navigtoitems/results');
		itemsData = this.lModel.getProperty('/mainSet/navtoitem/results');
		var Subtotal1        = 0.00;
		var TotalPreqPrice1  = 0.00;
		var DiscountedPrice1 = 0.00;
		var TotalVatValue1   = 0.00;
		for (var x = 0, len = itemsData.length; x < len; x++){
			 var TotalPreqPrice     = 0.00;
			 var TotalVatvalue      = 0.00;
			 var TotalDiscountvalue = 0.00;
			 var DiscountedPrice    = 0.00;
			 var PriceAfterDiscount = 0.00;
			 var TotalVatValue      = 0.00;
			 var Subtotal           = 0.00;

			TotalPreqPrice     = Number(itemsData[x].NetPrice) * Number(itemsData[x].Quantity); //PreqPrice
			TotalPreqPrice1    = TotalPreqPrice1 + TotalPreqPrice;
			DiscountedPrice    = ((Number(itemsData[x].Discountval)*TotalPreqPrice)/100);       //Discountvalue
			DiscountedPrice1   = DiscountedPrice1 + DiscountedPrice;
			PriceAfterDiscount = TotalPreqPrice - DiscountedPrice;
			TotalVatValue      = ((PriceAfterDiscount*Number(itemsData[x].Vatvalue))/100);      //Vatvalue
			TotalVatValue1     = TotalVatValue1 + TotalVatValue;
			Subtotal           = PriceAfterDiscount + TotalVatValue;
			Subtotal1          = Subtotal1 + Subtotal;
		}

		this.getView().byId("idTotalVal").setValue(TotalPreqPrice1.toFixed(2));
		this.getView().byId("idTotalDisc").setValue(DiscountedPrice1.toFixed(2));
		this.getView().byId("idSubTot").setValue(Subtotal1.toFixed(2));
		this.getView().byId("idTotalVatVal").setValue(TotalVatValue1.toFixed(2));
		this.getView().byId("idObjh").setNumber(Subtotal1.toFixed(2));

		// End logic for filling condition tab values 
	},
	
	// on press of PO Item ADD
	onPOItemaddPress : function(oEvent) {
		if (!this.prCommDialog) {
			this.prCommDialog = sap.ui.xmlfragment(this.createId("itemsFragment"),"poApp.view.fragments.POItemAdd",this);
			this.getView().addDependent(this.prCommDialog);
			jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.prCommDialog);
		}
		this.prCommDialog.open();
	},
	
	// on press of PO Item Detail
	onPODetailItemPress : function(oEvent) {
		this.cntxt = oEvent.getSource().getBindingContext();
//		this.cntxt.getObject().PreqPrice ="0.00"
//		this.cntxt .PreqPrice = ""
		
		//start - get PO Number and selected PO Item Number
		var oBindContext= this.cntxt;
		var oModel      = oBindContext.getModel();
		var sPath       = oBindContext.getPath();

		this.selectedPONumber     = oModel.getData(sPath).mainSet.PoNumber;
		var itemIndex             = oBindContext.sPath.split("/")[4];
		this.selectedItemPONumber = oModel.getData(sPath).mainSet.navtoitem.results[itemIndex].PoItem;
		//end - get PO Number and selected PO Item Number
		
		if (!this.prItemDetailDialog) {
			this.prItemDetailDialog = sap.ui.xmlfragment(this.createId("itemDetail"),"poApp.view.fragments.POItemDetail",this); 
			// to
			this.getView().addDependent(this.prItemDetailDialog);
			jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), this.prItemDetailDialog);
		}
		// this.prItemDetailDialog.bindElement(cntxt);
		this.prItemDetailDialog.setModel(this.lModel);
		this.prItemDetailDialog.setBindingContext(this.cntxt);
		this.prItemDetailDialog.open();

	},
	
	// Items Remove
	onItemRemove : function(oEvent) {

		oEvent.getSource().getParent().close();

		var arr      = this.cntxt.getPath().split("/");
		var items    = this.lModel.getProperty('/mainSet/navtoitem/results');
		var pInt     = parseInt(arr[arr.length - 1]);
		var PRitemNo = items[pInt].PreqItem;
		if(PRitemNo){
			var tempDelData = this.lModel.getProperty("/tempDelData");
			var poData      = $.extend(true, {},items[pInt]);
			var temp        = {};
			temp.PreqItem = poData.PreqItem;
			temp.Banfn = poData.Banfn;												
			temp.Kostl = poData.Kostl;
			temp.Glaccount = poData.Glaccount;
			tempDelData.push(temp);
	
			this.lModel.setProperty("/tempDelData",tempDelData);
			this.conditionfill();
			
		}else{
			var POitemNo         = items[pInt].PoItem;
			var InstallmentData  = this.lModel.getProperty("/poServices");
			var InstalDataLength = InstallmentData.length;
			for( var x=0; x<InstalDataLength; x++ ){
				var Polineitem = InstallmentData[x].Polineitem;
				if( Polineitem === POitemNo ){
					InstallmentData.splice(x, 1);
				}
			}
			this.lModel.setProperty("/poServices", InstallmentData);
		}
																							
		items.splice(pInt, 1);
		this.lModel.setProperty('/mainSet/navtoitem/results',items);
		// lstbl.removeItem(parseInt(arr[arr.length-1]));
	},
	
	// Items Edit and display
	onEditDetailItem : function(oEvent) {
		this.lModel.setProperty("/dEditable", true);
	},
	
	// Detail Dialogue PO Item detail on After loading
	onOpenPODetailDialItem : function(oEvent) { 
		var fragmentId         = this.getView().createId("itemDetail");
		// start for Net price calculation
		var Quanity            = Number(sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue());
		var Value              = Number(sap.ui.core.Fragment.byId(fragmentId,	"matrnVal").getValue());
		var Vatvalue           = Number(sap.ui.core.Fragment.byId(fragmentId,	"matrnVAT").getValue());
		var Discountvalue      = Number(sap.ui.core.Fragment.byId(fragmentId,	"matrnDiscVal").getValue());
		var sCurrency          = sap.ui.core.Fragment.byId(fragmentId,	"matrnCurr").getSelectedKey();
//		Value			       = Value*Quanity;
		var DiscountedPrice    = ((Discountvalue*Value)/100);
//		var PriceAfterDiscount = Value - DiscountedPrice;
		var PriceAfterDiscount = (Value - DiscountedPrice)*Quanity;
		var TotalVatValue      = ((PriceAfterDiscount*Vatvalue)/100);
		var Subtotal           = PriceAfterDiscount + TotalVatValue;
		sap.ui.core.Fragment.byId(fragmentId, "idSubTotal"   ).setValue(PriceAfterDiscount.toFixed(2));				
		sap.ui.core.Fragment.byId(fragmentId, "matrnNetValue").setValue(Subtotal.toFixed(2));
		//this.getView().byId("matrnNetValue").setValue(Subtotal.toFixed(3));
		
		sap.ui.core.Fragment.byId(fragmentId,"idSubTotalCurr").setSelectedKey(sCurrency);		
		sap.ui.core.Fragment.byId(fragmentId,	"matrnNVCurr").setSelectedKey(sCurrency);			
		
		// end for Net price calculation
		
		var rType = this.cntxt.getProperty("Requestmat");
		var segBtns = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader");
		var matBtn =  sap.ui.core.Fragment.byId(fragmentId,"mtrl");
		var srvBtn =  sap.ui.core.Fragment.byId(fragmentId,"srv");
		var othBtn =  sap.ui.core.Fragment.byId(fragmentId,"othrs");
		
		if(rType == "1"){
//			 sBtn =  sap.ui.core.Fragment.byId(fragmentId,"mtrl");
			segBtns.setSelectedKey(rType);
			matBtn.firePress();
			srvBtn.setEnabled(false);
			othBtn.setEnabled(false);
			sap.ui.core.Fragment.byId(fragmentId,"idServicePaymentTableDisplay" ).setVisible(false);
		}else if(rType == "2"){
			segBtns.setSelectedKey(rType);
			srvBtn.firePress();
			matBtn.setEnabled(false);
			othBtn.setEnabled(false);
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId,"idServicePaymentTableDisplay" ).setVisible(true);
		}else{
			segBtns.setSelectedKey(rType);
			othBtn.firePress();
			matBtn.setEnabled(false);
			srvBtn.setEnabled(false);
			sap.ui.core.Fragment.byId(fragmentId, "matrnQuan").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").setVisible(false);
			sap.ui.core.Fragment.byId(fragmentId,"idServicePaymentTableDisplay" ).setVisible(true);
		}
		
		var NVCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnNVCurr");
		NVCurr.setModel(this.getOwnerComponent().getModel("prm"));
		NVCurr.setModel(this.lModel,"lModel");

		NVCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});
		var sSubTotalCurr = sap.ui.core.Fragment.byId(fragmentId,"idSubTotalCurr");
		sSubTotalCurr.setModel(this.getOwnerComponent().getModel("prm"));
		sSubTotalCurr.setModel(this.lModel,"lModel");

		sSubTotalCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
			})
		});
		var valCurr = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr");
		valCurr.setModel(this.getOwnerComponent().getModel("prm"));
		valCurr.setModel(this.lModel,"lModel");

		valCurr.bindItems({
			path : "/currencySet",
			template : new sap.ui.core.ListItem({
						text : "{Waers}",
						key : "{Waers}",
						additionalText : "{Landx50}"
					})
		});

		var currPath = "lModel>"+ this.cntxt.getPath()+ "/Currency";
		valCurr.bindProperty("selectedKey",currPath);

		var matrnUnit = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit");

		matrnUnit.setModel(this.getOwnerComponent().getModel("prm"));
		matrnUnit.setModel(this.lModel,"lModel");

		matrnUnit.bindItems({
			path : "/unitsSet",
			template : new sap.ui.core.ListItem({
						text : "{Msehl}",
						key : "{Msehi}"
					})
		});
		// Account Assignment Catogery

		var unitPath = "lModel>"+ this.cntxt.getPath()+ "/Orderunit";
		matrnUnit.bindProperty("selectedKey", unitPath);

		var matrnActAsignCat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat");
		matrnActAsignCat.setModel(this.getOwnerComponent().getModel("prm"));
		matrnActAsignCat.setModel(this.lModel, "lModel");

		matrnActAsignCat.bindItems({
			path : "/ACCATEGORYSet",
			template : new sap.ui.core.ListItem({
						text : "{Knttx}",
						key : "{Knttp}"
					})
		});

		var acPath = "lModel>"+ this.cntxt.getPath()+ "/Acctasscat";
		matrnActAsignCat.bindProperty("selectedKey", acPath);
		// Tax Code
		var matrnTaxCode = sap.ui.core.Fragment.byId(fragmentId,"matrnTaxcode");
		matrnTaxCode.setModel(this.getOwnerComponent().getModel("pom"));
		//matrnTaxCode.setModel(this.lModel, "lModel");
		matrnTaxCode.bindItems({
			path : "/TAXCODESSet",
			template : new sap.ui.core.ListItem({
						text : "{Text1}",
						key : "{Mwskz}"
					})
		});

		var TaxPath = "lModel>"+ this.cntxt.getPath()+ "/Tax_Code";
		matrnTaxCode.bindProperty("selectedKey", TaxPath);
		// cost center list 
		var matrnCC = sap.ui.core.Fragment.byId(fragmentId, "matrnCC");
		matrnCC.setModel(this.getOwnerComponent().getModel("prm"));
		matrnCC.setModel(this.lModel,"lModel");
		matrnCC.bindItems({
			path : "/costcentrelistSet",
			template : new sap.ui.core.ListItem({
						text : "{Ltext}",
						key : "{Kostl}"
					})
		});

		var ccPath = "lModel>"+ this.cntxt.getPath()+ "/Costcenter";
		matrnCC.bindProperty("selectedKey",	ccPath);
		var matrnGLCode = sap.ui.core.Fragment.byId(fragmentId, "matrnGLCode");
		matrnGLCode.setModel(this.getOwnerComponent().getModel("pom"));
		matrnGLCode.setModel(this.lModel,"lModel");

		matrnGLCode.bindItems({
			path : "/GLACCOUNTSSet",
			template : new sap.ui.core.ListItem({
						text : "{Txt20}",
						key : "{Saknr}"
					})
		});

		var glPath = "lModel>"	+ this.cntxt.getPath()	+ "/Glaccount";
		matrnGLCode.bindProperty("selectedKey", glPath);
		
		//Display Service Order
		
//		var vatPercentage    = this.cntxt.getProperty("Vatvalue");
//		var oServiceTemplate = new sap.m.ColumnListItem({
//			cells:[
//				new sap.m.Text({ text: "{ShortText}"}),
//				new sap.m.Text({ text: "{GrPrice}"}),
//				new sap.m.Text({ text: "{Vatamount}"}),
//				new sap.m.Text({ text: "{Netvalue}"}),
//				new sap.m.Text({ text: "{FormVal1}%"}),
//			]
//		});
//		
//		var ServiceOrderPath = "/POITEMSSet(PoNumber='"+this.selectedPONumber+"',PoItem='"+this.selectedItemPONumber+"')/navigpotoservices";
//		var ServiceTable = sap.ui.core.Fragment.byId(fragmentId,"idServicePaymentTableDisplay");
//		ServiceTable.setModel(this.getOwnerComponent().getModel("pom"));
//		ServiceTable.bindItems({path:ServiceOrderPath, template:oServiceTemplate});
		if(rType !== "1"){
			var poInstModel       = this.lModel.getProperty("/poInstallment");
			var poInstModelLength = poInstModel.length;
			if (poInstModelLength > 0){
				if(poInstModel.includes(this.selectedItemPONumber) === false){
					this._onPoLineSelected();
				}
			}else{
				this._onPoLineSelected();
			}
		}
		
	},
	
	//load Installment in local model on click of line item no.
	_onPoLineSelected: function(){
		var fragmentId       = this.getView().createId("itemDetail");
		var PoModel          = this.getOwnerComponent().getModel("pom");
		var poInstModel      = this.lModel.getProperty("/poInstallment");
		var ServOrderModel   = this.lModel.getProperty("/poServices");
		var ServiceOrderPath = "/POITEMSSet(PoNumber='"+this.selectedPONumber+"',PoItem='"+this.selectedItemPONumber+"')";
		PoModel.read(ServiceOrderPath,{
			success:function(oData, response){
				if (response.statusText === "OK"){
					var vPath = this.cntxt.getPath()+"/navServiceOrder";
					this.lModel.setProperty(vPath, oData.navigpotoservices.results);
					poInstModel.push(this.selectedItemPONumber);
					var oInstalmentItem = oData.navigpotoservices.results;
					var InstLength      = oInstalmentItem.length;
					if(InstLength === 0){
						sap.ui.core.Fragment.byId(fragmentId, "onServiceOrderType").setEnabled(true);
					}
					var x;
					for(x = 0; x < InstLength; x++){
						ServOrderModel.push(oInstalmentItem[x]);
					}
				}
			}.bind(this),
			error:function(oError){
			
			},
			urlParameters:{
				"$expand": "navigpotoservices"
			}
		});
	},
	
	// Items dialog close
	onPRCItemDialogueClose : function(oEvent) {
		var fragmentId = this.getView().createId("itemDetail");
		var matrnBudExem = sap.ui.core.Fragment.byId(fragmentId,"matrnBudExem");
		if (matrnBudExem.getSelected())
			this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'X';
		else
			this.lModel.getProperty(this.cntxt.getPath()).Excemtion = 'Y';
		oEvent.getSource().getParent().close();
	},

	
	onPOItemSave : function(oEvent) {
			var tablObj        = {};
			var fragmentId     = this.getView().createId("itemsFragment");
			tablObj.Material   = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
			tablObj.Short_Text = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
			tablObj.Quantity   = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
			if (tablObj.Quantity) {
				tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);
			};
			tablObj.Orderunit  = sap.ui.core.Fragment.byId(fragmentId,"matrnUnit").getSelectedKey();
			tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId,"matrnActAsignCat").getSelectedKey();
			tablObj.NetPrice   = sap.ui.core.Fragment.byId(fragmentId,"matrnVal").getValue();
//			tablObj.PreqPrice = "";
			if (tablObj.NetPrice) {
				tablObj.NetPrice = parseFloat(tablObj.NetPrice).toFixed(2);
			} else {
				tablObj.NetPrice = 0.01;
				tablObj.NetPrice = parseFloat(tablObj.NetPrice).toFixed(2);
			}
			tablObj.Currency    = sap.ui.core.Fragment.byId(fragmentId,"matrnCurr").getSelectedKey();
			tablObj.Begda       = sap.ui.core.Fragment.byId(fragmentId,"itmStartDate").getDateValue();
			tablObj.Endda       = sap.ui.core.Fragment.byId(fragmentId,"itmEndDate").getDateValue();
			tablObj.Delvdate    = sap.ui.core.Fragment.byId(fragmentId,"DP1").getDateValue();
			tablObj.Discountval = sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue();
			if (tablObj.Discountval) {
				tablObj.Discountval = parseFloat(tablObj.Discountval).toFixed(2);
			} else {
				tablObj.Discountval = 0.00;
				tablObj.Discountval = parseFloat(tablObj.Discountval).toFixed(2);
			}
//			tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue();
//			// tablObj.discountvalue =
//			// sap.ui.core.Fragment.byId(fragmentId,"matrnDiscType").getValue();
//			if (tablObj.Vatvalue) {
//				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
//			} else {
//				tablObj.Vatvalue = 0;
//				tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
//			}
			tablObj.Vatvalue   = sap.ui.core.Fragment.byId(fragmentId,"POitemAddVAT").getSelectedKey();
			tablObj.Tax_Code   = sap.ui.core.Fragment.byId(fragmentId,"POitemAddTaxCode").getValue();
			tablObj.Costcenter = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedKey();
			tablObj.Costtext   = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText(); 
			tablObj.Glaccount  = sap.ui.core.Fragment.byId(fragmentId, "matrnGLCode").getSelectedKey();
			tablObj.Excemtion  = sap.ui.core.Fragment.byId(fragmentId, "matrnBudExem").getSelected();
			tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
			if (tablObj.Requestmat !== "1"){
				var text     = "";
				var possible = "0123456789";
				for (var i = 0; i < 5; i++){
					text += possible.charAt(Math.floor(Math.random() * possible.length));
				}
				tablObj.PoItem = text;
			}
			// if (tablObj.Excemtion) {
			tablObj.Excemtion = tablObj.Excemtion ? "X"	: "Y";
			if(this.POitemValidation(tablObj)){	
				var lTbl = this.lModel.getProperty("/mainSet/navtoitem/results");
			try{
				lTbl.push(tablObj);
				}catch(oEr){
					var lTbl =[] ;	
					lTbl.push(tablObj);
				}
//			lTbl.push(tablObj);
			this.lModel.setProperty("/mainSet/navtoitem/results", lTbl);
			var dItemBox = sap.ui.core.Fragment.byId(fragmentId,"idPRCDialog");
			this.onItemReset();
			dItemBox.close()
			}else{
				var errText = "Please fill Mandatory fields"
				sap.m.MessageBox.error(errText, {title : "Error"});
			}
			this.conditionfill();
	},
	
	onItemSave : function(oEvent) { 
		var tablObj = {};
		var fragmentId    = this.getView().createId("itemsFragment");
		tablObj.Material  = sap.ui.core.Fragment.byId(fragmentId, "matrnNo").getValue();
		tablObj.ShortText = sap.ui.core.Fragment.byId(fragmentId,"matrnDesc").getValue();
		tablObj.Quantity  = sap.ui.core.Fragment.byId(fragmentId,"matrnQuan").getValue();
		if (tablObj.Quantity) {
			tablObj.Quantity = parseFloat(tablObj.Quantity).toFixed(2);
		};
		tablObj.Unit       = sap.ui.core.Fragment.byId(fragmentId, "matrnUnit").getSelectedKey();
		tablObj.Acctasscat = sap.ui.core.Fragment.byId(fragmentId, "matrnActAsignCat").getSelectedKey();
		tablObj.PreqPrice  = sap.ui.core.Fragment.byId(fragmentId, "matrnVal").getValue();
//		tablObj.PreqPrice = "";
		if (tablObj.PreqPrice) {
			tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);
		} else {
			tablObj.PreqPrice = 0.01;
			tablObj.PreqPrice = parseFloat(tablObj.PreqPrice).toFixed(2);
		}
		tablObj.Currency  = sap.ui.core.Fragment.byId(fragmentId, "matrnCurr").getSelectedKey();
		tablObj.Begda     = sap.ui.core.Fragment.byId(fragmentId, "itmStartDate").getDateValue();
		tablObj.Endda     = sap.ui.core.Fragment.byId(fragmentId, "itmEndDate").getDateValue();
		tablObj.DelivDate = sap.ui.core.Fragment.byId(fragmentId, "DP1").getDateValue();
		tablObj.Discountvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnDiscVal").getValue();
		if (tablObj.Discountvalue) {
			tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);
		} else {
			tablObj.Discountvalue = 0.00;
			tablObj.Discountvalue = parseFloat(tablObj.Discountvalue).toFixed(2);
		}
		tablObj.Vatvalue = sap.ui.core.Fragment.byId(fragmentId,"matrnVAT").getValue();
		// tablObj.discountvalue =
		// sap.ui.core.Fragment.byId(fragmentId,"matrnDiscType").getValue();
		if (tablObj.Vatvalue) {
			tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
		} else {
			tablObj.Vatvalue = 0;
			tablObj.Vatvalue = parseFloat(tablObj.Vatvalue).toFixed(2);
		}

		tablObj.Kostl      = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedKey();
		tablObj.Costtext   = sap.ui.core.Fragment.byId(fragmentId, "matrnCC").getSelectedItem().getText(); 
		tablObj.Glaccont   = sap.ui.core.Fragment.byId(fragmentId, "matrnGLCode").getSelectedKey();
		tablObj.Excemtion  = sap.ui.core.Fragment.byId(fragmentId, "matrnBudExem").getSelected();
		tablObj.Requestmat = sap.ui.core.Fragment.byId(fragmentId,"itemDialHeader").getSelectedKey();
		
		// if (tablObj.Excemtion) {
		tablObj.Excemtion = tablObj.Excemtion ? "X"	: "Y";
		if(this.itemValidation(tablObj)){	
			var lTbl = this.lModel.getProperty("/mainSet/navtoitem/results");
			lTbl.push(tablObj);
			this.lModel.setProperty("/mainSet/navtoitem/results", lTbl);
			var dItemBox = sap.ui.core.Fragment.byId(fragmentId, "idPRCDialog");
			this.onItemReset();
			dItemBox.close()
		}else{
			var errText = "Please fill Mandatory fields";
			sap.m.MessageBox.error(errText, {title : "Error"});
		}
		
	},
	
	onPRCDialogueClose : function(oEvent) {
		this.onItemReset();
		oEvent.getSource().getParent().close();
	},
	
	confirmDialog: function(oEvent) {
		
		if (!this.apprDialog) {
			this.apprDialog = new sap.m.Dialog({
						title : this.getResourceBundle().getText("Confirm"),
						type : 'Message',
						draggable : true,
						content : new sap.m.Text({
									text : this.getResourceBundle().getText("AreYou") + " : " + this.sId
								}),
						beginButton : new sap.m.Button({
							text : this.getResourceBundle().getText("Yes") ,
							type : "Accept",
							press : function() {
	//sap.m.MessageToast.show("Submitted");
								this.apprDialog.close();
								this.onPOEditSave(oEvent);
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
		this.apprDialog.open();
	},
	
	onSubmitPress : function(oEvent){
		this.lModel.setProperty("/mainSet/Posubmit", "X"),
		this.submitAggrement(oEvent);
	},
	submitAggrement: function(oEvent){
		if (!this.ConfirmDialog) {
			this.ConfirmDialog = new Dialog({
						title     : this.getResourceBundle().getText("Confirm"),
						type      : 'Message',
						state     : 'Warning',
						draggable : true,
						content : new Text({
									text : this.getResourceBundle().getText("submitMsg")
								}),
						beginButton : new Button({
							text : this.getResourceBundle().getText("Yes"),
							type : "Accept",
							press : function() {
								this.ConfirmDialog.close();
								this.getView().setBusy(true);
								this.onPOEditSave(oEvent);
							}.bind(this)
						}),
						endButton : new Button({
							text : this.getResourceBundle().getText("No"),
							type : "Reject",
							press : function() {
								this.ConfirmDialog.close();
							}.bind(this)
						})
					});

			// to get access to the global model
			this.getView().addDependent(this.ConfirmDialog);
		}

		this.ConfirmDialog.open();
	},
	onCreatePO: function(oEvent){
		this.getOwnerComponent().getRouter().navTo("master", true);
//		var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
//			
//			var shlHash = "zPurchasingOrder-create?id="+this.lModel.getProperty("/mainSet/Preq_No");
//			var hrefForProductDisplay  =  oCrossAppNav.toExternal({
//				  target : { shellHash : shlHash }
//			});
	},
		
	onServiceOrderType: function(oEvent){
		  var sKey         = oEvent.getSource().getSelectedKey();
		  var fragmentId   = this.getView().createId("itemDetail");
		  var sValueLabel  = sap.ui.core.Fragment.byId(fragmentId,	"idServiceOrderValue");
		  var sValueUnit   = sap.ui.core.Fragment.byId(fragmentId,	"idAddInstalTxt");
		  
		  if(sKey === 'P'){
			  sValueLabel.setText("Percentage");
			  sValueUnit.setText("%");
		  }else if(sKey === 'V'){
			  sValueLabel.setText("Value");
			  sValueUnit.setText("");
		  }
	  },
	
	onAddInstalment: function(oEvent){
		var sId          = oEvent.getSource().getId().split('--')[1];
		var fragmentId   = this.getView().createId(sId);
		var sDescription = sap.ui.core.Fragment.byId(fragmentId, "idAddInstalDesc").getValue();
		var sValue       = sap.ui.core.Fragment.byId(fragmentId, "idAddInstalValue").getValue();
		var sServiceType = sap.ui.core.Fragment.byId(fragmentId, "idServiceType").getSelectedKey();
		var sNetValue    = sap.ui.core.Fragment.byId(fragmentId, "matrnNetValue").getValue();
		var sCurrency    = sap.ui.core.Fragment.byId(fragmentId, "matrnCurr").getSelectedKey();
		var sPoItemNo    = this.selectedItemPONumber;
		var oValue       = sap.ui.core.Fragment.byId(fragmentId, "matrnVal");
		var oSubValue    = sap.ui.core.Fragment.byId(fragmentId, "idSubTotal");
		var oDiscount    = sap.ui.core.Fragment.byId(fragmentId, "matrnDiscVal").getValue();
		var oVat         = sap.ui.core.Fragment.byId(fragmentId, "matrnVAT").getValue();
		var oNetValue    = sap.ui.core.Fragment.byId(fragmentId, "matrnNetValue");
		var oVatPercent  = sap.ui.core.Fragment.byId(fragmentId, "POitemAddVAT").getSelectedKey();
		var currentValue = Number(oSubValue.getValue());
//		var currentNet   = Number(oNetValue.getValue());
		var currentNet   = currentValue;
		var totalGrossValue = 0;
		
		if (currentValue < 1){
			oValue.setValueState(sap.ui.core.ValueState.Error);
		}else{
			var tablObj = {};
			  
			if(sServiceType === 'V'){
//				tablObj.ShortText = sDescription + ' - ' + sValue + ' ' + sCurrency;
				tablObj.ShortText = sDescription;
				tablObj.Quantity  = "1";
				tablObj.GrPrice   = Number(sValue).toFixed(2);
				tablObj.BaseUom   = "GRO";
				tablObj.Formula   = "VOL01";
				tablObj.FormVal1  = "0.00";
				tablObj.Polineitem= sPoItemNo;
				tablObj.Vatamount = (sValue*oVatPercent/100).toFixed(2);
				tablObj.Netvalue  = (Number(sValue) + (sValue*oVatPercent/100)).toFixed(2);
			}else if(sServiceType === 'P'){
//			    tablObj.ShortText = sDescription + ' - ' + sValue + ' %';
				tablObj.ShortText = sDescription;
				tablObj.Quantity  = "1";
				tablObj.GrPrice   = (currentValue*sValue/100).toString();
				tablObj.BaseUom   ="%";
				tablObj.Formula   ="PERCENT";
				tablObj.FormVal1  =Number(sValue).toFixed(2);
				tablObj.Polineitem= sPoItemNo;
				tablObj.Vatamount = ((currentValue*sValue/100)*oVatPercent/100).toFixed(2);
				tablObj.Netvalue  = ((currentValue*sValue/100) + (sValue*oVatPercent/100)).toFixed(2);
		  	}
			
			var lTbl                 = this.lModel.getProperty("/poServices");
		  	var navServiceOrder      = this.lModel.getProperty(this.cntxt.getPath()+"/navServiceOrder");
		  	var serviceOrderLength;
		  	if ( navServiceOrder == undefined){
		  		serviceOrderLength = 0
		  	}else{
		  		serviceOrderLength = navServiceOrder.length;
		  		for(var x = 0; x < serviceOrderLength; x++ ){
		  			totalGrossValue +=  Number(navServiceOrder[x].GrPrice);
			  	}
		  	}
		  	totalGrossValue += Number(tablObj.GrPrice);
		  	if(currentValue >= totalGrossValue){
		  		var localItemSOTable = this.lModel.getProperty(this.cntxt.getPath()+"/navServiceOrder");
				var localInstTable = this.lModel.getProperty('/poServices');
				localInstTable.push(tablObj);
				this.lModel.setProperty("/poServices", localInstTable);
				
				var localItemTable   = this.lModel.getProperty(this.cntxt.getPath());
				if (localItemSOTable == undefined){
					localItemTable.navServiceOrder=[];
					localItemTable.navServiceOrder.push(tablObj);
					this.lModel.setProperty(this.cntxt.getPath(), localItemTable);
				}else{
					localItemSOTable.push(tablObj);
					this.lModel.setProperty(this.cntxt.getPath()+"/navServiceOrder", localItemSOTable);
				}
				
		  	}else{
		  		var extraInstallment = (Number(totalGrossValue) - Number(currentValue)).toFixed(2);
		  		var sAlert = this.getResourceBundle().getText("instExcVal", [extraInstallment, sCurrency]);
				MessageBox.error(sAlert, {
  					title : this.getResourceBundle().getText("Error"),
  				});
		  	}
		}
		var sDescription = sap.ui.core.Fragment.byId(fragmentId, "idAddInstalDesc").setValue('');
		var sValue       = sap.ui.core.Fragment.byId(fragmentId, "idAddInstalValue").setValue('');
	},  
	  
	handleInstalmentDelete: function(oEvent){
		var sPath        = oEvent.getParameter('listItem').getBindingContext().getPath();
	    var index        = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
	    var aItems       = this.lModel.getProperty('/poServices');
	    var dItems       = this.lModel.getProperty(this.cntxt.getPath()+'/navServiceOrder');
	    var selectedData = this.lModel.getProperty(sPath);
	    
	    var bItems       = this.lModel.getProperty(sPath);
	    var alength      = aItems.length;
	    var x, cItems;
	    for(x = 0; x < alength; x++){
			cItems = aItems[x]; 
			if(JSON.stringify(bItems) === JSON.stringify(cItems)){
				aItems.splice(x,1);
				this.lModel.setProperty('/poServices', aItems);
				
				delete selectedData.__metadata;
			    delete selectedData.__proto__;
			    var tempDelInstData = this.lModel.getProperty("/tempDelInstData");
			    tempDelInstData.push(selectedData);
			    this.lModel.setProperty("/tempDelInstData",tempDelInstData);
				
				dItems.splice(index,1);
				this.lModel.setProperty(this.cntxt.getPath()+"/navServiceOrder", dItems);
			}else{
			 
			}
	    }
	    
//	    delete selectedData.__metadata;
//	    delete selectedData.__proto__;
//	    var tempDelInstData = this.lModel.getProperty("/tempDelInstData");
//	    tempDelInstData.push(selectedData);
//	    this.lModel.setProperty("/tempDelInstData",tempDelInstData);
//	    dItems.splice(index,1);
//	    this.lModel.setProperty(this.cntxt.getPath()+"/navServiceOrder", dItems);
	    //set value or percentage drop-down as editable
	    var InstalmentData       = this.lModel.getProperty(this.cntxt.getPath()+"/navServiceOrder");
	    var InstalmentDataLength = InstalmentData.length;
	    if(InstalmentDataLength === 0){
	    	var fragmentId      = this.getView().createId("itemDetail");
	    	var oVorPdrop       = sap.ui.core.Fragment.byId(fragmentId, "idServiceType");
	    	oVorPdrop.setEnabled(true);
	    }
	},
	
	onVatEdited: function(oEvent){
		var sPath      = this.cntxt.getPath();
		var itemData   = this.lModel.getProperty(sPath);
		var itemType   = itemData.Requestmat;
		var fragmentId = this.getView().createId("itemDetail");
		var Vatvalue   = Number(sap.ui.core.Fragment.byId(fragmentId,"POitemAddVAT").getSelectedKey());
		if(itemType !== "1"){
			var serviceOrderData       = this.lModel.getProperty(sPath + '/navServiceOrder')
			var serviceOrderDataLength = serviceOrderData.length
			var x;
			if (serviceOrderDataLength > 0){
				for( x = 0; x < serviceOrderDataLength; x++ ){
					serviceOrderData[x].Vatamount = ((serviceOrderData[x].GrPrice)*Vatvalue/100).toString();
					serviceOrderData[x].Netvalue  = Number((serviceOrderData[x].GrPrice)) + ((serviceOrderData[x].GrPrice)*Vatvalue/100);
				}
				this.lModel.setProperty(this.cntxt.getPath()+"/navServiceOrder", serviceOrderData);
			}
		}
		this.netPriceCalc(oEvent);
	},
	
	onDocSelectionChange: function (oEvent) {
      var oSelected   = oEvent.getSource().getBindingContext().getObject();
      var sDoknr      = oSelected.Doknr;
      var sSerialno   = oSelected.Serialno;
      var sDocPath    = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='DMS',appno='" +sDoknr+"',lang='',ndavalue='" +sSerialno+ "')/$value ";
      window.open(sDocPath,true); 
    },
	
/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf z_pr.app
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf z_pr.app
*/
//	onExit: function() {
//
//	}

});
	
})