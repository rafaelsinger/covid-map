/*
TODO: map through fetchCovidData and display it on the page
TODO: figure out where/how to apply covid data to the map
TODO: make custom markers and display further data to add interactivity
TODO: allow for more functionality and expand further
TODO: make everything look better/unique through custom CSS
*/

import React, {useState, useEffect} from 'react';
import axios from 'axios';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { Icon } from 'leaflet';
import states from './states.json';

const state = new Icon({
  iconUrl: './clipboard.svg',
  iconSize: [25, 25]
})


const provider = new OpenStreetMapProvider();

export default function App() {

  const [covidData, setCovidData] = useState({});
  const [stateNames, setStateNames] = useState([]);
  const [coords, setCoords] = useState([]);
  const [activeState, setActiveState] = useState(null);

  useEffect(() => {
    if (!stateNames || !stateNames.length){
      return;
    }
    fetchCoords();
  }, [stateNames])

  useEffect(() => {
    getStateNames();
  }, [])

  // useEffect(() => {
  //   console.log(activeState);
  //   // fetchCovidData(activeState);
  // }, [activeState]);

  const fetchCoords = async () => {
    try {
      const req = await Promise.all(stateNames.map(async (state) => {
        return await axios.get(`https://nominatim.geocoding.ai/search.php?state=${state}&format=jsonv2`);
      }))
      for (let i = 0; i < req.length; i++){
        const stateInfo = req[i].data[0];
        if (req[i].data.length !== 0)
          setCoords(coordsArr => [...coordsArr, {name: stateInfo.display_name, lat: stateInfo.lat, lon: stateInfo.lon}]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStateNames = () => {
    try {
      const stateArr = [];
      for (let i = 0; i < states.length; i++){
        stateArr.push(states[i].name);
      }
      setStateNames(stateArr);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchCovidData = async (stateName) => {
    try {
      const response = await axios.get(`https://disease.sh/v3/covid-19/states/${stateName}`);
      setCovidData(response.data);
    } 
    catch (err) {
      console.error(err);
    }
  }

  return (
    <MapContainer id="map" center={[38.093498,-98.178923]} zoom={5} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {coords.map((coord, idx) => (
        <Marker 
          key={idx} 
          position={[
            coord.lat,
            coord.lon
          ]}
          icon={state}
          click={console.log('hello world')}
        >
          <Popup>
            <div>
              {covidData.state}: 
              {covidData.cases} cases
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}