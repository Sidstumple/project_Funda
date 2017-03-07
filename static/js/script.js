(function(){
  'use strict';
  var el = {
    search: document.getElementById('getUserQuery'),
    queryResult: document.getElementById('queryResult'),
    detailSection: document.getElementById('detailResult'),
    error: document.getElementById('error'),
    button: document.getElementById('button'),
  };

  var app ={
    init: function() {
      el.search.addEventListener('submit', function(){
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
          console.log('page is ' + this.path);
          sections.toggle('#' + this.path );
        },
        'search/:detail': function(detail) {
          console.log('page is ' + this.path);
          sections.toggle('#' + this.path );
        }
      });
    }
  };

  var getData = {
    search: function(){
      var userQuery = document.getElementById('user-input-field').value.replace(/\s/g, '-');
      var rooms = [];

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
          // console.log(data.Objects);
          console.log('search api is loaded');
          // this calls renderSearch and changes the html according to the applied filter
          sections.renderSearch(data);
          sections.renderDetail(data);
        })
    .go()
  },

  detail: function(id) {

      //makes sure api url has the right userquery and adds the value of the selected option
      var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/detail/' + _APIKEY + '/koop/'+ id;
      // GET data for applied filter
      console.log(apiUrl);
      aja()
      .url(apiUrl)
      .on('success', function(data){
        console.log(data);
        console.log('detail api is loaded');
        // this calls renderSearch and changes the html according to the applied filter
        sections.renderDetail(data);
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

      el.queryResult.innerHTML = htmlCollection;
      //checks when search results are rendered, if a media-item is clicked.
      var mediaItem = document.querySelectorAll('.house-item');
      mediaItem.forEach(function(get) {
        var house = get.id;
        // console.log(document.getElementById(house));
        document.getElementById(house).addEventListener('click', function(el) {
          console.log(this.id);
          getData.detail(this.id);
        })
      })

    },

    renderError: function() {
      var source = document.getElementById('errorTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var errorHTML = template();

      el.error.innerHTML = errorHTML;
},

    renderDetail: function(data) {
      //this is the script template in the html
      var source = document.getElementById('detailTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var htmlDetail = template(data);

      el.detailSection.innerHTML = htmlDetail;
    },

    toggle: function(route) {
      //selects all sections in the document
      var section = document.querySelectorAll('section');
      //loop through all sections
      section.forEach(function(section){
        //sectionsId adds a hashtag to all section id's, so it will be the same as the location hash
        var router = route.slice(1);

        //if sectionsId is the same as route remove the hide class
        if (section.id === router || router.slice(8) === section.id) {
          console.log('remove hide');
          section.classList.remove('hide');
        }else { // else add class hide to section
          section.classList.add('hide');
        }
      });
    }
  }

  app.init();

}());
