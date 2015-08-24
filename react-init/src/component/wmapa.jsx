var WMapa = React.createClass({
    getInitialState: function(){
        return {
            map_height: 300,
            map_width: 300,
            lat_cen: 0,
            lon_cen: 0,
            zoom: 0
        };
    },
    render: function(){
        return(
                <div id = "wmapa"></div>
        );
    },
    componentDidMount: function(){
        var mH = this.state.map_height;
        var mW = this.state.map_width;
        var translate = [mW/2, mH/2];
        var projects = [
            {
                name: 'azimuthalEqualArea',
                fn: d3.geo.azimuthalEqualArea().scale(50).translate(translate)
            },
            {
                name: 'conicEquidistant',
                fn: d3.geo.conicEquidistant().scale(35).translate(translate)
            },
            {
                name: 'equirectanglar',
                fn: d3.geo.equirectangular().scale(50).translate(translate)
            },
            {
                name: 'mercator',
                fn: d3.geo.mercator().scale(50).translate(translate)
            },
            {
                name: 'ortographic',
                fn: d3.geo.orthographic().scale(90).translate(translate)
            },
            {
                name: 'stereograhic',
                fn: d3.geo.stereographic().scale(35).translate(translate)
            }
        ];
        d3.json("https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-50m.json", function(error, world){
            projects.forEach(function(proj){
                var path = d3.geo.path().projection(proj.fn);
                var div = d3.select("#wmapa")
                    .append("div")
                    .attr("class","map");

                var svg = div.append("svg")
                    .attr("width",mW)
                    .attr("height",mH);

                svg.append("path")
                    .datum(topojson.feature(world, world.objects.land))
                    .attr("class","land")
                    .attr("d", path);

                svg.append("path")
                    .datum(topojson.feature(world, world.objects.countries))
                    .attr("class", "boundary")
                    .attr("d", path);

                div.append("h3").text(proj.name);
            });
        });
    }
});
module.exports = WMapa;
