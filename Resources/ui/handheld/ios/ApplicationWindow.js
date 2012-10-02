function ApplicationWindow(params) {


	var MasterView = require('ui/common/MasterView'),
		DetailView = require('ui/common/DetailView');
		
	var mdb = params.mdb;
	var engine = params.engine;
	var settings = params.settings;

	var self = Ti.UI.createWindow({
		backgroundColor:'#ffffff'
	});
		
	//construct UI
	var masterView = new MasterView(params);
		
	//create master view container
	var masterContainerWindow = Ti.UI.createWindow({
		//title:'Products'
	});
	masterContainerWindow.barColor = settings.backgroundColor;
	masterContainerWindow.barImage = '/iphone/navBg.png';
	masterContainerWindow.add(masterView);
	

	
	//create iOS specific NavGroup UI
	var navGroup = Ti.UI.iPhone.createNavigationGroup({
		window:masterContainerWindow
	});
	self.add(navGroup);
	
	Ti.App.addEventListener('app:itemSelected', function(e) {	
		var tempView = new DetailView({engine: engine, mdb: mdb, itemID: e.data, settings: settings});			
		var tempWindow = Ti.UI.createWindow({
			//title: e.data[1].act_name
		});	
		tempWindow.barColor = settings.backgroundColor;
		tempWindow.barImage = '/iphone/navBg.png';
		var tempContainerView = Ti.UI.createView({layout: "vertical"});
		tempContainerView.add(tempView);
		tempWindow.add(tempContainerView);

		navGroup.open(tempWindow);
	});
	
	
	//---------------------------------------------------------------
	
	var alertWin = Titanium.UI.createWindow({
		height: 100,
		width: 280,
		bottom: 110,
		borderRadius: 10
	});
	
	var alertView = Titanium.UI.createView({
		backgroundColor:'#000',
		opacity: 0.8,
		height: 100,
		width: 280,
		borderRadius: 10
	});
	
	var alertLabel = Titanium.UI.createLabel({
		color: '#fff',
		font: {fontSize: 13},
		textAlign: 'center',
		left: '10dp', right: '10dp', top: '10dp', botom: '10dp'
	});
	alertLabel.verticalAlign = Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER;
	alertWin.add(alertView);
	alertWin.add(alertLabel);
	
	//Titanium.App.fireEvent('app:showAlert',{data: ""});
	
	Titanium.App.addEventListener('app:showAlert', function(e){
		alertLabel.text = e.data;
		alertWin.open();
		setTimeout(function(){
			alertWin.close({opacity: 0, duration: 500});
		}, 2000);
	});	
	
	//----------------------------------------	
	
	var restarauntCount = mdb.getRestarauntsCount();
	if(restarauntCount == 0){
		engine.getCousins(function(data){											
												
												mdb.saveCousins(data);
											});
		engine.getRestaraunts(function(data){
												Titanium.App.fireEvent('app:showAlert',{data: "loaded restaraunts: " + data.length});
												mdb.saveRestaraunts(data);
											});
	} else {
		Titanium.App.fireEvent('app:showAlert', {data: "Got " + restarauntCount + " Restaraunts"});	
	}
		
	return self;
};

module.exports = ApplicationWindow;
