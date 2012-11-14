function ApplicationWindow(params) {
	//declare module dependencies
	var MasterView = require('ui/common/MasterView'),
		DetailView = require('ui/common/DetailView');
		
	var mdb = params.mdb;
	var engine = params.engine;
	var settings = params.settings;

	//create object instance
	var self = Ti.UI.createWindow({
		title:'Products',
		exitOnClose:true,
		navBarHidden:false,
		backgroundColor:'#ffffff'
	});
		
	//construct UI
	var masterView = new MasterView(params);
	self.add(masterView);

	//add behavior for master view
	Ti.App.addEventListener('app:itemSelected', function(e) {
		//create detail view container
		var detailView = new DetailView({engine: engine, mdb: mdb, itemID: e.data, settings: settings});
		var detailContainerWindow = Ti.UI.createWindow({
			title:'Product Details',
			navBarHidden:false,
			backgroundColor:'#ffffff'
		});
		detailContainerWindow.add(detailView);
		detailView.fireEvent('itemSelected',e);
		detailContainerWindow.open();
	});
	
	self.refreshData = function(){
	   	//Ti.API.info("REFRESH");
	   	var last_date_param = "lastdate=" + mdb.editDate;
	   	//Ti.API.info("last_date_param(" + last_date_param + ")");
		engine.getRestaraunts(function(data){
			
			//Titanium.App.fireEvent('app:showAlert',{data: "loaded restaraunts: " + data.length});
			
			mdb.saveRestaraunts(data);
			self.updateCousineRestaraunts();
		}, last_date_param);
	};	
	
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
	
	Ti.API.info('restarauntCount...');
	var restarauntCount = mdb.getRestarauntsCount();
	Ti.API.info('restarauntCount = ' + restarauntCount);
	if(restarauntCount == 0){
		engine.getCousins(function(data){											
												
												mdb.saveCousins(data);
											});
		engine.getRestaraunts(function(data){
												Titanium.App.fireEvent('app:showAlert',{data: "Рестораны загружены: " + data.length});
												mdb.saveRestaraunts(data);
												self.updateCousineRestaraunts();
											});
	} else {
		self.refreshData();
		//Titanium.App.fireEvent('app:showAlert', {data: "Got " + restarauntCount + " Restaraunts"});	
	}	
	
	return self;
};

module.exports = ApplicationWindow;
