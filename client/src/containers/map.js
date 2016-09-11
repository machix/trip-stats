import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as _ from 'underscore'
import {GoogleMapLoader, GoogleMap, DrawingManager, Marker, Polygon} from 'react-google-maps'

import {loadTrips, setROI} from '../redux/actions'

class Map extends Component {
  componentWillMount(){
    this.props.dispatch(loadTrips())
  }
  componentDidMount(){
    this.updateHeatmap()
  }
  componentDidUpdate(){
    this.updateHeatmap()
  }
  render() {
    const containerElement = (<div className="map" />)
    const children = _.compact(_.flatten(_.union(
      [this.renderDrawingManager(), this.renderRoi()],
      this.renderTopTrips()
    )))
    return (
        <GoogleMapLoader
          containerElement={containerElement}
          googleMapElement={
            <GoogleMap
              ref={(map) => this._map = map}
              defaultZoom={15}
              defaultCenter={{ lat: 40.7589, lng: -73.9851 }}
              onClick={(event) => this.props.dispatch(addPoint({lat: event.latLng.lat(), lng: event.latLng.lng()}))}
            >
              {children}
            </GoogleMap>
          }
        />
    );
  }

  renderDrawingManager(){
    return (
      <DrawingManager
        key="drawing-manager"
        defaultDrawingMode={google.maps.drawing.OverlayType.POLYGON}
        defaultOptions={{
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON,
            ],
          },
          polygonOptions: {
            clickable: true
          },
        }}
        onPolygoncomplete={(polygon)=> {
          let latLngs = _.map(polygon.getPath().getArray(), (latLng) => ({lat: latLng.lat(), lng: latLng.lng()}))

          this.props.dispatch(setROI(latLngs))

          polygon.setMap(null) // will be added in render pass...
        }}
      />
    )
  }

  renderRoi(){
    if(!this.props.roi){
      return null
    }
    const handleClick = () =>{
      // this.props.dispatch(something!({id}))
    }
    return (
      <Polygon
        key="roi"
        path={this.props.roi}
        onClick={handleClick} />
    )
  }

  renderTopTrips(){
    return _.values(this.props.topTrips).map((point, index) => {
      return (
        <Marker
          key={index}
          position={point}
          title={`${point.pickup} ${point.count} Trips`}
          />
      )
    })
  }

  updateHeatmap(){
    if(this.props.trips.length){
      const heatMapData = this.props.trips.map(trip => ({location: new google.maps.LatLng(trip.lat, trip.lng), weight: trip.count}))
      if(this._heatmap){
        this._heatmap.setData(heatMapData)
      }else{
        this._heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatMapData,
          map: this._map.props.map
        })
      }
    }
  }
}

export default connect((redux) => {
  return redux
})(Map)
