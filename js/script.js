var MovieDBApp = {};

MovieDBApp.ArrayOfMovieByCast = [];

MovieDBApp.apiUrl = 'https://api.themoviedb.org/3/'
MovieDBApp.apiKey = '0dc77fa2f3cda50f25ad8a701972cdd8';

MovieDBApp.getPersonId = function(person) {
	return $.ajax({
		url: MovieDBApp.apiUrl + 'search/person',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: MovieDBApp.apiKey,
			query: person
		}	
	})
}

var pageNmbr = 1;

MovieDBApp.getMovie = function(person, pageNumber) {

	return $.ajax({
		url: MovieDBApp.apiUrl + 'discover/movie',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: MovieDBApp.apiKey,
			with_cast: person,
			page: pageNumber
		}	
	})
};

MovieDBApp.getMovieByCast = function(person) {

	$.when(MovieDBApp.getMovie(person, pageNmbr)).then(function(getMovieResult) {
			getMovieResult.results.forEach(function(eachMovie) {
				if (eachMovie.release_date === "" || eachMovie.release_date > "2016-08-09") {
					MovieDBApp.ArrayOfMovieByCast.push(eachMovie);
				}
				
			});

			if (getMovieResult.results.length === 20) {
				pageNmbr += 1;
				
					MovieDBApp.getMovieByCast(person);

			} else {
				//MovieDBApp.displayMovie(myMovie.ArrayOfMovieByCast);
				console.log(MovieDBApp.ArrayOfMovieByCast)
			}

		});
}

MovieDBApp.getCreditsForMovie = function(MovieId) {
	return $.ajax({
		url: MovieDBApp.apiUrl + `movie/${MovieId}/credits`,
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: MovieDBApp.apiKey
		}	
	})
};

MovieDBApp.init = function() {

	$.when(MovieDBApp.getPersonId("law")).then(function(getPersonIdResult) {

		var id = getPersonIdResult.results[0].id;
		MovieDBApp.getMovieByCast(id);
	})


};



$(function() {
	MovieDBApp.init();
});