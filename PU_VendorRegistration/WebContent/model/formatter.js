sap.ui.define([
	] , function () {
		"use strict";

		return {

			VendorType : function (sValue) {
				if (sValue === '2')
					return 'Company';
				else if (sValue === '1'){
					return 'Freelancer';
				}
			},

			VendorIndex: function (sValue) {
				if (sValue === '2')
					return 0;
				else if (sValue === '1'){
					return 1;
				}
			},
			
			FirstName: function(sValue){
				if (sValue === '2')
					return 'Name';
				else if (sValue === '1'){
					return 'First Name';
				}
			},
			
			SecondName: function(sValue){
				if (sValue === '2')
					return '';
				else if (sValue === '1'){
					return 'Last Name';
				}
			},
			
			type: function (sValue) {
				if (sValue === 'TEO1') {
					return 'Vendor';
				}else if (sValue === 'TEO2') {
					return 'Freelancer';
				}else if (sValue === 'TEO3'){
					return 'Employee';
				}else{
					return 'Type Not Defined';
				}
				
			}
		};

	}
);
