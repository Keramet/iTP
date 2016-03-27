"use strict";

var itp = itp || {};
	
	itp._config = {
		rCount: 10,
		cCount: 20
	}

	itp.init = function () {
		var rCountInput = document.querySelector('#rCount'),
			cCountInput = document.querySelector('#cCount');
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;

		document.querySelector('#btnCreate').addEventListener("click", function () {
			itp.rCount = rCountInput.value;
			itp.cCount = cCountInput.value;
			itp._createTables();
		});
	}
		
	itp._createTables = function () {
		var table = document.querySelector('#itpTable'),
			tableCol = document.querySelector('#itpTableCol'),
			tableRow = document.querySelector('#itpTableRow'),
		//	tbody = table.getElementsByTagName('tbody'),
			r, c, row;

		for (r = 0; r < itp.rCount; r++) {
			table.insertRow(r);
			tableRow.insertRow(r).insertCell(0).textContent = r + 1;

			for (c = 0; c < itp.cCount; c++) {
				if (r === 0) { 
					if (c === 0 ) { tableCol.insertRow(0) };
					tableCol.rows[0].insertCell(c).textContent = String.fromCharCode(65 + c);
				 }
				table.rows[r].insertCell(c).textContent =  ( r === 0 ) ? c+1 :
														   ( c === 0 ) ? r+1 : "";
			}
		}

		table.onscroll = function() {
  			var scrolledY = table.pageYOffset || document.documentElement.scrollTop,
  				scrolledX = table.pageXOffset || document.documentElement.scrollLeft;
  			console.log( "Y: " + scrolledY + 'px' );
  			console.log( "X: " + scrolledX + 'px' );
		}

	//	document.querySelector('.rowHeader').offsetHeight = document.querySelector('.table').offsetHeight;
	//	console.log(document.querySelector('.table').style.height);
	//	console.log(document.querySelector('.rowHeader').style);
	//	console.log(table.offsetHeight);

		console.dir(document.querySelector('hr'));

		
	}

document.addEventListener("DOMContentLoaded", itp.init);














	