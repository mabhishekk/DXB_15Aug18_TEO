sap.ui.define([
	"sap/m/Select"
  ], function(select) {
  //jQuery.sap.declare("teo.select");
	var customSelect = select.extend("teo.select", {
		metadata: {
			events: {
				"click": {}
			}
		},
		onclick: function() {
			this.fireClick();
		},
		renderer: {},
		
		onAfterRendering: function() {
			if (sap.m.Select.prototype.onAfterRendering) {
				sap.m.Select.prototype.onAfterRendering.apply(this, arguments);
			}
		}
	});
	return customSelect;
});