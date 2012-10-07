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
	//table.separatorColor = 'transparent';
	self.add(table);
	
	var tableData = mdb.getCousins();
	var tempData = [];
	var row = Ti.UI.createTableViewRow({
		height: '40dp',
		hasCheck: settings.cousineId == -1 ? true: false,
		itemID: -1
	});
	var l = Ti.UI.createLabel({
		left: 5,
		font: {fontSize: 15, fontWeight: 'bold'},
		color: '#000',
		text: 'Любая',
		itemID: -1
	});
	row.add(l);
	tempData.push(row);
	
	for(var i = 0; i < tableData.length; i++){
		var row = Ti.UI.createTableViewRow({
			height: '40dp',
			itemID: tableData[i].id
		});
		if(settings.cousineId == tableData[i].id){
			row.hasCheck = true;
		}
		var l = Ti.UI.createLabel({
			left: 5,
			font: {fontSize: 15, fontWeight: 'bold'},
			color: '#000',
			text: tableData[i].name + "(" + tableData[i].items_count + ")",
			itemID: tableData[i].id
		});
		row.add(l);
		tempData.push(row);
	}
	table.setData(tempData);	
	
	table.addEventListener('click', function(e){
		var index = e.index;
		var section = e.section;
	
		setTimeout(function(){
			for (var i=0;i<section.rows.length;i++){
				section.rows[i].hasCheck = false;
				section.rows[i].children[0].color = '#000';
			}
			settings.cousineId = section.rows[index].itemID;
			section.rows[index].hasCheck = true;
			section.rows[index].children[0].color = '#336699';			
		}, 250);	
	});	
	
	
	return self;
};

module.exports = CousineView; 
 