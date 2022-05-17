/*
TODO: map through fetchCovidData and display it on the page
TODO: figure out where/how to apply covid data to the map
TODO: make custom markers and display further data to add interactivity
TODO: allow for more functionality and expand further
TODO: make everything look better/unique through custom CSS
*/

import React, {useState, useEffect} from 'react';
import axios from 'axios';

import { MapContainer, Marker, Popup, TileLayer, GeoJSON} from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import outlines from './data/us-state-outlines.json'

export default function App() {

  const [covidData, setCovidData] = useState({});
  const [states, setStates] = useState([]);

  // useEffect(() => {
  //   if (stateCovidInfo.length === 0 && covidData.length > 0){
  //     covidData.map((state) => {
  //       setStateCovidInfo(stateArr => [...stateArr, {state: state.state, deaths: state.tot_death}])
  //     })
  //   }
  // }, [covidData])

  //get covid data for the current week. if it has not been updated yet to all 50 states, get previous week's data.
  const fetchCovidData = async () => {
    try {
      var curr = new Date;
      var firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0];
      let response = await axios.get(`https://data.cdc.gov/resource/9mfq-cb36.json?submission_date=${firstDay}`);
      if (response.data.length < 50){
        firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()-7)).toISOString().split('T')[0];
        response = await axios.get(`https://data.cdc.gov/resource/9mfq-cb36.json?submission_date=${firstDay}`)
      }
      setCovidData(response.data);
    } 
    catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchCovidData();
  }, []);
  // console.log(covidDeaths);

  /* 
    GOAL FOR TOMORROW:
    as of right now, covidData is read as an empty array because it hasn't been updated yet through the asynchronous fetch
    call. need to find a way to access the covidData array AFTER it loads, which means then we can pull out the specific data
    and pass it through to the styleCovidData function.
  */
  const getStateCovidData = (stateName) => {
    // let data = await covidData;
    // console.log(covidData);
    let obj = covidData.find(o => o.state === stateName);
    return obj;
  }

  // console.log(getStateCovidData('IL'));

  //FUNCTION FOR GETTING COLOR BASED OFF COVID deaths
  function getColor(deaths) {
    return deaths > 100000 ? '#b30000' :
           deaths > 50000  ? '#e34a33' :
           deaths > 10000  ? '#fc8d59' :
           deaths > 5000  ? '#fdcc8a' :
           deaths > 1000   ? '#fef0d9' :
                          'fef0d9'
  }

  //STYLING FUNCTION
  function styleCovidData(feature) {
      const stateTotalDeaths = getStateCovidData(feature.properties.stusab).tot_deaths; 
      return {
          fillColor: getColor(stateTotalDeaths),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
      };
  }

  return (
    <MapContainer id="map" center={[38.093498,-98.178923]} zoom={4.25} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <GeoJSON data={outlines} style={styleCovidData} />

    </MapContainer>
  );
} 