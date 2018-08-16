/*global history*/

sap.ui.define([
	'z_nda/controller/BaseController',
], function (BaseController) {
	"use strict";

	return BaseController.extend("z_nda.controller.Worklist", {
		
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			
			this.oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oModel,"lModel");
			
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 *
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			
		},

		/**
		 * Triggered by the SearchFields's 'search' event
		 * @param {sap.ui.base.Event} oEvent SearchFields's search event
		 * @public
		 */
		onFilterPosts: function (oEvent) {

		},

		onAfterRendering: function (oEvent) {
			  var sPath1   = "Land1";
			  var sOperator1 = "EQ";
			  var sValue1    = "AE";
			  var oFilter1   = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);

			  // get the list items binding
			  var oBinding = this.byId("idNDA_region").getBinding("items");

			  //Apply filter(s)
			  oBinding.filter(oFilter1);
		},
		
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		
		onCountrySelection: function(oEvent) {
			var sCountryKey = oEvent.getSource().getSelectedKey();
			
			var sPath1 = "Land1";
			var sOperator1 = "EQ";
			var sValue1 = sCountryKey;
			var oFilter1 = new sap.ui.model.Filter(sPath1, sOperator1, sValue1);
			
			// get the list items binding
			var oBinding = this.byId("idNDA_region").getBinding("items");
			
			//Apply filter(s)
			oBinding.filter(oFilter1);
		},
		
		onPrint: function(oEvent) {
			var oLmodel			= this.getView().getModel("lModel");
			var sVendor         = oLmodel.getData().vendor_name;
			var sCountry        = this.getView().byId("idNDA_country").getSelectedItem().mProperties.text;
			var sRegion         = this.getView().byId("idNDA_region").getSelectedItem().mProperties.text;
			var sAddress        = sRegion  +"   " + oLmodel.getData().zip +"   " + sCountry;
			var regNo           = oLmodel.getData().regNo;
			var salesServices   = oLmodel.getData().tos;
			var ndavalue        = sVendor + '|' + sAddress +'|'+ regNo +'|'+ salesServices;
			var lang            = sap.ui.getCore().getConfiguration().getLanguage();
			var sPrintPath      = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='NDA',appno='',lang='EN',ndavalue='" +ndavalue+"')/$value";
			window.open(sPrintPath,true); 
		},
		
		onPrintDelete: function (oEvent) {

			var oModel = this.getView().getModel("lModel");
			
			
			var oDataM = this.getView().getModel();
			var ndaString = oModel.getData().vendor_name +"|"+ oModel.getData().Country  + oModel.getData().rsp 	+ oModel.getData().zip  +"|" + oModel.getData().regNo +"|" + oModel.getData().tos;
//			var sPath = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='NDA',appno='',lang='EN',ndavalue='"+ndaString +"')/$value";
			var sPath  = "/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet(apptype='NDA',appno='',lang='EN',ndavalue='TEO|UAE|REG0001|SALES AND SERVICES')/$value";
//				var oModel = this.getView().getModel();
//				oModel.read(sPath,{
//					urlParameters:
//				success:function(data){
//					
//					
//					
//				},
//				error:function(data){
//					
//					
//				}
//				
//			});
			
			
			$.ajax({
				type : "GET",
				async : false,
				url : sPath,
				contentType : "blob",
				success : function(oData) {
					
//					var pdflink = 	oData.getElementsByTagName("d:pdfstring")[0].innerHTML;
				var pdflink = 	oData.getElementsByTagName("d:pdfstring")[0].innerHTML;
				var byteCharacters = atob(pdflink);
				var byteNumbers = new Array(
						byteCharacters.length);
				for (var i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters
							.charCodeAt(i);
				}
				var byteArray = new Uint8Array(
						byteNumbers);
				var file = new Blob(
						[ byteArray ],
						{
							type : 'application/pdf'
						});
				var fileURL = URL
						.createObjectURL(pdflink);
				var win = window.open();
				win.document.write('<iframe src="'+ fileURL+ '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
					
					
					
					
				},
				error : function(oResp) {
					
				}
			});
			
			
//			window.open(sPath,true);
			
			
//			window.open("/sap/opu/odata/sap/ZPR_APPL_SRV/FORM_TO_PDFSet('ZSF_AR_PR_SUMMARY')/$value");
			
			/*oDataM.read(sPath,{
				
				success:function(oEvent){
					
					
					
				}
				
			});*/
			
			
			
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Sets the item count on the worklist view header
		 * @param {int} iTotalItems the total number of items in the table
		 * @private
		 */
		_updateListItemCount: function (iTotalItems) {
			
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
		},
		
		
	});

});
