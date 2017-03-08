(function(){
  'use strict';
  var el = {
    search: document.getElementById('getUserQuery'),
    queryResult: document.getElementById('queryResult'),
    details: document.getElementById('details'),
    suggestions: document.getElementById('suggestions'),
    error: document.getElementById('error'),
    button: document.getElementById('button'),
    rooms: document.getElementById('rooms'),
    price: document.getElementById('price'),
    detailId: document.getElementById('detail-item')
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
        console.log(userQuery);
        //makes sure api url has the right userquery and adds the value of the selected option
        var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/' + _APIKEY + '/?type=koop&zo=/'+ userQuery +'/&page=1&pagesize=25';
        var self = this;
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
          var obj = data.Objects;
          self.filterRooms(obj);
          self.filterPrice(obj);
          // self.suggest();
        })
        .go()
  },
  detail: function(id) {
      //makes sure api url has the right userquery and adds the value of the selected option
      var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/detail/' + _APIKEY + '/koop/'+ id;
      var self = this;
      console.log(apiUrl);
      aja()
      .url(apiUrl)
      .on('success', function(data){
        console.log(data);
        console.log('detail api is loaded');
        // this calls renderSearch and changes the html according to the applied filter
        sections.renderDetail(data);
        self.suggest(data);
      })
      .go()
    },
    suggest: function(data) {
      var garden = '';

      if (data.tuin != 'null') {
        var garden = '/tuin'
      }
      var self = this;
        //makes sure api url has the right userquery and adds the value of the selected option
        var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/' + _APIKEY + '/?type=koop&zo=/'+ data.Plaats + '/' + data.Postcode + '/+5km' + garden;
        console.log(apiUrl);

        var detRooms = data.AantalKamers;
        var detSpace = data.WoonOppervlakte;

        aja()
        .url(apiUrl)
        .on('success', function(arr){
          //if the array is empty renderError
          if(arr.Objects.length === 0) {
            console.log('nothing available');
            sections.renderError();
          }
          console.log('search api is loaded');
          // this calls renderSearch and changes the html according to the applied filter
          sections.renderSuggest(arr);

          var obj = arr.Objects;
          self.filterRooms(detRooms);
          self.filterPrice(detSpace);
        })
        .go()
      },
  filterRooms: function(data){
    var self = this;
    el.rooms.addEventListener('change', function() {
      console.log(this.value);
      var filterValue = this.value;
      function getFilters(check) {
          console.log(filterValue);
          return check.AantalKamers > filterValue;
      }
      var filterData = data.filter(getFilters);
      el.queryResult.innerHTML > filterData;
      sections.renderFilter(filterData);
      console.log(filterData);
      self.filterPrice(filterData);
    })
  },
  filterPrice: function(data) {
    var self = this;
    el.price.addEventListener('change', function(){
      console.log(this.value);
      var filterValue = this.value;
      function getFilters(check) {
        console.log(filterValue);
        return check.Koopprijs < filterValue;
      }
      var filterData = data.filter(getFilters);

      el.queryResult.innerHTML > filterData;
      sections.renderFilter(filterData);
      self.filterRooms(filterData);
    })
  }
};


  var sections = {
    //hier worden de sections geladen.
    renderSearch: function(data) {
      //this is the script template in the html
      var source = document.getElementById('searchTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var htmlCollection = template(data);

      //checks whether search results are rendered, if a media-item is clicked.
      var mediaItem = document.querySelectorAll('.house-item');
      mediaItem.forEach(function(get) {
        var house = get.id;
        // console.log(document.getElementById(house));
        document.getElementById(house).addEventListener('click', function(el) {
          console.log('click on item')
          console.log(this.id);
          getData.detail(this.id);
        })
      })
      el.queryResult.innerHTML = htmlCollection;

      //checks whether search results are rendered, if a media-item is clicked.
      var mediaItem = document.querySelectorAll('.house-item');
      mediaItem.forEach(function(get) {
        var house = get.id;
        // console.log(document.getElementById(house));
        document.getElementById(house).addEventListener('click', function(el) {
          console.log('click on item')
          console.log(this.id);
          getData.detail(this.id);
        })
      })
    },
    renderFilter: function(data) {
      console.log(data);
      var htmlCollection = '';
      data.map(function(fil) {
        htmlCollection += `
        <div class="house-item" id=${fil.Id}>
          <a href="#search/${fil.Id}"><img src="${fil.FotoLarge}" alt="${fil.Adres}" /></a>
          <h3><a href="#search/${fil.GlobalId}">${fil.Adres}</a></h3>
          <p>${fil.Postcode} ${fil.Woonplaats}</p>
          <p>Aantal kamers: ${fil.AantalKamers}</p>
          <p><strong>€ ${fil.Koopprijs}</strong></p>
        </div>
        `;
      })
      el.queryResult.innerHTML = htmlCollection;

      //checks whether search results are rendered, if a media-item is clicked.
      var mediaItem = document.querySelectorAll('.house-item');
      mediaItem.forEach(function(get) {
        var house = get.id;
        // console.log(document.getElementById(house));
        document.getElementById(house).addEventListener('click', function(el) {
          console.log('click on item')
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
      console.log(data)

      el.details.innerHTML = htmlDetail;
    },
    renderSuggest: function(data) {
      //this is the script template in the html
      var source = document.getElementById('suggestTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var htmlDetail = template(data);

      el.suggestions.innerHTML = htmlDetail;
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
  };

  app.init();

}());
