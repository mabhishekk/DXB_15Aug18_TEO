sap.ui.define([
	"z_vr/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	'sap/ui/model/Filter', 
	'sap/ui/model/FilterOperator',
	'sap/m/MessageBox'
], function(BaseController, History, MessageToast, Filter, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("z_vr.controller.Add", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the add controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Register to the add route matched
			this.getRouter().getRoute("add").attachPatternMatched(this._onRouteMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		_onRouteMatched: function() {
			// register for metadata loaded events
			var oModel = this.getModel();
			oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		
		_onMetadataLoaded: function () {
			// create default properties
			var tdata   = {
					"zvm_identificationSet":[{
						"Type"          :"",
						"Text"          :"",
						"Idnumber"      :"",
						"Institute"     :"",
						"EntryDate"     :new Date(),
						"ValidDateFrom" :new Date(),
						"ValidDateTo"   :new Date(),
						"Country"       :"",
						"Region"        :""
					}],
					"bankDetails"         :[{
						"id"            :"",
						"BankCtry"       :"",
						"BankKey"       :"",
						"BankAcct"   :"",
						"CtrlKey"    :"",
						"Iban"          :"",
						"RefDetail"     :"",
						"ExtrnId"       :"",
						"AccountHolder" :"",
						"AccountName"   :"",
						"ValidFrom"     :"",
						"ValidTo"       :"",
						"FincInst"      :""
					}],
					"FreelancerTitle"     :[
						{"key" :"0002",  "text" :"Mr."    },
						{"key" :"0001",  "text" :"Ms."    },
						{"key" :"0004",  "text" :""       }
					],
					"CompanyTitle"        :[
						{"key" :"0003",  "text" :"Company"}
					],
					"FreelancerIdentification":[
						{"Type":"TEOPP" , "Text" :"Passport"   },
						{"Type":"TEOEM" , "Text" :"Emirates ID"},
						{"Type":"TEOVIS", "Text" :"Visa Number"}
					],
					"CompanyIdentification"   :[
						{"Type":"TEOLIC", "Text" :"License Number"}
					],
					"Company"             : false,
					"Freelancer"          : false
			};
			this.tempModel = new sap.ui.model.json.JSONModel(tdata);
			this.getView().setModel(this.tempModel,'tempModel');
		},
		
		onAfterRendering: function(){
			var oBinding        = this.getView().byId("idRegion").getBinding("items");
			oBinding.filter([ new Filter([
				new Filter({
					path: 'Bland',
			        operator: FilterOperator.EQ,
			        value1: 'AE'
				})
			])]);
		},
		/**
		 * Event handler for the cancel action
		 * @public
		 */
		onCancel: function() {
			this.onNavBack();
		},

		/**
		 * Event handler for the save action
		 * @public
		 */
		onSave: function() {
			this.getModel().submitChanges();
		},

		/**
		 * Event handler for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function() {
			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			// discard new product from model.
			this.getModel().deleteCreatedEntry(this._oContext);

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				// this is my third commit
				var bReplace = true;
				this.getRouter().navTo("vendorlist", {}, bReplace);
			}
		},
		onVendorType: function(oEvent){
			var oSelectedIndex          = oEvent.getParameter("selectedIndex");
			var oItemTemplate           = new sap.ui.core.ListItem({
				key           : "{tempModel>key}",
				text          : "{tempModel>text}",
				additionalText: "{tempModel>key}"
			});
			var oIdentificationTemplate = new sap.ui.core.ListItem({
				key           : "{tempModel>Type}",
				text          : "{tempModel>Type}",
				additionalText: "{tempModel>Text}"
			});
			if(oSelectedIndex === 0){
				this.tempModel.setProperty('/headerData/VendorOrCompany','VC');
				this.tempModel.setProperty('/Company', true);
				this.tempModel.setProperty('/Freelancer', false);
				this.getView().byId('idFirstName').setText('Name');
				this.getView().byId('idTitle').bindItems({
					path    : "tempModel>/CompanyTitle",
					template: oItemTemplate
				});
				var aCompanyIdentify = this.tempModel.getProperty('/CompanyIdentification');
				this.tempModel.setProperty('/Identification', aCompanyIdentify);
			}else{
				this.tempModel.setProperty('/headerData/VendorOrCompany','VF');
				this.tempModel.setProperty('/Company', false);
				this.tempModel.setProperty('/Freelancer', true);
				this.getView().byId('idFirstName').setText('First Name');
				this.getView().byId('idTitle').bindItems({
					path: "tempModel>/FreelancerTitle",
					template: oItemTemplate
				});
				var aFreelancerIndentify = this.tempModel.getProperty('/FreelancerIdentification');
				this.tempModel.setProperty('/Identification', aFreelancerIndentify);
			}
		},
		
		onSelectCountry: function(oEvent){
			var SelectedCountry = oEvent.getSource().getSelectedKey();
			var oBinding        = this.getView().byId("idRegion").getBinding("items");
			oBinding.filter([ new Filter([
				new Filter({
					path: 'Bland',
			        operator: FilterOperator.EQ,
			        value1: SelectedCountry
				})
			])]);
		},
		
		onSelectTableCountry: function(oEvent){
			var aSelectedCell   = oEvent.getSource().getParent().getCells();
			var SelectedCountry = aSelectedCell[7].getSelectedKey();
			var oBinding        = oEvent.getSource().getParent().getCells()[8].getBinding('items');
			oBinding.filter([ new Filter([
				new Filter({
					path: 'Bland',
			        operator: FilterOperator.EQ,
			        value1: SelectedCountry
				})
			])]);
		},
		
		onSelectTableType: function(oEvent){
//			debugger;
//			var aSelectedCell   = oEvent.getSource().getParent().getCells();
//			var sText           = aSelectedCell[0].getSelectedItem().getBindingContext().getObject().Text;
//			aSelectedCell[1].setText(sText);
		},
		
		handleIdentifyAdd: function(oEvent){
			var aIdentifyData = this.tempModel.getProperty('/zvm_identificationSet');
			var pData         = {
					"Type"          :"",
					"Text"          :"",
					"Idnumber"      :"",
					"Institute"     :"",
					"EntryDate"     :new Date(),
					"ValidDateFrom" :new Date(),
					"ValidDateTo"   :new Date(),
					"Country"       :"",
					"Region"        :""
			};
			aIdentifyData.push(pData);  
			this.tempModel.setProperty('/zvm_identificationSet',aIdentifyData);
		},
		
		handleDelete: function(oEvent){
			var sPath           = oEvent.getParameter("listItem").getBindingContext('tempModel').getPath();
			var index           = parseInt(sPath.substring(sPath.lastIndexOf('/') +1));
			var aIndentifyData  = this.tempModel.getProperty('/zvm_identificationSet'); 
			aIndentifyData.splice(index, 1);
			this.tempModel.setProperty('/zvm_identificationSet',aIndentifyData);
		},
		
		onSave: function(oEvent){
//			this.getView().setBusy(true);
			var oModel    = this.getOwnerComponent().getModel();
			var inputData = jQuery.extend(true, {}, this.tempModel.getProperty('/headerData'));
//			inputData.partner_bank = this.tempModel.getProperty('/bankDetails');
			inputData.partner_identity=this.tempModel.getProperty('/zvm_identificationSet');
			debugger;
			oModel.create("/ZVENDOR_COMPANYSet",inputData,{
				success:function(oEvnt){
					debugger;
					that.getView().setBusy(false);
					that.getView().getModel().refresh();
					var sText = that.getResourceBundle().getText("vendrCret")+ oEvnt.Partner;
					MessageBox.success(sText, {
						title : that.getResourceBundle().getText("Success")
					});
					that.lModel.setData(tData);
				},
				error:function(oEvnt){
					debugger;
					that.getView().setBusy(false);
					var sText = that.getResourceBundle().getText("vendrCret")
					MessageBox.error(sText, {
						title : that.getResourceBundle().getText("Error")
					});
				}
			})
		}

	});
});