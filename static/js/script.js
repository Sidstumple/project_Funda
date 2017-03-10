(function(){
  'use strict';
  var el = {
    baseUrl: '#search/',
    search: document.getElementById('getUserQuery'),
    queryResult: document.getElementById('queryResult'),
    details: document.getElementById('details'),
    suggestions: document.getElementById('suggestions'),
    error: document.getElementById('error'),
    button: document.getElementById('button'),
    rooms: document.getElementById('rooms'),
    price: document.getElementById('price'),
    detailId: document.getElementById('detail-item'),
    load1: document.getElementById('load1'),
    load2: document.getElementById('load2'),
    load3: document.getElementById('load3')
  };

  var app ={
    init: function() {
      el.search.addEventListener('submit', function(){
        event.preventDefault();
        console.log('search was used');
        getData.search();
        el.load1.classList.remove('hide');
        sections.renderLoader();
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
          sections.toggle(this.path );
          el.load1.classList.add('hide');
        },
        'search/:detail': function(detail) {
          console.log('page is ' + this.path);
          getData.detail();
          sections.toggle(this.path);
        }
      });
    }
  };

  var getData = {
    search: function(val){
      var userQuery = document.getElementById('user-input-field').value.replace(/\s/g, '-');
        //makes sure api url has the right userquery and adds the value of the selected option
        var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/' + _APIKEY + '/?type=koop&zo=/'+ userQuery +'/&page=1&pagesize=25';
        var self = this;
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
          var obj = data.Objects;
          self.filterRooms(obj);
          self.filterPrice(obj);

          el.load1.classList.add('hide');
        })
        .go()
  },
  detail: function() {
    el.load1.classList.remove('hide');
      //makes sure api url has the right userquery and adds the value of the selected option
      var id = location.hash.slice(el.baseUrl.length);

      var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/detail/' + _APIKEY + '/koop/'+ id;
      var self = this;
      aja()
      .url(apiUrl)
      .on('success', function(data){
        console.log('detail api is loaded');
        // this calls renderSearch and changes the html according to the applied filter
        sections.renderDetail(data);
        self.suggest(data);
      })
      .go()
    },

  suggest: function(data) {
    el.load1.classList.remove('hide');
      var garden = '';
      if (data.tuin != 'null') {
        var garden = '/tuin'
      }
      var self = this;

      var detSpace = data.Koopprijs;
      var detId = data.InternalId;

      var filterValueRooms = el.rooms.value;
      var filterValuePrice = el.price.value;

      if (filterValueRooms == '') {
        var rooms = data.AantalKamers;
      } else {
        console.log('filter rooms was used');
        var rooms = el.rooms.value;
      }

      if (filterValuePrice == '') {
        var price = '0-' + data.Koopprijs;
      } else {
        console.log('filter price was used');
        var price = + '0-' + el.price.value ;
      }


        //makes sure api url has the right userquery and adds the value of the selected option
        var apiUrl = 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/' + _APIKEY + '/?type=koop&zo=/'+ data.Plaats + '/' + data.Postcode + '/+10km' + garden + '/' + rooms + '+kamers/' + price +'/&page=1&pagesize=6';
        aja()
        .url(apiUrl)
        .on('success', function(sugData){
          //if the array is empty renderError
          console.log(sugData.Objects);
          if(sugData.Objects.length === 1) {
            console.log('nothing available');
            document.getElementById('suggest').classList.add('hide');
          } else {
            document.getElementById('suggest').classList.remove('hide');
          }
          console.log('search api is loaded');

            function getFilters(check) {
              return check.Id != detId;
            }
            var filterData = sugData.Objects.filter(getFilters);
            // this calls renderSuggest and changes the html according to the applied filter
            sections.renderSuggest(filterData);
        })
        .go()
      },
  filterRooms: function(data){
    var self = this;
    el.rooms.addEventListener('change', function(){
      var filterValue = this.value;
      function getFilters(check) {
          return check.AantalKamers > filterValue;
      }
      var filterData = data.filter(getFilters);
      sections.renderFilter(filterData);
      self.filterPrice(filterData);
    });
  },
  filterPrice: function(data) {
    var self = this;
    el.price.addEventListener('change', function(){
      var filterValue = this.value;
      function getFilters(check) {
        return check.Koopprijs < filterValue;
      }
      var filterData = data.filter(getFilters);
      sections.renderFilter(filterData);
      self.filterRooms(filterData);
    })
  },
};


  var sections = {
    //hier worden de sections geladen.
    renderSearch: function(data) {
      el.load1.classList.add('hide');
      //this is the script template in the html
      var source = document.getElementById('searchTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var htmlCollection = template(data);

      el.queryResult.innerHTML = htmlCollection;

    },
    renderFilter: function(data) {
      el.load1.classList.add('hide');
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
        });
      el.queryResult.innerHTML = htmlCollection;
    },
    renderError: function() {
      var source = document.getElementById('errorTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var errorHTML = template();

      el.error.innerHTML = errorHTML;
    },
    renderDetail: function(data) {
      el.load2.classList.add('hide');
      //this is the script template in the html
      var source = document.getElementById('detailTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var htmlDetail = template(data);
      el.details.innerHTML = htmlDetail;
    },
    renderSuggest: function(data) {
      el.load3.classList.add('hide');
      var htmlCollection = '';
        data.map(function(fil) {
          htmlCollection += `
          <div class="suggest-item" id=${fil.Id}>
            <a href="#search/${fil.Id}"><img src="${fil.FotoLarge}" alt="${fil.Adres}" /></a>
            <a href="#search/${fil.Id}"><h3>${fil.Adres}</h3></a>
            <p>${fil.Postcode} ${fil.Woonplaats}</p>
            <p>Aantal kamers: ${fil.AantalKamers}</p>
            <p>Oppervlakte woning: ${fil.Woonoppervlakte}m2</p>
            <p><strong>€ ${fil.Koopprijs}</strong></p>
          </div>
          `;
        });
      el.suggestions.innerHTML = htmlCollection;
    },
    renderLoader: function() {
      //this is the script template in the html
      var source = document.getElementById('loader').innerHTML;
      var template = Handlebars.compile(source);
      var htmlDetail = template();

      el.load1.innerHTML = htmlDetail;
      el.load2.innerHTML = htmlDetail;
      el.load3.innerHTML = htmlDetail;
    },
    toggle: function(route) {
      //selects all sections in the document
      var section = document.querySelectorAll('section');
      //loop through all sections
      section.forEach(function(section){
        //if sectionsId is the same as route remove the hide class
        if (section.id === route || route.slice(el.baseUrl.length) === section.id) {
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
