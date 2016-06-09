
class itpSheetClass {

	constructor (rCount=30, cCount=20, isHide=true) {	//	false, чтобы переСоздавать лист (пока не использую) 
		this.id 	= -1;		// только создан. потом id >= 0
		this.name 	= "";
		this.rCount = rCount;
		this.cCount = cCount;
		this.cells 	= {};		// может, использовать спец.объект (WeakSet)? (или массив?)
		this.corner = {			// может лучше использовать объект itpCellClass ?
			r: 1,
			c: 1,
			get name () { return itpCellClass.getColName( this.c-1 ) + this.r; }
		};
	}

	fromJSON (sheetJSON) {		// может, как-то совместить с constructor ?
		if ( !sheetJSON ) return  console.log("Не передан sheetJSON!");

		let {id, name, rCount, cCount, cells, active=false} = sheetJSON;
		this.id 	= id;		
		this.name 	= name;
		this.rCount = rCount;
		this.cCount = cCount;
		for (let cell in cells) {
			let itpCell = new itpCellClass().fromJSON( cells[cell] );
    		this.cells[itpCell.name] = itpCell;
		}
		this.active	= active;

		return this;itpSheetClass
	}
	addCell (cellName, text="") {
		if ( !cellName )  return console.log('Не указана ячейка (например: "D4")');

		if ( this.cells[cellName] ) {	//	если text="" удалять? или value=0 ?
			this.cells[cellName].text = text;
			this.cells[cellName].getValue();
			return this.cells[cellName];
		} else {
			let cell = new itpCellClass();
			cell.sheetId = this.id;
			cell.name 	 = cellName;
		//	cell.id 	 = `[${+cell.sheetId}]${cell.name}`;
			cell.text    = text;
			cell.getValue();
			this.cells[cellName] = cell;
			return cell;
		}
	}
//	getSelected () {}

//	unSelect () {} 	

}//	end of  itpSheetClass


class itpCellClass {

	constructor () {		// подумать, какие параметры можно передавать...
		this.sheetId = -1;
		this.name 	 = "";
	//	this.id 	 = `[${this.sheetId}]${this.name}`;	// может, заменить на getter?
		this.text 	 = "";
		this.value 	 = ""
	//	this.td 	 = null;
	}

	fromJSON (cellJSON) {
		if ( !cellJSON ) return	console.log("Не передан cellJSON!");

		let {sheetId, name, id, text, value} = cellJSON;
		this.sheetId = sheetId;
		this.name 	 = name;
	//	this.id 	 = id;
		this.text 	 = text;
		this.value   = value;
		return this;
	}
	get id () { return `[${this.sheetId}]${this.name}`; }

	getValue () {
		let formula, result,
			sheet = +this.sheetId - 1;	//	для  _getValueByRef(formula)

		if ( this.text === "" ) return 0, this.value = "";
		if ( this.text === "=" ) {
			this.text = "";
			return this.value = "";
		}

		// 	if (this.text === "" || this.text === "=") {
		// 	this.text  = "";
		// 	this.value = "";
		// 	return 0;
		// }


		if (this.text[0] === "=") {
			formula = this.text.substring(1);
			try   {
				result = new Function( "with (Math) { return " + _getValueByRef(formula) + "}" )(); 
			}
			catch (error) {	
				result = "<span class='error'>!</span>";
				console.log("Ошибка в формуле - ячейка ", this.id);
			}

		} else { result = this.text; }
		return this.value = result;

		function _getValueByRef(formula) {		// sheet надо брать из formula!! (чтоб ссылаться на другие листы)  Добавить проверку, попадает ли ref на лист?
			return  formula.replace( /([A-Z]+\d+)/g, ref => {
				let val = itpApp.data[sheet].cells[ref]? itpApp.data[sheet].cells[ref].value
													   : 0;
				return 	val;						   
			});
		}
	}//	end of  getValue()

	get row () { return  +this.name.substring( this.name.search(/\d/) ); }
	
	get column () { return  this.name.substring( 0, this.name.search(/\d/) ); }

	get columnN () { return itpCellClass.getColumnN( this.name ); }

	setTD (txt=this.value) {			//	связь с конкретной ячейкой в HTML-таблице
		let temp = itpApp.checkCell(this);

		if ( temp ) {
			itpApp.table.rows[ temp.r ].cells[ temp.c ].innerHTML = txt;
		}
		// if (this.sheetId !== itpApp.aSh.id)	{
		// 	return console.log("Ячейка не на активном листе");
		// }

		// console.log("row: ", this.row);
		// console.log("columnN: ", this.columnN);
		


		// let table = document.querySelector("#tt"),
	//	let table = document.querySelector("div.sheet.active").querySelector("table.itpTable"),
		// 	r 	  = this.row - 1,
		// 	c 	  = this.columnN - 1;

		// table.rows[r].cells[c].innerHTML = txt;
	//	return this.td;
	}

	static getColName (n=0) {	// получить символ столбца по его номеру	
		let chCount = itpApp._conf.colChars.end.charCodeAt(0) - 
					  itpApp._conf.colChars.start.charCodeAt(0) + 1,
			arr     = [],
			getChar = (i) => String.fromCharCode( itpApp._conf.colChars.start.charCodeAt(0) + i );	// а если i>chCount ?  (i присвоить itpApp._conf.colChars.end?)

		(function decomposition(N, base) {		// подумать, может base убрать?? (использовать сразу chCount)
			let temp = Math.floor(N / base);

			if (!temp) { arr.unshift( getChar(N) ); }
			else {
				arr.unshift( getChar(N % base) );
				decomposition( temp - 1, base );
			}
		})(n, chCount);

		return arr.join("");
	}

	static getRow (cellName) { return +cellName.substring( cellName.search(/\d/) ); }

	static getColumn (cellName) { return cellName.substring( 0, cellName.search(/\d/) ); }

	static getColumnN (cellName) {		//	получить номер столбца. Отсчёт с 1    //  get columnN () { ... }
		let startCode  = itpApp._conf.colChars.start.charCodeAt(0),
			endCode    = itpApp._conf.colChars.end.charCodeAt(0),
			count 	   = endCode - startCode + 1,
			colNameArr = itpCellClass.getColumn(cellName).split("").reverse();

		return colNameArr.reduce( (pr, cur, i) => {
        	return pr + Math.pow(count, i) + cur.charCodeAt(0) - startCode;
        }, 0);
	}

}//	end of  itpCellClass


class SelRangeClass {

	constructor (startR=-1, startC=-1, sheet=-1) {
		this.start     = { r: startR,  c: startC };
		this.end       = { r: startR,  c: startC };
		this.sheet     = sheet;
		this.inProcess = true;
		// this.getSelector();
	}

	get id () { return `[${this.sheet}]${itpCellClass.getColName( this.start.c-1 )}${this.start.r}:${itpCellClass.getColName( this.end.c-1 )}${this.end.r}`; }

	checkEnd (endR, endC) {		//	проверяем, изменился ли диапазон в процессе выделения
		let cp;
		if (this.end.r !== endR || this.end.c !== endC) {
			cp = this.copy().show("hovered", "remove");
			// cp = this.copy().setClass("hovered", "remove");

			if (this.end.r !== endR) this.end.r = endR;
			if (this.end.c !== endC) this.end.c = endC;
			cp = this.copy().show("hovered");
			// cp = this.copy().setClass("hovered");

			itpApp.formula.inputCell.value = cp.toString();
		}
	}

	checkStartEnd () {	// если  выделение начато не из верх.лев. угла
		if (this.start.r > this.end.r)  [this.start.r,  this.end.r] = [this.end.r, this.start.r];
		if (this.start.c > this.end.c) 	[this.start.c,  this.end.c] = [this.end.c, this.start.c];
		// this.getSelector();
		return this;
	}

	// getSelector () {
	// 	return this.selector = "tr:nth-child(n+" + (this.start.r+1) + "):not(:nth-child(n+" + (this.end.r+2) + ")) " +
	// 					   	   "td:nth-child(n+" + (this.start.c+1) + "):not(:nth-child(n+" + (this.end.c+2) + "))";
	// }

	// setClass (cssClass="", operation="add") {  // 
	// 	let range = document.querySelector("div.sheet.active")
	// 					.querySelectorAll(this.selector);
	// 	[].forEach.call( range, cell => cell.classList[operation](cssClass) );
	// 	return this;
	// }

	show (cssClass="selected", operation="add") {		// заменить на setClass ?
		let r, c;

		if ( this.sheet !== itpApp.aSh.id ) return;

		for (let i = 1, rows = itpApp.table.rows.length - 1; i <= rows; i++) {
			r = i + itpApp.aSh.corner.r - 1;
			for (let j = 1, cols = itpApp.table.rows[0].cells.length - 1; j <= cols; j++) {
				c = j + itpApp.aSh.corner.c - 1;
				if ( (r >= this.start.r && r <= this.end.r) && (c >= this.start.c && c <= this.end.c) ) {
					itpApp.table.rows[i].cells[j].classList[ operation ](cssClass);
				}
			}
		}

		return	this;
	}

	copy () {		// для применения стилей, пока диапазон в процессе установления...
		let cp  = new SelRangeClass();
		cp.start.r = this.start.r;
		cp.start.c = this.start.c;
		cp.end.r   = this.end.r;
		cp.end.c   = this.end.c;
		cp.sheet   = this.sheet;		
		cp.checkStartEnd();
		return cp;
	}

//	toString () { return `[${this.sheet}]${itpCellClass.getColName(this.start.c-1)}${this.start.r}:${itpCellClass.getColName(this.end.c-1)}${this.end.r}`; }
	toString () { return  this.id; }

}// end of  SelRangeClass


class FormulaClass {

	constructor (selector='input.formula') {
		this.input     = document.querySelector(selector);		//  this.input = document.querySelector(selector) || 
		this.inputCell = document.querySelector("#inputCell");
		this.active    = false;
		this.text      = "";
		this.onEvents();	//	события на input
	}// end of condtructor

	checkActive () {	//	
		this.text   = this.input.value;
		// this.active = ( this.text.search(/[=+-/\*(]$/ig) !== -1 )? true : false;
		if ( this.text.startsWith("=") && this.text.search(/[=+-/\*(]$/ig) !== -1 ) {
			this.active = true;
		} else {
			this.active = false;
		}
	
	}

	onEvents () {	
		this.input.oninput = () => {
			this.checkActive();
			// debugger;
			itpApp.aCell.setTD( this.text );
			console.log(this.active);
		}
		this.input.onchange = () => {
			this.checkActive();
			console.log(this.active);
		}
		this.input.onkeyup = function (e) { 
			if (e.keyCode === 13) {
				itpApp.formula.active = false;
				// itpApp.aCell.td.classList.add("selected");	// !!!
				this.blur();
			}
		}
		this.input.onfocus = (e) => {
			if ( !itpApp.aCell ) {
				console.log("this.input.onfocus()...  Нет активной ячейки!");
				console.dir(e.target);
				e.target.blur();
			} else {
				this.checkActive();
				itpApp.aCell.setTD( this.text );
			//	itpApp.aCell.td.innerHTML = this.text;
			}
		}
		this.input.onblur  = () => { 
			if ( itpApp.aCell && !this.active ) {
				itpApp.aCell.text = this.input.value;
				this.text         = this.input.value;
				if ( this.input.value ) {
					itpApp.aSh.addCell( itpApp.aCell.name, itpApp.aCell.text );
				} 
				itpApp.aCell.setTD( itpApp.aCell.getValue() );	// !!!
				itpApp.isNeedSave = true;
			} else {
	
				console.log("this.input.onblur()...   Нет активной ячейки!");
			}
		}
	}// end of   onEvents

	getCells () {
		let cells = [];

		cells = this.text.match(/([A-Z]+\d+)/g);
		console.log(cells);
	}

/*	setValue (options=null) {
		(function () {
			return options => {
				this.text  = this.input.value;
				if ( !options ) this.value = (this.text === "")? "" : `f(${this.text})=??? ...  написать реализацию f()`;
			}
		})();
	}
*/

}// end of  FormulaClass



// })();