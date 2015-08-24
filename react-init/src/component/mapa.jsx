var Mapa = React.createClass({
    render: function(){
        return(
                <div id = "mapa"></div>
        );
    },
    componentDidMount: function(){
        var mH = this.props.map_height;
        var mW = this.props.map_width;
        var latcen = this.props.lat_cen;
        var loncen = this.props.lon_cen;
        var inizoom = this.props.zoom;

        var proj = d3.geo.mercator()
            .scale((1 << inizoom) / 2 / Math.PI)
            .translate([mW / 2, mH / 2]);

        var center = proj([loncen, latcen]);

        this.zoom = d3.behavior.zoom()
            .scale(proj.scale() * 2 * Math.PI)
            .scaleExtent([1 << 23, 1 << 27])
            .translate([mW - center[0], mH - center[1]])
            .on("zoom", this.draw);

        // Limpia la proyeccion
        proj
            .scale(1 / 2 / Math.PI)
            .translate([0, 0]);
            
        this.path = d3.geo.path()
            .projection(proj);

        var svg = d3.select("#mapa")
            .append("svg")
            .attr("height", mH+"px")
            .attr("width", mW+"px")
            .call(this.zoom);
        var g = svg.append("g");

        this.g = g;
        // Dibujado inicial de la grafica
        this.draw();
    },
    draw: function(){
        // redibuja la grafica
        // selection.data()
        // data.enter(), data.exit(), etc etc etc
        var gin = this.g.selectAll("path")
            .data(this.computeCalles(this.props.json))
            .enter();
            gin.append("path")
            .attr("d", this.path)
            .attr("id",function(d){
                return d.id;
            });
        gin.append("text")
            .style("font-size","20px")
            .style("color","black")
            .append("textPath")
            .attr("xlink:href", function(d){
                return "#"+d.id;
            }).text(function(d){
                return d.properties.name;
            });
        this.g.attr("transform","translate(" + this.zoom.translate() + ") scale(" + this.zoom.scale() + ")");
    },
    componentDidUpdate: function(){
        this.draw();
    },
    computeCalles: function(osm){
        var obnodes = {};
        osm.nodes.forEach(function(v, k){
            obnodes[v.id] = v;
        });
        var cuadras = osm.cuadras.map(function(v,k){
            return {
                type: "Feature",
                id: v.id,
                nodes: v.nodes,
                geometry: {
                    type: "LineString",
                    coordinates: v.nodes.map(function(w,q){
                        return [obnodes[w].lon, obnodes[w].lat];
                    })
                },
                properties: v.tags
            };
        });
        return cuadras;
    },
    computeNodos: function(osm){
        var nodes = osm.nodes.map(function(v,k){
            return {
                type: "Feature",
                id: v.id,
                geometry: {
                    type: "Point",
                    coordinates: [v.lon, v.lat]
                }
            };
        });
        return nodes;
    }
});

module.exports = Mapa;
