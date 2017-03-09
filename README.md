# Project Funda
Project for the Dutch, online estate agency Funda. This project is a part of the curriculum for the Minor Web Development. We were given several user stories to find a solution for. I chose a user story where I had to give extra, suggestion data to compliment search results.

## User Stories
As a funda user I want to get suggestions of houses I probably find interesting, so I'll also get offers just outside of my search query.

## Drawing it out:
![flow visueel](/img/flow_suggest.jpg)

## Schematic:
![flow schematisch](/img/actorDiagram.png)

### Notes for API
+ &zo= is used to add a search query, all new queries are placed between slashes(/.../).
+ All spaces in queries are replaced by middle dashes (-).
+ First query has to be a city, next can be an address, or postal code.
