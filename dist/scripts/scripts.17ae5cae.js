!function(a){"use strict";var b=a.angular.module("pokedexApp",[]);b.value("baseurl","http://pokeapi.co/"),b.value("pageSize",6),b.filter("offset",function(){return function(a,b){return a?a.slice(+b):void 0}}),b.factory("Coget",["$http",function(a){var b=function(b){var c="http://whateverorigin.org/get?url="+encodeURIComponent(b)+"&callback=JSON_CALLBACK",d=a.jsonp(c,{cache:!0}).then(function(a){return a.data=a.data.contents,a});return d.success=function(a){this.then(function(b){return a(b.data)})},d};return{get:b}}]),b.controller("MainCtrl",["$scope","$window","Coget","baseurl","pageSize",function(a,b,c,d,e){a.pageSize=e,a.offset=0,a.types=["fire","water","flying","ground","rock","steel","electronic","grass","ghost","dark","normal","psychic","poison","bug","dragon","fighting","fairly"],a.setOffset=function(b){var c=a.offset+b*e;c>-1&&c<a.filtered.length&&(a.offset=c)},c.get(d+"api/v1/pokedex/1/").success(function(b){a.pokemons=b.pokemon}),a.getSprite=function(b){c.get(d+"/sprite/"+b).success(function(c){console.log(c),a.sprite[b]=d+c.image})}}]),b.controller("PokemonCtrl",["$scope","Coget","baseurl",function(a,b,c){a.focus={pokemon:null};var d=a.pokemon&&a.pokemon.resource_uri;d&&b.get(c+d).success(function(b){a.info=b})}]),b.controller("SpriteCtrl",["$scope","Coget","baseurl",function(a,b,c){b.get(c+a.sprite.resource_uri).success(function(b){a.uri="http://pokeapi.co/"+b.image,a.name=b.pokemon.name})}]),b.controller("TypeCtrl",["$scope","Coget","baseurl",function(a,b,c){a.$watch("info",function(d){d&&b.get(c+a.info.types[0].resource_uri).success(function(b){a.type=b})})}]),b.controller("DetailCtrl",["$scope","Coget","baseurl",function(a,b,c){a.moves={},a.$watch("focus.pokemon",function(d){d&&b.get(c+d.resource_uri).success(function(d){a.info=d,d.moves.filter(function(a){return"level up"===a.learn_type}).forEach(function(d){b.get(c+d.resource_uri).success(function(b){a.moves[d.name]=b})})})})}]),b.controller("MoveCtrl",["$scope","Coget","baseurl",function(){}])}(window);