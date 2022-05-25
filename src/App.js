/*
BUGS:
fix Alaska
fix zoom on click (too zoomed in)
*/

import React, {useState, useEffect} from 'react';
import axios from 'axios';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import outlines from './data/us-state-outlines.json';
import CovidMap from './CovidMap';

export default function App() {

  const [covidData, setCovidData] = useState(null);
  const [states, setStates] = useState([]);

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

  return (
    <MapContainer id="map" center={[38.093498,-98.178923]} zoom={4.25} scrollWheelZoom={true}>
      <TileLayer
        className="attribution"
        attribution='Map Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />        
      {covidData && <CovidMap mapData={outlines} covidData={covidData} />}
    </MapContainer>
  );
} 