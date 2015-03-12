"use strict";
var requests = require('./requests');

// Google Calendar Wrapper
var Calendar = function(id, key) {
    this.baseUrl = 'https://www.googleapis.com/calendar/v3/calendars/';
    this.id = id;
    this.params = {
        timezone: 'Europe%2FOslo',
        maxResults: 10,
        orderBy: 'startTime',
        fields: 'items(description%2Cend%2Cstart%2Csummary)%2Cupdated',
        singleEvents: true,
        key: key
    };

    // Misc

    // Fucking Americans and their silly week systems
    this.weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
};

Calendar.prototype.generateUrl = function() {
    var params = [];
    for(var key in this.params) {
        if(this.params.hasOwnProperty(key)) {
            params.push(key + '=' + this.params[key]);
        }
    }
    return this.baseUrl + this.id + '/events?' + params.join('&');
};

Calendar.prototype.pad = function(time) {
    // Zero pad time (8 -> 08)
    return ('0' + time).slice(-2);
};

Calendar.prototype.prettyDate = function(meetingDate) {
    var dateString = meetingDate.dateTime;
    if(dateString === undefined) {
        dateString = meetingDate.date;
    }
    var date = new Date(dateString);
    var tonight = new Date();
    tonight.setDate(tonight.getDate() + 1);
    tonight.setHours(1, 0, 0, 0);
    // Before 01:00 will show HH:MM
    if(date < tonight) {
        return this.pad(date.getHours()) + ':' + this.pad(date.getMinutes());
    }
    // else day
    return this.weekdays[date.getDay()];
};

Calendar.prototype.prettify = function(meeting) {
    // 08:00-10:00 arrKom\n14:00-16:00 triKom\n18:00-23:59 appKom'
    meeting.start.pretty = this.prettyDate(meeting.start);
    meeting.end.pretty = this.prettyDate(meeting.end);
    meeting.pretty = meeting.start.pretty + '-' + meeting.end.pretty;
};

Calendar.prototype.timebounds = function(start, end) {
    this.params['timeMin'] = start.toISOString();
    this.params['timeMax'] = end.toISOString();
};

Calendar.prototype.todayOnly = function() {
    this.params['timeMin'] = new Date().toISOString();
    var midnight = new Date();
    midnight.setHours(23);
    midnight.setMinutes(59);
    this.params['timeMax'] = midnight.toISOString();
}

Calendar.prototype.get = function(callback) {
    var that = this;
    requests.json(this.generateUrl(), {
        success: function(meetings) {
            meetings.items.forEach(function(meeting) {
                that.prettify(meeting);
            });
            callback.success(meetings.items);
        },
        error: callback.error
    });
};

module.exports = Calendar;
