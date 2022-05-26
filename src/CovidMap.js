import React, { useRef, useEffect } from 'react';
import { GeoJSON, useMap, TileLayer, LayersControl } from 'react-leaflet';
import Control from 'react-leaflet-custom-control'
import states from 'us-state-converter';
import './index.css';

const CovidMap = (props) => {

    const geoJsonRef = useRef();
    const infobody = useRef();
    const infohead = useRef();

    const map = useMap();

    const generateLegend = () => {
        let div = "";
        const grades = [1000, 2500, 5000, 10000, 20000, 50000, 100000]
        for (let i = 0; i < grades.length; i++){
            div +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return {__html: div};
    }

    function getColor(deaths) {
        return deaths > 100000 ? '#800026' :
                deaths > 50000  ? '#BD0026' :
                deaths > 20000  ? '#E31A1C' :
                deaths > 10000  ? '#FC4E2A' :
                deaths > 5000   ? '#FD8D3C' :
                deaths > 2500   ? '#FEB24C' :
                deaths > 1000   ? '#FED976' :
                                  '#FFEDA0';
    }

    //STYLING FUNCTION
    function styleCovidData(feature) {
        const stateAbr = feature.properties.stusab;
        const stateWithCovid = props.covidData.find(state => state.state === stateAbr);
        const stateTotalDeaths = stateWithCovid.tot_death;
        return {
          fillColor: getColor(stateTotalDeaths),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
      };
    }

    // //HIGHLIGHT FUNCTION
    function highlightFeature(e){
        var target = e.target;
        const stateAbr = target.feature.properties.stusab;
        const stateWithCovid = props.covidData.find(state => state.state === stateAbr);

        const prettyDeathNumbers = stateWithCovid.tot_death.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        const body = infobody.current;
        body.innerHTML = `
            <div class='state'>${states.fullName(stateWithCovid.state)}</div>
            <div>${prettyDeathNumbers} deaths</div>
        `;

        target.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        target.bringToFront();
    }

    //RESET HIGHLIGHT
    function resetHighlight(e) {
        geoJsonRef.current.resetStyle(e.target);
        const body = infobody.current;
        body.innerHTML = '<div>Hover over a state</div>';
    }

    // //ZOOM FUNCTION
    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature,
        });
    }

    return ( 
     <>
        <GeoJSON attribution="Data from <a href=https://data.cdc.gov/Case-Surveillance/United-States-COVID-19-Cases-and-Deaths-by-State-o/9mfq-cb36/data>CDC</a>" data={props.mapData} style={styleCovidData} onEachFeature={onEachFeature} ref={geoJsonRef} /> 
        <Control>
            <div className='info'>
                <h4 ref={infohead}>TOTAL COVID-19 DEATHS</h4>
                <div ref={infobody}>Hover over a state</div>
            </div>
        </Control>
        <Control position='bottomright'>
            <div className='info legend' dangerouslySetInnerHTML={generateLegend()}></div>
        </Control>
        <Control position='topright' >
            <select>
                <option value="tot_death">Total Deaths</option>
                <option value="tot_cases">Total Cases</option>
                <option value="cases_week">Cases This Week</option>
            </select>
        </Control>
     </>    
    )
} 

export default CovidMap;