import React,{useState} from 'react';
import { Map } from 'pigeon-maps'

import './Map.css';

const MyMap = props => {
    console.log(props.location);
    const [center, setCenter] = useState([props.location.lat, props.location.lng])
    const [zoom, setZoom] = useState(11)
    return (
      <Map 
        width={600} 
        height={400}
        center={center} 
        zoom={zoom} 
        onBoundsChanged={({ center, zoom }) => { setCenter(center); setZoom(zoom) }}>
        ...
      </Map>
    )
}
export default MyMap;