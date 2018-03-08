var Player = function (team, name) {
    this.name = name;
    this.points = 0;
    this.team = team;
};

var Team = function (circuit, name) {
    this.circuit = circuit;
    this.name = name;
    this.players = [];
};

Team.prototype.removePlayer = function (player) {
    var index = this.players.indexOf(player);
    if (index > -1) {
        this.players.splice(index, 1);
    }
};

Team.prototype.recognizes = function (names) {
    var self = this;
    _.forEach(names || [], function (name) {
        self.recognize(name);
    })
    return self;
};

Team.prototype.recognize = function (name) {
    var id = { 'name': name };
    var player = _.find(this.circuit.players, id);
    if (player) {
        if (player.team && player.team.name !== this.name) {
            player.team.removePlayer(player);
            this.players.push(player);
        } else {
            player.team = this;
            this.players.push(player);
        }
    } else {
        player = new Player(this, name);
        this.circuit.addPlayer(player);
    }
    var teamPlayer = _.find(this.players, id);
    if (!teamPlayer) {
        this.players.push(player);
    }
    return this;
};

var Tournament = function (circuit, name) {
    this.circuit = circuit;
    this.name = name;
};

Tournament.prototype.awards = function (points, names) {
    var self = this;
    _.forEach(names || [], function (name) {
        self.award(points, name);
    })
    return self;
};

Tournament.prototype.award = function (points, name) {
    var id = { 'name': name };
    var player = _.find(this.circuit.players, id);
    if (!player) {
        var newPlayer = new Player(null, name);
        newPlayer.points = points;
        this.circuit.addPlayer(newPlayer);
    } else {
        player.points += points;
    }

    this.circuit.graph.links.push({
        source: _.find(this.circuit.tournaments, { name: this.name }).node,
        target: _.find(this.circuit.players, { name: id.name }).node,
        value: points
    });

    return this;
};

var Circuit = function () {
    this.graph = { nodes: [], links: [] };
    this.players = [];
    this.teams = [];
    this.tournaments = [];
};

Circuit.prototype.addTeam = function (team) {
    var node = this.graph.nodes.length;
    team.node = node;
    this.graph.nodes.push({ name: team.name });
    this.teams.push(team);
};

Circuit.prototype.addPlayer = function (player) {
    var node = this.graph.nodes.length;
    player.node = node;
    this.graph.nodes.push({ name: player.name });
    this.players.push(player);
};

Circuit.prototype.team = function (name) {
    var id = { 'name': name };
    var team = _.find(this.teams, id);
    if (!team) {
        team = new Team(this, name);
        this.addTeam(team);
    }
    return team;
};

Circuit.prototype.tournament = function (name) {
    var tournament = new Tournament(this, name);
    var node = this.graph.nodes.length;
    tournament.node = node;
    this.tournaments.push(tournament);
    this.graph.nodes.push({ name: tournament.name });
    return tournament;
};

Circuit.prototype.buildGraph = function () {
    var self = this;
    _.forEach(this.teams, function (team) {
        _.forEach(team.players, function (player) {
            self.graph.links.push({
                source: player.node,
                target: team.node,
                value: player.points
            });
        })
    });
    return self.graph;
};
