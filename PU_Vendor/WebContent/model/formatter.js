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
			}
		};

	}
);
