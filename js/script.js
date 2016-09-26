var MovieDBApp = {};

MovieDBApp.arrayOfMovieByCast = [];
MovieDBApp.arrayOfMovieIds = [];

MovieDBApp.arrayOfCastForEachMovie = [];

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

			MovieDBApp.arrayOfCastForEachMovie.forEach(function(EachMovieCastAndCrew) {
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

					movie.castShowMore = false;
					if (movie.cast.length > 3) {
						movie.castShowMore = true;

						for (i = 3; i < movie.cast.length; i++) {
							movie.cast[i].extended = true;
						}
					}

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
			if (eachMovie.release_date > "2016-09-06") {
				MovieDBApp.arrayOfMovieByCast.push(eachMovie);
				MovieDBApp.arrayOfMovieIds.push(eachMovie.id);
			} 
			
		});

		if (getMovieResult.results.length === 20) {
		
				pageNmbr += 1;
			
				MovieDBApp.getMovieByCast(person);

		} else {

			//after getting all the movies for that person lets get the cast and crew for each movie 

			MovieDBApp.arrayOfMovieIds.forEach(function(eachId ,Index) {
				$.when(MovieDBApp.getCreditsForMovie(eachId)).then(function(getCreditsForMovieResult) {
					MovieDBApp.arrayOfCastForEachMovie.push(getCreditsForMovieResult);
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

								MovieDBApp.arrayOfMovieIds.splice(Index, 1);

								MovieDBApp.arrayOfMovieByCast.forEach(function(eachMovieToDelete, IndexToDelete) {
									if (eachMovieToDelete.id === eachId) {
										MovieDBApp.arrayOfMovieByCast.splice(IndexToDelete, 1);
										MovieDBApp.arrayOfCastForEachMovie.splice(IndexToDelete, 1);
									}
								});
							}
						}
					});



					//then we need to display the remaining movies in page

					MovieDBApp.arrayOfMovieByCast.forEach(function(movieToDisplay) {
						if (movieToDisplay.id === eachId) {
							MovieDBApp.displayMovie(movieToDisplay);
						}
					});
				});
			});

			MovieDBApp.headerDisplay();

		}

	});


}

MovieDBApp.getPersonSearch = function(person) {
	return $.ajax({
		url: MovieDBApp.apiUrl + 'search/person',
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: MovieDBApp.apiKey,
			search_type: 'ngram',
			query: person
		}	
	}).then(function(data){
		var movieArray = data;
		var names = movieArray.results.map(function(person) {
			return person.name;
		});


	
		$('#inputBox').autocomplete({
			source: names
		});

	});
}

MovieDBApp.headerDisplay = function() {
	if (MovieDBApp.arrayOfMovieByCast.length > 0) {
		if (MovieDBApp.person.profile_path != null) {
			$('#personHeader').append(`<div class="personBoard"><div class="headPhoto"><img src="http://image.tmdb.org/t/p/w150${MovieDBApp.person.profile_path}" alt=""></div><h6>Upcoming Movie(s) for ${MovieDBApp.person.name}</h6><div>`);
		} else {
			$('#personHeader').append(`<div class="personBoard"><h6>Upcoming Movie(s) for ${MovieDBApp.person.name}</h6><div>`);
		}
	} else {
		if (MovieDBApp.person.profile_path != null) {
			$('#personHeader').append(`<div class="personBoard"><div class="headPhoto"><img src="http://image.tmdb.org/t/p/w150${MovieDBApp.person.profile_path}" alt=""></div><h6>Sorry there is no upcoming movie for ${MovieDBApp.person.name}</h6><div>`);
		} else {
			$('#personHeader').append(`<div class="personBoard"><h6>Sorry there is no upcoming movie for ${MovieDBApp.person.name}</h6><div>`);
		}
	}
}

MovieDBApp.init = function() {
	//go back to home page when user clicks on what's new movie
	$('h5').on('click', function(){
		location.reload();
	})

	$('#inputBox').keyup(function(){
		var userChoice = $(this).val();
		MovieDBApp.getMovie(userChoice);

		MovieDBApp.getPersonSearch(userChoice);
	});


	//after submitting the form we need to change some styles in next page and get the input value and after resetting the data
	//call display the movies for person
	$('#searchForm').on('submit', function(e){

		
		e.preventDefault();
		$('.header-text').hide();
		$('.header-image').hide();
		$('.header-two').show();
		$('#searchForm').addClass('header-custom');
		$('.flexForm').addClass('flexShrink');
		$('h1').addClass('headerShrink');
		

		$.when(MovieDBApp.getPersonId($('input[name=search]').val())).then(function(getPersonIdResult) {

			MovieDBApp.arrayOfMovieByCast = [];
			MovieDBApp.arrayOfMovieIds = [];
			MovieDBApp.arrayOfCastForEachMovie = [];

			var userChoice = $('#input').val();

			$('#movieList').empty();
			pageNmbr = 1;

			MovieDBApp.person = getPersonIdResult.results[0];
			$('#personHeader').empty();
			
			
			

			var id = getPersonIdResult.results[0].id;
			MovieDBApp.personId = id;
			MovieDBApp.getMovieByCast(id);

		})

	})



	//if user clicks on each cast name display the movies for that person

	$('#movieList').on('click', 'li', function() {

		
		
		if ($(this).hasClass('showMore')) {

			var expandible = $(this).parent().children('.extended');

			$(this).text() === 'Show More' ? $(this).text('Show Less') : $(this).text('Show More');
			$(expandible).css('display') === 'none' ? $(expandible).css('display', 'flex') : $(expandible).css('display', 'none');
			//$('li.extended').slideToggle(300, 'linear');

		} else {

			var clickedPerson = $(this).text();

			$('input[name=search]').val(""); 

			$.when(MovieDBApp.getPersonId(clickedPerson)).then(function(getPersonIdResult) {

				MovieDBApp.arrayOfMovieByCast = [];
				MovieDBApp.arrayOfMovieIds = [];
				MovieDBApp.arrayOfCastForEachMovie = [];

				MovieDBApp.person = getPersonIdResult.results[0];
				
				$('#personHeader').empty();

				$('#movieList').empty();
				pageNmbr = 1;

				var id = getPersonIdResult.results[0].id;
				MovieDBApp.personId = id;
				MovieDBApp.getMovieByCast(id);
				

			})

		}

	});

	$("body").bind("DOMNodeInserted", function() {
	      $(this).find('.ui-helper-hidden-accessible').css('display', 'none');
	 	  $inputWidth = $('#inputBox').width();
	 	  $(this).find('.ui-autocomplete').css('width', $inputWidth + 50);
	 	  $(this).find('.ui-menu-item-wrapper').css('background-color', '#fff');
	 	  $(this).find('.ui-menu-item-wrapper').hover(function(){
   			 $(this).css('color','#159dc8');
   			 $(this).css('border-color','#fff');
		  });
		  $(this).find('.ui-menu-item-wrapper').css('color', '#333');
		  $(this).find('.ui-menu-item-wrapper').css('font-size', '18px');
	});

};



$(function() {
	MovieDBApp.init();
});