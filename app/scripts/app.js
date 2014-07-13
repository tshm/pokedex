(function( window, undefined ) {
  'use strict';
  var app = window.angular.module('pokedexApp', ['ngTouch']);

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
    ['$scope', 'Coget', 'baseurl', 'pageSize',
  function( $scope, Coget, baseurl, pageSize ) {

    $scope.pageSize = pageSize;
    $scope.offset = 0;

    $scope.types = ['fire', 'water', 'flying',
      'ground', 'rock', 'steel', 'electronic',
      'grass', 'ghost', 'dark', 'normal',
      'psychic', 'poison', 'bug', 'dragon',
      'fighting', 'fairy'];

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

  app.controller('PokemonCtrl', ['$scope', 'Coget', 'baseurl',
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
    $scope.$watch('sprite', function( sprite ) {
      if ( !sprite ) { return; }
      Coget.get( baseurl + sprite.resource_uri )
      .success(function( dat ) {
        $scope.uri = 'http://pokeapi.co/' + dat.image;
        $scope.name = dat.pokemon.name;
      });
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
    $scope.evolutions = [];

    var getEvolutions = function( evols ) {
      return evols.forEach(function( inf ) {
        Coget.get( baseurl + inf.resource_uri )
        .success(function( dat ) {
          inf.name = dat.name;
          $scope.sprite = dat.sprites[ 0 ];
          $scope.evolutions.push( inf );
        });
      });
    };

    $scope.$watch('focus.pokemon', function( pokemon ) {
      if ( !pokemon ) { return; }
      Coget.get( baseurl + pokemon.resource_uri )
      .success(function( dat ) {
        $scope.info = dat;

        getEvolutions( dat.evolutions );

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

})( window );

