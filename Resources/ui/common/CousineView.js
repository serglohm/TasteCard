function CousineView(params){
//		data.push({title:'Table View Options', hasChild:true, test:'ui/handheld/ios/baseui/table_view_options'});

	var settings = params.settings;
	var mdb = params.mdb;
		
	var self = Ti.UI.createView({
		backgroundColor: settings.backgroundColor
	});

	var shadowColor = '#000000';
	var fontColor = "#ffffff";
	var shadowOffset = {x: 0, y: -1};	
	
	var table = Ti.UI.createTableView({
		backgroundColor: 'transparent',
		allowsSelection: true
	});
	
	table.separatorColor = 'transparent';
	table.separatorStyle = 0;
	self.add(table);
	
	var tableData = mdb.getCousins();
	var tempData = [];
	var row = Ti.UI.createTableViewRow({
		height: '40dp',
		hasCheck: settings.cousineId == -1 ? true: false,
		backgroundImage: '/iphone/itemBg.png',
		itemID: -1
	});
	var l = Ti.UI.createLabel({
		left: 10,
		font: {fontSize: 15, fontWeight: 'bold'},
		color: fontColor,
		text: 'Любая',
		itemID: -1, shadowColor: shadowColor, shadowOffset: shadowOffset
	});
	row.add(l);
	tempData.push(row);
	
	for(var i = 0; i < tableData.length; i++){
		var row = Ti.UI.createTableViewRow({
			height: '40dp', color: fontColor,
			backgroundImage: '/iphone/itemBg.png',
			itemID: tableData[i].id
		});
		row.selectedColor = "#ffffff";
		
		if(settings.cousineId == tableData[i].id){
			row.hasCheck = true;
		}
		var l = Ti.UI.createLabel({
			left: 10,
			font: {fontSize: 15, fontWeight: 'bold'},
			color: fontColor,
			text: tableData[i].name + " (" + tableData[i].items_count + ")",
			itemID: tableData[i].id, shadowColor: shadowColor, shadowOffset: shadowOffset
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
				section.rows[i].children[0].color = fontColor;
			}
			settings.cousineId = section.rows[index].itemID;
			section.rows[index].hasCheck = true;
			section.rows[index].children[0].color = '#50ca32';			
		}, 250);	
	});	
	
	
	return self;
};

module.exports = CousineView; 
 