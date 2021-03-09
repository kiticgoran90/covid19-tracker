import React, { useState, useEffect } from 'react';
import './App.css';
import image from './images/image.png'
import { InfoBox, Map, Table, LineGraph } from './components'

import { Card, CardContent, FormControl, Select, MenuItem } from '@material-ui/core'

import { sortData, prettyPrintStat } from './utils'
import "leaflet/dist/leaflet.css"


function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState('cases')

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
      const getCountriesData = async () => {
          await fetch('https://disease.sh/v3/covid-19/countries')
          .then((response) => response.json())
          .then((data) => {
              const countries = data.map((country) => (
                  {
                      name: country.country,
                      value: country.countryInfo.iso2
                  }
              ))
              const sortedData = sortData(data)
              setTableData(sortedData)
              setMapCountries(data)
              setCountries(countries)
          })
      }
      getCountriesData()
  }, [])

  const onCountryChange = async (event) => {
      const countryCode = event.target.value
      
      const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
      
      await fetch(url)
      .then(response => response.json())
      .then(data => {
          setCountry(countryCode)
          setCountryInfo(data)

          setMapCenter([data.countryInfo.lat, data.countryInfo.long])
          setMapZoom(4)
      })
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <img className="app__image" src={image} alt="COVID-19" />
          <FormControl className="app__dropdown">
                <Select variant="outlined" value={country} onChange={onCountryChange}>
                    <MenuItem value="worldwide">Worldwide</MenuItem>
                    {
                        countries.map(country => (
                            <MenuItem value={country.value}>{country.name}</MenuItem>
                        ))
                    }   
                </Select>
            </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox 
            isRed
            active={casesType === 'cases'}
            onClick={(e) => setCasesType('cases')} 
            title="Coronavirus cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox 
            active={casesType === 'recovered'}
            onClick={(e) => setCasesType('recovered')}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox 
            isRed
            active={casesType === 'deaths'}
            onClick={(e) => setCasesType('deaths')}
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)} />
        </div>
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>

      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData}/>
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType}/>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
