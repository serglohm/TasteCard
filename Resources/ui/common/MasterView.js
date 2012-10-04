//Master View Component Constructor
function MasterView(params) {
	var settings = params.settings;
	var mdb = params.mdb;
	
	var itemsData = {};
	
	var self = Ti.UI.createView({
		backgroundColor: settings.backgroundColor
	});	
	
	self.addRowToTable = function(_rowdata, _data){
		var newRow = Ti.UI.createTableViewRow({
				itemID: _rowdata.id,
				className: 'itemRowDp',
				height: '105dp'
		});
		newRow.backgroundColor = 'transparent';
		newRow.selectedBackgroundColor = '#fff';
	
		var bckView = Ti.UI.createView({left: '5dp', top: '5dp', right: '5dp', bottom: '0dp',			
			itemID: _rowdata.id,
			borderRadius: '3dp'
			//backgroundImage: '/iphone/item2Bg.png'
		});
		bckView.backgroundFocusedColor = '#000';
		bckView.backgroundSelectedColor = '#000';
		bckView.backgroundColor = '#000';	
			
		var shadowColor = '#66D22C';
		var fontColor = "#fff";
		var shadowOffset = {x: 0, y: -1};
		
		var labelPanel = Ti.UI.createView({
			height: Ti.UI.SIZE,
			width: '239dp',
			center: {x: '200dp', y: '60dp'},
			//backgroundColor: 'red',
			layout: 'vertical'
		});	
		bckView.add(labelPanel);
			
		var titleLabel = Ti.UI.createLabel({
			text: _rowdata.title,
			itemID: _rowdata.id,			
			left: '5dp', right: '5dp', top: '5dp', height: '15dp',
			font: {fontSize: '15dp', fontWeight: 'bold', fontFamily: 'Arial'},
			color: fontColor,
			shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		titleLabel.textAlign = 'center';
		bckView.add(titleLabel);
		
		var addressLabel = Ti.UI.createLabel({
			text: _rowdata.adress,
			itemID: _rowdata.id,			
			left: '5dp', right: '5dp',
			font: {fontSize: '12dp', fontFamily: 'Arial'},
			color: fontColor //, shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		labelPanel.add(addressLabel);
		var cousinsTextLabel = Ti.UI.createLabel({
			text: 'Кухня: ' + _rowdata.cousins_text,
			itemID: _rowdata.id,			
			left: '5dp', right: '5dp',
			font: {fontSize: '10dp', fontFamily: 'Arial'},
			color: fontColor //, shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		labelPanel.add(cousinsTextLabel);	
				
		var imageBgView = Ti.UI.createView({
			left: '5dp', top: '20dp', bottom: '5dp',			
			itemID: _rowdata.id,			
		});
		var img = Ti.UI.createImageView({
			center: {x: '36dp', y: '40dp'},
			itemID: _rowdata.id,
			image: _rowdata.preview_image
		});
		img.hires = true;
		img.defaultImage = settings.itemSmallDefImage;
		imageBgView.add(img);
		bckView.add(imageBgView);
		
		newRow.add(bckView);
		
		_data.push(newRow);
		itemsData[_rowdata.id + ""] = _rowdata;
	};		

	self.clearTable = function(){
		tableData = [];
		table.setData([]);		
	};
	
	var table = Ti.UI.createTableView({
		backgroundColor: 'transparent'
	});
	table.separatorColor = 'transparent';
	self.add(table);
	
	var tableData = mdb.getRestaraunts();
	var tempData = [];
	for(var i = 0; i < tableData.length; i++){
		tableData[i].title = tableData[i].name;
		tableData[i].preview_image = tableData[i].taste_preview_image;		

		self.addRowToTable(tableData[i], tempData);
	}
	table.setData(tempData);
	
	table.addEventListener('click', function(e) {
		Ti.API.log("click on Table");
		Ti.App.fireEvent('app:itemSelected', {data: e.source.itemID});
		
	});
	
	
	
	return self;
};

module.exports = MasterView;