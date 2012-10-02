function ActionMapView(_params){
	var self = Ti.UI.createView({
		
	});
	var item = _params.item;

	var annotation_arr = [];
	
	var tempAnnotation = Ti.Map.createAnnotation({ 
 		latitude: item.plat, 
 		longitude: item.plong, 
 		title: item.name, 
 		subtitle: item.adress, 
 		pincolor: Ti.Map.ANNOTATION_RED, 
 		animate: true, 
 		//leftButton: '/iphone/favBtn.png', 
		image: '/iphone/mapPin.png',
		//rightButton: '/iphone/favBtn.png',
 		myid: 1	
 	});
 	annotation_arr.push(tempAnnotation);
	
	var mapview = Ti.Map.createView({ 
		top: 50,
		mapType: Ti.Map.STANDARD_TYPE, 
		region: {
	 		latitude: item.plat, 
	 		longitude: item.plong, 
			latitudeDelta: 0.01, 
			longitudeDelta: 0.01
		}, 
		animate: true, 
		regionFit: true, 
		userLocation: true, 
		annotations: annotation_arr });

	self.add(mapview); 
	
	var minusButton = Ti.UI.createButton({
		left: 10, top: 10, title: '-'
	});
	minusButton.addEventListener('click', function(e){
		mapview.zoom(-1);
	});
	self.add(minusButton);
	
	var plusButton = Ti.UI.createButton({
		right: 10, top: 10, title: '+'
	});
	plusButton.addEventListener('click', function(e){
		mapview.zoom(1);
	});
	self.add(plusButton);

	return self;	
};

module.exports = ActionMapView;