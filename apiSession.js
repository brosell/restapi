// CI agent -> mediator
module.exports = {
	sessions: {
		name: 'regression-session',
		url: 'regression-sessions',

		// list current and past sessions
		onList: function() {
			return this.model.list();
		},

		// data on a specific session (current or past)
		onGet: function(id) {
			return this.model.getItem(id);
		},
	},

	currentSession: {
		name: 'current-regression-session',
		url: 'current-regression-session',

		// view the one and only current session
		onList: function() {
			var currentSession = this.model.queryItem(function(item) {
				return !item.endTimestamp;
			});

			return currentSession;
		},

		// create a session - fails if session is already active
		onPost: function(data, request, result) {
			var currentSession = this.model.queryItem(function(item) {
				return !item.endTimestamp;
			});

			if (currentSession){
				result.status = 422;
				result.response = { error: 'session already running', currentSession: currentSession };
				return;
			}

			// TODO: scrape the feature dlls and create jobs for each matching test

			result.status = 201;
			var me = this;
			setTimeout(this.autoEndSession.bind(this), 30000);

			return this.model.create({startTimestamp: new Date().toString()}, true);
		},

		// cancel a session. Only current session can be canceled
		onDelete: function(id) {
			// TODO: if open or unassigned jobs then require confirmation
			var currentSession = this.model.queryItem(function(item) {
				return !item.endTimestamp;
			});
			if (currentSession) {
				currentSession.endTimestamp = new Date().toString();
				return this.model.update(currentSession.id, currentSession);
			}
		},

		autoEndSession: function() {
			console.log('autoend');
			this.onDelete();
		}
	},

	init: function(api, models) {
		this.sessions.model = models.sessions;
		this.currentSession.model = models.sessions;

		api.addResource(this.sessions);
		api.addResource(this.currentSession);

		return {
			sessions: this.sessions,
			current: this.currentSession
		};
	}


};
