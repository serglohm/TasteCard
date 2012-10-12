//Master View Component Constructor
function MasterView(params) {
	var settings = params.settings;
	var mdb = params.mdb;
	
	var itemsData = {};
	
	var self = Ti.UI.createView({
		backgroundColor: '#274f10'//settings.backgroundColor
	});	
	
	self.addRowToTable = function(_rowdata, _data){
		var newRow = Ti.UI.createTableViewRow({
				itemID: _rowdata.id,
				className: 'itemRowDp',
				height: '125dp'
		});
		newRow.backgroundColor = 'transparent';
		newRow.selectedBackgroundColor = '#fff';
	
		var bckView = Ti.UI.createView({left: '0dp', top: '0dp', right: '0dp', bottom: '0dp',			
			itemID: _rowdata.id,
			//borderRadius: '3dp',
			backgroundImage: '/iphone/itemBg.png'
		});
		bckView.backgroundFocusedColor = '#000';
		bckView.backgroundSelectedColor = '#000';
		bckView.backgroundColor = '#000';	
			
		var shadowColor = '#000000';
		var fontColor = "#ffffff";
		var shadowOffset = {x: 0, y: -1};
		
		var labelPanel = Ti.UI.createView({
			height: Ti.UI.SIZE,
			width: '220dp',
			left: '97dp', top: '36dp',
			//backgroundColor: 'red',
			layout: 'vertical'
		});	
		bckView.add(labelPanel);
			
		var titleLabel = Ti.UI.createLabel({
			text: _rowdata.title,
			itemID: _rowdata.id,			
			left: '5dp', right: '5dp', top: '10dp', height: '15dp',
			font: {fontSize: '15dp', fontFamily: 'Arial-BoldMT'},
			color: fontColor
			, shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		titleLabel.textAlign = 'center';
		bckView.add(titleLabel);
		
		var addressLabel = Ti.UI.createLabel({
			text: _rowdata.adress,
			itemID: _rowdata.id,			
			left: '0dp', right: '0dp',
			font: {fontSize: '13dp', fontFamily: 'Arial'},
			color: fontColor, shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		labelPanel.add(addressLabel);
		var cousinsTextLabel = Ti.UI.createLabel({
			text: 'Кухня: ' + _rowdata.cousins_text,
			itemID: _rowdata.id,			
			left: '0dp', right: '0dp', top: '1dp',
			font: {fontSize: '12dp', fontFamily: 'Arial-ItalicMT'},
			color: fontColor, shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		labelPanel.add(cousinsTextLabel);
		var distanceLabel = Ti.UI.createLabel({
			text: '',
			itemID: _rowdata.id,			
			textAlign: 'right', left: '0dp', right: '5dp', top: '5dp',
			font: {fontSize: '13dp', fontFamily: 'Arial-ItalicMT'},
			visible: false,
			color: fontColor, shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		labelPanel.add(distanceLabel);	
		newRow.distanceLabel = distanceLabel;
				
		var imageBgView = Ti.UI.createView({
			left: '8dp', bottom: '8dp',
			height: '81dp', width: '81dp',
			backgroundColor: '#fff',		
			itemID: _rowdata.id,			
		});
		var img = Ti.UI.createImageView({
			left: '5dp', top: '5dp',
			height: '71', width: '71',
			itemID: _rowdata.id,
			image: _rowdata.preview_image
		});
		if(_rowdata.preview_image.indexOf('142') > -1){
			img.hires = true;
		}
		img.defaultImage = settings.itemSmallDefImage;
		imageBgView.add(img);
		bckView.add(imageBgView);
		
		newRow.add(bckView);
		
		_data.push(newRow);
		itemsData[_rowdata.id + ""] = _rowdata;
	};		

	self.clearTable = function(){
		self.tableData = [];
		table.setData([]);		
	};

	var table = Ti.UI.createTableView({
		separatorStyle : 0,
		backgroundColor: 'transparent'
	});
	var headerView = Ti.UI.createView({
		backgroundColor: "transparent",	height: '50dp'
	});
	var headerBgView = Ti.UI.createView({
		left: '0dp', right: '0dp', top: '0dp', bottom: '0dp',
		layout: 'vertical', backgroundImage: '/iphone/itemBg.png'
	});
	var filterButton = Ti.UI.createButton({
		top: 10, title: "Выбрать кухню",
		font: {fontSize: '13dp', fontFamily: 'Arial'},
		height: '30', width: '250dp'
	});
	filterButton.backgroundLeftCap = '30';
	filterButton.backgroundTopCap = '10';
	filterButton.backgroundImage = '/iphone/cousineButton.png';
	
	filterButton.addEventListener('click', function(e){
		Ti.App.fireEvent('app:selectCousine', {data: 0});
	});
	headerBgView.add(filterButton);
	
	headerView.add(headerBgView)
	table.headerView = headerView;
	table.separatorColor = 'transparent';
	self.add(table);
	
	self.updateCousineLabel = function(){
		if(settings.cousineId > -1){
			filterButton.title = 'Кухня: ' + mdb.getCousineName(settings.cousineId);
		} else {
			filterButton.title = 'Выбрать кухню';
		}
	};
	
	self.setTableData = function(newData){
		var tempData = [];
		for(var i = 0; i < newData.length; i++){
			newData[i].title = newData[i].name;
			newData[i].preview_image = newData[i].taste_preview_image;		
			self.addRowToTable(newData[i], tempData);
		}
		table.setData(tempData);
	};
	self.tableData = mdb.getRestaraunts();
	for(var i = 0; i < self.tableData.length; i++){
		mdb.setCachedRestaraunt(self.tableData[i]);
	}
	self.setTableData(self.tableData);
	
	table.addEventListener('click', function(e) {
		Ti.API.log("click on Table");
		Ti.App.fireEvent('app:itemSelected', {data: e.source.itemID});
		
	});
	
	self.updateDistance = function(){
		for(var i = 0; i < table.data[0].rows.length; i++){
			var id = table.data[0].rows[i].itemID;
			var distance = mdb.getCachedRestaraunt(id).distance.toFixed(2)
			table.data[0].rows[i].distanceLabel.text = 'Расстояние: ' + distance + ' км.';
			table.data[0].rows[i].distanceLabel.visible = true;
			table.data[0].rows[i].distance = distance;
		}
		
		var data = table.data[0].rows;
		data.sort( function( row1, row2 ) {
  			return row1.distance - row2.distance;
		});
		table.setData( data );		
		
	};
	
	self.tableDataFunc = function(){		
		return self.tableData;
	};
	
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;	
	Titanium.Geolocation.distanceFilter = 10;
	Titanium.Geolocation.purpose = "Получаем Ваши координаты";	
	self.updatePositionAndTable = function(){
		Titanium.Geolocation.getCurrentPosition(function(e){
			if (!e.success || e.error){
				Ti.API.info("Code translation: "+translateErrorCode(e.code));
				return;
			}
	
			var longitude = e.coords.longitude;
			var latitude = e.coords.latitude;
			var altitude = e.coords.altitude;
			var heading = e.coords.heading;
			var accuracy = e.coords.accuracy;
			var speed = e.coords.speed;
			var timestamp = e.coords.timestamp;
			var altitudeAccuracy = e.coords.altitudeAccuracy;
			
			mdb.updateCachedDistance(latitude, longitude);
			self.updateDistance();
	
			Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
		});	
	};	
	self.updatePositionAndTable();
	
	
	return self;
};

module.exports = MasterView;