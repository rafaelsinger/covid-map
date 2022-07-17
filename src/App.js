/*
BUGS:
fix attribution (needs to be below the legend)
fix bounds (setMaxBounds) - maybe unnecessary
*/

import React, {useState, useEffect} from 'react';
import axios from 'axios';

import { MapContainer, Marker, Popup, TileLayer, AttributionControl } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import outlines from './data/us-state-outlines.json';
import CovidMap from './CovidMap.js';

export default function App() {

  const [covidData, setCovidData] = useState(null);
  const [vaxData, setVaxData] = useState(null);

  //get covid data for the current week. if it has not been updated yet to all 50 states, get previous week's data.
  const fetchCovidData = async () => {
    try {
      let curr = new Date;
      let firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0];
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

  const fetchVaxData = async () => {
    try {
      let curr = new Date;
      const offset = curr.getTimezoneOffset()
      curr = new Date(curr.getTime() - (offset*60*1000))
      let time = curr.toISOString().split('T')[0];
      let response = await axios.get(`https://data.cdc.gov/resource/unsk-b7fc.json?date=2022-06-10`); 
      //data set discontinued so using data from last week with data on all 50 states
      // if (response.data.length < 50){
      //   time = new Date(curr.setDate(curr.getDate() - curr.getDay()-7)).toISOString().split('T')[0];
      //   console.log(`https://data.cdc.gov/resource/unsk-b7fc.json?date=${time}`);
      //   response = await axios.get(`https://data.cdc.gov/resource/unsk-b7fc.json?date=${time}`)
      // }
      setVaxData(response.data)
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchCovidData();
    fetchVaxData();
  }, []);

  return (
    <MapContainer center={[38.093498,-98.178923]} zoom={4.25} scrollWheelZoom={true} minZoom={3} maxZoom={6.5} attributionControl={false} fullscreenControl={true}>      
      <TileLayer
            className="attribution"
            attribution='Made by <a href="https://www.rafaelsinger.com">Rafael Singer</a>, Map Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />  
      {(covidData && vaxData) && <CovidMap mapData={outlines} covidData={covidData} vaxData={vaxData} />}
      <AttributionControl position="bottomleft"/>
    </MapContainer>
  );
} 