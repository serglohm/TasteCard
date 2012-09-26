function MDb(_params){
	this.dbName = _params.settings.dbName;
	var db = Ti.Database.open(this.dbName);
	
	var DB_VERSION = 1.00;
	
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
    	if (parseFloat(result) < DB_VERSION){
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
	
	
    db.execute("CREATE TABLE IF NOT EXISTS restaraunts (id INTEGER PRIMARY , \
                                                                    name TEXT, \
																	description TEXT, \
																	conditions TEXT, \
																	url TEXT, \
																	adress TEXT, \
																	plat NUMERIC, \
																	plong NUMERIC, \
																	telefon TEXT, \
																	options TEXT, \
																	date_sell_start NUMERIC, \
																	date_sell_end NUMERIC, \
																	taste_preview_image TEXT \
																	)");
                                                                    
    db.execute("CREATE TABLE IF NOT EXISTS restaraunts_imgs (id INTEGER, url TEXT)");
   
    db.execute("CREATE TABLE IF NOT EXISTS restaraunts_cousins (id INTEGER, cid TEXT)");     
    db.execute("CREATE TABLE IF NOT EXISTS cousins (id INTEGER, name TEXT)");    
                                                                            
                                                                            
                                                                            
    db.execute("CREATE TABLE IF NOT EXISTS favourite_items (id INTEGER PRIMARY KEY AUTOINCREMENT, \
                                                                            rid INTEGER)");
    
    
                                                                            
	
	db.execute('COMMIT');
	db.close();
	
	
	this.db = db;
	
	return this;
};

MDb.prototype.open = function(itemId) {
	this.db = Ti.Database.open(this.dbName);
};

MDb.prototype.addItemToFavourites = function(itemId, name, thumb) {
	this.open();
    var query = this.db.execute("SELECT id FROM favourite_items where iid = ?", [itemId]);
    if (query.rowCount == 0){      
        this.db.execute("INSERT INTO favourite_items (iid) VALUES (?)", [itemId]);
    }
    query.close();
    var gquery = this.db.execute("SELECT cname FROM goods where iid = ?", [itemId]);
    if (gquery.rowCount == 0){
        this.db.execute("INSERT INTO goods (iid, cname, thumb) VALUES (?, ?, ?)", [itemId, name, thumb]);
    }
    gquery.close();

	this.db.close();
};


MDb.prototype.getRestaraunt = function(oid) {
    this.open();
	var model = [];
    var rows = this.db.execute("SELECT i.oid as oid, i.iid as iid, i.cnt as cnt, g.thumb as thumb, g.cname as cname FROM order_items i, goods g where g.iid=i.iid AND i.oid=?", [oid]);

	while (rows.isValidRow()){
		var rowData = {};
        rowData.cname = rows.fieldByName('cname');
        rowData.thumb = rows.fieldByName('thumb');
        rowData.oid = rows.fieldByName('oid');
        rowData.iid = rows.fieldByName('iid');
        rowData.cnt = rows.fieldByName('cnt');		
		
        model.push(rowData);
        rows.next();
    }
	rows.close();

    this.db.close();
    return model;
};

module.exports = MDb; 