function MDb(_params){
	this.dbName = _params.settings.dbName;
	this.db = Ti.Database.open(this.dbName);
	Ti.API.info('first time this.DBName = ' + this.dbName);
	this.db.execute("CREATE TABLE IF NOT EXISTS app_settings (sname VARCHAR(100) PRIMARY KEY, svalue TEXT)");
	this.DB_VERSION = 1.11;
	
	this.tablesData = {"restaraunts": ["id INTEGER PRIMARY KEY", 
									 "name TEXT", 
									 "description TEXT",
									 "conditions TEXT",
									 "url TEXT",
									 "adress TEXT",
									 "plat NUMERIC",
									 "plong NUMERIC",
									 "telefon TEXT",
									 "options TEXT",
									 "date_sell_start DATETIME",
									 "date_sell_end DATETIME",
									 "date_edit DATETIME",
									 "cousins_text TEXT",
									 "taste_preview_image TEXT"],
                                                                
	    "restaraunts_imgs": ["id INTEGER", "url TEXT"],
	    "restaraunts_cousins": ["id INTEGER", "cid INTEGER"],
	    "cousins": ["id INTEGER PRIMARY KEY", "name TEXT", "items_count INTEGER"],                                                                 
	    "favourite_items": ["id INTEGER PRIMARY KEY AUTOINCREMENT", "rid INTEGER"]                                                                       
	};
	this.cached = {'restaraunts': {}};
	this.editDate = "";	
	this.db.close();
	
	return this;
};	
	
MDb.prototype.initialize = function() {	
	Ti.API.info('initialize call');
	this.open();
	this.db.execute('BEGIN');
	
	var notVersion = this.updateNotEqualSetting('DB_VERSION', this.DB_VERSION);
        
    if(notVersion){    	
	    this.updateNotEqualSetting('EDIT_DATE', '');
	    for(var tableName in this.tablesData){
			this.db.execute("DROP TABLE IF EXISTS " + tableName);
		}
		this.db.execute('COMMIT'); this.db.close(); this.open(); this.db.execute('BEGIN');		
		
		this.createTables();
		
		this.db.execute('COMMIT'); this.db.close();		
    	this.open(); this.db.execute('BEGIN');		
	} else {
		Ti.API.info('db version ok');
	}
	this.editDate = this.getSetting("EDIT_DATE");
	this.db.execute('COMMIT');
	this.db.close();
	Ti.API.info('initialize end');
	
	Ti.API.info("this.editDate: " + this.editDate);
};

MDb.prototype.updateSetting = function(name, value) {
	db.execute("UPDATE app_settings SET svalue=? WHERE sname='" + name + "'", [value]);
};

MDb.prototype.getSetting = function(name) {
	return this.getOneFieldSql("SELECT svalue FROM app_settings WHERE sname=?", "svalue", [name]);
};

MDb.prototype.saveCousins = function(data) {
	this.open();
	this.db.execute("DELETE FROM cousins");

	for(var i = 0, data_len = data.length; i < data_len; i++){
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
	var editDate = this.editDate != "" ? this.dateFromStr(this.editDate): this.dateFromStr('2012-09-12 01:01:01');
	
	for(var i = 0, data_len = data.length; i < data_len; i++){
		try{
			var item = data[i];
			
			item['plat'] = 0; 
			item['plong'] = 0;
			var options = item['options'].join(",");
			
			if(item['coord'] != ""){
				var coord = item['coord'].split(',');
				item['plat'] = coord[1];
				item['plong'] = coord[0];
			}	
			
			var params = [
					item['id'], 
					item['name'], 
					item['description'], 
					item['conditions'], 
					item['url'], 
					item['adress'], 
					item['plat'], 
					item['plong'], 
					item['telefon'], 
					options, 
					item['date_sell_start'], 
					item['date_sell_end'], 
					item['date_edit'],
					item['taste_preview_image']
			];
			
			Ti.API.info("date_edit: " + item['date_edit']);
			
			var tempDate = this.dateFromStr(item['date_edit']);
			if(tempDate){
				if (editDate - tempDate < 0){
					editDate = tempDate;
					this.editDate = item['date_edit'];
					Ti.API.info("SET DATE_EDIT TO " + item['date_edit']);
				}			
			}
			if(this.getCachedRestaraunt(item['id'])){
				this.db.execute("DELETE FROM restaraunts WHERE id=?", item['id']);
				this.db.execute("DELETE FROM restaraunts_imgs WHERE id=?", item['id']);
				this.db.execute("DELETE FROM restaraunts_cousins WHERE id=?", item['id']);
				Ti.API.info('DELETE DATA FOR ' + item['id']);
			} else {
				Ti.API.info('Cache Data for ' + item['id']);
				this.setCachedRestaraunt(item);
			}
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
	
	Ti.API.info("save restaraunts editDate: " + this.editDate)
	this.updateNotEqualSetting('EDIT_DATE', this.editDate);
	
	this.db.close();
	
	
	
};

MDb.prototype.getCousins = function() {
	return this.getSql("SELECT id, name, items_count FROM cousins WHERE items_count>?", ['id', 'name', 'items_count'], [0]);
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
    var rows = this.db.execute("SELECT id, name, telefon, taste_preview_image, adress, plat, plong, cousins_text, date_edit FROM restaraunts");

	while (rows.isValidRow()){
		var rowData = {};
        rowData.id = rows.fieldByName('id');
        rowData.name = rows.fieldByName('name');
        rowData.adress = rows.fieldByName('adress');
        rowData.telefon = rows.fieldByName('telefon');
        rowData.taste_preview_image = rows.fieldByName('taste_preview_image');
        rowData.plat = rows.fieldByName('plat');	
        rowData.plong = rows.fieldByName('plong');
        rowData.date_edit = rows.fieldByName('date_edit');
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

	//Ti.API.info('getDistance...');
	//Ti.API.info(lat1 + ' ' + lon1 + ' ' + lat2 + ' ' + lon2);
	if(! ( lat1 && lon1 && lat2 && lon2 )){
		//Ti.API.info(' .... 0');
		return 0;
	}
	var R = 6371; // km
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var lat1 = parseFloat(lat1).toRad();
	var lat2 = parseFloat(lat2).toRad();
	
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
    var rows = this.db.execute("SELECT  id, name, telefon, taste_preview_image, adress, plat, plong, conditions, description, options, cousins_text FROM restaraunts WHERE id=?", id);

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
			if(url.indexOf("71x71") < 0 && url.indexOf("142x142") < 0){
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
	this.open();
    var result = this.getOneFieldSql("SELECT count(id) as cnt FROM restaraunts", "cnt");
    this.db.close();
    return result; 
};

MDb.prototype.getCousineName = function(cid) {
    this.open();
    var result = this.getOneFieldSql("SELECT name FROM cousins WHERE id=?", "name", [cid]);
    this.db.close();
    return result; 
};

//----------------------------------------------------------------

MDb.prototype.updateNotEqualSetting = function(sname, svalue) {
	var updated = false;
	var query = this.db.execute("SELECT svalue FROM app_settings WHERE sname=?", sname);
    if (query.rowCount == 0){      
        updated = true;
        this.db.execute("INSERT INTO app_settings (sname, svalue) VALUES (?, ?)", sname, svalue);
    } else {
    	var result = query.fieldByName('svalue');
    	Ti.API.info("OLD VALUE OF " + sname + " " + result);
    	if (result != svalue){
    		updated = true;
    		this.db.execute("UPDATE app_settings SET svalue=? WHERE sname=?", svalue, sname);
    		Ti.API.info("UPDATE VALUE OF " + sname + " TO " + svalue);
    	}	
    }
    query.close();
    return updated;
};

MDb.prototype.createTableSql = function(tableName, fieldNames) {
	//var sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (" + fieldNames.join(", ") + ")";
	var sql = "CREATE TABLE " + tableName + " (" + fieldNames.join(", ") + ")";
	return sql;
};

MDb.prototype.open = function(itemId) {
	Ti.API.info('this.DBName = ' + this.dbName);
	this.db = Ti.Database.open(this.dbName);
};

MDb.prototype.getSql = function(sql, fields, params) {
    this.open();
	var model = [];
	/*
	var	sql = arguments[0];
	var fields = arguments[1];
	var sql_arguments = [sql];
	if(arguments.length > 2){
		for(var i = 2; i < arguments.length; i++){
			sql_arguments[i - 1] = arguments[i];
		}	
	}
	var rows = Function.prototype.apply.call(this.db.execute, this.db, sql_arguments);
	*/
	var rows;
	if(params){
		rows = this.db.execute(sql, params);
	} else {
		rows = this.db.execute(sql);
	}
	while (rows.isValidRow()){
		var rowData = {};
		for(var i = 0; i < fields.length; i++){
			rowData[fields[i]] = rows.fieldByName(fields[i]);	
		}
        model.push(rowData);
        rows.next();
    }
	rows.close();
    this.db.close();
    return model;
};

MDb.prototype.getOneFieldSql = function(sql, fieldName, params) {
    
	var result;
	var query;
	
	/* 
	var	sql = arguments[0];
	var fieldName = arguments[1];
	var sql_arguments = [sql];
	if(arguments.length > 2){
		for(var i = 2; i < arguments.length; i++){
			sql_arguments[i - 1] = arguments[i];
		}	
	}
	var query = Function.prototype.apply.call(this.db.execute, this.db, sql_arguments);
	*/
	if(params){
		query = this.db.execute(sql, params);
	} else {
		query = this.db.execute(sql);
	}
	
    if (query.rowCount == 0){      
        result = 0;
    } else {
    	var v = query.fieldByName(fieldName);	
    	result = v;
    }
    query.close();
    return result;
};

MDb.prototype.createTables = function() {
	for(var tableName in this.tablesData){
		Ti.API.info('createTableSql(' + tableName + ')');
		var sql = this.createTableSql(tableName, this.tablesData[tableName]);
		Ti.API.info(sql);
		var result = this.db.execute(sql);
		Ti.API.info(result);
	}	
};

MDb.prototype.dropTables = function() {
	for(var tableName in this.tablesData){
		this.db.execute("DROP TABLE IF EXISTS " + tableName); 
	}	
};

MDb.prototype.showTables = function(str) {
	Ti.API.info('show tables');
	var rows = this.db.execute("select sql from sqlite_master");
	while (rows.isValidRow()){
		Ti.API.info('get table sql: ' + rows.fieldByName('sql'));
		rows.next();
	}
	rows.close();
};

MDb.prototype.dateFromStr = function(str) {
	var myRe = /(\d+)\-(\d+)\-(\d+) (\d+)\:(\d+)\:(\d+)/ig;
	var myArray = myRe.exec(str);
	if(myArray.length){
		var y = parseInt(myArray[1]);
		var m = myArray[2] - 1;
		var d = myArray[3];
		
		var hour = myArray[4];
		var minute = myArray[5];
		var seconds = myArray[6];
		var tempDate = new Date(y, m, d, hour, minute, seconds);
		return tempDate;
	}
	return 0;	
};

module.exports = MDb; 