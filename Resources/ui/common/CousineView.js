function CousineView(params){
//		data.push({title:'Table View Options', hasChild:true, test:'ui/handheld/ios/baseui/table_view_options'});

	var settings = params.settings;
	var mdb = params.mdb;
		
	var self = Ti.UI.createView({
		backgroundColor: settings.backgroundColor
	});
	
	var table = Ti.UI.createTableView({
		backgroundColor: 'transparent'
	});
	table.separatorColor = 'transparent';
	self.add(table);
	
	var tableData = mdb.getCousins();
	var tempData = [];
	for(var i = 0; i < tableData.length; i++){
		tableData[i].title = tableData[i].name;
		//tableData[i].preview_image = tableData[i].taste_preview_image;		

		//self.addRowToTable(tableData[i], tempData);
	}
	table.setData(tempData);	
	
	
	return self;
};

module.exports = CousineView; 
 