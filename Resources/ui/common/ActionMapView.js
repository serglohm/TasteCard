function ActionMapView(_params){
	var self = Ti.UI.createView({
		
	});
	var items = _params.items;
	var annotation_arr = [];
	self.showMapItems = function(){
		for(var i = 0; i < items.length; i++){
			var item = items[i];
			var rightButtonImage = Ti.UI.createImageView({ 
				image: item.taste_preview_image, 
				width: 30, height: 30, 
				backgroundColor: '#000', 
				itemID: item.id,
				preventDefaultImage: true 
			});	
			var tempAnnotation = Ti.Map.createAnnotation({ 
		 		latitude: item.plat, 
		 		longitude: item.plong, 
		 		title: item.name, 
		 		subtitle: item.adress, 
		 		pincolor: Ti.Map.ANNOTATION_RED, 
		 		animate: true, 
		 		//leftButton: '/iphone/favBtn.png', 
				image: '/iphone/mappin.png',
				rightView: rightButtonImage,
		 		itemID: item.id	
		 	});
		 	if(items.length > 1){
			 	tempAnnotation.addEventListener('click', function(e){
			 		Ti.API.info('click on annotation: ' + e.clicksource + ' ' + e.source.itemID);
			 		//Titanium.App.fireEvent('app:showAlert',{data: 'click on annotation: ' + e.clicksource + ' ' + e.source.itemID});
			 		if (e.clicksource == 'title' || e.clicksource == 'subtitle') {
			 			Ti.App.fireEvent('app:itemSelected', {data: e.source.itemID});
			 		}
			 	});
			}
		 	annotation_arr.push(tempAnnotation);
		}
		mapview.annotations = annotation_arr;
		if(annotation_arr.length > 0){
			var region = {
	            latitude: annotation_arr[0].latitude,
	            longitude: annotation_arr[0].longitude,
	            animate: true,
	            latitudeDelta: annotation_arr.length == 0 ? 0.01: 0.1,
	            longitudeDelta: annotation_arr.length == 0 ? 0.01: 0.1
	        };
	        
	        setTimeout(function(){
	        	mapview.setLocation(region);
    			Ti.API.info("setTimeout moveTo latitude: " + annotation_arr[0].latitude + " longitude: " + annotation_arr[0].longitude);
			}, 500);
		} else {
			Ti.API.info("annotation array: 0");
		}
	};
	
	var mapview = Ti.Map.createView({ 
		mapType: Ti.Map.STANDARD_TYPE, 
		region: {
			latitude: 55.75166,
			longitude: 37.617777,
			latitudeDelta: 0.05, 
			longitudeDelta: 0.05
		}, 
		animate: true, 
		regionFit: true, 
		userLocation: true });

	self.add(mapview); 
	
	var minusButton = Ti.UI.createButton({
		left: 10, top: 10, height: 57, width: 57
	});
	minusButton.backgroundImage = '/iphone/minus.png';
	minusButton.addEventListener('click', function(e){
		mapview.zoom(-1);
	});
	self.add(minusButton);
	
	var plusButton = Ti.UI.createButton({
		right: 10, top: 10, height: 57, width: 57
	});
	
	plusButton.backgroundImage = '/iphone/plus.png';
	plusButton.addEventListener('click', function(e){
		mapview.zoom(1);
	});
	self.add(plusButton);
	

	return self;	
};

module.exports = ActionMapView;