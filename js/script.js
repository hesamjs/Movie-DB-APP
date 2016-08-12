var MovieDBApp = {};

MovieDBApp.ArrayOfMovieByCast = [];
MovieDBApp.ArrayOfMovieIds = [];

MovieDBApp.ArrayOfCastForEachMovie = [];

MovieDBApp.personId = 0;

MovieDBApp.apiUrl = 'https://api.themoviedb.org/3/'
MovieDBApp.apiKey = '0dc77fa2f3cda50f25ad8a701972cdd8';

//a function that returns person ID by getting the name with type of string

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

//a function that gets the movie object and displays the movie on page using handlebars

MovieDBApp.displayMovie = function(movie) {

		var myTemplate = $("#myTemplate").html();

		var template = Handlebars.compile(myTemplate);

			//looping through array of cast and pushing the cast of each movie in their movie object and displaying them using handlebars

			MovieDBApp.ArrayOfCastForEachMovie.forEach(function(EachMovieCastAndCrew) {
				if (movie.id === EachMovieCastAndCrew.id) {
					movie.cast = [];
					movie.castPic = [];
					EachMovieCastAndCrew.cast.forEach(function(eachCast) {
						var eachCastNameAndPic = {
							name: eachCast.name,
							pic: eachCast.profile_path
						}
						movie.cast.push(eachCastNameAndPic);

						if (eachCast.id === MovieDBApp.personId) {
							movie.personPhoto = eachCast.profile_path;
						}
					});

					EachMovieCastAndCrew.crew.forEach(function(eachCrew) {

						if (eachCrew.id === MovieDBApp.personId) {
							movie.personPhoto = eachCrew.profile_path;
						}
					});

				}
			});
			var movieTemplate = template(movie);

			$('#movieList').append(movieTemplate);
		

}

//a function that returns movie ID by getting the id of person and page number for results

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

//a function that returns the cast and crew result by getting the id of each movie

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

//a function that gets the person id and gets the movies for the person and checks if each movie is upcoming and if so
//then puts the umcoming movies in an array 

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

				//after getting all the movies for that person lets get the cast and crew for each movie 

				MovieDBApp.ArrayOfMovieIds.forEach(function(eachId ,Index) {
					$.when(MovieDBApp.getCreditsForMovie(eachId)).then(function(getCreditsForMovieResult) {
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
										}
									});
								}
							}
						});

					//then we need to display the remaining movies in page

					MovieDBApp.ArrayOfMovieByCast.forEach(function(movieToDisplay) {
						if (movieToDisplay.id === eachId) {
							MovieDBApp.displayMovie(movieToDisplay);
						}
					});
					});

				});
				


			}

		});
}


MovieDBApp.init = function() {
	//go back to home page when user clicks on what's new movie
	$('h5').on('click', function(){
		location.reload();
	})

	//after submitting the form we need to change some styles in next page and get the input value and after resetting the data
	//call display the movies for person
	$('#searchForm').on('submit', function(e){
		e.preventDefault();
		$('.header-text').hide();
		$('.header-image').hide();
		$('.header-two').show();
		$('#searchForm').addClass('header-custom');

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

	//if user clicks on each cast name display the movies for that person

	$('#movieList').on('click', 'li', function() {
		var clickedPerson = $(this).text();

		$.when(MovieDBApp.getPersonId(clickedPerson)).then(function(getPersonIdResult) {

					MovieDBApp.ArrayOfMovieByCast = [];
					MovieDBApp.ArrayOfMovieIds = [];
					MovieDBApp.ArrayOfCastForEachMovie = [];

					$('#movieList').empty();
					pageNmbr = 1;

					var id = getPersonIdResult.results[0].id;
					MovieDBApp.personId = id;
					MovieDBApp.getMovieByCast(id);
				})
	});

};


$(function() {
	MovieDBApp.init();
});