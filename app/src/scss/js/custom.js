(function () {
  // ================ Model ======================
  var moviesModel = {
    fetchData: function (url) {
      return fetch(url)
    },
    nowplaying: async function (numOfPages) {
      var res = [];
      var resJson = [];
      for (let i = 1; i < numOfPages; i++) {
        res[i] = await this.fetchData(`https://api.themoviedb.org/3/movie/now_playing?api_key=f8b313d0e3dcf45cc923ce968f742ac1&language=en-US&page=${i}`);
        resJson[i] = await res[i].json();
      }
      var mydata = resJson;
      return mydata;
    },
    topRated: async function () {
      //top rated data
      const res = await this.fetchData('https://api.themoviedb.org/3/movie/top_rated?api_key=f8b313d0e3dcf45cc923ce968f742ac1&language=en-US&page=1');
      const resJson = await res.json();
      var mydata = resJson;
      return mydata;

    },
    trending: async function () {
      //trending data
      const res = await this.fetchData('https://api.themoviedb.org/3/trending/all/day?api_key=f8b313d0e3dcf45cc923ce968f742ac1');
      const resJson = await res.json();
      var mydata = resJson;
      return mydata;
    }
  }

  // ================ Controller ======================
  const moviesController = {
    init: function () {
      moviesView.init();
    },
    nowplayingData: async function () {
    // ========give the number of pages =============
      return moviesModel.nowplaying(5);
    },
    topRatedData: async function () {
      return moviesModel.topRated();
    },
    trendingData: async function () {
      return moviesModel.trending();
    }
  }

  // ================ View ======================
  const moviesView = {
    init: function () {
      this.cacheDom();
      this.render();
      this.setCarousel();
    },
    cacheDom: function () {
      // cacheDom
      this.$movies = $("#moviesID");
      this.$rated = $("#ratedID");
      this.$trend = $("#trendID");

    },
    setCarousel: function () {
      this.$movies.owlCarousel({
        dots: false,
        loop: true,
        autoWidth:true,
        center:true,
        margin:30,
        responsive: {
          0: {
            items: 1
          },
          600: {
            items: 1
          },
          768: {
            items: 1
          },
          900: {
            items: 1
          },
          1200: {
            items: 3
          }
        }
      });

      this.$rated.owlCarousel({
        dots: false,
        loop: true,
        center:true,
        margin:10,
        responsive: {
          0: {
            items: 3
          },
          600: {
            items: 4
          },
          768: {
            items: 4
          },
          900: {
            items: 5
          },
          1200: {
            items: 8
          }
        }
      });

      this.$trend.owlCarousel({
        dots: false,
        loop:true,
        center:true,
        margin: 10,
        responsive: {
          0: {
            items: 3
          },
          600: {
            items: 4
          },
          768: {
            items: 4
          },
          900: {
            items: 5
          },
          1200: {
            items: 8
          }
        }
      });
    },
    render: async function () {

      var nowPlayingMovies = await moviesController.nowplayingData();
      var topRatedMovies = await moviesController.topRatedData();
      var trendingMovies = await moviesController.trendingData();
      var movieDetails = [];
      var trailer = [];

      // =============Bidning Top-Rated Movies Banner Data into Template =============
      topRatedMovies.results.forEach(tRated => {
        this.$rated.owlCarousel('add',
          `<div class="item">
            <img src="https://image.tmdb.org/t/p/original${tRated.poster_path}" alt="">
            </div>`
        ).owlCarousel('update');
      })
      // =============Bidning Trending Movies Banner Data into Template =============
      trendingMovies.results.forEach(trending => {
        this.$trend.owlCarousel('add',
          `<div class="item">
            <img src="https://image.tmdb.org/t/p/original${trending.poster_path}" alt="">
            </div>`
        ).owlCarousel('update');
      })

      // =============Looping on Different Pages ==========================
      for (let j = 1; j <= nowPlayingMovies.length; j++) {

      // =============Bidning NowPlaying Movies Banner Data From A Certain Page =============
        nowPlayingMovies[j].results.forEach(async (movie, i) => {

          // =============fetching Duration/Genre of Movie =============================
          const res = await fetch(`https://api.themoviedb.org/3/movie/${nowPlayingMovies[j].results[i].id}?api_key=f8b313d0e3dcf45cc923ce968f742ac1&language=en-US`);
          const resJson = await res.json();

          // =============fetching Trailer of Movie ====================================
          const res3 = await fetch(`https://api.themoviedb.org/3/movie/${nowPlayingMovies[j].results[i].id}/videos?api_key=f8b313d0e3dcf45cc923ce968f742ac1&language=en-US`);
          const resJson3 = await res3.json();
          trailer = resJson3;
          movieDetails = resJson;

          // =============Looping on Correct Trailer key ================================
          for (let i = 0; i < trailer.results.length; i++) {
            if (trailer.results[i]['type'] == 'Trailer') {
              trailer.results[0]['key'] = trailer.results[i]['key'];
              break;
            }
          }

          // =============Checking for Runtime availability ==============================
          if (movieDetails.runtime == 0) {
            movieDetails.runtime = "No runtime available";
          } else {
          // ========== converting the runtime minutes to hours & minutes=================
            movieDetails.runtime = Math.floor(((movieDetails.runtime) / 60)) + "h " + (movieDetails.runtime) % 60 + "min";
          }

          // =============Bidning Now Playing Movies Banner Data into Template ===========
          this.$movies.owlCarousel('add',
            ` <div class="item">
                  <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" alt="">
                  <div class="overlay"></div>
                  <div class="wrapper">
                    <h4 class="">Now Playing</h4>
                    <h2 id="title" class="text-white">${movie.title}</h2>
                    <h3 class="text-white" id="genre">${movieDetails['genres'][0]['name'] + " | " + movieDetails['genres'][1]['name'] + " - " + movieDetails.runtime}</h3>
                    <a href="https://www.youtube.com/watch?v=${trailer.results[0]['key']}" target="_blank" class=" text-decoration-none"><i class="far fa-play-circle"></i> Play Trailer</a>
                    </div>
               </div>`
          ).owlCarousel('update');
        });
      }
    }
  }

  moviesController.init();
})();