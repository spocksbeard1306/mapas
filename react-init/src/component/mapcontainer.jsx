import Mapa from './mapa.jsx';

var MapContainer = React.createClass({
    getInitialState: function(){
        return {
            map_height: 500,
            map_width: 960,
            lat_cen: -12.0508,
            lon_cen: -77.0281,
            zoom: 23,
            json: {
                cuadras:[],
                nodes:[]
            }
        };
    },
    render: function(){
        return(<Mapa {...this.state} />);
    },
    componentDidMount: function(){
        var self = this;
        d3.json("data.json", function(error, data){
            self.setState({json: data});
        });
    }
});

module.exports = MapContainer;
