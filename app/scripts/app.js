(function( window, undefined ) {
  'use strict';
  var app = window.angular.module('pokedexApp', []);

  app.value('baseurl', 'http://pokeapi.co/');
  app.value('pageSize', 6 );

  app.filter('offset', function() {
    return function(arr, offset) {
      if ( !arr ) { return; }
      return arr.slice( +offset );
    };
  });

  app.factory('Coget', ['$http', function( $http ) {
    var getViaProxy = function( url ) {
      var proxy = 'http://whateverorigin.org/get?url=' + encodeURIComponent( url ) + '&callback=JSON_CALLBACK';
      var p = $http.jsonp( proxy, { cache: true }).then(function( resp ) {
        resp.data = resp.data.contents;
        return resp;
      });
      p.success = function( fn ) {
        this.then(function( resp ) {
          return fn( resp.data );
        });
      };
      return p;
    };
    return { get: getViaProxy };
  }]);

  app.controller('MainCtrl',
    ['$scope', '$window', 'Coget', 'baseurl', 'pageSize',
  function( $scope, $window, Coget, baseurl, pageSize ) {

    $scope.pageSize = pageSize;
    $scope.offset = 0;

    $scope.types = ['fire', 'water', 'flying',
      'ground', 'rock', 'steel', 'electronic',
      'grass', 'ghost', 'dark', 'normal',
      'psychic', 'poison', 'bug', 'dragon',
      'fighting', 'fairly'];

    $scope.setOffset = function( dir ) {
      var offset = $scope.offset + dir * pageSize;
      if ( -1 < offset && offset < $scope.filtered.length ) {
        $scope.offset = offset;
      }
    };

    Coget.get( baseurl + 'api/v1/pokedex/1/' )
    .success(function( dat ) {
      $scope.pokemons = dat.pokemon;
    });

    $scope.getSprite = function( id ) {
      Coget.get( baseurl + '/sprite/' + id )
      .success(function( dat ) {
        console.log(dat);
        $scope.sprite[ id ] = baseurl + dat.image;
      });
    };

  }]);

  app.controller('PokemonCtrl',
      ['$scope', 'Coget', 'baseurl',
  function( $scope, Coget, baseurl ) {
    $scope.focus = { pokemon: null };

    var uri = $scope.pokemon && $scope.pokemon.resource_uri;
    if ( uri ) {
      Coget.get( baseurl + uri )
      .success(function( dat ) {
        $scope.info = dat;
      });
    }
  }]);

  app.controller('SpriteCtrl', ['$scope', 'Coget', 'baseurl',
  function( $scope, Coget, baseurl ) {
    Coget.get( baseurl + $scope.sprite.resource_uri )
    .success(function( dat ) {
      $scope.uri = 'http://pokeapi.co/' + dat.image;
      $scope.name = dat.pokemon.name;
    });
  }]);

  app.controller('TypeCtrl', ['$scope', 'Coget', 'baseurl',
  function( $scope, Coget, baseurl ) {
    $scope.$watch('info', function( info ) {
      if ( !info ) { return; }
      Coget.get( baseurl + $scope.info.types[0].resource_uri )
      .success(function( dat ) {
        $scope.type = dat;
      });
    });
  }]);

  app.controller('DetailCtrl',
      ['$scope', 'Coget', 'baseurl',
  function( $scope, Coget, baseurl ) {
    $scope.moves = {};

    $scope.$watch('focus.pokemon', function( pokemon ) {
      if ( !pokemon ) { return; }
      Coget.get( baseurl + pokemon.resource_uri )
      .success(function( dat ) {
        $scope.info = dat;

        dat.moves.filter(function( o ) {
          return o.learn_type === 'level up';
        }).forEach(function( v ) {
          Coget.get( baseurl + v.resource_uri )
          .success(function( move ) {
            $scope.moves[ v.name ] = move;
          });
        });
      });
    });
  }]);

  app.controller('MoveCtrl', 
      ['$scope', 'Coget', 'baseurl',
  function( $scope, Coget, baseurl ) {
    // Coget.get( baseurl + $routeParams.uri )
    // .success(function( dat ) {
    //   $scope.info = dat;
    // });
  }]);

})( window );

