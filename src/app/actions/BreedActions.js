var AppDispatcher = require('../dispatcher/AppDispatcher');
var BreedConstants = require('../constants/BreedConstants');
var Api = require('./Api');

var BreedActions = {

  getAllBreeds: function() {
    Api.get('/breeds', null, BreedConstants.GET_ALL_BREEDS);
  },
  getBreed: function(name) {
    Api.get('/breeds/' + name, null, BreedConstants.GET_BREED);
	},
	postBreed: function(breed) {
    Api.create('/breeds', breed, BreedConstants.POST_BREED);
	},
  deleteBreed: function(breed) {
    Api.del('/breeds/' + breed.name, breed, BreedConstants.DELETE_BREED)
  }  
};

module.exports = BreedActions;