/*
 *  Variables
 */


// Get DOM primary elements
const cal = document.getElementById('calendar');
const main = document.getElementsByTagName('main')[0];



// Customization variables
var useMonthShort = false,
	useDayShort = true;


// Validation rules
const validations = {
	required: function(value) {
		return value !== '';
	},
	dateFormat: function(value) {
		return value.match(/^((0[13578]|1[02])[\/|\-](0[1-9]|[12][0-9]|3[01])[\/|\-](18|19|20)[0-9]{2})|((0[469]|11)[\/|\-](0[1-9]|[12][0-9]|30)[\/|\-](18|19|20)[0-9]{2})|((02)[\/|\-](0[1-9]|1[0-9]|2[0-8])[\/|\-](18|19|20)[0-9]{2})|((02)[\/|\-]29[\/|\-](((18|19|20)(04|08|[2468][048]|[13579][26]))|2000))$/);
	},
	daysLength: function(value) {
		return value.match(/^([1-9][0-9]{0,2})$/);
	},
	countryCode: (value) => {
		return (value.length == 2 && !parseInt(value));
	}
};

// Validation error messages
var messages = {
	required: 'Required field',
	dateFormat: 'Invalid date format. Please use mm/dd/yyyy',
	daysLength: 'Use only numeric chacters between 1 and 999.',
	countryCode: "Country code input to accept only 2 letter"
}


// Define month full names
var monthFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Define day full names
var dayFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Get today's date
var today = getTodayDate();
// Format day and month names
var monthName = formatNames('month', useMonthShort);
var dayName;




/*
 *  Helpers
 */


// Get todays date formatted as dd/mm/yyyy
function getTodayDate() {
	var now = new Date();
	return now.getDate() + '/' + now.getMonth() + '/' + now.getFullYear();
}

// Get first day of a month
// Returns an integer. Eg: 4 => Thursday
function firstDayOfMonth(year, month) {
	var thisMonth = year + '/' + (month + 1) + '/1';
	return new Date(thisMonth).getDay();
}

// Get total days in a month
// Return an interger. Eg: 30
function totalDaysInMonth(year, month) {
	return new Date(year, month + 1, 0).getDate();
}

// Format day and month names
function formatNames(type, useShort) {
	var arrayFull = (type === 'month') ? monthFull : dayFull,
		arrayFinal;

	// If using short version of names
	if ( useShort ) {
		// Create a new empty array
		arrayFinal = [];

		// Iterate each name, slice first 3 charactes and push to new array
		for (var i = 0; i < arrayFull.length; i++) {
			arrayFinal.push(arrayFull[i].substr(0, 3));
		}
	// If using full version of names
	} else {
		// Create a shallow copy of original
		arrayFinal = arrayFull.slice();
	}

	// Return results
	return arrayFinal;
}

// Make calendar
function makeCalendar(dateStart, dateLength, countryCode) {
	/* getting country code json */
	//countryHolidays = getJsonCountryHolidays(countryCode);
	// Parse dateLength value just to make sure we work with an integer
	dateLength = parseInt(dateLength);

	// Split date to ensure expected formatting (dd/mm/yyyy)
	var params = dateStart.split('/'),
		startDay = parseInt(params[1]),
		startMonth = parseInt(params[0] - 1),
		startYear = parseInt(params[2]),
		formatted = startYear + '/' + startMonth + '/' + startDay;

	/**
	 * async function to get the holidays, apply the class to cell selected and not selected.
	 * @param {integer} $theDay 
	 * @param {object} $day_name 
	 * @param {object} $day_cell 
	 * @param {integer} $month 
	 * @param {boolean} isLast 
	 * @param {string} countryCode 
	 * @param {integer} startMonth 
	 */
	let final = async function ($theDay,$day_name, $day_cell, $month, isLast,countryCode,startMonth ) {
		var holidayArr = await getJsonCountryHolidays($theDay,countryCode,startMonth); 
		if( !isLast ) {
			$day_cell.appendChild($day_name);
			
			if( holidayArr.length > 0 ) {
				//setting attributes
				$day_cell.setAttribute('data-day',$theDay);
				$day_cell.setAttribute('data-country',countryCode);
				$day_cell.setAttribute('data-month',startMonth);
				//adding event to click
				$day_cell.addEventListener("click", btnClick);	

				$day_cell.classList.add("holiday");
			}
			$month.appendChild($day_cell);
		} else {
			fillEmptyMonth(tempYear, tempMonth, $theDay, monthLimit,countryCode);
		}		
		
	}
	
	
	// Create new month structure
	createNewMonth(startMonth, startYear);

	// Define temporal variables for loop
	var tempDay, tempMonth, tempYear, monthLimit, firstDay, tempCount = 0;

	// Iterate on user input length
	for (var j = 0; j <= dateLength; j++) {
		var isLast = (j === dateLength);

		// First iteration (staring day)
		if ( j === 0 ) {
			tempDay		= startDay;
			tempMonth	= startMonth;
			tempYear	= startYear;
			monthLimit	= totalDaysInMonth(tempYear, tempMonth);
			firstDay	= firstDayOfMonth(tempYear, tempMonth);

			// Fix empty spaces array iteration length if week starts on monday
			var loopLen = tempDay - 1;

			// Add all invalid day spaces before start date
			addEmptyDaySpaces(tempYear, tempMonth, loopLen);
		// Current day number exceeds month total days
		} else if ( tempDay + tempCount > monthLimit && !isLast ) {
			// Reset temporal day counts
			tempCount	= 0;
			tempDay		= 1;

			// Reset temporal month and increment by one temporal year variable
			// if current month exceeds maximum amount of months in a year (11 > December)
			if ( tempMonth === 11 ) {
				tempYear = tempYear + 1;
				tempMonth = 0;
			// else, increment temporal month variable by one
			} else {
				tempMonth = tempMonth + 1;
			}

			// Reset month limits and get new month's first day
			monthLimit	= totalDaysInMonth(tempYear, tempMonth);
			firstDay	= firstDayOfMonth(tempYear, tempMonth);

			// Create new month structure
			createNewMonth(tempMonth, tempYear);
		}
		var $theDay = tempDay + tempCount;
		if ( !isLast ) {
			var $month = document.getElementById(monthName[tempMonth] +  '_' + tempYear);
			let $day_cell = document.createElement('li');
			let $day_name = document.createElement('span');
			

			// Add correct day number for new month structures
			$day_name.innerText = tempDay + tempCount;

			var weekend = (tempDay + tempCount - 1) + firstDay,
				dateString = (tempDay + tempCount) + '/' + tempMonth;

			// Check if day is weekend and add class name for styling purposes
			if ( weekend % 7 === 0 || (weekend + 1) % 7 === 0) {
				$day_cell.classList.add('weekend');
			}

			// Check if day is today and add class name for styling purposes
			if ( dateString + '/' + tempYear === today ) {
				$day_cell.classList.add('today');
			}
			
			final($theDay,$day_name, $day_cell, $month, false,countryCode,startMonth);
			
		} else {
			final($theDay,"", null, null, true,countryCode,startMonth);
		}

		// Increment temp day counter
		tempCount++;
	}

	// Remove loading class after all days/months are rendered
	window.setTimeout(function() {
		cal.parentNode.classList.remove('loading');

	}, 1500);
}

function createNewMonth(curMonth, curYear) {
	dayName = formatNames('day', useDayShort);
	// Create month wrapper structure
	let $month_wrapper = document.createElement('div');

	// Add month wrapper class based on version of week day names (full || short)
	$month_wrapper.className = ( !useDayShort ) ? 'month big' : 'month';

	// Append month wrapper to calendar
	cal.appendChild($month_wrapper);

	// Create month header and add month name
	let $month_header = document.createElement('h2');
	$month_header.className = 'month_title';
	$month_header.innerText = monthName[curMonth] + ' ' + curYear;

	// Append header to month wrapper
	$month_wrapper.appendChild($month_header);

	// Create week day names header
	let $week_header = document.createElement('ol');
	$week_header.className = 'week_title';

	// Create day numbers container
	let $days = document.createElement('ol');
	var monthId =  monthName[curMonth] + '_' + curYear;
	$days.id = monthId;
	$days.className = 'week_days';

	// Append week name header to month wrapper
	$month_wrapper.appendChild($week_header);
	// Append day numbers container to month wrapper
	$month_wrapper.appendChild($days);

	// Iterate on days of week
	for (var i = 0; i < dayName.length; i++) {
		let $day_cell = document.createElement('li');
		let $day_name = document.createElement('span');

		// Add day name
		$day_name.innerText = dayName[i];
		// Append day name to list item
		$day_cell.appendChild($day_name);
		// Append list item to week row
		$week_header.appendChild($day_cell);
	}

	// Get first day in month for use as empty space length
	var firstDay = firstDayOfMonth(curYear, curMonth);

	// Add all empty day spaces before first day of month
	addEmptyDaySpaces(curYear, curMonth, firstDay);
}

// Fill days on calendar before user selected date
function addEmptyDaySpaces(year, month, length) {
	var firstDay = firstDayOfMonth(year, month);
	var monthId =  monthName[month] + '_' + year;
	var $month = document.getElementById(monthId);
	var loopLen = length;

	for (var i = 0; i < loopLen; i++) {
		var $day_cell = document.createElement('li');
		var $day_name = document.createElement('span');
		var weekend = i + firstDay;

		$day_name.className = 'empty';
		$day_name.innerText = '-';

		// Append month name to month table container
		$day_cell.appendChild($day_name);
		$month.appendChild($day_cell);
	}
}

// Fill days on calendar after user input length
async function  fillEmptyMonth(year, month, start, length,countryCode ) {
	var firstDay = firstDayOfMonth(year, month);
	var monthId =  monthName[month] + '_' + year;
	var $month = document.getElementById(monthId);
	var loopLen = length;

	for (var i = start - 1; i < loopLen; i++) {
		var $day_cell = document.createElement('li');
		var $day_name = document.createElement('span');

		$day_name.className = 'disabled';
		$day_name.innerText = i + 1;
		var $theDay = i + 1;
		holidayArr= await getJsonCountryHolidays(i + 1, countryCode, month);

		//valid if the array is not empty to assign the attributes, add class to cell and event to show the holiday name
		if( holidayArr.length > 0 ) {
			console.log(parseInt(holidayArr[0].day) ,  i + 1);
			if(parseInt(holidayArr[0].day) == i + 1)
			{
				//setting attributes
				$day_cell.setAttribute('data-day',$theDay);
				$day_cell.setAttribute('data-country',countryCode);
				$day_cell.setAttribute('data-month',month);
				//adding event to click
				$day_cell.addEventListener("click", btnClick);	

				$day_cell.classList.add("holiday");
			}	
		}

		// Append month name to month table container
		$day_cell.appendChild($day_name);
		$month.appendChild($day_cell);
	}
}

/**
 * async function to get from country code and json file the holidays.
 * @param {integer} $theDay 
 * @param {string} countryCode 
 * @param {integer} startMonth 
 * @returns array
 */
async function getJsonCountryHolidays($theDay,countryCode, startMonth) {
	
	const jsonPath = "/holidays/";
	const countries = [
		'cr',
		'us',
		'int'
	];
	var prefix = countries.filter((data)=> data == countryCode);
	var uri ="";
	
	if( prefix.length > 0 ) {
		uri = jsonPath + prefix[0]+".json";
	} else {
		uri = jsonPath + countries[2]+".json";
	}

	const countryHolidays = await fetch(uri).then((res)=> res.json()).then((_holidays)=>{
		
		var allHolidays = [];
		for(var key in _holidays) {
			var monthday = key.split("/");
			
			if( allHolidays.filter((month, k)=>(k == monthday[1])).length== 0) {
				allHolidays[monthday[1]] = [];
			}

			allHolidays[monthday[1]].push({day: monthday[0], holiday:_holidays[key][0].name });

		}
		return allHolidays;


	});	

	const getHolidayDay = countryHolidays.filter((data2,key)=> key == startMonth);
	var holiday_ = getHolidayDay[0].filter((data)=>{
		return data.day == $theDay;
	});

	if ( holiday_.length > 0) {
		return holiday_;
	} else {
		return [];
	}
}

// Validate form data and submit
function validateForm() {
	var formElem = document.getElementById('cal_form'),
		inputArray = formElem.querySelectorAll('input');

	// Add classname 'used' if input has a value
	for (var k = 0; k < inputArray.length; k++) {
		inputArray[k].addEventListener('blur', function(e) {
			if ( !this.value ) {
				this.classList.remove('used');
			} else {
				this.classList.add('used');
			}
		});
	}
  
	formElem.addEventListener('submit', function(e) {
		e.preventDefault();

		var errorsLen = 0, i = 0;

		while (i < inputArray.length) {
			var attr = inputArray[i].getAttribute('data-validation'),
				rules = attr ? attr.split(' ') : '',
				parent = inputArray[i].parentNode,
				j = 0;

			while (j < rules.length) {
				var inputName = inputArray[i].getAttribute('name'),
					elError = document.getElementById(inputName + '-error');

				if ( !validations[rules[j]](inputArray[i].value) ) {
					e.preventDefault();

					if ( !elError ) {
						elError = document.createElement('span');
						elError.id = inputName + '-error';
						elError.classList.add('error');

						parent.appendChild(elError);
					}

					elError.innerHTML = messages[rules[j]];
					inputArray[i].classList.add('error');
					errorsLen++;

					break;
				} else {
					if ( elError ) {
						elError.parentNode.removeChild(elError);
					}

					inputArray[i].classList.remove('error');
				}

				j++;
			}

			i++;
		}

		if ( !errorsLen ) {
			main.classList.add('with-data');
			cal.parentNode.classList.add('loading');

			while ( cal.hasChildNodes() ) {
				cal.removeChild(cal.lastChild);
			}

			cal.scrollTop = 0;
			makeCalendar(inputArray[0].value, inputArray[1].value, inputArray[2].value);

			var button = e.target.querySelectorAll("button")[0];
			button.innerHTML = button.innerText = "Update Calendar"; 
		}

	}, false);
}

/**
 * Callback click to show holiday description
 * @param {event} e 
 */
function btnClick(e) {
	var $btn = e.currentTarget;
	var country = $btn.getAttribute("data-country");
	var month = $btn.getAttribute("data-month");
	var day = $btn.getAttribute("data-day");

	/**
	 * Async function to get the holiday description fron json file by country code, month and day
	 * @param {integer} day 
	 * @param {string} country 
	 * @param {integer} month 
	 */
	var clickHoliday = async function(day, country, month) { 
		var	$result = await getJsonCountryHolidays(day, country, month);
		alert($result[0].holiday);
		
	}

	clickHoliday(day, country, month);
}

validateForm();