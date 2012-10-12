function ApplicationWindow(params) {

	var MasterView = require('ui/common/MasterView');
	var DetailView = require('ui/common/DetailView');
	var CousineView = require('ui/common/CousineView');
	var ActionMapView = require('ui/common/ActionMapView');
		
	var mdb = params.mdb;
	var engine = params.engine;
	var settings = params.settings;

	
	var self = Ti.UI.createWindow({
		backgroundColor: '#ffffff'
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
	var mapButton = Titanium.UI.createButton({title:'Карта'});
	mapButton.addEventListener('click', function(e){		
		var itemsData = masterView.tableDataFunc();
		Ti.App.fireEvent('app:showMap', {data: itemsData});
	});
	masterContainerWindow.rightNavButton = mapButton;

	var refreshButton = Ti.UI.createButton({
	    systemButton : Ti.UI.iPhone.SystemButton.REFRESH
	});
	masterContainerWindow.leftNavButton = refreshButton;
	refreshButton.addEventListener('click',function(){
	   	Ti.API.info("REFRESH");
	   	Ti.App.name = "REFRESH";
	});	
	
	Ti.App.addEventListener('app:selectCousine', function(e){
		var tempView = new CousineView({engine: engine, mdb: mdb, settings: settings});			
		var tempWindow = Ti.UI.createWindow({
			//title: e.data[1].act_name
		});	
		tempWindow.barColor = settings.backgroundColor;
		tempWindow.barImage = '/iphone/navBg.png';
		tempWindow.backButtonTitle = 'Назад';
		var tempContainerView = Ti.UI.createView({layout: "vertical"});
		tempContainerView.add(tempView);
		tempWindow.add(tempContainerView);

		var oldCousineId = settings.cousineId;
		navGroup.open(tempWindow);
		tempWindow.addEventListener('close', function(e){
			try{
				if(oldCousineId != settings.cousineId){
					self.updateCousineRestaraunts();	
				}				
			} catch(e){
				Ti.API.info('ERROR: ' + e);
			}
		});
	});

	self.updateCousineRestaraunts = function(){
		var cousinRestaraunts;
		if(settings.cousineId > -1){
			cousinRestaraunts = mdb.getCousinRestaraunts(settings.cousineId);
		} else {
			cousinRestaraunts = mdb.getRestaraunts();
		}
		masterView.setTableData(cousinRestaraunts);			
		masterView.updateCousineLabel();		
		masterView.updatePositionAndTable();
	};
	
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
		tempWindow.backButtonTitle = 'Назад';
		navGroup.open(tempWindow);
	});
	
	Ti.App.addEventListener('app:showMap', function(e) {	
		var tempView = new ActionMapView({engine: engine, mdb: mdb, items: e.data, settings: settings});			
		var tempWindow = Ti.UI.createWindow({
			//title: e.data[1].act_name
		});	
		tempWindow.barColor = settings.backgroundColor;
		tempWindow.barImage = '/iphone/navBg.png';		
		tempWindow.backButtonTitle = 'Назад';
		
		var tempContainerView = Ti.UI.createView({layout: "vertical"});
		tempContainerView.add(tempView);
		tempWindow.add(tempContainerView);
		navGroup.open(tempWindow);
		tempView.showMapItems();
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
												self.updateCousineRestaraunts();
											});
	} else {
		//Titanium.App.fireEvent('app:showAlert', {data: "Got " + restarauntCount + " Restaraunts"});	
	}
	
	return self;
};

module.exports = ApplicationWindow;
