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


		};

	}
);
