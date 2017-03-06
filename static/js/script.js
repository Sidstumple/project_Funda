(function(){
  'use strict';
  var config = {
    search: document.getElementById('getUserQuery'),
    queryResult: document.getElementById('queryResult'),
    error: document.getElementById('error'),
    button: document.getElementById('button')
  };

  var app ={
    init: function() {
      config.search.addEventListener('submit', function(){
        event.preventDefault();
        console.log('search was used');
        getData.search();
      });
      routes.init();
    }
  };

  var routes = {
    init: function(){
      routie({
        '': function(){
          location.hash = '#search';
        },
        'search': function(){
          console.log(this.path);
          sections.toggle('#' + this.path );
        },
        'search/:detail': function(detail) {
          console.log(this.path);
          sections.toggle('#' + this.path );
        }
      });
    }
  };

  var getData = {
    search: function(){
      var userQuery = document.getElementById('user-input-field').value.replace(/\s/g, '-');

        console.log(userQuery);
        //makes sure api url has the right userquery and adds the value of the selected option
        var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/' + _APIKEY + '/?type=koop&zo=/'+ userQuery +'/&page=1&pagesize=25';
        // GET data for applied filter
        console.log(apiUrl);
        aja()
        .url(apiUrl)
        .on('success', function(data){
          //if the array is empty renderError
          if(data.Objects.length === 0) {
            console.log('nothing available');
            sections.renderError();
          }
          console.log('search api is loaded');
          // this calls renderSearch and changes the html according to the applied filter
          sections.renderSearch(data);
          console.log(data.Objects.GlobalId)

          config.button.addEventListener('click',function(){
            event.preventDefault();
            var filtered = this.filter(Objects.HeeftBrochure === true);
            renderSearch(filtered);
          })
        })
    .go()
  },
  filter: function(){

  }
};

  var sections = {
    //hier worden de sections geladen.
    renderSearch: function(data) {
      //this is the script template in the html
      var source = document.getElementById('searchTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var htmlCollection = template(data);

      config.queryResult.innerHTML = htmlCollection;
      console.log(htmlCollection);
    },
    renderError: function() {
    var source = document.getElementById('errorTemplate').innerHTML;
    var template = Handlebars.compile(source);
    var errorHTML = template();

    config.error.innerHTML = errorHTML;
     console.log(template);
},


    toggle: function(route) {
      //selects all sections in the document
      var section = document.querySelectorAll('section');
      //loop through all sections
      section.forEach(function(section){
        //sectionsId adds a hashtag to all section id's, so it will be the same as the location hash
        var sectionsId = '#' + section.id;
        //if sectionsId is the same as route remove the hide class
        if (sectionsId === route) {
          section.classList.remove('hide');
        }else { // else add class hide to section
          section.classList.add('hide');
        }
      })
    }
  }

  app.init();

}());
