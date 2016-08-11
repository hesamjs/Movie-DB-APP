var MovieDBApp = {};

MovieDBApp.ArrayOfMovieByCast = [];
MovieDBApp.ArrayOfMovieIds = [];

MovieDBApp.ArrayOfCastForEachMovie = [];

MovieDBApp.personId = 0;

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

MovieDBApp.displayMovie = function(movie) {

	var myTemplate = $("#myTemplate").html();

	var template = Handlebars.compile(myTemplate);

	//movieArray.forEach(function(movie) {
	console.log(movie);

		MovieDBApp.ArrayOfCastForEachMovie.forEach(function(EachMovieCastAndCrew) {
			if (movie.id === EachMovieCastAndCrew.id) {
				movie.cast = [];
				EachMovieCastAndCrew.cast.forEach(function(eachCast) {
					movie.cast.push(eachCast.name)

					if (eachCast.id === MovieDBApp.personId) {
						movie.personPhoto = eachCast.profile_path;
					}
				});

				EachMovieCastAndCrew.crew.forEach(function(eachCrew) {

					if (eachCrew.id === MovieDBApp.personId) {
						movie.personPhoto = eachCrew.profile_path;
					}
				});

				console.log(EachMovieCastAndCrew.cast);
			}
		});
		var movieTemplate = template(movie);

		$('#movieList').append(movieTemplate);
	// });


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

MovieDBApp.getMovieByCast = function(person) {

	$.when(MovieDBApp.getMovie(person, pageNmbr)).then(function(getMovieResult) {
			getMovieResult.results.forEach(function(eachMovie) {
				if (eachMovie.release_date > "2016-08-09") {
					MovieDBApp.ArrayOfMovieByCast.push(eachMovie);
					MovieDBApp.ArrayOfMovieIds.push(eachMovie.id);
				} 
				
			});

			if (getMovieResult.results.length === 20) {
					pageNmbr += 1;
				
					MovieDBApp.getMovieByCast(person);

			} else {
				//console.log(MovieDBApp.ArrayOfMovieByCast);
				//console.log(MovieDBApp.ArrayOfMovieIds);

				MovieDBApp.ArrayOfMovieIds.forEach(function(eachId ,Index) {
					$.when(MovieDBApp.getCreditsForMovie(eachId)).then(function(getCreditsForMovieResult) {
						console.log(getCreditsForMovieResult);
						MovieDBApp.ArrayOfCastForEachMovie.push(getCreditsForMovieResult);
						getCreditsForMovieResult.crew.forEach(function(crew) {

							// if it is not director splice 

							if (crew.id === person && crew.job !== "Director") {

								//loop crew again and if the name does not appear in director job then splice
								var isDirector = false;

								getCreditsForMovieResult.crew.forEach(function(secondCrew) {
									if (secondCrew.id === person && secondCrew.job === "Director") {
										isDirector = true;
									} 
								})

								if (!isDirector) {

									MovieDBApp.ArrayOfMovieIds.splice(Index, 1);

									MovieDBApp.ArrayOfMovieByCast.forEach(function(eachMovieToDelete, IndexToDelete) {
										if (eachMovieToDelete.id === eachId) {
											MovieDBApp.ArrayOfMovieByCast.splice(IndexToDelete, 1);
											MovieDBApp.ArrayOfCastForEachMovie.splice(IndexToDelete, 1);
											console.log("spliced");
										}
									});
								}
							}
						});


					// console.log(MovieDBApp.ArrayOfMovieIds);
					// console.log(MovieDBApp.ArrayOfMovieByCast);

					MovieDBApp.ArrayOfMovieByCast.forEach(function(movieToDisplay) {
						if (movieToDisplay.id === eachId) {
							console.log(movieToDisplay);
							MovieDBApp.displayMovie(movieToDisplay);
						}
					});
					});

				});
				


			}

		});
}


MovieDBApp.init = function() {

	$('#searchForm').on('submit', function(e){
		e.preventDefault();

		$.when(MovieDBApp.getPersonId($('input[name=search]').val())).then(function(getPersonIdResult) {

			MovieDBApp.ArrayOfMovieByCast = [];
			MovieDBApp.ArrayOfMovieIds = [];
			MovieDBApp.ArrayOfCastForEachMovie = [];

			$('#movieList').empty();
			pageNmbr = 1;

			var id = getPersonIdResult.results[0].id;
			MovieDBApp.personId = id;
			MovieDBApp.getMovieByCast(id);
		})
	 })

};


$(function() {
	MovieDBApp.init();
});