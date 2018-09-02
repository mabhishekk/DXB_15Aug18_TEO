sap.ui.define([
	"sap/m/Select"
  ], function(Select) {
  //jQuery.sap.declare("z_vr.control.Select");
	var customSelect = Select.extend("z_vr.control.Select", {
		metadata: {
			events: {
				"open": {}
			}
		},
//		onclick: function(oEvent) {
//			this.onOpen(oEvent);
//		},
		renderer: {},
		
		onAfterRendering: function() {
			if (sap.m.Select.prototype.onAfterRendering) {
				sap.m.Select.prototype.onAfterRendering.apply(this, arguments);
			}
		},
		
		onOpen: function(oEvent){
			var aSelectedCell   = oEvent.getSource().getParent().getCells();
			var SelectedCountry = aSelectedCell[6].getSelectedKey();
			var oBinding        = oEvent.getSource().getParent().getCells()[7].getBinding('items');
			oBinding.filter([ new Filter([
				new Filter({
					path: 'Bland',
			        operator: FilterOperator.EQ,
			        value1: SelectedCountry
				})
			])]);
		},
	});
	return customSelect;
});