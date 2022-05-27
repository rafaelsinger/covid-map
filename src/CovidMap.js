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

    const map = useMap();

    useEffect(() => {
        data === "tot_death" ? setInfoHead('TOTAL COVID-19 DEATHS') : 
        data === 'tot_cases' ? setInfoHead('TOTAL COVID-19 CASES') :
        data === 'new_case' ? setInfoHead('COVID-19 CASES THIS WEEK') : console.log('test');
    }, [data])

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

    function getColor(num) {
        if (data === 'tot_death'){
            return num > 100000 ? '#800026' :
                    num > 50000  ? '#BD0026' :
                    num > 20000  ? '#E31A1C' :
                    num > 10000  ? '#FC4E2A' :
                    num > 5000   ? '#FD8D3C' :
                    num > 2500   ? '#FEB24C' :
                    num > 1000   ? '#FED976' :
                                    '#FFEDA0';
        } else if (data === 'tot_cases'){
            return num > 5000000 ? '#800026' :
                    num > 2500000  ? '#BD0026' :
                    num > 1000000  ? '#E31A1C' :
                    num > 500000  ? '#FC4E2A' :
                    num > 250000   ? '#FD8D3C' :
                    num > 100000   ? '#FEB24C' :
                    num > 50000   ? '#FED976' :
                                    '#FFEDA0';
        } else if (data === 'new_case'){
            return num > 20000 ? '#800026' :
                    num > 10000  ? '#BD0026' :
                    num > 7500  ? '#E31A1C' :
                    num > 5000  ? '#FC4E2A' :
                    num > 2500   ? '#FD8D3C' :
                    num > 1000   ? '#FEB24C' :
                    num > 500   ? '#FED976' :
                                    '#FFEDA0';
        }
    }

    //STYLING FUNCTION
    function styleCovidData(feature) {
        let color = '';
        const stateAbr = feature.properties.stusab;
        const stateWithCovid = props.covidData.find(state => state.state === stateAbr);
        if (data === 'tot_death'){
            const stateTotalDeaths = stateWithCovid.tot_death;
            color = getColor(stateTotalDeaths);
        } else if (data === 'tot_cases'){
            const stateTotalCases = stateWithCovid.tot_cases;
            color = getColor(stateTotalCases);
        } else if (data === 'new_case'){
            const stateNewCase = stateWithCovid.new_case;
            color = getColor(stateNewCase);
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
        const stateAbr = target.feature.properties.stusab;
        const stateWithCovid = props.covidData.find(state => state.state === stateAbr);
        let div = '';

        const prettyDeathNumbers = stateWithCovid.tot_death.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const prettyCaseNumbers = stateWithCovid.tot_cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const prettyNewCaseNumbers = Math.round(stateWithCovid.new_case).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        console.log(prettyNewCaseNumbers);

        dataRef.current === 'tot_death' ? div = `<div class='state'>${states.fullName(stateWithCovid.state)} </div><div>${prettyDeathNumbers} deaths</div>` :  
        dataRef.current === 'tot_cases' ? div = `<div class='state'>${states.fullName(stateWithCovid.state)} </div><div>${prettyCaseNumbers} cases</div>` :
        dataRef.current === 'new_case' ? div = `<div class='state'>${states.fullName(stateWithCovid.state)} </div><div>${prettyNewCaseNumbers} cases</div>` : 
        console.log ('hi');

        setInfoBody({__html: div})

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
            </select>
        </Control>
     </>    
    )
} 

export default CovidMap;