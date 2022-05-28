import React, { useRef, useEffect, useState } from 'react';
import { GeoJSON, useMap, TileLayer, LayersControl } from 'react-leaflet';
import Control from 'react-leaflet-custom-control'
import states from 'us-state-converter';
import './index.css';

const CovidMap = (props) => {

    const geoJsonRef = useRef();
    const infobody = useRef();
    const infohead = useRef();
    const dataRef = useRef();

    const [data, setData] = useState('tot_death');
    dataRef.current = data;
    const [infoHead, setInfoHead] = useState('TOTAL COVID-19 DEATHS');
    const [infoBody, setInfoBody] = useState({__html: `<div>Hover over a state</div>`});
    const [target, setTarget] = useState(null);

    const map = useMap();

    useEffect(() => {
        data === "tot_death" ? setInfoHead('TOTAL COVID-19 DEATHS') : 
        data === 'tot_cases' ? setInfoHead('TOTAL COVID-19 CASES') :
        data === 'new_case' ? setInfoHead('COVID-19 CASES THIS WEEK') : 
        data === 'series_complete_pop_pct' ? setInfoHead('PERCENTAGE VACCINATED') : console.error() ;
    }, [data])

    useEffect(() => {
        if (target && target.event.type === 'mouseover'){ 
            target.target.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });
            target.target.bringToFront(); 
        } else if (target && target.event.type === 'mouseout') {
            geoJsonRef.current.resetStyle(target.target);
        } 
    }, [infoBody])

    const generateLegend = () => {
        let div = "";
        let grades = [];
        data === "tot_death" ? grades = [1000, 2500, 5000, 10000, 20000, 50000, 100000] : 
        data === 'tot_cases' ? grades = [50000, 100000, 250000, 500000, 1000000, 2500000, 5000000] :
        data === 'new_case' ? grades = [500, 1000, 2500, 5000, 7500, 10000, 20000] : 
        data === 'series_complete_pop_pct' ? grades = [85, 75, 70, 65, 60, 55, 50] : console.error() ;
        for (let i = 0; i < grades.length; i++){
            if (data !== 'series_complete_pop_pct'){
                div +=
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            } else if (data === 'series_complete_pop_pct'){
                if (grades[i+1]){
                    div += 
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + '% ' + '&ndash;' + ' ' + grades[i+1] + '%' + '<br>';
                }
            }
        }
        return {__html: div};
    }

    function getColor(num) {
        if (dataRef.current === 'tot_death'){
            return num > 100000 ? '#800026' :
                    num > 50000  ? '#BD0026' :
                    num > 20000  ? '#E31A1C' :
                    num > 10000  ? '#FC4E2A' :
                    num > 5000   ? '#FD8D3C' :
                    num > 2500   ? '#FEB24C' :
                    num > 1000   ? '#FED976' :
                                    '#FFEDA0';
        } else if (dataRef.current === 'tot_cases'){
            return num > 5000000 ? '#800026' :
                    num > 2500000  ? '#BD0026' :
                    num > 1000000  ? '#E31A1C' :
                    num > 500000  ? '#FC4E2A' :
                    num > 250000   ? '#FD8D3C' :
                    num > 100000   ? '#FEB24C' :
                    num > 50000   ? '#FED976' :
                                    '#FFEDA0';
        } else if (dataRef.current === 'new_case'){
            return num > 20000 ? '#800026' :
                    num > 10000  ? '#BD0026' :
                    num > 7500  ? '#E31A1C' :
                    num > 5000  ? '#FC4E2A' :
                    num > 2500   ? '#FD8D3C' :
                    num > 1000   ? '#FEB24C' :
                    num > 500   ? '#FED976' :
                                    '#FFEDA0';
        } else if (dataRef.current === 'series_complete_pop_pct'){
            return num > 80 ? '#005824' :
                    num > 75 ? '#238b45' :
                    num > 70 ? '#41ae76' :
                    num > 65 ? '#66c2a4' :
                    num > 60 ? '#99d8c9' :
                    num > 55 ? '#ccece6' :
                    num > 50 ? '#ccf0e2' : 
                                '#c7e9c0' ;
        }
    }

    //STYLING FUNCTION
    function styleCovidData(feature) {
        let color = '';
        const stateAbr = feature.properties.stusab;
        const stateWithCovid = props.covidData.find(state => state.state === stateAbr);
        if (dataRef.current === 'tot_death'){
            const stateTotalDeaths = stateWithCovid.tot_death;
            color = getColor(stateTotalDeaths);
        } else if (dataRef.current === 'tot_cases'){
            const stateTotalCases = stateWithCovid.tot_cases;
            color = getColor(stateTotalCases);
        } else if (dataRef.current === 'new_case'){
            const stateNewCase = stateWithCovid.new_case;
            color = getColor(stateNewCase);
        } else if (dataRef.current === 'series_complete_pop_pct'){
            const stateWithVax = props.vaxData.find(state => state.location === stateAbr);
            const statePercentVax = stateWithVax.series_complete_pop_pct;
            color = getColor(statePercentVax);
        }

        return {
            fillColor: color,
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
        setTarget({target: target, event: e});
        const stateAbr = target.feature.properties.stusab;
        const stateWithCovid = props.covidData.find(state => state.state === stateAbr);
        const stateWithVax = props.vaxData.find(state => state.location === stateAbr);
        let div = '';

        const prettyDeathNumbers = stateWithCovid.tot_death.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const prettyCaseNumbers = stateWithCovid.tot_cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const prettyNewCaseNumbers = Math.round(stateWithCovid.new_case).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        dataRef.current === 'tot_death' ? div = `<div class='state'>${states.fullName(stateWithCovid.state)} </div><div>${prettyDeathNumbers} deaths</div>` :  
        dataRef.current === 'tot_cases' ? div = `<div class='state'>${states.fullName(stateWithCovid.state)} </div><div>${prettyCaseNumbers} cases</div>` :
        dataRef.current === 'new_case' ? div = `<div class='state'>${states.fullName(stateWithCovid.state)} </div><div>${prettyNewCaseNumbers} cases</div>` : 
        dataRef.current === 'series_complete_pop_pct' ? div = `<div class='state'>${states.fullName(stateWithVax.location)} </div><div>${stateWithVax.series_complete_pop_pct}%</div>` :
        console.error();

        setInfoBody({__html: div});
    }

    //RESET HIGHLIGHT
    function resetHighlight(e) {
        setTarget({target: e.target, event: e});
        setInfoBody({__html: '<div>Hover over a state</div>'})
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
                <h4>{infoHead}</h4>
                <div dangerouslySetInnerHTML={infoBody}></div>
            </div>
        </Control>
        <Control position='bottomright'>
            <div className='info legend' dangerouslySetInnerHTML={generateLegend()}></div>
        </Control>
        <Control position='topright' >
            <select name="data" className="data" value={data} onChange={e => setData(e.target.value)}>
                <option value="tot_death">Total Deaths</option>
                <option value="tot_cases">Total Cases</option>
                <option value="new_case">Cases This Week</option>
                <option value="series_complete_pop_pct">Percentage Vaccinated</option>
            </select>
        </Control>
     </>    
    )
} 

export default CovidMap;