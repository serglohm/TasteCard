function DetailView(_params) {
	var settings = _params.settings;
	var self = Ti.UI.createView({
		//backgroundImage: settings.itemBackgroundImage
		backgroundColor: settings.backgroundColor
	});
	var engine = _params.engine;
	var mdb = _params.mdb;
	var itemID = _params.itemID;
	var itemData = {};
	
	var options_imgs = {
		"50sale": "/iphone/options50.png",
        "2eq1": "/iphone/options21.png",
		"2persons": "/iphone/optionsx2.png",
      	"4persons": "/iphone/optionsx4.png",
        "6persons": "/iphone/optionsx6.png",
        "8persons": "/iphone/optionsx8.png",
      	"xfriday": "/iphone/optionsxpt.png",
      	"phone": "/iphone/optionsphone.png"
	};
	

    var scrollView = Ti.UI.createScrollView({
      left: 0, top: 0, right: 0, bottom: 0,
      contentWidth: 'auto',
      contentHeight: 'auto',
      showVerticalScrollIndicator: true,
      showHorizontalScrollIndicator: true,
    });
  
    scrollView.visible = false;
    self.add(scrollView);
    
    var view = Ti.UI.createView({
      left: '5dp', top: '5dp', right: '5dp', bottom: '5dp',
      height: Ti.UI.SIZE,
      width: 'auto',
      layout: 'vertical'
    });
    view.backgroundColor = '#7fc14c';
    view.borderRadius = '5dp';
    scrollView.add(view);

	var titleLabel = Ti.UI.createLabel({
		text: '',	
		textAlign: 'center',
		top: '10dp', left: '10dp', right: '10dp',
		font: {fontSize: '17dp', fontWeight: 'bold', fontFamily: 'Arial'},
		color: '#fff'		
	});
	titleLabel.shadowColor = '#333';
	titleLabel.shadowOffset = {x: 0, y: -1};
	view.add(titleLabel);	

	var scrollImageView = Ti.UI.createScrollableView({
		views: [],
		pagingControlColor: 'transparent',
		showPagingControl: true,
		//clipViews: false,
		height: 172,
		top: '10dp', left: 0, right: 0
	});
	view.add(scrollImageView);	
	
	var addressLabel = Ti.UI.createButton({
		text: '',	
		textAlign: 'center',
		top: '3dp', left: '10dp', right: '10dp',
		font: {fontSize: '15dp', fontWeight: 'bold', fontFamily: 'Arial'},
		color: '#fff'		
	});
	addressLabel.shadowColor = '#333';
	addressLabel.shadowOffset = {x: 0, y: -1};
	addressLabel.addEventListener('click', function(e){
			Ti.App.fireEvent('app:showMap', {data: itemData});
		});
	view.add(addressLabel);	
	
	
	var phoneLabel = Ti.UI.createLabel({
		text: '',	
		textAlign: 'center',
		top: '5dp', left: '10dp', right: '10dp',
		font: {fontSize: '18dp', fontWeight: 'bold', fontFamily: 'Arial'},
		color: '#fff'		
	});
	phoneLabel.shadowColor = '#333';
	phoneLabel.shadowOffset = {x: 0, y: -1};
	view.add(phoneLabel);	

	var optionsView = Ti.UI.createView({
      center: {x: '160dp', y: '20dp'},
      height: Ti.UI.SIZE,
      width: Ti.UI.SIZE,
      layout: 'horizontal'
    });
    view.add(optionsView);
	
	var annotaionLabel = Ti.UI.createLabel({	
		font: {fontSize: '14dp', fontFamily: 'Arial'},
		color: "#fff",
		left: '10dp', right: '10dp',
		height: 'auto',
		text: ''
	});
	annotaionLabel.shadowColor = '#000';
	annotaionLabel.shadowOffset = {x: 0, y: -1};	
	view.add(annotaionLabel);	
	
	
	var actInd = Titanium.UI.createActivityIndicator({
		top: 10, 
		height: 50,
		width: 150
	});
	actInd.color = "#fff";
	if (Ti.UI.iPhone) {
		actInd.style = Titanium.UI.iPhone.ActivityIndicatorStyle.BIG;
	}
	actInd.show();
	actInd.message = 'Загрузка...';
	self.add(actInd);		
	
	var model = mdb.getRestaraunt(itemID);
	itemData = model[0];
	Ti.API.log('itemID: ' + itemID + 'data: ' + JSON.stringify(model));
	
	var t = itemData.description + " ";
	var f = 0;
	var newstring = t.replace(/\n/g, "");
	newstring = newstring.replace(/&nbsp;/g, " ");
	newstring = newstring.replace(/<([^>]+)>/g, function($0, $1) { 
		var r = '';
		if($1 == "ul"){f++;} 
		else if($1 == "/ul"){f = f - 1; if(f == 0){r = '\n';}}
		else if($1 == "/li"){}	
		else if($1 == "li"){if(f == 1){r = '\n ∙ ';} else if(f == 2){r = '\n  - ';}}
		else if($1.indexOf("/h") == 0){r = '\n';}
		else if($1.indexOf("h") == 0){r = '\n';}
		else if($1.indexOf("/p") == 0){r = '\n';}	
		return r;
	});
	annotaionLabel.text = newstring;
	
	titleLabel.text = itemData.name;
	addressLabel.text = itemData.adress;
	phoneLabel.text = itemData.telefon;
	//optionsLabel.text = itemData.options;
	
	var options =  itemData.options.split(",");	
	for(var i = 0; i < options.length; i++){
		var opt_img = Ti.UI.createImageView({image: options_imgs[options[i]], width: '45', height: '27', 'left': '2', 'right': '2'});
		Ti.API.log(options[i] + " " + options_imgs[options[i]]);
		optionsView.add(opt_img);
	}
		
	for(var i = 0; i < itemData.imgs.length; i++){
		var iv1 = Ti.UI.createImageView({defaultImage: settings.itemBigDefImage, hires: true, image: itemData.imgs[i], width: 320, height: 172});
		scrollImageView.addView(iv1);
	}
	actInd.hide();
	scrollView.show();
		
	
	return self;
};

module.exports = DetailView;
