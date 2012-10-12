function MDb(_params){
	this.dbName = _params.settings.dbName;
	var db = Ti.Database.open(this.dbName);
	
	var DB_VERSION = 1.030;
	
	
	db.execute('BEGIN');
	
	db.execute("CREATE TABLE IF NOT EXISTS app_settings (sname VARCHAR(100) PRIMARY KEY, svalue TEXT)");
	
	var delete_flag = false;
	var query = db.execute("SELECT svalue FROM app_settings WHERE sname='DB_VERSION'");
    if (query.rowCount == 0){      
        delete_flag = true;
        db.execute("INSERT INTO app_settings (sname, svalue) VALUES (?, ?)", ['DB_VERSION', DB_VERSION]);
    } else {
    	var result = query.fieldByName('svalue');
    	Ti.API.log('current DBVersion = ' + result)
    	if (parseFloat(result) != DB_VERSION){
    		delete_flag = true;
    		db.execute("UPDATE app_settings SET svalue=? WHERE sname='DB_VERSION'", [DB_VERSION]);
    	}	
    }
    query.close();
	
	if(delete_flag){
		Ti.API.log('DROP TABLES');
		db.execute("DROP TABLE IF EXISTS favourite_items");                                                        
	    db.execute("DROP TABLE IF EXISTS restaraunts");
		db.execute("DROP TABLE IF EXISTS restaraunts_imgs");
		db.execute("DROP TABLE IF EXISTS restaraunts_cousins");
		db.execute("DROP TABLE IF EXISTS cousins");
	}
	
	
    db.execute("CREATE TABLE IF NOT EXISTS restaraunts (id INTEGER PRIMARY KEY, \
                                                                    name TEXT, \
																	description TEXT, \
																	conditions TEXT, \
																	url TEXT, \
																	adress TEXT, \
																	plat NUMERIC, \
																	plong NUMERIC, \
																	telefon TEXT, \
																	options TEXT, \
																	date_sell_start DATETIME, \
																	date_sell_end DATETIME, \
																	date_edit DATETIME, \
																	cousins_text TEXT, \
																	taste_preview_image TEXT \
																	)");
                                                                    
    db.execute("CREATE TABLE IF NOT EXISTS restaraunts_imgs (id INTEGER, url TEXT)");
    db.execute("CREATE TABLE IF NOT EXISTS restaraunts_cousins (id INTEGER, cid INTEGER)");     
    db.execute("CREATE TABLE IF NOT EXISTS cousins (id INTEGER PRIMARY KEY, name TEXT, items_count INTEGER)");                                                                      
    db.execute("CREATE TABLE IF NOT EXISTS favourite_items (id INTEGER PRIMARY KEY AUTOINCREMENT, rid INTEGER)");                                                                        
	
	db.execute('COMMIT');
	db.close();
	
	this.cached = {'restaraunts': {}};
	this.editDate = 0;
	
	this.db = db;
	
	return this;
};

MDb.prototype.open = function(itemId) {
	this.db = Ti.Database.open(this.dbName);
};
MDb.prototype.saveCousins = function(data) {
	this.open();
	this.db.execute("DELETE FROM cousins");

	for(var i = 0; i < data.length; i++){
		var item = data[i];
		this.db.execute("INSERT INTO cousins (id, name, items_count) VALUES (?, ?, 0)", [
			item['id'],
			item['name']
		]);
		var cid = this.db.getLastInsertRowId();	
	}
	this.db.close();
};

MDb.prototype.saveRestaraunts = function(data) {
	this.open();
	this.db.execute("DELETE FROM restaraunts");
	this.db.execute("DELETE FROM restaraunts_imgs");
	this.db.execute("DELETE FROM restaraunts_cousins");
	var editDate = new Date(this.editDate);
	
	for(var i = 0; i < data.length; i++){
		try{
			var item = data[i];
			
			var plat = 0; 
			var plong = 0;
			var options = item['options'].join(",");
			
			if(item['coord'] != ""){
				var coord = item['coord'].split(',');
				plat = coord[1];
				plong = coord[0];
			}	
			
			var params = [
					item['id'], 
					item['name'], 
					item['description'], 
					item['conditions'], 
					item['url'], 
					item['adress'], 
					plat, 
					plong, 
					item['telefon'], 
					options, 
					item['date_sell_start'], 
					item['date_sell_end'], 
					item['date_edit'],
					item['taste_preview_image']
			];
			
			var edit_date = new Date();
			var myRe = /(\d+)\-(\d+)\-(\d+) (\d+)\:(\d+)\:(\d+)/ig;
			var myArray = myRe.exec(item['date_edit']);
			if(myArray.length){
				var y = parseInt(myArray[1]) - 1900;
				var m = myArray[2] - 1;
				var d = myArray[3];
				
				var hour = myArray[4];
				var minute = myArray[5];
				var seconds = myArray[6];
				var tempDate = new Date(y, m, d, hour, minute, seconds);	
				if (editDate < tempDate){
					editDate = tempDate;
				}			
			}
			this.setCachedRestaraunt(item);
			
			this.db.execute("INSERT INTO restaraunts (id, name, description, conditions, url, adress, plat, plong, telefon, options, date_sell_start, date_sell_end, date_edit, taste_preview_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", params);
			var rid = this.db.getLastInsertRowId();
						
			for(var j = 0; j < item['taste_images'].length; j++){
				this.db.execute("INSERT INTO restaraunts_imgs (id, url) VALUES (?, ?)", [rid, item['taste_images'][j]]);			
			}
			
			var cousins_text = ""; 
			for(var j = 0; j < item['cousins'].length; j++){
				this.db.execute("INSERT INTO restaraunts_cousins (id, cid) VALUES (?, ?)", [
					rid, item['cousins'][j]
				]);
				this.db.execute("UPDATE cousins SET items_count=items_count+1 WHERE id=?", [item['cousins'][j]]);
				
				var cousine_query = this.db.execute("SELECT name FROM cousins WHERE id=?", [item['cousins'][j]]);
			    if (cousine_query.rowCount > 0){      
			    	cousins_text += cousins_text == "" ? "": ", ";
			    	cousins_text += cousine_query.fieldByName("name");		
			    }
			    cousine_query.close();
			}	
			this.db.execute("UPDATE restaraunts SET cousins_text=? WHERE id=?", [cousins_text, rid]);			
			
	
		} catch(e){
			Ti.API.log('DB INSERT ERROR: ' + JSON.stringify(e));
		}
	}
	this.db.close();
	
	Ti.API.info("editDate: " + editDate);
};

MDb.prototype.getCousins = function() {
	return this.getSql("SELECT id, name, items_count FROM cousins WHERE items_count>?", ['id', 'name', 'items_count'], [1]);
};

MDb.prototype.getCousinRestaraunts = function(cid) {
	Ti.API.info("getCousinRestaraunts: " + cid);
	var sql = "SELECT r.id, r.name, r.telefon, r.taste_preview_image, r.adress, r.plat, r.plong, r.cousins_text, c.cid FROM restaraunts r, restaraunts_cousins c WHERE c.id=r.id AND c.cid=?";
	var fieldNames = ['id', 'name', 'adress', 'telefon', 'taste_preview_image', 'plat', 'plong', 'cousins_text', "cid"];
	var params = [cid];
	return this.getSql(sql, fieldNames, params);	
};

MDb.prototype.setCachedRestaraunt = function(rowData) {
	this.cached.restaraunts[rowData.id] = {'plat': rowData.plat, 'plong': rowData.plong, 'distance': 0};
};

MDb.prototype.getRestaraunts = function() {
    this.open();
	var model = [];
    var rows = this.db.execute("SELECT id, name, telefon, taste_preview_image, adress, plat, plong, cousins_text FROM restaraunts");

	while (rows.isValidRow()){
		var rowData = {};
        rowData.id = rows.fieldByName('id');
        rowData.name = rows.fieldByName('name');
        rowData.adress = rows.fieldByName('adress');
        rowData.telefon = rows.fieldByName('telefon');
        rowData.taste_preview_image = rows.fieldByName('taste_preview_image');
        rowData.plat = rows.fieldByName('plat');	
        rowData.plong = rows.fieldByName('plong');
        rowData.cousins_text = rows.fieldByName('cousins_text');

        model.push(rowData);
        rows.next();
    }
	rows.close();

    this.db.close();
    return model;
};

Number.prototype.toRad = function() {
    return this * Math.PI / 180;
}

MDb.prototype.getDistance = function(lat1, lon1, lat2, lon2) {

	var R = 6371; // km
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}

MDb.prototype.updateCachedDistance = function(lat, lon) {
	try{
		for(var i in this.cached['restaraunts']){
			var restaraunt = this.cached['restaraunts'][i];
			var d = this.getDistance(lat, lon, restaraunt.plat, restaraunt.plong);
			this.cached.restaraunts[i].distance = d;
		}
	} catch(e){
		Ti.API.info("error: " + e);
	}
}

MDb.prototype.getCachedRestaraunt = function(id) {
	return this.cached.restaraunts[id]; 
}

MDb.prototype.getRestaraunt = function(id) {
    this.open();
	var model = [];
    var rows = this.db.execute("SELECT  id, name, telefon, taste_preview_image, adress, plat, plong, conditions, description, options, cousins_text FROM restaraunts WHERE id=?", [id]);

	while (rows.isValidRow()){
		var rowData = {};
        rowData.id = rows.fieldByName('id');
        rowData.name = rows.fieldByName('name');
        rowData.adress = rows.fieldByName('adress');
        rowData.telefon = rows.fieldByName('telefon');
        rowData.taste_preview_image = rows.fieldByName('taste_preview_image');
        rowData.plat = rows.fieldByName('plat');	
        rowData.plong = rows.fieldByName('plong');
        rowData.cousins_text = rows.fieldByName('cousins_text');
        rowData.description = rows.fieldByName('description');
        rowData.conditions = rows.fieldByName('conditions');
        rowData.options = rows.fieldByName('options');
        
        var restaraunts_imgs = [];
        var imgsRows = this.db.execute("SELECT url FROM restaraunts_imgs WHERE id=?", [id]);
		while (imgsRows.isValidRow()){
			var url = imgsRows.fieldByName('url');
			if(url.indexOf("71x71") < 0){
        		restaraunts_imgs.push(url);
        	}
        	imgsRows.next();
        }
        imgsRows.close();
        rowData.imgs = restaraunts_imgs;
        
        model.push(rowData);
        rows.next();
    }
	rows.close();

    this.db.close();
    return model;
};


MDb.prototype.getRestarauntsCount = function() {
    return this.getOneFieldSql("SELECT count(id) as cnt FROM restaraunts", "cnt");
};

MDb.prototype.getCousineName = function(cid) {
    return this.getOneFieldSql("SELECT name FROM cousins WHERE id=?", "name", [cid]);
};

//----------------------------------------------------------------

MDb.prototype.getSql = function(sql, fields, params) {
    this.open();
	var model = [];
    var rows;
    if(params){
    	rows = this.db.execute(sql, params);
    	Ti.API.info("execute(" + sql + ", " + params);
    } else {
    	rows = this.db.execute(sql);
    }
    Ti.API.info('fields: ' + fields);
	while (rows.isValidRow()){
		var rowData = {};
		
		for(var i = 0; i < fields.length; i++){
			rowData[fields[i]] = rows.fieldByName(fields[i]);	
		}
		Ti.API.info(rowData);
        model.push(rowData);
        rows.next();
    }
	rows.close();

    this.db.close();
    return model;
};

MDb.prototype.getOneFieldSql = function(sql, fieldName, params) {
    
    this.open();
	var result = 0;
	var query;
	if(params){
		query = this.db.execute(sql, params);
	} else {
		query = this.db.execute(sql);
	}
    if (query.rowCount == 0){      
        result = 0;
    } else {
    	result = query.fieldByName(fieldName);		
    }
    query.close();
    this.db.close();
    return result;
};

module.exports = MDb; 