var cookieName = 'connect.sid';
var sessions = [];

module.exports = function (req, res, next) {
	var cookieValue = req.cookies[cookieName];
	var index = sessions.indexOf(cookieValue);

	if( index!==-1 ) {		
		req.session = sessions[index];
		req.session.generate = function(){
			sessions.push({
				
			});
		};
	}else {
		req.session = {};
	}

	next();
};