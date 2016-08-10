var MovieDBApp = {};

MovieDBApp.ArrayOfMovieByCast = [];
MovieDBApp.ArrayOfMovieIds = [];

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
			with_people: person,
			page: pageNumber
		}	
	})
};

MovieDBApp.getUpcomings = function() {
	return $.ajax({
		url: MovieDBApp.apiUrl + 'movie/upcoming',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: MovieDBApp.apiKey
		}	
	})
}

MovieDBApp.getMovieByCast = function(person) {

	$.when(MovieDBApp.getMovie(person, pageNmbr)).then(function(getMovieResult) {
			getMovieResult.results.forEach(function(eachMovie) {
				if (eachMovie.release_date > "2016-08-09") {
					MovieDBApp.ArrayOfMovieByCast.push(eachMovie);
					MovieDBApp.ArrayOfMovieIds.push(eachMovie.id);
				} else if (eachMovie.release_date === "") {
					$.when(MovieDBApp.getUpcomings()).then(function(upcomingResults) {
						upcomingResults.results.forEach(function(upcomingMovie) {
							if (upcomingMovie.id === eachMovie.id) {
								MovieDBApp.ArrayOfMovieByCast.push(eachMovie);
								MovieDBApp.ArrayOfMovieIds.push(eachMovie.id);
							}
						});
					});
				}
				
			});

			if (getMovieResult.results.length === 20) {
				pageNmbr += 1;
				
					MovieDBApp.getMovieByCast(person);

			} else {
				//MovieDBApp.displayMovie(myMovie.ArrayOfMovieByCast);
				//console.log(MovieDBApp.ArrayOfMovieByCast);
				//console.log(MovieDBApp.ArrayOfMovieIds);

				MovieDBApp.ArrayOfMovieIds.forEach(function(eachId ,Index) {
					$.when(MovieDBApp.getCreditsForMovie(eachId)).then(function(getCreditsForMovieResult) {
						//console.log(getCreditsForMovieResult);
						getCreditsForMovieResult.crew.forEach(function(crew) {

							if (crew.id === person && crew.job !== "Director") {
								MovieDBApp.ArrayOfMovieIds.splice(Index, 1);

								MovieDBApp.ArrayOfMovieByCast.forEach(function(eachMovieToDelete, IndexToDelete) {
									if (eachMovieToDelete.id === eachId) {
										MovieDBApp.ArrayOfMovieByCast.splice(IndexToDelete, 1);
									}
								});
								console.log(MovieDBApp.ArrayOfMovieByCast);

							}
						});

					});
					//console.log(MovieDBApp.ArrayOfMovieIds);
				});
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

	$.when(MovieDBApp.getPersonId("abrams")).then(function(getPersonIdResult) {

		var id = getPersonIdResult.results[0].id;
		MovieDBApp.getMovieByCast(id);
	})


};

$(function() {
	MovieDBApp.init();

});