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
		var distanceLabel = Ti.UI.createLabel({
			text: '',
			itemID: _rowdata.id,			
			left: '5dp', right: '5dp',
			font: {fontSize: '10dp', fontFamily: 'Arial'},
			color: fontColor //, shadowColor: shadowColor, shadowOffset: shadowOffset
		});
		labelPanel.add(distanceLabel);	
		newRow.distanceLabel = distanceLabel;
				
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
	
	self.updateTable = function(){
		for(var i = 0; i < table.data[0].rows.length; i++){
			//table.data.rows[0].children[z].text = &quot;hello!&quot;
			Ti.API.log("updateTable: " + i + " " + table.data[0].rows[i].itemID);
			var id = table.data[0].rows[i].itemID;
			var distance = mdb.getCachedRestaraunt(id).distance.toFixed(2)
			table.data[0].rows[i].distanceLabel.text = distance + ' км.';
			table.data[0].rows[i].distance = distance;
		}
		
		var data = table.data[0].rows;
		data.sort( function( row1, row2 ) {
  			return row1.distance - row2.distance;
		});
		table.setData( data );		
		
	};
	
	
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;	
	Titanium.Geolocation.distanceFilter = 10;	
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
		Ti.API.info('speed ' + speed);
		
		mdb.updateCachedDistance(latitude, longitude);
		Titanium.API.info('mdb: ' + mdb);
		self.updateTable();

		Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
		
		
	
	});	
	
	
	
	return self;
};

module.exports = MasterView;