var _timeline;
var _EVENTS;
var popup_tmpl;
var popup_artwork_tmpl;
var event_tmpl;
var audioElement;


function TimeLine(startDate, endDate, dpl)
{
	var _startDate = startDate;
	var _endDate = endDate;
    var _dayPixelLength = dpl;

	this.getLength = function(endDate)
	{
		return dayDiff(_startDate, _endDate);
	}

	this.getDateDistance = function(date)
	{
		return dayDiff(_startDate, date);
	}

	this.endDate = function()
	{
		return _endDate;
	}

	this.startDate = function()
	{
		return _startDate;
	}

	this.dayPixelLength = function()
	{
		return _dayPixelLength;
	}


    function dayDiff(first, second)
	{
		return Math.floor((second-first)/(1000*60*60*24));
	}
}


function parseDate(str)
{
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[1]-1, mdy[0]);
}


function formatDate(date)
{
    var month = date.getMonth() + 1;
    var result = date.getDate() + "/"

    if (month < 10)
    {
        result += "0"
    }

    result += month + "/" + date.getYear();

    return result;
}


function addEvent(event, event_index)
{
    var d_start=parseDate(event.start);
    var d_end=parseDate(event.end);

    if (d_end<_timeline.startDate()) {
        return document.createElement('div');
    };
    if (d_start>_timeline.endDate()) {
        return document.createElement('div');
    };

    event.years=d_start.getFullYear();
    if (d_end.getFullYear() != d_start.getFullYear())
        event.years = event.years + " - " + d_end.getFullYear();
    div = event_tmpl(event);

    var outer_div = document.createElement('div');
    outer_div.setAttribute('data-eventindex', event_index);
    outer_div.setAttribute('class', 'event ' + event.cls);
    outer_div.style.top = _timeline.getDateDistance(d_start) * _timeline.dayPixelLength() + "px";
    outer_div.style.height = (_timeline.getDateDistance(d_end) - _timeline.getDateDistance(d_start)) * _timeline.dayPixelLength() + "px";
    outer_div.style.marginLeft = (5 + (event.opt_c)*14 + _.random(0,10)) + "%";
    outer_div.innerHTML = div;

    var container = document.getElementById("divEventContainer");
    container.appendChild(outer_div);

    return outer_div;
}

function shortYear(year) {
    return year.toString().substr(2,4);
}

function addYear(year)
	{
		var div = document.createElement('div');
		div.innerHTML = "<p><center><b>" + (shortYear(year)) + "</b></center></p>";

		div.setAttribute('class', 'timeLineYear');

		div.style.top = _timeline.getDateDistance(new Date(year, 0, 1)) * _timeline.dayPixelLength() + "px";

		var container = document.getElementById("divTimeLine");

		container.appendChild(div);
	}



function scroll_event(parent) {
    var ep=$(parent);
    var ei=$('.inner', ep);

    var ST=$(window).scrollTop();
    var Sh=$(window).height();
    var PT=ep.offset().top;
    var Ph=ep.height();
    var Eh=ei.height();

    var scroll = 0;
    var progress = 0;

    if (ST < PT-Sh) {
        scroll = Sh+100;
    } else if (ST > PT+Ph) {
        scroll = -1 * Eh - 100;
    } else {
        progress = (ST-(PT-Sh))/(Ph+Sh);
        scroll = Math.round((Ph-Eh)*progress);
        scroll = scroll - (ST-PT);
    }

    if (ep.hasClass('artworks')) {
        ei.css("bottom", scroll + "px");
    } else {
        ei.css("top", scroll + "px");
    }
}

function set_year() {
    var days = ($(window).scrollTop() + ($(window).height()/2) - $('#divTimeLine').offset().top) / _timeline.dayPixelLength();
    var year = _timeline.startDate().getFullYear() + Math.floor(days / 365);
    $('#year').text(shortYear(year));
}

function scroll(e) {
    set_year();
    _.each(_EVENTS, scroll_event);
}

function parse_params() {
    return _.object(_.compact(_.map(location.search.slice(1).split('&'), function(item) {  if (item) return item.split('='); })));
}


function resize(e) {
    $(".eventspadding").height($(window).height());
}




function init_timeline(start, end, day_pixel_length)
	{
        var span = _.findWhere(SPANS, {start: parseInt(parse_params().start)});

        if (_.isUndefined(span)) {
            var timeline_start = new Date(start, 0, 1);
            var timeline_end = new Date(end, 0, 1);
        } else {
            var timeline_start = new Date(span.start, 0, 1);
            var timeline_end = new Date(span.end, 0, 1);
            $('.periodName').html(span.title);
            day_pixel_length = span.day_pixel_length;
        }
        $('.periodSpan a').text(shortYear(timeline_start.getFullYear()) + '-' + shortYear(timeline_end.getFullYear()));

		_timeline = new TimeLine(timeline_start, timeline_end, day_pixel_length);
		var length = _timeline.getLength();

		// resize container
		var container = document.getElementById("divTimeLineContainer");
		container.style.height = length * _timeline.dayPixelLength() + "px";

		/*/ add timeline... lines
		var timeline_line = new Date(timeline_start.getYear(), 0, 1);

		while(timeline_line.getFullYear() <= _timeline.endDate().getFullYear())
		{
			addYear(timeline_line.getFullYear())
			timeline_line.setFullYear(timeline_line.getFullYear() + 1);
		}
        */

	}



function init_data(eventData)
{
    _EVENTS = _.map(eventData, addEvent);
}


function init_music()
{
    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'kytice_lzi_04.mp3');
    audioElement.setAttribute('autoplay', 'autoplay');
    audioElement.addEventListener('ended', function() {
        this.play();
    }, false);
    $(".audio-play").text($(".audio-play").data('pause'));
}


function init(events, start, end, day_pixel_length)
{
    popup_tmpl = _.template($("#popup_tmpl").html());
    popup_artwork_tmpl = _.template($("#popup_artwork_tmpl").html());
    event_tmpl = _.template($("#event_tmpl").html());
    init_timeline(start, end, day_pixel_length);
    init_data(events);
    init_music();
    scroll();
    resize();
}

